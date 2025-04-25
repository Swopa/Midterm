

function getSelectedText(): string {
    const selection = window.getSelection();
    if (selection) {
      return selection.toString().trim();
    }
    return "";
  }
  
  
  console.log("Flashcard Content Script Loaded!"); 
  
  document.addEventListener('mouseup', () => {
    // This code runs *every time* the user releases the mouse button on the page
    const text = getSelectedText(); // Call our function
  
    if (text) { // Only proceed if some text was actually selected
      console.log("Selected:", text); // For now, just print it to the console
      
      
    }
  });
  
  
  export {};