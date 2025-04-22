import React, { useState, useEffect } from "react";
import styles from "./TextArea.module.css";
import {
  loadCursorPositionsForUser,
  saveCursorPositionsForUser,
} from "../../utils/localStorageUtils";

function TextWindow({
  id,
  lastActiveFileName,
  initfileName,
  username,
  content,
  onContentChange,
  isActive,
  onSetActive,
}) {
  const [cursorPosition, setCursorPosition] = useState(null);

  // Initialize content when component mounts or when content prop changes
  useEffect(() => {
    const textWindow = document.getElementById(id);
    if (textWindow && textWindow.innerHTML !== content) {
      textWindow.innerHTML = content;
    }
  }, [id, content]);

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

  const restoreCursorPosition = () => {
    const cursorPositions = loadCursorPositionsForUser(username);
    const savedPosition = cursorPositions[id];
    if (!savedPosition) return;

    const selection = window.getSelection();
    const range = document.createRange();

    const textWindow = document.getElementById(id);
    if (textWindow && textWindow.firstChild) {
      const node = textWindow.firstChild;
      const offset = Math.min(savedPosition.offset, node.textContent.length);
      range.setStart(node, offset);
      range.collapse(true);
    } else if (textWindow) {
      if (!textWindow.firstChild) {
        const textNode = document.createTextNode(content || "");
        textWindow.appendChild(textNode);
      }
      range.setStart(textWindow.firstChild, 0);
      range.collapse(true);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleFocus = () => {
    if (!isActive) {
      onSetActive();
    }
    restoreCursorPosition();
  };

  const handleMouseUp = () => {
    if (!isActive) {
      onSetActive();
    }
    saveCursorPosition();
  };

  const handleInput = (e) => {
    const updatedContent = e.target.innerHTML;
    onContentChange(updatedContent);
    saveCursorPosition();
  };

  return (
    <div
      id={id}
      className={`${styles.TextWindow} ${isActive ? styles.activeTextWindow : ""}`}
      contentEditable="true"
      data-type="text-window"
      onInput={handleInput}
      onFocus={handleFocus}
      onMouseUp={handleMouseUp}
    ></div>
  );
}

export default TextWindow;