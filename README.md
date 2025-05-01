# Gesture-Controlled Flashcard Chrome Extension

This project allows users to create flashcards from text selected on web pages and review them using webcam-based hand gestures.
It features a Chrome Extension frontend built with TypeScript and TensorFlow.js for gesture recognition, 
and a backend API server built with Node.js, Express, TypeScript, and PostgreSQL for persistent storage.

## Features

*   **Flashcard Creation:** Select text on any webpage, open the extension popup, and save it as the front of a flashcard (prompts for the back).
*   **Gesture-Based Review:** Use your webcam to review flashcards:
    *   **Thumbs Up:** Mark the current card as 'Easy'.
    *   **Thumbs Down:** Mark the current card as 'Wrong'.
    *   **Middle Finger Up:** Mark the current card as 'Difficult' (Example action).
    *   **Palm:** Skip to the next card.
    *   *(Other gestures can be added)*
*   **Button Navigation:** Traditional next/previous card buttons and show/hide answer functionality.
*   **Webcam Feed:** Displays the live webcam feed within the extension popup.
*   **Gesture Recognition:** Utilizes TensorFlow.js and the MediaPipe Hands model for real-time hand tracking and gesture detection.
*   **Persistent Storage:** Flashcards and their review statuses are saved to a PostgreSQL database via a backend API.
*   **Separate Frontend/Backend:** Clear separation between the browser extension logic and the data persistence layer.
