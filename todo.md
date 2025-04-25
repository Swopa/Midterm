# Midterm Project: Detailed Technical TODO List

## Part 1: Browser Extension - Core & Card Creation

- [ ] **1.1:** Create the project folder structure (e.g., `src/`, `dist/`, `assets/`).
- [ ] **1.2:** Create the `manifest.json` file in the root or appropriate build output folder.
- [ ] **1.3:** Define `manifest_version`, `name`, and `version` in `manifest.json`.
- [ ] **1.4:** Add `permissions` (`activeTab`, `storage`) to `manifest.json`.
- [ ] **1.5:** Define the `action` (popup) pointing to `popup.html` in `manifest.json`.
- [ ] **1.6:** Define `content_scripts`, specifying `matches` (`<all_urls>`) and `js` (`content_script.js`) in `manifest.json`.
- [ ] **1.7:** Create the `src/content_script.ts` file.
- [ ] **1.8:** Implement function in `content_script.ts` to get selected text using `window.getSelection().toString()`.
- [ ] **1.9:** Add an event listener (e.g., `mouseup`) in `content_script.ts` to trigger text selection capture.
- [ ] **1.10:** Inside the event listener in `content_script.ts`, call `chrome.runtime.sendMessage` to send the selected text.
- [ ] **1.11:** Structure the message object sent from `content_script.ts` (e.g., `{ type: 'SELECTION', text: '...' }`).
- [ ] **1.12:** Add basic `console.log` statements in `content_script.ts` for debugging selection and message sending.
- [ ] **1.13:** Create the `popup.html` file.
- [ ] **1.14:** Add basic HTML structure to `popup.html` (e.g., a `div` to display text, a "Save Card" button).
- [ ] **1.15:** Create the `src/popup.ts` file.
- [ ] **1.16:** Link the compiled `popup.js` script in `popup.html` using `<script defer src="popup.js"></script>`.
- [ ] **1.17:** In `popup.ts`, add a message listener using `chrome.runtime.onMessage.addListener`.
- [ ] **1.18:** Inside the listener in `popup.ts`, check if the message `type` is the one sent from the content script.
- [ ] **1.19:** If the message type matches, get a reference to the display `div` in `popup.html`.
- [ ] **1.20:** Update the `textContent` or `innerText` of the display `div` with the received text.
- [ ] **1.21:** Create a `src/types.ts` file (or similar) to define shared types.
- [ ] **1.22:** Define a `Flashcard` interface/type in `types.ts` (e.g., `{ id: string, front: string, back: string, status?: string }`).
- [ ] **1.23:** Add an event listener to the "Save Card" button in `popup.ts`.
- [ ] **1.24:** Inside the save button listener, retrieve the currently displayed text (which will be the 'front' of the card).
- [ ] **1.25:** (For now) Prompt the user or use a placeholder for the 'back' of the card.
- [ ] **1.26:** Call `chrome.storage.local.get` to retrieve the current list of saved cards.
- [ ] **1.27:** Create a new `Flashcard` object using the retrieved front text and generated ID/back text.
- [ ] **1.28:** Add the new flashcard object to the list retrieved from storage (handle the case where storage was empty).
- [ ] **1.29:** Call `chrome.storage.local.set` to save the updated list of cards back to storage.
- [ ] **1.30:** Add error handling/logging for `chrome.storage` calls.
- [ ] **1.31:** Implement logic in `popup.ts` to run when the popup opens (e.g., DOMContentLoaded) to load existing cards using `chrome.storage.local.get`.
- [ ] **1.32:** Store the loaded cards in a variable in `popup.ts`.
- [ ] **1.33:** (Display) Add logic to show the count of loaded cards or prepare the review UI state.
- [ ] **1.34:** Set up TypeScript compilation (`tsconfig.json` and build script/command like `tsc`) to convert `.ts` files to `.js` for the browser.

## Part 2: Hand Gesture Recognition - Review Flashcards

- [ ] **2.1:** Add a `<video>` element to `popup.html` for the webcam feed.
- [ ] **2.2:** Add an element (e.g., `div id="gesture-output"`) to `popup.html` to display detected gestures.
- [ ] **2.3:** Add elements to `popup.html` to display the flashcard front/back during review.
- [ ] **2.4:** In `popup.ts`, write an async function to request webcam access using `navigator.mediaDevices.getUserMedia({ video: true })`.
- [ ] **2.5:** Handle the promise returned by `getUserMedia`: get the `MediaStream` on success, handle errors on failure.
- [ ] **2.6:** Get a reference to the `<video>` element in `popup.ts`.
- [ ] **2.7:** Set the video element's `srcObject` to the obtained `MediaStream`.
- [ ] **2.8:** Call `video.play()` to start displaying the feed.
- [ ] **2.9:** Install TensorFlow.js core: `npm install @tensorflow/tfjs`.
- [ ] **2.10:** Install Hand Pose Detection model: `npm install @tensorflow-models/hand-pose-detection`.
- [ ] **2.11:** Import necessary TensorFlow and hand pose modules in `popup.ts`.
- [ ] **2.12:** Write an async function in `popup.ts` to load the `handPoseDetection` model (`createDetector`).
- [ ] **2.13:** Call the model loading function when the popup starts and store the detector object. Handle loading errors.
- [ ] **2.14:** Create a function (e.g., `detectHandsLoop`) that runs repeatedly (using `requestAnimationFrame` or `setInterval`).
- [ ] **2.15:** Inside the loop, call `detector.estimateHands()` passing the video element.
- [ ] **2.16:** Process the `hands` array returned by `estimateHands()`. Check if any hands are detected.
- [ ] **2.17:** If hands are detected, extract the `keypoints` from the first detected hand.
- [ ] **2.18:** Create a separate function `recognizeGesture(keypoints)` in `popup.ts`.
- [ ] **2.19:** Inside `recognizeGesture`, implement logic to detect "Thumbs Up" based on keypoint positions (e.g., thumb tip Y relative to index finger base Y).
- [ ] **2.20:** Inside `recognizeGesture`, implement logic for "Thumbs Down".
- [ ] **2.21:** Inside `recognizeGesture`, implement logic for "Flat Palm" (e.g., check distances between fingertips).
- [ ] **2.22:** `recognizeGesture` should return a string indicating the detected gesture (e.g., 'THUMBS_UP', 'THUMBS_DOWN', 'PALM', 'NONE').
- [ ] **2.23:** In the `detectHandsLoop`, call `recognizeGesture` with the extracted keypoints.
- [ ] **2.24:** Get a reference to the gesture display element (`#gesture-output`).
- [ ] **2.25:** Update the `textContent` of the gesture display element with the result from `recognizeGesture`.
- [ ] **2.26:** Implement function `displayCardForReview(card: Flashcard)` in `popup.ts` to show card front in the UI.
- [ ] **2.27:** Implement logic to select the first/next card to review from the loaded cards array. Call `displayCardForReview`.
- [ ] **2.28:** In the `detectHandsLoop`, if a valid gesture is detected AND a card is being reviewed:
    *   Map the gesture string ('THUMBS_UP', etc.) to a review action ('Easy', 'Wrong', etc.).
- [ ] **2.29:** Update the status of the current `Flashcard` object in the local array based on the review action.
- [ ] **2.30:** (Optional for now) Trigger a save of the updated card list back to `chrome.storage.local`.
- [ ] **2.31:** Select the next card for review and call `displayCardForReview`.
- [ ] **2.32:** Add a small delay or state management to prevent one gesture triggering multiple reviews instantly.

## Part 3: Backend & Integration (Optional Expansion)

- [ ] **3.1:** Initialize a Node.js project (`npm init`) in a separate `backend/` folder.
- [ ] **3.2:** Install Express: `npm install express`.
- [ ] **3.3:** Install PostgreSQL driver: `npm install pg`.
- [ ] **3.4:** Install TypeScript and types for Node/Express/pg: `npm install typescript @types/node @types/express @types/pg --save-dev`.
- [ ] **3.5:** Setup `tsconfig.json` for the backend.
- [ ] **3.6:** Create a basic Express server file (`server.ts`).
- [ ] **3.7:** Configure database connection details (preferably using environment variables).
- [ ] **3.8:** Implement DB connection logic using `pg`.
- [ ] **3.9:** Define SQL for creating a `flashcards` table.
- [ ] **3.10:** Implement Express route handler for `GET /api/cards`.
- [ ] **3.11:** Implement DB query logic for fetching all cards in the GET handler.
- [ ] **3.12:** Implement Express route handler for `POST /api/cards`.
- [ ] **3.13:** Implement DB query logic for inserting a new card in the POST handler.
- [ ] **3.14:** Implement Express route handler for `PUT /api/cards/:id/review`.
- [ ] **3.15:** Implement DB query logic for updating a card's status in the PUT handler.
- [ ] **3.16:** Add basic error handling to backend routes.
- [ ] **3.17:** Enable CORS middleware in Express (`npm install cors`, `app.use(cors())`).
- [ ] **3.18:** Modify `popup.ts` (Task 1.31) to use `fetch` to call the backend `GET /api/cards` endpoint.
- [ ] **3.19:** Modify `popup.ts` (Task 1.29) to use `fetch` to call the backend `POST /api/cards` endpoint.
- [ ] **3.20:** Modify `popup.ts` (Task 2.30) to use `fetch` to call the backend `PUT /api/cards/:id/review` endpoint.