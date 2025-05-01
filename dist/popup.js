var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log("Popup script loaded!");
// --- References to HTML Elements ---
// Elements from teammate's code (or assumed standard)
const displayDiv = document.getElementById("selected-text-display");
const saveButton = document.getElementById("save-button");
const cardCountElement = document.getElementById('card-count-display');
const videoElement = document.getElementById("webcam"); // Match teammate's ID
const gestureOutputElement = document.getElementById('gesture-output');
// Elements needed for Card Viewing (Adding back)
const cardDisplayArea = document.getElementById('card-display-area');
const cardFrontElement = document.getElementById('card-front');
const cardBackElement = document.getElementById('card-back');
const prevCardButton = document.getElementById('prev-card-button');
const showAnswerButton = document.getElementById('show-answer-button');
const nextCardButton = document.getElementById('next-card-button');
// --- State Variables ---
let loadedFlashcards = []; // Holds all loaded cards - Use Flashcard[] type
let currentCardIndex = 0; // Index of the card currently displayed
let isBackVisible = false; // Tracks if the back of the card is shown
// --- Functions ---
// Webcam function from teammate (using 'videoElement' reference)
function startWebcam() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!videoElement) {
                console.error("Webcam video element not found!");
                if (gestureOutputElement)
                    gestureOutputElement.textContent = "Video element missing.";
                return;
            }
            console.log("Requesting webcam access..."); // Added log
            if (gestureOutputElement)
                gestureOutputElement.textContent = "Requesting access..."; // Update status
            const stream = yield navigator.mediaDevices.getUserMedia({ video: true });
            videoElement.srcObject = stream;
            yield videoElement.play(); // Ensure play is awaited or handled correctly
            console.log("Webcam feed started.");
            if (gestureOutputElement) {
                gestureOutputElement.textContent = "Webcam Active"; // Update status on success
                gestureOutputElement.style.color = 'green';
            }
        }
        catch (err) { // Catch specific errors
            console.error("Error accessing webcam:", err);
            if (gestureOutputElement) {
                let errorMsg = `Error: ${err.name || 'Unknown'}`;
                if (err.name === 'NotAllowedError') {
                    errorMsg = "Error: Camera permission denied/dismissed.";
                }
                else if (err.name === 'NotFoundError') {
                    errorMsg = "Error: No camera found.";
                }
                gestureOutputElement.textContent = errorMsg;
                gestureOutputElement.style.color = 'red';
            }
        }
    });
}
// Update "Create Card" display
function updateDisplay(text) {
    if (!displayDiv)
        return;
    if (text) {
        displayDiv.textContent = text;
    }
    else {
        displayDiv.textContent = "(No text captured or error occurred)";
    }
    console.log("Create Card display updated.");
}
// Update "Total Cards" display
function updateCardCountDisplay() {
    if (cardCountElement)
        cardCountElement.textContent = `Total Cards: ${loadedFlashcards.length}`;
}
// Request selected text from content script
function requestSelectedText() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log("Requesting selected text...");
        try {
            const tabs = yield chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs.length === 0 || !((_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.id)) {
                console.log("No active tab.");
                updateDisplay(null);
                return;
            }
            const activeTabId = tabs[0].id;
            const response = yield chrome.tabs.sendMessage(activeTabId, { type: "POPUP_GET_SELECTED_TEXT" });
            if (response === null || response === void 0 ? void 0 : response.text) {
                updateDisplay(response.text);
            }
            else {
                console.log("No text in response.");
                updateDisplay(null);
            }
        }
        catch (error) {
            console.error("Error requesting text:", error);
            updateDisplay(null);
        }
    });
}
// Display card in the viewer section (Adding back)
function displayCardForReview(index) {
    console.log(`Attempting to display card at index: ${index}`);
    if (!cardFrontElement || !cardBackElement) {
        console.error("Card display elements missing!");
        return;
    }
    if (loadedFlashcards.length === 0) {
        cardFrontElement.textContent = "(No cards saved)";
        cardBackElement.textContent = "";
        cardBackElement.style.display = 'none';
        isBackVisible = false;
        if (showAnswerButton)
            showAnswerButton.textContent = "Show Answer";
        return;
    }
    if (index < 0 || index >= loadedFlashcards.length) {
        index = 0;
    } // Wrap index
    const card = loadedFlashcards[index];
    currentCardIndex = index;
    cardFrontElement.textContent = card.front;
    cardBackElement.textContent = card.back;
    cardBackElement.style.display = 'none'; // Always hide back initially
    isBackVisible = false;
    if (showAnswerButton)
        showAnswerButton.textContent = "Show Answer";
    console.log(`Displaying card ${index + 1}/${loadedFlashcards.length}`);
}
// --- Event Listeners ---
// Listener for messages from content script (keep as is)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "CONTENT_SCRIPT_SELECTION") {
        updateDisplay(message.text);
    }
});
// Listener for when the popup's HTML is fully loaded
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('DOM Content Loaded.');
    requestSelectedText(); // Request selected text for create section
    // Start Webcam Feed (Using teammate's function)
    // Note: This runs concurrently with card loading
    startWebcam();
    // Load existing flashcards
    try {
        const storageKey = 'flashcards';
        console.log('Loading cards...');
        const data = yield chrome.storage.local.get(storageKey);
        loadedFlashcards = (data === null || data === void 0 ? void 0 : data[storageKey]) || []; // Use Flashcard[] type
        console.log(`Loaded ${loadedFlashcards.length} cards.`);
        updateCardCountDisplay();
        // Display the first card in the viewer section (Adding back)
        displayCardForReview(0);
    }
    catch (error) {
        console.error("Error loading cards:", error);
        if (cardCountElement)
            cardCountElement.textContent = "Error loading cards.";
        displayCardForReview(0); // Show empty state
    }
    // --- Attach Listeners to Buttons ---
    // Save Button Listener (keep as is, ensure Flashcard types are used)
    if (saveButton) {
        saveButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            console.log("Save Card button clicked!");
            const frontText = (_a = displayDiv === null || displayDiv === void 0 ? void 0 : displayDiv.textContent) === null || _a === void 0 ? void 0 : _a.trim();
            if (!frontText || frontText === "(No text captured or error occurred)") {
                alert("Select text first!");
                return;
            }
            const backText = prompt("Enter back of card:", frontText);
            if (backText === null) {
                console.log("User cancelled.");
                return;
            }
            const trimmedBackText = backText.trim();
            if (trimmedBackText === "") {
                alert("Back cannot be empty.");
                return;
            }
            try {
                const storageKey = 'flashcards';
                const data = yield chrome.storage.local.get(storageKey);
                const existingCards = (data === null || data === void 0 ? void 0 : data[storageKey]) || []; // Use Flashcard[]
                const newCard = {
                    id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    front: frontText, back: trimmedBackText, status: 'New',
                };
                const updatedCards = [...existingCards, newCard];
                yield chrome.storage.local.set({ [storageKey]: updatedCards });
                loadedFlashcards = updatedCards;
                updateCardCountDisplay();
                alert("Flashcard saved!");
            }
            catch (error) {
                console.error("Error saving card:", error);
                alert("Error saving.");
            }
        }));
        console.log("Save button listener added.");
    }
    else {
        console.error("Save button not found.");
    }
    // Show/Hide Answer Button Listener (Adding back)
    if (showAnswerButton && cardBackElement) {
        showAnswerButton.addEventListener('click', () => {
            if (loadedFlashcards.length === 0)
                return;
            if (isBackVisible) {
                cardBackElement.style.display = 'none';
                showAnswerButton.textContent = 'Show Answer';
                isBackVisible = false;
            }
            else {
                cardBackElement.style.display = 'block';
                showAnswerButton.textContent = 'Hide Answer';
                isBackVisible = true;
            }
        });
        console.log("Show Answer button listener added.");
    }
    else {
        console.warn("Show Answer button or card back element not found.");
    }
    // Next Card Button Listener (Adding back)
    if (nextCardButton) {
        nextCardButton.addEventListener('click', () => {
            if (loadedFlashcards.length > 0) {
                let nextIndex = (currentCardIndex + 1) % loadedFlashcards.length;
                displayCardForReview(nextIndex);
            }
        });
        console.log("Next Card button listener added.");
    }
    else {
        console.warn("Next Card button not found.");
    }
    // Previous Card Button Listener (Adding back)
    if (prevCardButton) {
        prevCardButton.addEventListener('click', () => {
            if (loadedFlashcards.length > 0) {
                let prevIndex = (currentCardIndex - 1 + loadedFlashcards.length) % loadedFlashcards.length;
                displayCardForReview(prevIndex);
            }
        });
        console.log("Prev Card button listener added.");
    }
    else {
        console.warn("Previous Card button not found.");
    }
    // --- End Button Listeners ---
}));

// --- End DOMContentLoaded ---
// No explicit export {} needed if import causes issues without type="module"
