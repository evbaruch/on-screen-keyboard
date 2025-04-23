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

// Global flag to ensure listeners are only attached once
if (typeof window !== "undefined" && !window._keyboardGlobals) {
  window._keyboardGlobals = {
    listenersAttached: false,
    keydownHandler: null,
    keyupHandler: null,
  };
}

function Keyboard({ username, lastActiveTextWindow, lastActivefileName }) {
  const [highlighted, setHighlighted] = useState([]);
  const [modifiers, setModifiers] = useState({ Shift: false, Alt: false });
  const [isCapsLockActive, setIsCapsLockActive] = useState(false);
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false);
  const [listenerState, setListenerState] = useState(false); // Just to track listener state
  const [keyboardLanguage, setKeyboardLanguage] = useState("EN"); // Add keyboard language state
  const [highlightTimeouts, setHighlightTimeouts] = useState({});

  const toggleEmojiKeyboard = () => {
    setShowEmojiKeyboard((prev) => !prev);
  };

  // Add language toggle function
  const toggleLanguage = () => {
    setKeyboardLanguage(prev => prev === "EN" ? "HE" : "EN");
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
        html: textWindow.innerHTML,
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

  const handleMouseDown = (id, key, keyObj) => {
    // First, add the key to highlighted array
    setHighlighted(prev => [...prev, id]);
    
    // Clear any existing timeout for this key
    if (highlightTimeouts[id]) {
      clearTimeout(highlightTimeouts[id]);
    }
    
    // Set new timeout to clear highlight after 150ms
    const timeout = setTimeout(() => {
      setHighlighted(prev => prev.filter(hId => hId !== id));
    }, 150);
    
    // Store the timeout ID
    setHighlightTimeouts(prev => ({...prev, [id]: timeout}));

    if (!lastActiveTextWindow) return;

    const normalizedKey = key.toUpperCase();

    if (normalizedKey === "CAPSLOCK") {
      setIsCapsLockActive((prev) => !prev);
      return;
    }
    
    if (normalizedKey === "SHIFT") {
      setModifiers(prev => ({ ...prev, Shift: true }));
      return;
    }
    
    if (normalizedKey === "ALT") {
      setModifiers(prev => ({ ...prev, Alt: true }));
      return;
    }

    const activeTextWindow = document.getElementById(lastActiveTextWindow);
    if (!activeTextWindow) return;

    // Focus the text window to ensure it has focus for cursor positioning
    activeTextWindow.focus();

    // Restore cursor position before inserting text
    restoreCursorPosition(lastActiveTextWindow, username);

    // Process the key
    let keyToInsert;

    if (normalizedKey === "SPACE") {
      keyToInsert = " ";
    } else if (normalizedKey === "BACKSPACE") {
      // Handle backspace
      document.execCommand("delete", false);

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
      document.execCommand("insertHTML", false, "<br>");

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
    } else if (normalizedKey === "TAB") {
      // Insert 4 spaces for TAB
      document.execCommand("insertText", false, "    ");
      
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
    } else {
      // Handle character insertion based on language and modifiers
      if (keyboardLanguage === "HE" && keyObj && keyObj.fourth) {
        // Use Hebrew character if available in current language
        keyToInsert = keyObj.fourth;
      } else if (modifiers.Shift && keyObj && keyObj.shift) {
        // Use shift character if shift is held
        keyToInsert = keyObj.shift;
      } else if (modifiers.Alt && keyObj && keyObj.alt) {
        // Use alt character if alt is held
        keyToInsert = keyObj.alt;
      } else if (isCapsLockActive && key.length === 1) {
        // Apply caps lock for regular letters
        keyToInsert = key.toUpperCase();
      } else {
        // Default case - use lowercase
        keyToInsert = key.toLowerCase();
      }
    }

    // Use execCommand to insert text at the cursor position
    document.execCommand("insertText", false, keyToInsert);

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
    document.execCommand("insertHTML", false, emojiHTML);

    // add a space after the emoji to separate it from the next text
    document.execCommand("insertText", false, " ");

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

  const handleMouseUp = (id, key) => {
    // Only reset modifier keys on mouse up
    if (key.toUpperCase() === "SHIFT") {
      setModifiers(prev => ({ ...prev, Shift: false }));
    } else if (key.toUpperCase() === "ALT") {
      setModifiers(prev => ({ ...prev, Alt: false }));
    }
    // Don't clear highlight state here - let the timeout handle it
  };

  // Handle physical keyboard input - without useEffect
  if (
    typeof window !== "undefined" &&
    !window._keyboardGlobals.listenersAttached
  ) {
    // Create handlers that capture the current state
    window._keyboardGlobals.keydownHandler = (event) => {
      if (!lastActiveTextWindow) return;

      // Safety check for undefined event
      if (!event || !event.key) return;

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
      if (
        [
          "ENTER",
          "ARROWLEFT",
          "ARROWRIGHT",
          "ARROWUP",
          "ARROWDOWN",
          "TAB",
        ].includes(normalizedKey)
      ) {
        // Just update cursor position after the operation
        setTimeout(() => {
          saveCursorPosition(lastActiveTextWindow, username);
        }, 0);
        return;
      }

      if (normalizedKey === "BACKSPACE") {
        document.execCommand("delete", false);

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
        document.execCommand("insertText", false, event.key);

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
    };

    window._keyboardGlobals.keyupHandler = (event) => {
      // Safety check for undefined event or key
      if (!event || !event.key) return;

      try {
        const key = event.key === " " ? "Space" : event.key;
        const normalizedKey = key.toUpperCase();

        if (["SHIFT", "ALT", "CONTROL"].includes(normalizedKey)) {
          setModifiers((prev) => ({ ...prev, [normalizedKey]: false }));
        }
      } catch (error) {
        console.log("Error in keyupHandler:", error);
      }
    };

    // Attach the event listeners
    window.addEventListener("keydown", window._keyboardGlobals.keydownHandler);
    window.addEventListener("keyup", window._keyboardGlobals.keyupHandler);

    // Mark listeners as attached
    window._keyboardGlobals.listenersAttached = true;
    setListenerState(true);
  }

  // Clean up timeouts to prevent memory leaks
  if (typeof window !== "undefined") {
    window.addEventListener('beforeunload', () => {
      Object.values(highlightTimeouts).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
    });
  }

  return (
    <div className={styles.keyboardContainer}>
      <div className={styles.keyboardControls}>
        <button 
          onClick={toggleEmojiKeyboard} 
          className={styles.toggleButton}
        >
          {showEmojiKeyboard ? "Switch to Keyboard" : "Switch to Emoji Keyboard"}
        </button>
        
        {/* Language toggle button */}
        <button 
          onClick={toggleLanguage}
          className={`${styles.toggleButton} ${styles.languageButton}`}
        >
          {keyboardLanguage === "EN" ? "English" : "עברית"}
        </button>
      </div>
      
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
              keyboardLanguage={keyboardLanguage}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Keyboard;