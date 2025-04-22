import React, { useState } from "react";
import styles from "./TextArea.module.css"; // Import CSS module for styling

function TextWindow({ id, content, onContentChange, isActive, onSetActive }) {
  const [cursorPosition, setCursorPosition] = useState(null); // Track cursor position

  const handleInput = (e) => {
    const htmlContent = e.target.innerHTML; // Get the updated HTML content
    if (htmlContent !== content) {
      onContentChange(htmlContent); // Notify parent of the content change
    }
    saveCursorPosition(); // Save the current cursor position
  };

  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      setCursorPosition({
        node: range.startContainer,
        offset: range.startOffset,
      });
    }
  };

  const restoreCursorPosition = () => {
    if (!cursorPosition) return; // Skip if no cursor position is saved

    const selection = window.getSelection();
    const range = document.createRange();

    if (
      cursorPosition.node &&
      cursorPosition.node.parentNode &&
      cursorPosition.offset <= cursorPosition.node.length
    ) {
      // Restore to the saved position
      range.setStart(cursorPosition.node, cursorPosition.offset);
      range.collapse(true);
    } else {
      // Fallback to the end of the content
      const textWindow = document.getElementById(id);
      if (textWindow) {
        const lastChild = textWindow.lastChild;
        if (lastChild) {
          range.setStart(lastChild, lastChild.length || 0);
          range.collapse(true);
        }
      }
    }

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleFocus = () => {
    if (!isActive) {
      onSetActive(); // Notify parent that this TextWindow is active
    }
    restoreCursorPosition(); // Restore cursor position on focus
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.collapsed && range.startOffset > 0) {
          // Update cursor position after deletion
          setCursorPosition({
            node: range.startContainer,
            offset: range.startOffset - 1,
          });
        } else {
          saveCursorPosition();
        }
      }
    }
  };

  const handleKeyUp = () => {
    saveCursorPosition(); // Save cursor position after key press
  };

  const handleMouseDown = () => {
    if (!isActive) {
      onSetActive(); // Ensure this TextWindow becomes active on mouse interaction
    }
  };

  return (
    <div
      id={id}
      className={styles.TextWindow}
      contentEditable="true"
      data-type="text-window" // Custom attribute to uniquely identify this div
      dangerouslySetInnerHTML={{ __html: content }}
      onInput={handleInput}
      onFocus={handleFocus}
      onMouseDown={handleMouseDown}
      onKeyUp={handleKeyUp}
      onKeyDown={handleKeyDown} // Handle Backspace key
    ></div>
  );
}

export default TextWindow;