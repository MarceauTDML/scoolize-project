const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const CSV_FILE_PATH = path.join(__dirname, 'fr-esr-cartographie_formations_parcoursup.csv');

const updateSchoolTypes = async () => {
    let connection;
    try {
        console.log('Connexion à la base de données...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('Lecture du fichier CSV...');
        const data = fs.readFileSync(CSV_FILE_PATH, 'utf8');
        const lines = data.split('\n');

        const headers = lines[0].split(';');
        const idxId = headers.indexOf('Identifiant de l\'établissement');
        const idxType = headers.indexOf('Types d\'établissement');

        console.log('Mise à jour des types d\'établissements...');
        
        const processedUAI = new Set();
        let updateCount = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(';');

            const uai = cols[idxId];
            const type = cols[idxType];

            if (!uai || processedUAI.has(uai)) {
                continue;
            }

            processedUAI.add(uai);

            const email = `contact.${uai.toLowerCase()}@scoolize.fr`;

            const query = `
                UPDATE school_details d
                JOIN users u ON u.id = d.user_id
                SET d.school_type = ?
                WHERE u.email = ?
            `;

            const [result] = await connection.query(query, [type, email]);

            if (result.affectedRows > 0) {
                updateCount++;
                if (updateCount % 100 === 0) process.stdout.write('.');
            }
        }

        console.log(`\n\nTerminé ! ${updateCount} écoles ont été mises à jour avec leur type.`);

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        if (connection) connection.end();
    }
};

updateSchoolTypes();