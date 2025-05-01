import { Flashcard } from './types'; 

console.log("Popup script loaded!");

// Get references to HTML elements early
const displayDiv = document.getElementById("selected-text-display");
const saveButton = document.getElementById("save-button");
// Example reference for card count display (ensure element exists in popup.html)
const cardCountElement = document.getElementById('card-count-display');

// --- Variable to hold loaded cards ---
let loadedFlashcards: Flashcard[] = []; // Initialize as empty array

async function startWebcam() {
  try {
    const video = document.getElementById("webcam") as HTMLVideoElement;
    if (!video) {
      console.error("Webcam video element not found!");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
    console.log("Webcam feed started.");
  } catch (err) {
    console.error("Error accessing webcam:", err);
  }
}


document.addEventListener('DOMContentLoaded', async () => {
  // Existing logic...
  requestSelectedText();
  await startWebcam(); // ✅ Start webcam feed here
  // ...
});


// Define updateDisplay function (for selected text)
function updateDisplay(text: string | null) {
  if (displayDiv) {
    if (text) {
      displayDiv.textContent = text;
      console.log("Displayed text:", text);
    } else {
      displayDiv.textContent = "(No text captured or error occurred)";
      console.log("No recent text found or error occurred.");
    }
  } else {
    console.error("Could not find the display element #selected-text-display");
  }
}


function updateCardCountDisplay() {
    if (cardCountElement) {
        cardCountElement.textContent = `Total Cards: ${loadedFlashcards.length}`;
    }
}

// Listener for IMMEDIATE updates (e.g., text selected while popup is open)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Popup received message:", message);
  if (message.type === "CONTENT_SCRIPT_SELECTION") {
    updateDisplay(message.text);
  }
});

// Function to request selected text when popup opens
async function requestSelectedText() {
  console.log("Popup requesting text from content script...");
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("Active tabs found:", tabs); // Debug log

    if (tabs.length === 0) {
      console.log("No active tab found.");
      updateDisplay(null);
      return;
    }
    const activeTabId = tabs[0]?.id;
    console.log("Attempting to send to tab ID:", activeTabId); // Debug log

    if (activeTabId) {
      const response = await chrome.tabs.sendMessage(activeTabId, {
        type: "POPUP_GET_SELECTED_TEXT"
      });

      console.log("Popup received response:", response); // Debug log
      if (response && typeof response.text !== 'undefined') {
           updateDisplay(response.text);
      } else {
           console.log("Response from content script missing or invalid:", response);
           updateDisplay(null);
      }
    } else {
      console.log("Could not get active tab ID.");
      updateDisplay(null);
    }
  } catch (error) {
    console.error("Error caught during chrome.tabs.sendMessage or processing response:", error);
    updateDisplay(null);
  }
}


// --- Code that runs after the popup HTML is loaded ---
document.addEventListener('DOMContentLoaded', async () => { // <<<--- Make DOMContentLoaded async
  // Request the selected text when the popup loads
  requestSelectedText(); // Can run concurrently

  //load existing cards
  try {
    const storageKey = 'flashcards';
    console.log('Attempting to load cards from storage...');
    const data = await chrome.storage.local.get(storageKey);
    loadedFlashcards = data?.[storageKey] || []; // Assign to global variable
    console.log(`Loaded ${loadedFlashcards.length} cards successfully.`);

    //display card count
    updateCardCountDisplay(); // Update display based on loaded cards

  } catch (error) {
    console.error("Error loading cards from chrome.storage.local:", error);
    if (cardCountElement) { // Show error state in count display
        cardCountElement.textContent = "Error loading cards.";
    }
  }
  


  // Add listener for the save button
  if (saveButton) {
    console.log("Attempting to add click listener to save button...");
    saveButton.addEventListener('click', async () => { 
      console.log("Save Card button clicked!");

      const frontText = displayDiv?.textContent?.trim();
      // ... (keep front text validation) ...
      if (!frontText || frontText === "(No text captured or error occurred)") { /* ... */ return; }
      console.log("Captured Front Text:", frontText);

      const backText = prompt("Enter the back of the flashcard for:", frontText);
      // ... (keep back text validation) ...
      if (backText === null) { /* ... */ return; }
      const trimmedBackText = backText.trim();
      if (trimmedBackText === "") { /* ... */ return; }
      console.log("Captured Back Text:", trimmedBackText);

      // --- Save to Storage Logic ---
      try {
        console.log("Attempting to save card...");
        const storageKey = 'flashcards';
        // Re-fetch before saving to ensure we have the absolute latest
        const data = await chrome.storage.local.get(storageKey);
        const existingCards: Flashcard[] = data?.[storageKey] || [];
        console.log(`Found ${existingCards.length} existing cards before saving.`);

        const newCard: Flashcard = {
          id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          front: frontText,
          back: trimmedBackText,
          status: 'New',
        };
        console.log("Created new card:", newCard);

        const updatedCards = [...existingCards, newCard];
        await chrome.storage.local.set({ [storageKey]: updatedCards });
        console.log("Card saved successfully to storage!");

        // *** Update local cache and display AFTER successful save ***
        loadedFlashcards = updatedCards; // Update the variable holding cards
        console.log('Updated local card cache. Count:', loadedFlashcards.length);
        updateCardCountDisplay(); // Update the visual count

        alert("Flashcard saved!");

      } catch (error) {
        console.error("Error saving card:", error);
        alert("Error saving flashcard.");
      }
      // --- End Save Logic ---

    }); // End of async click listener
    console.log("Click listener added successfully to save button.");
  } else {
    console.error("Save button NOT found when trying to add listener.");
  }
}); // --- End of async DOMContentLoaded listener ---


// export {}; // Keep commented out