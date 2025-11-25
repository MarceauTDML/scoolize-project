const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'scoolize',
    port: process.env.DB_PORT || 3306
};

const CSV_FILE = 'fr-esr-cartographie_formations_parcoursup.csv';

const importSchools = async () => {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Connecté à la base de données.");

    const processedUAI = new Set();
    const schoolsToInsert = [];

    console.log("Lecture du fichier CSV...");

    fs.createReadStream(CSV_FILE)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
            const uai = row["Identifiant de l'établissement"];
            const name = row["Nom de l'établissement"];
            const type = row["Types d'établissement"];
            const commune = row["Commune"];
            const region = row["Région"];
            const website = row["Site internet de l'établissement"];

            if (!uai || processedUAI.has(uai)) return;

            processedUAI.add(uai);

            schoolsToInsert.push({
                uai,
                name,
                address: `${commune}, ${region}`,
                description: `Établissement de type : ${type}`,
                website: website || ''
            });
        })
        .on('end', async () => {
            console.log(`${schoolsToInsert.length} écoles uniques trouvées.`);
            console.log("Démarrage de l'insertion en base...");

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('scoolize2025', salt);

            const [roles] = await connection.execute('SELECT id FROM roles WHERE name = "school"');
            const roleId = roles[0].id;

            let successCount = 0;
            let errorCount = 0;

            for (const school of schoolsToInsert) {
                try {
                    const [existing] = await connection.execute('SELECT id FROM schools WHERE external_id = ?', [school.uai]);
                    if (existing.length > 0) continue;

                    const email = `${school.uai.toLowerCase()}@scoolize.com`;
                    
                    const [existingUser] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
                    
                    let userId;
                    if (existingUser.length > 0) {
                        userId = existingUser[0].id;
                    } else {
                        const [userResult] = await connection.execute(
                            'INSERT INTO users (email, password, role_id) VALUES (?, ?, ?)',
                            [email, hashedPassword, roleId]
                        );
                        userId = userResult.insertId;
                    }

                    await connection.execute(
                        `INSERT INTO schools (user_id, name, description, address, website, status, external_id) 
                         VALUES (?, ?, ?, ?, ?, 'approved', ?)`,
                        [userId, school.name, school.description, school.address, school.website, school.uai]
                    );

                    successCount++;
                    if (successCount % 100 === 0) console.log(`... ${successCount} écoles insérées`);

                } catch (err) {
                    console.error(`Erreur pour ${school.name}:`, err.message);
                    errorCount++;
                }
            }

            console.log(`Terminé ! ${successCount} écoles ajoutées, ${errorCount} erreurs.`);
            await connection.end();
        });
};

importSchools();