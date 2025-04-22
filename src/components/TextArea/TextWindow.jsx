import React, { useState } from "react";
import styles from "./TextArea.module.css"; // Import CSS module for styling
import {
  loadCursorPositionsForUser,
  saveCursorPositionsForUser,
  loadFilesForUser,
} from "../../utils/localStorageUtils";

function TextWindow({
  id,
  username,
  content,
  onContentChange,
  isActive,
  onSetActive,
}) {
  const [cursorPosition, setCursorPosition] = useState(null); // Track cursor position

  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const position = {
        offset: range.startOffset,
      };
      setCursorPosition(position);

      // Save cursor position to the user's object in local storage
      const cursorPositions = loadCursorPositionsForUser(username);
      cursorPositions[id] = position;
      saveCursorPositionsForUser(username, cursorPositions);
    }
  };

  const handleFocus = () => {
    if (!isActive) {
      onSetActive(id); // Notify parent that this TextWindow is active
    }
    handleContentUpdate(); // Update content dynamically
    restoreCursorPosition(); // Restore cursor position on focus
  };

  const handleMouseUp = () => {
    if (!isActive) {
      onSetActive(id); // Ensure this TextWindow becomes active on mouse interaction
    }
    saveCursorPosition(); // Save the cursor position after the user releases the mouse
  };

  const handleInput = (e) => {
    const updatedContent = e.target.innerHTML; // Get the updated content
    onContentChange(updatedContent); // Notify parent of the content change
    saveCursorPosition(); // Save the current cursor position
  };

  const restoreCursorPosition = () => {
    const cursorPositions = loadCursorPositionsForUser(username);
    const savedPosition = cursorPositions[id];
    if (!savedPosition) return; // Skip if no cursor position is saved

    const selection = window.getSelection();
    const range = document.createRange();

    const textWindow = document.getElementById(id);
    if (textWindow && textWindow.firstChild) {
      const node = textWindow.firstChild;
      const offset = Math.min(savedPosition.offset, node.textContent.length);
      range.setStart(node, offset);
      range.collapse(true);
    } else if (textWindow) {
      // If no child node exists, create a text node and set the cursor at the start
      if (!textWindow.firstChild) {
        const textNode = document.createTextNode(content || ""); // Use the current content
        textWindow.appendChild(textNode);
      }
      range.setStart(textWindow.firstChild, 0);
      range.collapse(true);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  };

  // Dynamically update the content and restore the cursor position
  const handleContentUpdate = () => {
    const textWindow = document.getElementById(id);
    if (textWindow && textWindow.innerHTML !== content) {
      content = loadFilesForUser(username)[id] || content; // Update the content dynamically
    }
    restoreCursorPosition(); // Restore the cursor position after updating the content
  };

  handleContentUpdate(); // Call this function to ensure the content is updated when the component mounts

  return (
    <div
      id={id}
      className={styles.TextWindow}
      contentEditable="true"
      data-type="text-window" // Custom attribute to uniquely identify this div
      onInput={handleInput}
      onFocus={handleFocus}
      onMouseUp={handleMouseUp} // Update cursor position on mouse up
    ></div>
  );
}

export default TextWindow;
