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

  // Helper function to ensure cursor position doesn't jump
  const maintainCursorPosition = (textWindow, beforeContent) => {
    if (!textWindow) return;
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const originalRange = selection.getRangeAt(0);
    const originalOffset = originalRange.startOffset;
    const originalNode = originalRange.startContainer;
    
    // Simple case - if the node and content are unchanged, just return
    if (textWindow.innerHTML === beforeContent) return;
    
    // Try to find the same relative position in the new content
    // by looking for text nodes that contain similar content
    let found = false;
    let foundNode = null;
    let foundOffset = 0;
    
    const findSimilarPosition = (node, originalNode, originalOffset) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent === originalNode.textContent) {
          foundNode = node;
          foundOffset = originalOffset;
          found = true;
          return;
        }
      }
      
      if (node.childNodes && node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          findSimilarPosition(node.childNodes[i], originalNode, originalOffset);
          if (found) return;
        }
      }
    };
    
    if (originalNode.nodeType === Node.TEXT_NODE) {
      findSimilarPosition(textWindow, originalNode, originalOffset);
    }
    
    // If we found a similar position, set the selection there
    if (found && foundNode) {
      const newRange = document.createRange();
      newRange.setStart(foundNode, Math.min(foundOffset, foundNode.textContent.length));
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
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

    // Store the content before making changes
    const beforeContent = activeTextWindow.innerHTML;

    // Focus the text window to ensure it has focus for cursor positioning
    activeTextWindow.focus();

    // Process the key
    if (normalizedKey === "SPACE") {
      key = " ";
    } else if (normalizedKey === "BACKSPACE") {
      // Handle backspace
      const selection = window.getSelection();
      if (selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      
      if (range.collapsed && range.startOffset > 0) {
        // No text selected, move back one character and delete
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
      
      // Save cursor position
      saveCursorPosition(lastActiveTextWindow, username);
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
      
      // Delete any selected text first
      range.deleteContents();
      
      // Insert the new text
      range.insertNode(textNode);
      
      // Move the cursor after the inserted text
      range.setStartAfter(textNode);
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
      
      // Save cursor position
      saveCursorPosition(lastActiveTextWindow, username);
      
      // Make sure the cursor stays where it should be
      maintainCursorPosition(activeTextWindow, beforeContent);
    }
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

    // Store the content before making changes
    const beforeContent = activeTextWindow.innerHTML;

    // Focus the text window
    activeTextWindow.focus();

    // Create an <img> element for the emoji
    const emojiNode = document.createElement("img");
    emojiNode.src = emojiPath;
    emojiNode.alt = "emoji";
    emojiNode.style.width = "20px";
    emojiNode.style.height = "20px";
    emojiNode.style.display = "inline-block";
    emojiNode.style.verticalAlign = "middle";

    // Get the current selection and range
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);

    // Delete any selected text
    range.deleteContents();

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

    // Save cursor position
    saveCursorPosition(lastActiveTextWindow, username);
    
    // Make sure the cursor stays where it should be
    maintainCursorPosition(activeTextWindow, beforeContent);
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
      
      // Store the content before making changes
      const beforeContent = activeTextWindow.innerHTML;

      // Let the browser handle Enter, Tab and arrow keys naturally
      if (["ENTER", "ARROWLEFT", "ARROWRIGHT", "ARROWUP", "ARROWDOWN", "TAB"].includes(normalizedKey)) {
        // Just update cursor position after the operation
        setTimeout(() => {
          saveCursorPosition(lastActiveTextWindow, username);
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
          saveCursorPosition(lastActiveTextWindow, username);
        }, 0);
        
        // Make sure the cursor stays where it should be
        maintainCursorPosition(activeTextWindow, beforeContent);
        
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
        saveCursorPosition(lastActiveTextWindow, username);
        
        // Make sure the cursor stays where it should be
        maintainCursorPosition(activeTextWindow, beforeContent);
        
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