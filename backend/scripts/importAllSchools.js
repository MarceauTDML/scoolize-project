const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const CSV_FILE_PATH = path.join(__dirname, 'fr-esr-cartographie_formations_parcoursup.csv');

const importAllSchools = async () => {
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
        const idxName = headers.indexOf('Nom de l\'établissement');
        const idxCity = headers.indexOf('Commune');
        const idxRegion = headers.indexOf('Région');
        const idxDept = headers.indexOf('Département');
        const idxWebsite = headers.indexOf('Site internet de l\'établissement');
        const idxLoc = headers.indexOf('Localisation');
        const idxDesc = headers.indexOf('Informations complémentaires');

        const processedUAI = new Set();

        const defaultHash = await bcrypt.hash('scoolize2024', 10);

        console.log('Démarrage de l\'importation massive...');
        let count = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(';');

            const uai = cols[idxId];
            const name = cols[idxName];
            const city = cols[idxCity];

            if (!uai || !name || processedUAI.has(uai)) {
                continue;
            }

            processedUAI.add(uai);

            const region = cols[idxRegion] || '';
            const dept = cols[idxDept] || '';
            let website = cols[idxWebsite] || '';
            const desc = cols[idxDesc] || "Formation disponible sur Parcoursup";
            
            let lat = null, lon = null;
            if (cols[idxLoc] && cols[idxLoc].includes(',')) {
                const parts = cols[idxLoc].split(',');
                lat = parts[0].trim();
                lon = parts[1].trim();
            }

            if (website && !website.startsWith('http')) {
                website = 'http://' + website;
            }

            const email = `contact.${uai.toLowerCase()}@scoolize.fr`;

            try {
                const [userRes] = await connection.query(
                    `INSERT INTO users (email, password, first_name, last_name, role, status) 
                     VALUES (?, ?, ?, ?, 'school', 'active')`,
                    [email, defaultHash, name, city]
                );

                const userId = userRes.insertId;

                await connection.query(
                    `INSERT INTO school_details 
                    (user_id, description, address, website, phone, region, department, latitude, longitude) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [userId, desc.substring(0, 500), city, website, '', region, dept, lat, lon]
                );

                count++;
                if (count % 100 === 0) process.stdout.write('.');

            } catch (err) {
                if (err.code !== 'ER_DUP_ENTRY') {
                    console.error(`\nErreur ligne ${i} (${name}):`, err.message);
                }
            }
        }

        console.log(`\n\nTerminé ! ${count} nouvelles écoles importées.`);
        console.log(`Mot de passe pour toutes les écoles : "scoolize2024"`);

    } catch (error) {
        console.error('Erreur critique:', error);
    } finally {
        if (connection) connection.end();
    }
};

importAllSchools();