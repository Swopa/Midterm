// src/types.ts

// Define the structure for a single Flashcard
export interface Flashcard {
    id: string;       // Unique identifier for the card (e.g., timestamp or UUID)
    front: string;      // The text for the front of the card (the selected text)
    back: string;       // The text for the back of the card (answer/definition)
    status?: 'New' | 'Learning' | 'Mastered' | 'Difficult'; // Optional: Tracking review status
    lastReviewed?: number; // Optional: Timestamp of last review
    nextReview?: number;   // Optional: Timestamp for next scheduled review (for SRS)
  }
  
  // We can add other shared types here later if needed