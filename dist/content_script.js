// src/content_script.ts
function getSelectedText() {
  const selection = window.getSelection();
  if (selection) {
    return selection.toString().trim();
  }
  return "";
}
console.log("Flashcard Content Script Loaded!");
var lastSelectedText = null;
document.addEventListener("mouseup", () => {
  const text = getSelectedText();
  if (text) {
    console.log("Content Script captured selection:", text);
    lastSelectedText = text;
    chrome.runtime.sendMessage({
      type: "CONTENT_SCRIPT_SELECTION",
      text
    }).catch((err) => {
    });
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("!!! CS Received Message! Type:", message?.type, "From:", sender?.origin);
  if (message.type === "POPUP_GET_SELECTED_TEXT") {
    console.log("!!! CS -> POPUP_GET_SELECTED_TEXT type matched!");
    console.log("!!! CS -> Sending back:", lastSelectedText);
    sendResponse({ text: lastSelectedText });
    return true;
  }
});
//# sourceMappingURL=content_script.js.map
