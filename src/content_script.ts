// src/content_script.ts

function getSelectedText(): string {
  const selection = window.getSelection();
  if (selection) {
    return selection.toString().trim();
  }
  return "";
}

console.log("Flashcard Content Script Loaded!");

// Variable MUST be declared before use
let lastSelectedText: string | null = null;

document.addEventListener('mouseup', () => {
  const text = getSelectedText();
  if (text) {
    console.log("Content Script captured selection:", text);
    lastSelectedText = text; // Store the text

    // Still send immediate message in case popup is open
    chrome.runtime.sendMessage({
        type: "CONTENT_SCRIPT_SELECTION",
        text: text
    }).catch(err => { /* Ignore "no receiving end" error */ });
  }
});

// --- Listener for messages FROM the popup ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Keep the logging - it's useful
  console.log("!!! CS Received Message! Type:", message?.type, "From:", sender?.origin);

  if (message.type === "POPUP_GET_SELECTED_TEXT") {
    console.log("!!! CS -> POPUP_GET_SELECTED_TEXT type matched!");
    // Access lastSelectedText correctly
    console.log("!!! CS -> Sending back:", lastSelectedText);

    // >>> UNCOMMENT THE NEXT LINE <<<
    sendResponse({ text: lastSelectedText });

    // Optional: Clear text after sending if you only want it retrieved once
    // lastSelectedText = null;

    // >>> UNCOMMENT THE NEXT LINE <<<
    // Indicate you intend to send a response asynchronously. Crucial!
    return true;
  }
  // For other message types, implicitly return undefined (no async response needed)
});
// --- End of listener ---

// export {}; // Optional