import React, { useState } from "react";
import styles from "./keyboard.module.css";
import KeyboardRow from "./KeyboardRow";
import keyboardLayout from "./KeyboardLayout";
import EmojiKeyboard from "./EmojiKeyboard"; // Import the EmojiKeyboard component

// missing featurs TODO:
// 1. [] emoji toggle button that will replace the keyboard with emoji keyboard
// https://github.com/cj1128/emoji-images/blob/master/emoji-sequences.txt

// 2. [] add a button to toggle between different keyboard layouts (QWERTY, AZERTY, etc.)
// 3. [] add a button to toggle between different languages (English, Hebrow, etc.)
// 4. [] enable combination keys (Ctrl + C, Ctrl + V, etc.)
// 5.1. [v] fix the capslocks issue (not changing the letters to uppercase when capslock is on)
// 5.2. [v] fix the capslocks styling issue (not changing the color of the capslock key when capslock is on or adding a ligthen dot to the capslock key when capslock is on)

// changes to be made:
// [v] 1. remove useEffect and useRef or any hook except useState from the Keyboard component

function Keyboard() {
  const [highlighted, setHighlighted] = useState([]);
  const [modifiers, setModifiers] = useState({ Shift: false, Alt: false });
  const [isCapsLockActive, setIsCapsLockActive] = useState(false);
  const [showEmojiKeyboard, setShowEmojiKeyboard] = useState(false); // Toggle state for emoji keyboard

  // Handle toggle between regular and emoji keyboard
  const toggleEmojiKeyboard = () => {
    setShowEmojiKeyboard((prev) => !prev);
  };

  // Attach event listeners directly when the component is initialized
  if (!window._keyboardListenersAttached) {
    window._keyboardListenersAttached = true;

    // Handle physical keyboard keydown
    window.addEventListener("keydown", (event) => {
      const key = event.key === " " ? "Space" : event.key;
      const normalizedKey = key.toUpperCase();

      if (normalizedKey === "CAPSLOCK") {
        setIsCapsLockActive((prev) => !prev); // Toggle Caps Lock state
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
          if (["SHIFT", "ALT", "CONTROL"].includes(normalizedKey)) {
            setModifiers((prev) => ({ ...prev, [normalizedKey]: true }));
          }

          setHighlighted((prev) => [...new Set([...prev, specificKey.id])]);
        }
      }
    });

    // Handle physical keyboard keyup
    window.addEventListener("keyup", (event) => {
      const key = event.key === " " ? "Space" : event.key;
      const normalizedKey = key.toUpperCase();

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
          if (["SHIFT", "ALT", "CONTROL"].includes(normalizedKey)) {
            setModifiers((prev) => ({ ...prev, [normalizedKey]: false }));
          }

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
      setIsCapsLockActive((prev) => !prev); // Toggle Caps Lock state
    }

    if (["SHIFT", "ALT", "CONTROL"].includes(normalizedKey)) {
      setModifiers((prev) => ({ ...prev, [normalizedKey]: false }));
    }

    if (isCapsLockActive) {
      key = key.toUpperCase();
    } else {
      key = key.toLowerCase();
    }

    // Dispatch a keydown event to simulate physical keyboard behavior
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: key,
        code: `Key${key}`,
        location: 0,
        bubbles: true,
        cancelable: true,
      })
    );

    setHighlighted((prev) => prev.filter((id) => id !== key.id));
    console.log("Mouse down on key:", key);
    console.log("CapsLock state:", isCapsLockActive);
  };

  // Handle mouse up on virtual keyboard
  const handleMouseUp = (id, key) => {
    const normalizedKey = key.toUpperCase();

    if (normalizedKey === "CAPSLOCK") {
      setIsCapsLockActive((prev) => !prev); // Toggle Caps Lock state
    }

    if (["SHIFT", "ALT", "CONTROL"].includes(normalizedKey)) {
      setModifiers((prev) => ({ ...prev, [normalizedKey]: false }));
    }

    if (isCapsLockActive) {
      key = key.toUpperCase();
    } else {
      key = key.toLowerCase();
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
    setHighlighted((prev) => prev.filter((id) => id !== key.id));
    console.log("Mouse up on key:", key);
  };

  return (
    <div className={styles.keyboardContainer}>
      <button onClick={toggleEmojiKeyboard} className={styles.toggleButton}>
        {showEmojiKeyboard ? "Switch to Keyboard" : "Switch to Emoji Keyboard"}
      </button>
      <div className={styles.keyboard}>
        {showEmojiKeyboard ? (
          <EmojiKeyboard />
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
