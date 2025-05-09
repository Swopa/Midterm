function getSelectedText(): string {
  const selection = window.getSelection();
  if (selection) {
    return selection.toString().trim();
  }
  return "";
}

console.log("Flashcard Content Script Loaded!");

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
  //logging for checking errors
  console.log("!!! CS Received Message! Type:", message?.type, "From:", sender?.origin);

  if (message.type === "POPUP_GET_SELECTED_TEXT") {
    console.log("!!! CS -> POPUP_GET_SELECTED_TEXT type matched!");
    // Access lastSelectedText correctly
    console.log("!!! CS -> Sending back:", lastSelectedText);

    
    sendResponse({ text: lastSelectedText });

    // Optional: Clear text after sending if you only want it retrieved once
    // lastSelectedText = null;

    
    
    return true;
  }
  // For other message types, implicitly return undefined (no async response needed)
});
// --- End of listener ---

// export {}; // Optional