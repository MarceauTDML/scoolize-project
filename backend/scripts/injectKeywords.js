const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const CSV_FILE_PATH = path.join(__dirname, 'fr-esr-cartographie_formations_parcoursup.csv');

const injectKeywords = async () => {
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

        console.log('Lecture du CSV...');
        const data = fs.readFileSync(CSV_FILE_PATH, 'utf8');
        const lines = data.split('\n');
        const headers = lines[0].split(';');
        
        const idxUAI = headers.indexOf('Identifiant de l\'établissement');
        const idxTypeForm = headers.indexOf('Types de formation');
        const idxSpe = headers.indexOf('Mentions/Spécialités');
        const idxInterest = headers.indexOf('Centres d’intérêt');

        console.log('Injection des mots-clés dans les descriptions...');
        
        let count = 0;
        const processedUAI = new Set();

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const cols = line.split(';');

            const uai = cols[idxUAI];
            if (!uai || processedUAI.has(uai)) continue;
            processedUAI.add(uai);

            const richDescription = `
                Type: ${cols[idxTypeForm] || ''}. 
                Spécialité: ${cols[idxSpe] || ''}. 
                ${cols[idxInterest] || ''}
            `.replace(/'/g, " ");

            const email = `contact.${uai.toLowerCase()}@scoolize.fr`;

            const query = `
                UPDATE school_details d
                JOIN users u ON u.id = d.user_id
                SET d.description = ?
                WHERE u.email = ?
            `;

            const [result] = await connection.query(query, [richDescription, email]);
            
            if (result.affectedRows > 0) {
                count++;
                if (count % 100 === 0) process.stdout.write('.');
            }
        }

        console.log(`\n\nTerminé ! ${count} écoles ont maintenant une description détaillée.`);

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        if (connection) connection.end();
    }
};

injectKeywords();