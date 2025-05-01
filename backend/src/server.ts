/*import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { createFlashcardsTable } from './db'; // Import pool and setup function

interface DbFlashcard {
    id: number; 
    front: string;
    back: string;
    status?: string;
    created_at?: Date;
    last_reviewed?: Date;
}


dotenv.config(); 

const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); // Enable CORS for all origins (adjust for production) (3.17)
app.use(express.json()); // Parse JSON request bodies

// Basic logging middleware (optional)
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// --- Routes ---

// GET /api/cards - Fetch all flashcards (3.10, 3.11)
app.get('/api/cards', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await pool.query<DbFlashcard>('SELECT * FROM flashcards ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching cards:", err);
        next(err); // Pass error to the error handler
    }
});

// POST /api/cards - Create a new flashcard (3.12, 3.13)
app.post('/api/cards', async (req: Request, res: Response, next: NextFunction) => {
    const { front, back } = req.body;

    // Basic validation
    if (!front || !back) {
        return res.status(400).json({ message: 'Front and back content are required.' });
    }

    try {
        const result = await pool.query<DbFlashcard>(
            'INSERT INTO flashcards (front, back, status) VALUES ($1, $2, $3) RETURNING *',
            [front, back, 'New'] // Default status
        );
        res.status(201).json(result.rows[0]); // Send back the newly created card
    } catch (err) {
        console.error("Error inserting card:", err);
        next(err);
    }
});

// PUT /api/cards/:id/review - Update a card's status (3.14, 3.15)
app.put('/api/cards/:id/review', async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body; // Expecting { "status": "Easy" | "Wrong" | etc. }

    // Basic validation
    const cardId = parseInt(id, 10);
    if (isNaN(cardId)) {
        return res.status(400).json({ message: 'Invalid card ID.' });
    }
    if (!status) {
         return res.status(400).json({ message: 'Status is required.' });
    }
    // Optional: Validate status against allowed values if needed

    try {
        const result = await pool.query<DbFlashcard>(
            'UPDATE flashcards SET status = $1, last_reviewed = NOW() WHERE id = $2 RETURNING *',
            [status, cardId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Flashcard not found.' });
        }

        res.json(result.rows[0]); // Send back the updated card
    } catch (err) {
        console.error("Error updating card status:", err);
        next(err);
    }
});

// --- Basic Error Handling Middleware (3.16) ---
// Add this AFTER all your routes
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Global Error Handler:", err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});


// --- Start Server ---
app.listen(port, async () => {
    console.log(`Backend server listening on http://localhost:${port}`);
    await createFlashcardsTable();
});
*/