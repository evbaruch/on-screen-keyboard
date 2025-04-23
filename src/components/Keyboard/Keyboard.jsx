import React, { useState, useEffect } from "react";
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

  // Improved cursor position handling function
  const saveCursorPosition = (windowId, username) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Store both the node and offset for more accurate position restoration
      const cursorPositions = loadCursorPositionsForUser(username);
      
      // Get the container node path for accurate restoration
      let node = range.startContainer;
      const textWindow = document.getElementById(windowId);
      const path = [];
      
      // Get path from node to text window
      while (node !== textWindow && node.parentNode) {
        const parent = node.parentNode;
        const children = Array.from(parent.childNodes);
        path.unshift(children.indexOf(node));
        node = parent;
      }
      
      cursorPositions[windowId] = {
        path: path,
        offset: range.startOffset,
        // Store the entire innerHTML to detect content changes
        html: textWindow.innerHTML
      };
      
      saveCursorPositionsForUser(username, cursorPositions);
    }
  };

  // Improved function to restore cursor position
  const restoreCursorPosition = (windowId, username) => {
    const cursorPositions = loadCursorPositionsForUser(username);
    const savedPosition = cursorPositions[windowId];
    if (!savedPosition) return;
    
    const textWindow = document.getElementById(windowId);
    if (!textWindow) return;
    
    try {
      const selection = window.getSelection();
      const range = document.createRange();
      
      // If HTML has changed significantly, position at the end
      if (savedPosition.html && textWindow.innerHTML !== savedPosition.html) {
        // Position cursor at the end
        if (textWindow.lastChild) {
          if (textWindow.lastChild.nodeType === Node.TEXT_NODE) {
            range.setStart(textWindow.lastChild, textWindow.lastChild.length);
          } else {
            range.setStartAfter(textWindow.lastChild);
          }
        } else {
          range.setStart(textWindow, 0);
        }
      } else if (savedPosition.path) {
        // Navigate to the node using the saved path
        let node = textWindow;
        for (let idx of savedPosition.path) {
          if (node.childNodes && idx < node.childNodes.length) {
            node = node.childNodes[idx];
          } else {
            // If path is invalid, position at the end of content
            if (node.lastChild) {
              if (node.lastChild.nodeType === Node.TEXT_NODE) {
                range.setStart(node.lastChild, node.lastChild.length);
              } else {
                range.setStartAfter(node.lastChild);
              }
            } else {
              range.setStart(node, 0);
            }
            break;
          }
        }
        
        // Set position within the final node
        if (node.nodeType === Node.TEXT_NODE) {
          const offset = Math.min(savedPosition.offset, node.length);
          range.setStart(node, offset);
        } else {
          range.setStart(node, 0);
        }
      }
      
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (e) {
      console.error("Error restoring cursor:", e);
      // Fallback: place cursor at end
      const selection = window.getSelection();
      const range = document.createRange();
      
      if (textWindow.lastChild) {
        if (textWindow.lastChild.nodeType === Node.TEXT_NODE) {
          range.setStart(textWindow.lastChild, textWindow.lastChild.length);
        } else {
          range.setStartAfter(textWindow.lastChild);
        }
      } else {
        range.setStart(textWindow, 0);
      }
      
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
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

    // Focus the text window to ensure it has focus for cursor positioning
    activeTextWindow.focus();
    
    // Restore cursor position before inserting text
    restoreCursorPosition(lastActiveTextWindow, username);

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
    } else if (normalizedKey === "ENTER") {
      document.execCommand('insertHTML', false, '<br>');
      
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

  const handleEmojiClick = (emojiPath) => {
    if (!lastActiveTextWindow) return;
    
    const activeTextWindow = document.getElementById(lastActiveTextWindow);
    if (!activeTextWindow) return;

    // Focus the text window
    activeTextWindow.focus();
    
    // Restore cursor position before inserting emoji
    restoreCursorPosition(lastActiveTextWindow, username);

    // Create emoji HTML string
    const emojiHTML = `<img src="${emojiPath}" alt="emoji" style="width:20px;height:20px;display:inline-block;vertical-align:middle;margin:0 2px;">`;
    
    // Use execCommand to insert HTML
    document.execCommand('insertHTML', false, emojiHTML);

    // add a space after the emoji to separate it from the next text
    document.execCommand('insertText', false, " ");
    
    // Save the updated content
    const updatedContent = activeTextWindow.innerHTML;
    if (lastActivefileName) {
      const files = loadFilesForUser(username);
      files[lastActivefileName] = updatedContent;
      saveFilesForUser(username, files);
    }

    // Make sure cursor is placed after the emoji
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.collapse(false); // Collapse to end
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Save the new cursor position
    saveCursorPosition(lastActiveTextWindow, username);
  };

  const handleMouseUp = () => {
    setHighlighted([]);
  };

  useEffect(() => {
    // One-time setup for keyboard event listeners
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
  }, [lastActiveTextWindow, lastActivefileName, username]);

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