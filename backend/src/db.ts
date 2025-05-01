import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
}

const pool = new Pool({
    connectionString: connectionString,
    // Optional: Add SSL configuration if connecting to a cloud DB
    // ssl: {
    //   rejectUnauthorized: false 
    // }
});

console.log("Database pool created.");

// Optional: Test connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Successfully connected to the database.');
    client?.release();
});


export const createFlashcardsTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS flashcards (
        id SERIAL PRIMARY KEY, -- Simple auto-incrementing ID
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'New', -- Match frontend types
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_reviewed TIMESTAMP WITH TIME ZONE
    );
    `;
    try {
        await pool.query(createTableQuery);
        console.log("Checked/created 'flashcards' table successfully.");
    } catch (err) {
        console.error("Error creating flashcards table:", err);
        // process.exit(1);
    }
};

export default pool; 