import React, { useState } from "react";
import styles from "./keyboard.module.css";
import KeyboardRow from "./KeyboardRow";
import keyboardLayout from "./KeyboardLayout";
import EmojiKeyboard from "./EmojiKeyboard"; // Import the EmojiKeyboard component
import textAreaStyles from "../TextArea/TextArea.module.css"; // Styles for the text area

// missing featurs TODO:
// 1. [v] emoji toggle button that will replace the keyboard with emoji keyboard
// https://github.com/cj1128/emoji-images/blob/master/emoji-sequences.txt

// 2. [] add a button to toggle between different keyboard layouts (QWERTY, AZERTY, etc.)
// 3. [] add a button to toggle between different languages (English, Hebrow, etc.)
// 4. [] enable combination keys (Ctrl + C, Ctrl + V, etc.)
// 5.1. [v] fix the capslocks issue (not changing the letters to uppercase when capslock is on)
// 5.2. [v] fix the capslocks styling issue (not changing the color of the capslock key when capslock is on or adding a ligthen dot to the capslock key when capslock is on)

// changes to be made:
// [v] 1. remove useEffect and useRef or any hook except useState from the Keyboard component

function Keyboard({ lastActiveTextWindow }) {
  const [highlighted, setHighlighted] = useState([]);
  const [modifiers, setModifiers] = useState({ Shift: false, Alt: false });
  const [isCapsLockActive, setIsCapsLockActive] = useState(false);
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false); // Toggle state for emoji keyboard

  // Handle toggle between regular and emoji keyboard
  const toggleEmojiKeyboard = () => {
    setShowEmojiKeyboard((prev) => !prev);
  };

  if (!window._keyboardListenersAttached) {
    window._keyboardListenersAttached = true;
  
    // Handle physical keyboard keydown
    window.addEventListener("keydown", (event) => {
      console.log("activeTextWindow:", lastActiveTextWindow); // Log the last active TextWindow
      const key = event.key === " " ? "Space" : event.key;
      const normalizedKey = key.toUpperCase();
  
      if (normalizedKey === "CAPSLOCK") {
        setIsCapsLockActive((prev) => !prev); // Toggle Caps Lock state
        return;
      }
  
      const activeTextWindow = document.getElementById(lastActiveTextWindow); // Find the currently focused TextWindow
  
      if (activeTextWindow) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
  
          // Handle special keys like Backspace
          if (normalizedKey === "BACKSPACE") {
            if (!range.collapsed) {
              range.deleteContents(); // Delete selected content
            } else if (range.startOffset > 0) {
              const node = range.startContainer;
              const offset = range.startOffset;
              const text = node.textContent;
  
              // Remove the character before the cursor
              node.textContent = text.slice(0, offset - 1) + text.slice(offset);
              range.setStart(node, offset - 1);
              range.setEnd(node, offset - 1);
            }
            selection.removeAllRanges();
            selection.addRange(range);
          } else if (normalizedKey.length === 1) {
            // Handle regular character input
            const char = isCapsLockActive ? key.toUpperCase() : key.toLowerCase();
            const textNode = document.createTextNode(char);
  
            range.deleteContents(); // Remove any selected text
            range.insertNode(textNode); // Insert the character
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
          }
  
          // Trigger an input event to notify React of the change
          activeTextWindow.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    });
  
    // Handle physical keyboard keyup
    window.addEventListener("keyup", (event) => {
      const key = event.key === " " ? "Space" : event.key;
      const normalizedKey = key.toUpperCase();
  
      if (["SHIFT", "ALT", "CONTROL"].includes(normalizedKey)) {
        setModifiers((prev) => ({ ...prev, [normalizedKey]: false })); // Reset modifier keys
      }
  
      const matchingKeys = keyboardLayout
        .flat()
        .filter((k) => k.key.toUpperCase() === normalizedKey);
  
      if (matchingKeys.length > 0) {
        const specificKey = matchingKeys.find((k) => {
          if (k.id.includes("left") && event.location === 1) return true;
          if (k.id.includes("right") && event.location === 2) return true;
          return !k.id.includes("left") && !k.id.includes("right");
        });
  
        if (specificKey) {
          setHighlighted((prev) => prev.filter((id) => id !== specificKey.id));
          console.log("Key released:", key);
        }
      }
    });
  }

  // Handle mouse down on virtual keyboard
  const handleMouseDown = (id, key) => {
    const normalizedKey = key.toUpperCase();

    if (normalizedKey === "CAPSLOCK") {
      setIsCapsLockActive((prev) => {
        const newState = !prev;
        console.log("Caps Lock toggled:", newState);
        return newState;
      });
      return;
    }

    if (["SHIFT", "ALT", "CONTROL"].includes(normalizedKey)) {
      setModifiers((prev) => ({ ...prev, [normalizedKey]: true }));
      return;
    }

    if (isCapsLockActive) {
      key = key.toUpperCase();
    } else {
      key = key.toLowerCase();
    }

    const activeTextWindow = document.getElementById(lastActiveTextWindow); // Use the last active TextWindow
    if (
      activeTextWindow &&
      activeTextWindow.isContentEditable &&
      activeTextWindow.getAttribute("data-type") === "text-window" // Ensure it's the correct type
    ) {
      // Ensure the activeTextWindow is focused
      activeTextWindow.focus();

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Ensure the selection is within the activeTextWindow
        if (activeTextWindow.contains(range.commonAncestorContainer)) {
          // Insert the key at the current cursor position
          const textNode = document.createTextNode(key);
          range.deleteContents(); // Remove any selected text
          range.insertNode(textNode); // Insert the key as text

          // Move the cursor after the inserted text
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection.removeAllRanges();
          selection.addRange(range);

          // Trigger an input event to notify React of the change
          activeTextWindow.dispatchEvent(new Event("input", { bubbles: true }));
        }
      } else {
        // If no valid selection, append the key at the end of the content
        activeTextWindow.innerHTML += key;
      }
    }
  };

  // Handle emoji click
  const handleEmojiClick = (emojiPath) => {
    const activeTextWindow = document.getElementById(lastActiveTextWindow); // Use the last active TextWindow
    if (activeTextWindow && activeTextWindow.contentEditable === "true") {
      const img = document.createElement("img");
      img.src = emojiPath; // Set the image source to the emoji path
      img.alt = "emoji"; // Optional: Add an alt attribute
      img.style.width = "20px"; // Set the image size
      img.style.height = "20px";

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Ensure the selection is within the activeTextWindow
        if (activeTextWindow.contains(range.commonAncestorContainer)) {
          range.deleteContents(); // Remove any selected text
          range.insertNode(img); // Insert the emoji image

          // Move the cursor after the inserted image
          range.setStartAfter(img);
          range.setEndAfter(img);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }

      // Trigger an input event to notify React of the change
      activeTextWindow.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  // Handle mouse up on virtual keyboard
  const handleMouseUp = (id, key) => {
    const normalizedKey = key.toUpperCase();

    if (["SHIFT", "ALT", "CONTROL"].includes(normalizedKey)) {
      setModifiers((prev) => ({ ...prev, [normalizedKey]: false })); // Reset modifier keys
    }

    // Dispatch a keyup event to simulate physical keyboard behavior
    window.dispatchEvent(
      new KeyboardEvent("keyup", {
        key: key,
        code: `Key${key}`,
        location: 0,
        bubbles: true,
        cancelable: true,
      })
    );

    setHighlighted((prev) => prev.filter((id) => id !== key.id)); // Remove key highlight
    console.log("Mouse up on key:", key);
  };

  console.log("handleEmojiClick is defined");

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
