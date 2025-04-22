import React, { useState } from "react";
import styles from "./keyboard.module.css";
import KeyboardRow from "./KeyboardRow";
import keyboardLayout from "./KeyboardLayout";
import EmojiKeyboard from "./EmojiKeyboard";
import {
  loadCursorPositionsForUser,
  saveCursorPositionsForUser,
  saveFilesForUser,
  loadFilesForUser,
} from "../../utils/localStorageUtils";

function Keyboard({ username, lastActiveTextWindow, lastActivefileName }) {
  const [highlighted, setHighlighted] = useState([]);
  const [modifiers, setModifiers] = useState({ Shift: false, Alt: false });
  const [isCapsLockActive, setIsCapsLockActive] = useState(false);
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);

  const toggleEmojiKeyboard = () => {
    setShowEmojiKeyboard((prev) => !prev);
  };

  // Get cursor position for the active text window
  const getCursorPosition = () => {
    if (!lastActiveTextWindow) return 0;
    
    const cursorPositions = loadCursorPositionsForUser(username);
    return cursorPositions[lastActiveTextWindow]?.offset || 0;
  };

  // Update cursor position for the active text window
  const updateCursorPosition = (newPosition) => {
    if (!lastActiveTextWindow) return;
    
    const cursorPositions = loadCursorPositionsForUser(username);
    cursorPositions[lastActiveTextWindow] = { offset: newPosition };
    saveCursorPositionsForUser(username, cursorPositions);
  };

  const handleMouseDown = (id, key) => {
    if (!lastActiveTextWindow) return;
    
    const normalizedKey = key.toUpperCase();

    if (normalizedKey === "CAPSLOCK") {
      setIsCapsLockActive((prev) => !prev);
      return;
    }

    const cursorPosition = getCursorPosition();
    const activeTextWindow = document.getElementById(lastActiveTextWindow);
    if (!activeTextWindow) return;

    let content = activeTextWindow.innerHTML || "";

    // Update content based on key pressed
    if (normalizedKey === "SPACE") {
      key = " ";
    } else if (normalizedKey === "BACKSPACE") {
      if (cursorPosition > 0 && activeTextWindow.textContent.length > 0) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        if (range.collapsed) {
          // No text selected, just delete one character
          range.setStart(range.startContainer, Math.max(0, range.startOffset - 1));
          range.deleteContents();
        } else {
          // Delete selected text
          range.deleteContents();
        }
        
        // Get the updated content and save it
        content = activeTextWindow.innerHTML;
        if (lastActivefileName) {
          const files = loadFilesForUser(username);
          files[lastActivefileName] = content;
          saveFilesForUser(username, files);
        }
        
        // Update cursor position based on current selection
        updateCursorPosition(selection.getRangeAt(0).startOffset);
        return;
      }
      return;
    } else if (isCapsLockActive) {
      key = key.toUpperCase();
    } else {
      key = key.toLowerCase();
    }

    // Insert text at cursor position
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(key);
      range.deleteContents();
      range.insertNode(textNode);
      
      // Move cursor after inserted text
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Update cursor position
      updateCursorPosition(range.startOffset);
      
      // Save updated content
      content = activeTextWindow.innerHTML;
      if (lastActivefileName) {
        const files = loadFilesForUser(username);
        files[lastActivefileName] = content;
        saveFilesForUser(username, files);
      }
    }
  };

  const handleEmojiClick = (emojiPath) => {
    if (!lastActiveTextWindow) return;
    
    const activeTextWindow = document.getElementById(lastActiveTextWindow);
    if (!activeTextWindow) return;

    // Create an <img> element for the emoji
    const emojiNode = document.createElement("img");
    emojiNode.src = emojiPath;
    emojiNode.alt = "emoji";
    emojiNode.style.width = "20px";
    emojiNode.style.height = "20px";
    emojiNode.style.display = "inline-block";

    // Get the current selection and range
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);

    // Insert the emoji at the cursor position
    range.insertNode(emojiNode);

    // Move the cursor after the emoji
    range.setStartAfter(emojiNode);
    range.collapse(true);

    // Update the selection
    selection.removeAllRanges();
    selection.addRange(range);

    // Save the updated content
    const updatedContent = activeTextWindow.innerHTML;
    if (lastActivefileName) {
      const files = loadFilesForUser(username);
      files[lastActivefileName] = updatedContent;
      saveFilesForUser(username, files);
    }

    // Update the cursor position
    updateCursorPosition(range.startOffset);
  };

  const handleMouseUp = () => {
    setHighlighted([]);
  };

  // Attach keyboard event listeners
  if (!window._keyboardListenersAttached) {
    window._keyboardListenersAttached = true;

    // Handle physical keyboard input
    window.addEventListener("keydown", (event) => {
      if (!lastActiveTextWindow) return;
      
      const key = event.key === " " ? "Space" : event.key;
      const normalizedKey = key.toUpperCase();

      // Handle special keys
      if (normalizedKey === "CAPSLOCK") {
        setIsCapsLockActive((prev) => !prev);
        return;
      }

      const activeTextWindow = document.getElementById(lastActiveTextWindow);
      if (!activeTextWindow) return;

      // Let the browser handle Enter, Tab and arrow keys naturally
      if (["ENTER", "ARROWLEFT", "ARROWRIGHT", "ARROWUP", "ARROWDOWN", "TAB"].includes(normalizedKey)) {
        // Just update cursor position after the operation
        setTimeout(() => {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            updateCursorPosition(selection.getRangeAt(0).startOffset);
          }
        }, 0);
        return;
      }

      if (normalizedKey === "BACKSPACE") {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        
        if (range.collapsed && range.startOffset > 0) {
          // No text selected, delete one character
          range.setStart(range.startContainer, range.startOffset - 1);
          range.deleteContents();
        } else {
          // Delete selected text
          range.deleteContents();
        }
        
        // Save updated content
        const updatedContent = activeTextWindow.innerHTML;
        if (lastActivefileName) {
          const files = loadFilesForUser(username);
          files[lastActivefileName] = updatedContent;
          saveFilesForUser(username, files);
        }
        
        // Update cursor position
        setTimeout(() => {
          if (selection.rangeCount > 0) {
            updateCursorPosition(selection.getRangeAt(0).startOffset);
          }
        }, 0);
        
        event.preventDefault();
      } else if (!["SHIFT", "ALT", "CONTROL", "META"].includes(normalizedKey)) {
        // Insert regular text
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const textNode = document.createTextNode(event.key);
        
        range.deleteContents();
        range.insertNode(textNode);
        
        // Move cursor after inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Save updated content
        const updatedContent = activeTextWindow.innerHTML;
        if (lastActivefileName) {
          const files = loadFilesForUser(username);
          files[lastActivefileName] = updatedContent;
          saveFilesForUser(username, files);
        }
        
        // Update cursor position
        updateCursorPosition(range.startOffset);
        
        event.preventDefault();
      }
    });

    // Handle physical keyboard keyup
    window.addEventListener("keyup", (event) => {
      const key = event.key === " " ? "Space" : event.key;
      const normalizedKey = key.toUpperCase();

      if (["SHIFT", "ALT", "CONTROL"].includes(normalizedKey)) {
        setModifiers((prev) => ({ ...prev, [normalizedKey]: false }));
      }

      setHighlighted((prev) => prev.filter((id) => id !== normalizedKey));
    });
  }

  return (
    <div className={styles.keyboardContainer}>
      <button onClick={toggleEmojiKeyboard} className={styles.toggleButton}>
        {showEmojiKeyboard ? "Switch to Keyboard" : "Switch to Emoji Keyboard"}
      </button>
      <div className={styles.keyboard}>
        {showEmojiKeyboard ? (
          <EmojiKeyboard onEmojiClick={handleEmojiClick} />
        ) : (
          keyboardLayout.map((row, rowIndex) => (
            <KeyboardRow
              key={rowIndex}
              row={row}
              highlighted={highlighted}
              modifiers={modifiers}
              isCapsLockActive={isCapsLockActive}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Keyboard;