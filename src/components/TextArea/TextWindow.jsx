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
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [formatMenuPosition, setFormatMenuPosition] = useState({ x: 0, y: 0 });

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

  const handleContextMenu = (e) => {
    e.preventDefault();
    
    // Only show format menu if there is text selected
    const selection = window.getSelection();
    if (selection.toString().trim().length > 0) {
      setFormatMenuPosition({ x: e.pageX, y: e.pageY });
      setShowFormatMenu(true);
    }
  };

  const handleClickOutside = (e) => {
    if (showFormatMenu && !e.target.closest(`.${styles.formatMenu}`)) {
      setShowFormatMenu(false);
    }
  };

  // Add event listener to handle clicks outside the format menu
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFormatMenu]);

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    const textWindow = document.getElementById(id);
    const updatedContent = textWindow.innerHTML;
    onContentChange(updatedContent);
    setShowFormatMenu(false);
  };

  return (
    <>
      <div
        id={id}
        className={`${styles.TextWindow} ${isActive ? styles.activeTextWindow : ""}`}
        contentEditable="true"
        data-type="text-window"
        onInput={handleInput}
        onFocus={handleFocus}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
      ></div>
      
      {showFormatMenu && (
        <div 
          className={styles.formatMenu} 
          style={{ 
            position: 'absolute', 
            top: formatMenuPosition.y, 
            left: formatMenuPosition.x 
          }}
        >
          <button onClick={() => applyFormat('bold')}>Bold</button>
          <button onClick={() => applyFormat('italic')}>Italic</button>
          <button onClick={() => applyFormat('underline')}>Underline</button>
          <select onChange={(e) => applyFormat('foreColor', e.target.value)}>
            <option value="">Text Color</option>
            <option value="#000000">Black</option>
            <option value="#ff0000">Red</option>
            <option value="#0000ff">Blue</option>
            <option value="#008000">Green</option>
          </select>
          <select onChange={(e) => applyFormat('fontSize', e.target.value)}>
            <option value="">Font Size</option>
            <option value="1">Small</option>
            <option value="3">Normal</option>
            <option value="5">Large</option>
            <option value="7">X-Large</option>
          </select>
          <select onChange={(e) => applyFormat('fontName', e.target.value)}>
            <option value="">Font</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
          </select>
        </div>
      )}
    </>
  );
}

export default TextWindow;