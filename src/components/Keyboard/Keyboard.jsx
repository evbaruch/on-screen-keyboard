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

  const handleMouseDown = (id, key) => {
    if (!lastActiveTextWindow) return;
    
    const normalizedKey = key.toUpperCase();

    if (normalizedKey === "CAPSLOCK") {
      setIsCapsLockActive((prev) => !prev);
      return;
    }

    const activeTextWindow = document.getElementById(lastActiveTextWindow);
    if (!activeTextWindow) return;

    // Focus the text window to ensure it has focus for cursor positioning
    activeTextWindow.focus();

    // Process the key
    if (normalizedKey === "SPACE") {
      key = " ";
    } else if (normalizedKey === "BACKSPACE") {
      // Handle backspace
      document.execCommand('delete', false);
      
      // Save updated content
      const updatedContent = activeTextWindow.innerHTML;
      if (lastActivefileName) {
        const files = loadFilesForUser(username);
        files[lastActivefileName] = updatedContent;
        saveFilesForUser(username, files);
      }
      
      // Save cursor position
      saveCursorPosition(lastActiveTextWindow, username);
      return;
    } else if (isCapsLockActive) {
      key = key.toUpperCase();
    } else {
      key = key.toLowerCase();
    }

    // Use execCommand to insert text at the cursor position
    document.execCommand('insertText', false, key);
    
    // Save the updated content
    const updatedContent = activeTextWindow.innerHTML;
    if (lastActivefileName) {
      const files = loadFilesForUser(username);
      files[lastActivefileName] = updatedContent;
      saveFilesForUser(username, files);
    }
    
    // Save cursor position
    saveCursorPosition(lastActiveTextWindow, username);
  };

  const saveCursorPosition = (windowId, username) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const cursorPositions = loadCursorPositionsForUser(username);
      cursorPositions[windowId] = { offset: range.startOffset };
      saveCursorPositionsForUser(username, cursorPositions);
    }
  };

  const handleEmojiClick = (emojiPath) => {
    if (!lastActiveTextWindow) return;
    
    const activeTextWindow = document.getElementById(lastActiveTextWindow);
    if (!activeTextWindow) return;

    // Focus the text window
    activeTextWindow.focus();

    // Create emoji HTML string
    const emojiHTML = `<img src="${emojiPath}" alt="emoji" style="width:20px;height:20px;display:inline-block;vertical-align:middle;margin:0 2px;">`;
    
    // Use execCommand to insert HTML - this is the most reliable cross-browser approach
    document.execCommand('insertHTML', false, emojiHTML);
    
    // Save the updated content
    const updatedContent = activeTextWindow.innerHTML;
    if (lastActivefileName) {
      const files = loadFilesForUser(username);
      files[lastActivefileName] = updatedContent;
      saveFilesForUser(username, files);
    }

    // Save cursor position
    saveCursorPosition(lastActiveTextWindow, username);
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
          saveCursorPosition(lastActiveTextWindow, username);
        }, 0);
        return;
      }

      if (normalizedKey === "BACKSPACE") {
        document.execCommand('delete', false);
        
        // Save updated content
        const updatedContent = activeTextWindow.innerHTML;
        if (lastActivefileName) {
          const files = loadFilesForUser(username);
          files[lastActivefileName] = updatedContent;
          saveFilesForUser(username, files);
        }
        
        // Update cursor position
        setTimeout(() => {
          saveCursorPosition(lastActiveTextWindow, username);
        }, 0);
        
        event.preventDefault();
      } else if (!["SHIFT", "ALT", "CONTROL", "META"].includes(normalizedKey)) {
        // Insert regular text using execCommand
        document.execCommand('insertText', false, event.key);
        
        // Save updated content
        const updatedContent = activeTextWindow.innerHTML;
        if (lastActivefileName) {
          const files = loadFilesForUser(username);
          files[lastActivefileName] = updatedContent;
          saveFilesForUser(username, files);
        }
        
        // Update cursor position
        saveCursorPosition(lastActiveTextWindow, username);
        
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