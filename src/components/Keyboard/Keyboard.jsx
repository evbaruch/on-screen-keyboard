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

  const getCursorPosition = () => {
    const cursorPositions = loadCursorPositionsForUser(username);
    return cursorPositions[lastActiveTextWindow]?.offset || 0;
  };

  const updateCursorPosition = (newPosition) => {
    const cursorPositions = loadCursorPositionsForUser(username);
    cursorPositions[lastActiveTextWindow] = { offset: newPosition };
    saveCursorPositionsForUser(username, cursorPositions);
  };

  const handleMouseDown = (id, key) => {
    const normalizedKey = key.toUpperCase();

    if (normalizedKey === "CAPSLOCK") {
      setIsCapsLockActive((prev) => !prev);
      return;
    }

    const cursorPosition = getCursorPosition();
    const activeTextWindow = document.getElementById(lastActiveTextWindow);
    if (!activeTextWindow) return;

    let content = activeTextWindow.textContent || "";

    if (isCapsLockActive) {
      key = key.toUpperCase();
    } else {
      key = key.toLowerCase();
    }

    const beforeCursor = content.slice(0, cursorPosition);
    const afterCursor = content.slice(cursorPosition);
    content = beforeCursor + key + afterCursor;

    // Update the node size manually by setting the content
    if (!activeTextWindow.firstChild) {
      const textNode = document.createTextNode(content);
      activeTextWindow.appendChild(textNode);
    } else {
      activeTextWindow.firstChild.textContent = content;
    }

    saveFilesForUser(username, { [lastActivefileName]: content }); // Save the updated content to local storage

    const newCursorPosition = Math.min(
      cursorPosition + key.length,
      content.length
    ); // Clamp the cursor position
    updateCursorPosition(newCursorPosition);

    const selection = window.getSelection();
    const range = document.createRange();
    const textNode = activeTextWindow.firstChild;

    const validOffset = Math.min(
      newCursorPosition,
      textNode.textContent.length
    ); // Ensure offset is valid
    range.setStart(textNode, validOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleEmojiClick = (emojiPath) => {
    const cursorPosition = getCursorPosition();
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
    const range = selection.getRangeAt(0);

    // Insert the emoji at the cursor position
    range.insertNode(emojiNode);

    // Move the cursor after the emoji
    range.setStartAfter(emojiNode);
    range.collapse(true);

    // Update the selection
    selection.removeAllRanges();
    selection.addRange(range);

    // Save the updated content to local storage
    const updatedContent = activeTextWindow.innerHTML;
    saveFilesForUser(username, { [lastActivefileName]: updatedContent });

    // Update the cursor position in local storage
    const newCursorPosition = cursorPosition + 1; // Treat emoji as a single character
    updateCursorPosition(newCursorPosition);
  };

  const handleMouseUp = () => {
    setHighlighted([]);
  };

  if (!window._keyboardListenersAttached) {
    window._keyboardListenersAttached = true;

    // Handle physical keyboard keydown
    window.addEventListener("keydown", (event) => {
      const key = event.key === " " ? "Space" : event.key;
      const normalizedKey = key.toUpperCase();

      if (normalizedKey === "CAPSLOCK") {
        setIsCapsLockActive((prev) => !prev);
        return;
      }

      const cursorPosition = getCursorPosition();
      const activeTextWindow = document.getElementById(lastActiveTextWindow);
      if (!activeTextWindow) return;

      let content = activeTextWindow.textContent || "";

      if (normalizedKey === "BACKSPACE") {
        if (cursorPosition > 0) {
          const beforeCursor = content.slice(0, cursorPosition);
          const afterCursor = content.slice(cursorPosition);
          const newBeforeCursor = [...beforeCursor].slice(0, -1).join("");
          content = newBeforeCursor + afterCursor;

          const newCursorPosition = newBeforeCursor.length;
          updateCursorPosition(newCursorPosition);

          activeTextWindow.textContent = content;

          const selection = window.getSelection();
          const range = document.createRange();
          range.setStart(
            activeTextWindow.firstChild || activeTextWindow,
            newCursorPosition
          );
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        const beforeCursor = content.slice(0, cursorPosition);
        const afterCursor = content.slice(cursorPosition);
        const newContent = beforeCursor + key + afterCursor;

        const newCursorPosition = cursorPosition + key.length;
        updateCursorPosition(newCursorPosition);

        activeTextWindow.textContent = newContent;

        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(
          activeTextWindow.firstChild || activeTextWindow,
          newCursorPosition
        );
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      event.preventDefault();
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
