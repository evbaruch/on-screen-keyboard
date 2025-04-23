import React, { useState } from "react";
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
  onClearContent,
}) {
  const [cursorPosition, setCursorPosition] = useState(null);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [formatMenuPosition, setFormatMenuPosition] = useState({ x: 0, y: 0 });
  const [undoStack, setUndoStack] = useState([]);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  // Initialize content on first render
  const initContent = () => {
    const textWindow = document.getElementById(id);
    if (textWindow && textWindow.innerHTML !== content) {
      textWindow.innerHTML = content;
    }
  };

  // Call init content on first render
  if (document.getElementById(id)) {
    initContent();
  }

  // Cursor position saving function
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      const textWindow = document.getElementById(id);
      
      let node = range.startContainer;
      const path = [];
      
      // Get path from node to text window
      while (node !== textWindow && node.parentNode) {
        const parent = node.parentNode;
        const children = Array.from(parent.childNodes);
        path.unshift(children.indexOf(node));
        node = parent;
      }
      
      const position = {
        path: path,
        offset: range.startOffset,
        html: textWindow.innerHTML
      };
      
      setCursorPosition(position);

      // Save cursor position to local storage
      const cursorPositions = loadCursorPositionsForUser(username);
      cursorPositions[id] = position;
      saveCursorPositionsForUser(username, cursorPositions);
    }
  };

  // Function to restore cursor position
  const restoreCursorPosition = () => {
    const cursorPositions = loadCursorPositionsForUser(username);
    const savedPosition = cursorPositions[id];
    if (!savedPosition) return;
    
    const textWindow = document.getElementById(id);
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
    
    // Close format menu if it's open and user clicks elsewhere
    if (showFormatMenu) {
      const selection = window.getSelection();
      if (selection.toString().trim().length === 0) {
        setShowFormatMenu(false);
      }
    }
  };

  const handleInput = (e) => {
    const textWindow = document.getElementById(id);
    const updatedContent = textWindow.innerHTML;
    
    // Add to undo stack
    setUndoStack([...undoStack, content]);
    
    onContentChange(updatedContent);
    saveCursorPosition();
  };

  // Listen for custom undo event from parent component
  if (typeof document !== 'undefined' && document.getElementById(id)) {
    const textWindow = document.getElementById(id);
    if (textWindow && !textWindow._undoListenerAttached) {
      textWindow._undoListenerAttached = true;
      textWindow.addEventListener('custom:undo', () => {
        handleUndo();
      });
    }
  }

  const handleUndo = () => {
    if (undoStack.length > 0) {
      // Get the last state
      const lastContent = undoStack[undoStack.length - 1];
      
      // Update the content
      const textWindow = document.getElementById(id);
      if (textWindow) {
        textWindow.innerHTML = lastContent;
      }
      
      // Update parent component
      onContentChange(lastContent);
      
      // Remove from undo stack
      setUndoStack(undoStack.slice(0, -1));
      
      // Restore cursor
      setTimeout(restoreCursorPosition, 0);
    }
  };
  
  const handleClearContent = () => {
    // Save current content for undo
    const textWindow = document.getElementById(id);
    if (textWindow) {
      setUndoStack([...undoStack, textWindow.innerHTML]);
      textWindow.innerHTML = "";
      onContentChange("");
    }
    if (onClearContent) {
      onClearContent();
    }
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
    // Manual implementation of click outside handling
    if (showFormatMenu && !e.target.closest(`.${styles.formatMenu}`)) {
      setShowFormatMenu(false);
    }
  };

  // Add click handler to document
  if (typeof document !== 'undefined') {
    document.addEventListener('mousedown', handleClickOutside);
  }

  const applyFormat = (command, value = null) => {
    // Save current state for undo
    const textWindow = document.getElementById(id);
    if (textWindow) {
      setUndoStack([...undoStack, textWindow.innerHTML]);
    }
    
    document.execCommand(command, false, value);
    
    if (textWindow) {
      const updatedContent = textWindow.innerHTML;
      onContentChange(updatedContent);
    }
    
    setShowFormatMenu(false);
    
    // Ensure we save the cursor position after formatting
    setTimeout(saveCursorPosition, 0);
  };
  
  const handleFindReplace = () => {
    try {
      const textWindow = document.getElementById(id);
      if (!textWindow) return;
      
      // Get the selected text range
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();
      
      // Save current state for undo
      setUndoStack([...undoStack, textWindow.innerHTML]);
      
      // Create regex from the find text
      const regex = new RegExp(findText, 'g');
      
      // Replace the text in the selection
      if (selectedText) {
        const replacedText = selectedText.replace(regex, replaceText);
        if (replacedText !== selectedText) {
          document.execCommand('insertText', false, replacedText);
          
          const updatedContent = textWindow.innerHTML;
          onContentChange(updatedContent);
        }
      }
      
      setShowFormatMenu(false);
      setTimeout(saveCursorPosition, 0);
      
    } catch (error) {
      console.error("Error in find/replace:", error);
      alert("Invalid regular expression pattern");
    }
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
          
          <label>Find & Replace (RegEx)</label>
          <input 
            type="text" 
            placeholder="Find pattern" 
            value={findText} 
            onChange={(e) => setFindText(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Replace with" 
            value={replaceText} 
            onChange={(e) => setReplaceText(e.target.value)}
          />
          <button onClick={handleFindReplace}>Replace</button>
        </div>
      )}
    </>
  );
}

export default TextWindow;