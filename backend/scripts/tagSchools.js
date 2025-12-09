const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const tagSchools = async () => {
    let connection;
    try {
        console.log('Connexion...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        const query = `
            SELECT u.id, u.first_name, d.school_type, d.description, d.website 
            FROM users u
            JOIN school_details d ON u.id = d.user_id
            WHERE u.role = 'school'
        `;
        
        const [schools] = await connection.query(query);
        console.log(`Analyse de ${schools.length} écoles...`);

        let count = 0;

        for (const school of schools) {
            let tags = [];
            const text = (
                (school.first_name || '') + " " + 
                (school.school_type || '') + " " + 
                (school.website || '') + " " +
                (school.description || '')
            ).toLowerCase();

            if (text.includes('art ') || text.includes('arts') || text.includes('design') || text.includes('boulle') || text.includes('estienne') || text.includes('condé') || text.includes('architecture') || text.includes('ensa ') || text.includes('beaux-arts') || text.includes('mode') || text.includes('cinéma') || text.includes('audiovisuel')) {
                tags.push('PROFILE_ART');
            }

            if (text.includes('ingénieur') || text.includes('polytech') || text.includes('insa') || text.includes('mines') || text.includes('telecom') || text.includes('informatique') || text.includes('numérique') || text.includes('technology') || text.includes('science') || text.includes('iut') || text.includes('but')) {
                tags.push('PROFILE_SCIENCE');
            }

            if (text.includes('business') || text.includes('management') || text.includes('commerce') || text.includes('gestion') || text.includes('hec') || text.includes('essec') || text.includes('edhec') || text.includes('esc ') || text.includes('em ')) {
                tags.push('PROFILE_ECO');
            }

            if (text.includes('médecine') || text.includes('santé') || text.includes('infirmier') || text.includes('ifsi') || text.includes('kine') || text.includes('pharmacie') || text.includes('vétérinaire')) {
                tags.push('PROFILE_SANTE');
            }

            if (text.includes('droit') || text.includes('juridique') || text.includes('lettres') || text.includes('humanités') || text.includes('sciences po') || text.includes('iep')) {
                tags.push('PROFILE_LETTRES');
            }

            if (tags.length > 0) {
                const oldDesc = school.description || "Information générale.";
                
                if (!oldDesc.includes('PROFILE_')) {
                    const newDesc = `${oldDesc} \n\n[SYSTEM_TAGS: ${tags.join(', ')}]`;
                    
                    await connection.query("UPDATE school_details SET description = ? WHERE user_id = ?", [newDesc, school.id]);
                    count++;
                }
            }
        }

        console.log(`Terminé ! ${count} écoles ont été tagguées avec précision.`);

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        if (connection) connection.end();
    }
};

tagSchools();