"use strict";
// src/popup.ts
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
// <<<--- Get reference to displayDiv early ---
const displayDiv = document.getElementById("selected-text-display");
// <<<--- Define updateDisplay function BEFORE it's called ---
function updateDisplay(text) {
    if (displayDiv) {
        if (text) {
            displayDiv.textContent = text;
            console.log("Displayed text:", text);
        }
        else {
            // Display a clearer message if no text or error
            displayDiv.textContent = "(No text captured or error occurred)";
            console.log("No recent text found or error occurred.");
        }
    }
    else {
        console.error("Could not find the display element #selected-text-display");
    }
}
// <<<--- End of function definition ---
// --- Listener for IMMEDIATE updates ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Popup received message:", message);
    if (message.type === "CONTENT_SCRIPT_SELECTION") {
        // Now it can call the function correctly
        updateDisplay(message.text);
    }
});
// --- Code to run when the popup OPENS ---
function requestSelectedText() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log("Popup requesting text from content script...");
        try {
            const tabs = yield chrome.tabs.query({ active: true, currentWindow: true });
            console.log("Active tabs found:", tabs);
            if (tabs.length === 0) {
                console.log("No active tab found.");
                updateDisplay(null);
                return;
            }
            const activeTabId = (_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.id;
            console.log("Attempting to send to tab ID:", activeTabId);
            if (activeTabId) {
                const response = yield chrome.tabs.sendMessage(activeTabId, {
                    type: "POPUP_GET_SELECTED_TEXT"
                });
                console.log("Popup received response:", response);
                // Check if response exists before accessing .text
                if (response && typeof response.text !== 'undefined') {
                    updateDisplay(response.text);
                }
                else {
                    // Handle cases where response is missing or doesn't have text
                    console.log("Response from content script missing or invalid:", response);
                    updateDisplay(null);
                }
            }
            else {
                console.log("Could not get active tab ID.");
                updateDisplay(null);
            }
        }
        catch (error) {
            console.error("Error caught during chrome.tabs.sendMessage or processing response:", error);
            updateDisplay(null); // Call updateDisplay on error too
        }
    });
}
document.addEventListener('DOMContentLoaded', requestSelectedText);
// --- End of new code ---
// export {}; // Optional
