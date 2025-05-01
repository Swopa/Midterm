# Gesture-Controlled Flashcard Chrome Extension (Local Storage Version)

This project is a Chrome Extension that allows users to create flashcards from text selected on web pages and review them using webcam-based hand gestures. Flashcards are stored **locally** within the browser using `chrome.storage.local`.


## Features

*   **Flashcard Creation:** Select text on any webpage, open the extension popup, and save it as the front of a flashcard (prompts for the back).
*   **Gesture-Based Review:** Use your webcam to review flashcards:
    *   **Thumbs Up:** Mark the current card as 'Easy'.
    *   **Thumbs Down:** Mark the current card as 'Wrong'.
    *   **Palm:** Skip to the next card.
    *   *(Other gestures can be added)*
*   **Button Navigation:** Traditional next/previous card buttons and show/hide answer functionality.
*   **Webcam Feed:** Displays the live webcam feed within the extension popup.
*   **Gesture Recognition:** Utilizes TensorFlow.js and the MediaPipe Hands model for real-time hand tracking and gesture detection.


*   ## Tech Stack

**Frontend (Chrome Extension - `src/` directory):**

*   TypeScript
*   HTML5 / CSS3
*   TensorFlow.js (`@tensorflow/tfjs`)
*   TensorFlow.js Hand Pose Detection Model (`@tensorflow-models/hand-pose-detection`)
*   Chrome Extension APIs (`chrome.*`)
*   `esbuild` (for bundling TypeScript and dependencies)

## Prerequisites

*   **Node.js and npm (or Yarn):** Required for installing dependencies and running the build script. Download from [https://nodejs.org/](https://nodejs.org/)
*   **Google Chrome:** Required for installing and running the unpacked extension.
*   **Webcam:** Required for the gesture recognition feature. ( Allow permission is needed! ) 

## Setup & Installation

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder-name>
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
    *This installs the necessary build tools (like `esbuild`, `typescript`) and runtime libraries (like `@tensorflow/tfjs`).*

3.  **Build the Extension:**
    ```bash
    npm run build
    # or
    # yarn build
    ```
    *This command uses your bundler (`esbuild` in the previous examples) to compile the TypeScript files from `src/` and bundle them with dependencies into the `dist/` folder.*

## Loading the Extension in Chrome

1.  Open Google Chrome and navigate to `chrome://extensions/`.
2.  Enable **"Developer mode"** using the toggle switch (usually in the top-right corner).
3.  Click the **"Load unpacked"** button.
4.  Navigate to and select the **root folder** of this project (the one containing `manifest.json`, `src/`, `dist/`, etc.). **Do NOT select the `dist/` folder directly.**
5.  The extension icon should appear in your Chrome toolbar.

## How to Use

1.  **Select Text:** Highlight some text on any webpage.
2.  **Open Popup:** Click the extension icon in your Chrome toolbar.
3.  **Create Card:** The selected text will appear as the 'Front'. Click "Save as Flashcard Front". You'll be prompted to enter the text for the 'Back' of the card. Click OK. The card is saved to the browser's local storage.
4.  **Review Cards:**
    *   The popup displays the front of a flashcard loaded from local storage. The current status ('New', 'Easy', 'Wrong', etc.) is shown below the front text.
    *   Click "Show Answer" or click directly on the card display area to reveal the back. Click again to hide.
    *   Use the `< Prev` and `Next >` buttons to navigate manually.
    *   **Gesture Control:**
        *   Ensure the webcam feed is active in the popup. You may need to grant permission the first time.
        *   Position your hand clearly in front of the webcam.
        *   Make one of the recognized gestures (Thumbs Up, Thumbs Down, Palm).
        *   The gesture will be detected, the card's status updated **in local storage**, and the next card will be shown automatically after a short cooldown. The detected gesture and status change will be briefly indicated.
5.  **Card Count:** The total number of cards stored locally is displayed at the top of the popup.

## Future Improvements / TODOs

*   Implement a local Spaced Repetition System (SRS) algorithm using `chrome.storage.local` and timestamps.
*   Improve gesture recognition accuracy or add more gestures.
*   Add an options page for configuring gesture actions or other settings.
*   Implement card deletion and editing functionality within local storage.
*   Add import/export functionality to back up or share locally stored cards.
*   Provide visual feedback during model loading.
*   Consider adding a simple backend later for syncing cards across devices (optional).
*   Working Backend.
