// src/popup.ts
import { Flashcard } from './types'; // <<< Keep this uncommented
import * as tf from '@tensorflow/tfjs';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl'; // Use WebGL backend

console.log("Popup script loaded!");

// --- References to HTML Elements ---
// Elements from teammate's code (or assumed standard)
const displayDiv = document.getElementById("selected-text-display");
const saveButton = document.getElementById("save-button");
const cardCountElement = document.getElementById('card-count-display');
const videoElement = document.getElementById("webcam") as HTMLVideoElement | null;
const gestureOutputElement = document.getElementById('gesture-output');

// Elements needed for Card Viewing (Adding back)
const cardDisplayArea = document.getElementById('card-display-area');
const cardStatusElement = document.getElementById('card-status-display');
const cardFrontElement = document.getElementById('card-front');
const cardBackElement = document.getElementById('card-back');
const prevCardButton = document.getElementById('prev-card-button') as HTMLButtonElement | null;
const showAnswerButton = document.getElementById('show-answer-button') as HTMLButtonElement | null;
const nextCardButton = document.getElementById('next-card-button') as HTMLButtonElement | null;


// --- State Variables ---
let loadedFlashcards: Flashcard[] = []; // Holds all loaded cards - Use Flashcard[] type
let currentCardIndex = 0;             // Index of the card currently displayed
let isBackVisible = false;            // Tracks if the back of the card is shown
let detector: handPoseDetection.HandDetector | null = null;
let lastDetectedActionGesture: string = 'NONE';
let gestureActionCooldown = false;
const GESTURE_COOLDOWN_MS = 1500;

function updateStatusDisplay(status: Flashcard['status']) { // Use the specific status type from Flashcard
  if (!cardStatusElement) return; // Exit if element doesn't exist

  const statusText = status || 'New'; // Default to 'New' if status is undefined

  cardStatusElement.textContent = `Status: ${statusText}`;

  // Optional: Change color based on status for better visual feedback
  switch (statusText) {
      case 'Easy':
      case 'Mastered':
          cardStatusElement.style.color = 'green';
          break;
      case 'Wrong':
      case 'Difficult':
          cardStatusElement.style.color = 'red';
          break;
      case 'Learning':
          cardStatusElement.style.color = 'orange';
          break;
      case 'New':
      default:
          cardStatusElement.style.color = '#666'; // Default grey
          break;
  }
}


// --- Functions ---

// Webcam function from teammate (using 'videoElement' reference)
async function startWebcam() {
  try {
    if (!videoElement) {
      console.error("Webcam video element not found!");
      if(gestureOutputElement) gestureOutputElement.textContent = "Video element missing.";
      return;
    }
    console.log("Requesting webcam access..."); // Added log
    if(gestureOutputElement) gestureOutputElement.textContent = "Requesting access..."; // Update status

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    await new Promise((resolve) => { videoElement.onloadedmetadata = resolve; });
    await videoElement.play(); // Ensure play is awaited or handled correctly

    console.log("Webcam feed started.");

    if(gestureOutputElement) {
      if (!detector) gestureOutputElement.textContent = "Webcam Active. Loading Model...";
        else gestureOutputElement.textContent = "Webcam Active. Model Ready.";
        gestureOutputElement.style.color = 'green';
    }
    return true;
  } catch (err: any) { // Catch specific errors
    console.error("Error accessing webcam:", err);
     if(gestureOutputElement) {
        let errorMsg = `Error: ${err.name || 'Unknown'}`;
        if (err.name === 'NotAllowedError') { errorMsg = "Error: Camera permission denied/dismissed."; }
        else if (err.name === 'NotFoundError') { errorMsg = "Error: No camera found."; }
        gestureOutputElement.textContent = errorMsg;
        gestureOutputElement.style.color = 'red';
    }
    return false;
  }
}


async function loadHandModel() {
  console.log("Loading Hand Pose model...");
  if (gestureOutputElement) gestureOutputElement.textContent = "Loading Model...";
  try {
      await tf.setBackend('webgl'); // Ensure backend is set
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig: handPoseDetection.MediaPipeHandsTfjsModelConfig = {
          runtime: 'tfjs', // or 'mediapipe'
          modelType: 'lite', // 'lite' or 'full'
          maxHands: 1 // Only detect one hand for simplicity
      };
      detector = await handPoseDetection.createDetector(model, detectorConfig);
      console.log("Hand Pose model loaded successfully.");
      if (gestureOutputElement) {
          // Update status only if webcam is already active or message wasn't error
          if (videoElement?.srcObject && gestureOutputElement.style.color !== 'red') {
               gestureOutputElement.textContent = "Model Ready. Webcam Active.";
          } else if (gestureOutputElement.style.color !== 'red') {
               gestureOutputElement.textContent = "Model Ready.";
          }
      }
  } catch (error) {
      console.error("Error loading Hand Pose model:", error);
      detector = null; // Ensure detector is null on failure
      if (gestureOutputElement) {
          gestureOutputElement.textContent = "Error loading model.";
          gestureOutputElement.style.color = 'red';
      }
  }
}


function recognizeGesture(keypoints: handPoseDetection.Keypoint[]): string {
  if (!keypoints || keypoints.length < 21) return 'NONE'; // Need all keypoints

  // Key landmark indices (based on MediaPipe Hands diagram)
  const WRIST = 0;
  const THUMB_CMC = 1, THUMB_MCP = 2, THUMB_IP = 3, THUMB_TIP = 4;
  const INDEX_MCP = 5, INDEX_PIP = 6, INDEX_DIP = 7, INDEX_TIP = 8;
  const MIDDLE_MCP = 9, MIDDLE_PIP = 10, MIDDLE_DIP = 11, MIDDLE_TIP = 12;
  const RING_MCP = 13, RING_PIP = 14, RING_DIP = 15, RING_TIP = 16;
  const PINKY_MCP = 17, PINKY_PIP = 18, PINKY_DIP = 19, PINKY_TIP = 20;

  // --- Simple Gesture Logic (Needs Refinement/Tuning) ---

  // Check if fingers are generally extended (Palm-like)
  const indexFingerExtended = keypoints[INDEX_TIP].y < keypoints[INDEX_PIP].y && keypoints[INDEX_PIP].y < keypoints[INDEX_MCP].y;
  const middleFingerExtended = keypoints[MIDDLE_TIP].y < keypoints[MIDDLE_PIP].y && keypoints[MIDDLE_PIP].y < keypoints[MIDDLE_MCP].y;
  const ringFingerExtended = keypoints[RING_TIP].y < keypoints[RING_PIP].y && keypoints[RING_PIP].y < keypoints[RING_MCP].y;
  const pinkyFingerExtended = keypoints[PINKY_TIP].y < keypoints[PINKY_PIP].y && keypoints[PINKY_PIP].y < keypoints[PINKY_MCP].y;

  // Check if fingers are generally curled (Fist-like)
  const indexFingerCurled = keypoints[INDEX_TIP].y > keypoints[INDEX_MCP].y;
  const middleFingerCurled = keypoints[MIDDLE_TIP].y > keypoints[MIDDLE_MCP].y;
  const ringFingerCurled = keypoints[RING_TIP].y > keypoints[RING_MCP].y;
  const pinkyFingerCurled = keypoints[PINKY_TIP].y > keypoints[PINKY_MCP].y;

  const thumbIsOpen = keypoints[THUMB_TIP].x < keypoints[THUMB_IP].x; // Basic check (for right hand) - adjust if needed
  const thumbIsUp = keypoints[THUMB_TIP].y < keypoints[THUMB_MCP].y && keypoints[THUMB_TIP].y < keypoints[INDEX_PIP].y;
  const thumbIsDown = keypoints[THUMB_TIP].y > keypoints[THUMB_MCP].y && keypoints[THUMB_TIP].y > keypoints[INDEX_PIP].y; // Less precise

  // Thumbs Up (Checklist 2.19)
  if (thumbIsUp && indexFingerCurled && middleFingerCurled && ringFingerCurled && pinkyFingerCurled) {
      // Add a stricter check: thumb tip significantly above index knuckle
      if (keypoints[THUMB_TIP].y < keypoints[INDEX_MCP].y - (keypoints[INDEX_TIP].y - keypoints[INDEX_MCP].y)*0.3) { // Heuristic threshold
           return 'THUMBS_UP';
      }
  }

  // Thumbs Down (Checklist 2.20) - Less reliable, often confused
  if (thumbIsDown && indexFingerCurled && middleFingerCurled && ringFingerCurled && pinkyFingerCurled) {
       // Add a stricter check: thumb tip significantly below index knuckle
       if (keypoints[THUMB_TIP].y > keypoints[INDEX_MCP].y + (keypoints[MIDDLE_MCP].y - keypoints[WRIST].y)*0.1) { // Heuristic
          return 'THUMBS_DOWN';
       }
  }

  // Flat Palm (Checklist 2.21)
  if (indexFingerExtended && middleFingerExtended && ringFingerExtended && pinkyFingerExtended) {
       // Optional: Check thumb is somewhat extended too
       // Optional: Check distances between fingertips are significant
       return 'PALM';
  }

  // Other gestures could be added here...
  

  return 'NONE'; // (Checklist 2.22)
}




async function detectHandsLoop() {
  if (detector && videoElement && videoElement.readyState >= 2) { // Ensure video is ready enough
      try {
          const hands = await detector.estimateHands(videoElement, { flipHorizontal: false }); // (Checklist 2.15)

          let currentGesture = 'NONE'; // Default for this frame

          if (hands && hands.length > 0) { // (Checklist 2.16)
              const keypoints = hands[0].keypoints; // (Checklist 2.17)
              if (keypoints) {
                  currentGesture = recognizeGesture(keypoints); // (Checklist 2.23)

                  // Update display (Checklist 2.25)
                  if (gestureOutputElement) {
                       gestureOutputElement.textContent = `Gesture: ${currentGesture}`;
                       // Maybe add visual feedback?
                       if (currentGesture !== 'NONE') gestureOutputElement.style.fontWeight = 'bold';
                       else gestureOutputElement.style.fontWeight = 'normal';
                  }

                  // --- Handle Gesture Action for Card Review (Checklist 2.28 - 2.32) ---
                  if (currentGesture !== 'NONE' && !gestureActionCooldown && loadedFlashcards.length > 0) {
                       console.log(`Detected Action Gesture: ${currentGesture}`);
                       let actionTaken = false;

                       const currentCard = loadedFlashcards[currentCardIndex];
                       if (!currentCard) {
                           console.warn("Current card not found, cannot process gesture.");
                           // Continue loop without action or cooldown
                       } else {
                          switch (currentGesture) { // (Checklist 2.28)
                              case 'THUMBS_UP':
                                  console.log(`Action: Mark card ${currentCardIndex} as 'Easy'`);
                                  currentCard.status = 'Easy'; // (Checklist 2.29)
                                  updateStatusDisplay(currentCard.status);
                                  actionTaken = true;
                                  break;
                              case 'THUMBS_DOWN':
                                  console.log(`Action: Mark card ${currentCardIndex} as 'Wrong'`);
                                  currentCard.status = 'Wrong'; // (Checklist 2.29)
                                  updateStatusDisplay(currentCard.status);
                                  actionTaken = true;
                                  break;
                              case 'PALM': // Use PALM to show answer or go next? Let's use for Next.
                                  console.log(`Action: Skip/Next card ${currentCardIndex}`);
                                  // No status change, just move next
                                  actionTaken = true;
                                  break;
                              // Add more cases if needed
                          }
                       }


                       if (actionTaken) {
                          // Apply Cooldown (Checklist 2.32)
                          gestureActionCooldown = true;
                          if (gestureOutputElement) gestureOutputElement.textContent += " (Action!)"; // Feedback

                          // TODO: Save updated cards (Checklist 2.30) - Implement proper saving later
                          // await saveUpdatedCards(); // Example function call

                          // Move to Next Card (Checklist 2.31)
                          const nextIndex = (currentCardIndex + 1) % loadedFlashcards.length;
                          displayCardForReview(nextIndex); // Display next

                          // Reset cooldown after delay
                          setTimeout(() => {
                              gestureActionCooldown = false;
                              console.log("Gesture cooldown finished.");
                          }, GESTURE_COOLDOWN_MS);
                       }
                  }
                  // Update last detected gesture state if needed for other logic
                  // lastDetectedActionGesture = currentGesture;

              } else {
                   if (gestureOutputElement) gestureOutputElement.textContent = "Gesture: (No keypoints)";
              }
          } else {
               // No hands detected
               if (gestureOutputElement) gestureOutputElement.textContent = "Gesture: NONE";
          }

      } catch (error) {
          console.error("Error during hand detection:", error);
          // Potentially stop the loop or handle error state
      }
  } else {
      // Conditions not met, maybe log or wait
      // console.log("Detector or video not ready for detection loop.");
       if (!detector && gestureOutputElement && gestureOutputElement.style.color !== 'red') {
           gestureOutputElement.textContent = "Waiting for model...";
       } else if (!videoElement || videoElement.readyState < 2 && gestureOutputElement && gestureOutputElement.style.color !== 'red') {
           gestureOutputElement!.textContent = "Waiting for video...";
       }
  }

  // Request next frame (Checklist 2.14 - Loop continuation)
  requestAnimationFrame(detectHandsLoop);
}






// Update "Create Card" display
function updateDisplay(text: string | null) {
  if (!displayDiv) return;
  if (text) { displayDiv.textContent = text; }
  else { displayDiv.textContent = "(No text captured or error occurred)"; }
  console.log("Create Card display updated.");
}

// Update "Total Cards" display
function updateCardCountDisplay() {
  if (cardCountElement) cardCountElement.textContent = `Total Cards: ${loadedFlashcards.length}`;
}

// Request selected text from content script
async function requestSelectedText() {
  console.log("Requesting selected text...");
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0 || !tabs[0]?.id) { console.log("No active tab."); updateDisplay(null); return; }
    const activeTabId = tabs[0].id;
    const response = await chrome.tabs.sendMessage(activeTabId, { type: "POPUP_GET_SELECTED_TEXT" });
    if (response?.text) { updateDisplay(response.text); }
    else { console.log("No text in response."); updateDisplay(null); }
  } catch (error) { console.error("Error requesting text:", error); updateDisplay(null); }
}

// Display card in the viewer section (Adding back)
function displayCardForReview(index: number) {
  console.log(`Attempting to display card at index: ${index}`);
  if (!cardFrontElement || !cardBackElement || !cardStatusElement) { console.error("Card display elements missing!"); return; }

  if (loadedFlashcards.length === 0) {
    cardFrontElement.textContent = "(No cards saved)";
    cardBackElement.textContent = "";
    cardBackElement.style.display = 'none';
    updateStatusDisplay(undefined);
    isBackVisible = false;
    if (showAnswerButton) showAnswerButton.textContent = "Show Answer";
    // Disable buttons if no cards?
     if (prevCardButton) prevCardButton.disabled = true;
     if (nextCardButton) nextCardButton.disabled = true;
     if (showAnswerButton) showAnswerButton.disabled = true;
    return;
  }
  // Enable buttons if cards exist
    if (prevCardButton) prevCardButton.disabled = false;
    if (nextCardButton) nextCardButton.disabled = false;
    if (showAnswerButton) showAnswerButton.disabled = false;

  if (index < 0 || index >= loadedFlashcards.length) {
      console.warn(`Invalid index ${index} requested, wrapping to 0.`);
      index = 0; // Wrap index or handle as error
  }

  const card = loadedFlashcards[index];
  currentCardIndex = index; // Update the current index state

  cardFrontElement.textContent = card.front;
  cardBackElement.textContent = card.back;
  cardBackElement.style.display = 'none'; // Always hide back initially
  isBackVisible = false;
  if (showAnswerButton) showAnswerButton.textContent = "Show Answer";

  updateStatusDisplay(card.status);

  // Optional: Display status on the card?
  // cardFrontElement.textContent = `${card.front} [${card.status || 'New'}]`;

  console.log(`Displaying card ${index + 1}/${loadedFlashcards.length} (Status: ${card.status || 'New'})`);
}


// --- Event Listeners ---

// Listener for messages from content script (keep as is)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CONTENT_SCRIPT_SELECTION") { updateDisplay(message.text); }
});

// Listener for when the popup's HTML is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded.');
  requestSelectedText(); // Request selected text for create section

  // Start Webcam Feed (Using teammate's function)
  // Note: This runs concurrently with card loading
  const webcamStarted = await startWebcam();
  await loadHandModel();

  if (webcamStarted && detector) {
    console.log("Starting hand detection loop...");
    detectHandsLoop(); // Start the detection loop (Checklist 2.14 called)
} else {
    console.warn("Webcam or Hand Pose Detector failed to initialize. Detection loop not started.");
    if(gestureOutputElement && gestureOutputElement.style.color !== 'red') {
         gestureOutputElement.textContent = "Detection disabled.";
    }
}





  // Load existing flashcards
  try {
    const storageKey = 'flashcards';
    console.log('Loading cards...');
    const data = await chrome.storage.local.get(storageKey);
    loadedFlashcards = data?.[storageKey] || []; // Use Flashcard[] type
    console.log(`Loaded ${loadedFlashcards.length} cards.`);
    updateCardCountDisplay();

    // Display the first card in the viewer section (Adding back)
    displayCardForReview(0);

  } catch (error) {
    console.error("Error loading cards:", error);
    if (cardCountElement) cardCountElement.textContent = "Error loading cards.";
    displayCardForReview(0); // Show empty state
  }

  // --- Attach Listeners to Buttons ---

  // Save Button Listener (keep as is, ensure Flashcard types are used)
  if (saveButton) {
    saveButton.addEventListener('click', async () => {
      console.log("Save Card button clicked!");
      const frontText = displayDiv?.textContent?.trim();
      if (!frontText || frontText === "(No text captured or error occurred)") { alert("Select text first!"); return; }
      const backText = prompt("Enter back of card:", frontText);
      if (backText === null) { console.log("User cancelled."); return; }
      const trimmedBackText = backText.trim();
      if (trimmedBackText === "") { alert("Back cannot be empty."); return; }

      try {
          const storageKey = 'flashcards';
          const data = await chrome.storage.local.get(storageKey);
          const existingCards: Flashcard[] = data?.[storageKey] || []; // Use Flashcard[]
          const newCard: Flashcard = { // Use Flashcard
              id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              front: frontText, back: trimmedBackText, status: 'New',
          };
          const updatedCards = [...existingCards, newCard];
          await chrome.storage.local.set({ [storageKey]: updatedCards });
          loadedFlashcards = updatedCards;
          updateCardCountDisplay();
          alert("Flashcard saved!");
      } catch (error) { console.error("Error saving card:", error); alert("Error saving."); }
      if (loadedFlashcards.length === 1) {
        displayCardForReview(0);
    }
      
    });

    console.log("Save button listener added.");
  } else { console.error("Save button not found."); }

  // Show/Hide Answer Button Listener (Adding back)
  if (showAnswerButton && cardBackElement) {
      showAnswerButton.addEventListener('click', () => {
          if (loadedFlashcards.length === 0) return;
          if (isBackVisible) {
              cardBackElement.style.display = 'none';
              showAnswerButton.textContent = 'Show Answer';
              isBackVisible = false;
          } else {
              cardBackElement.style.display = 'block';
              showAnswerButton.textContent = 'Hide Answer';
              isBackVisible = true;
          }
      });
       console.log("Show Answer button listener added.");
  } else { console.warn("Show Answer button or card back element not found."); }

  // Next Card Button Listener (Adding back)
  if (nextCardButton) {
      nextCardButton.addEventListener('click', () => {
          if (loadedFlashcards.length > 0) {
              let nextIndex = (currentCardIndex + 1) % loadedFlashcards.length;
              displayCardForReview(nextIndex);
          }
      });
       console.log("Next Card button listener added.");
  } else { console.warn("Next Card button not found."); }

  // Previous Card Button Listener (Adding back)
  if (prevCardButton) {
      prevCardButton.addEventListener('click', () => {
          if (loadedFlashcards.length > 0) {
              let prevIndex = (currentCardIndex - 1 + loadedFlashcards.length) % loadedFlashcards.length;
              displayCardForReview(prevIndex);
          }
      });
       console.log("Prev Card button listener added.");
  } else { console.warn("Previous Card button not found."); }
  // --- End Button Listeners ---

});
// --- End DOMContentLoaded ---

// No explicit export {} needed if import causes issues without type="module"