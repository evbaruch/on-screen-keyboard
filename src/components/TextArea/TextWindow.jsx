import React, { useState } from "react";
import styles from "./TextArea.module.css";
import {
  loadCursorPositionsForUser,
  saveCursorPositionsForUser,
} from "../../utils/localStorageUtils";

// Global object to manage undo handlers
if (typeof window !== 'undefined' && !window._textWindowGlobals) {
  window._textWindowGlobals = {
    undoHandlers: {}
  };
}

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
  const [listenerAttached, setListenerAttached] = useState(false);

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

  // Handle keyboard shortcuts - MOVED UP before initContent
  const handleKeyDown = (e) => {
    // Ctrl+Z for undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      handleUndo();
      return;
    }
    
    // Handle Delete or Backspace with text selection
    if ((e.key === 'Delete' || e.key === 'Backspace')) {
      const selection = window.getSelection();
      const hasSelection = selection.toString().trim().length > 0;
      
      if (hasSelection) {
        // Save current state for undo first
        const textWindow = document.getElementById(id);
        setUndoStack(prevStack => [...prevStack, textWindow.innerHTML]);
        
        // Let the default delete/backspace happen
        // We just need to update after it's done
        setTimeout(() => {
          const updatedContent = textWindow.innerHTML;
          onContentChange(updatedContent);
          saveCursorPosition();
        }, 0);
      }
    }
  };

  // Store the handleUndo function globally
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
      setUndoStack(prevStack => prevStack.slice(0, -1));
      
      // Restore cursor
      setTimeout(restoreCursorPosition, 0);
    }
  };

  // Add to global registry
  window._textWindowGlobals.undoHandlers[id] = handleUndo;

  // Initialize content on first render
  const initContent = () => {
    const textWindow = document.getElementById(id);
    if (textWindow && textWindow.innerHTML !== content) {
      textWindow.innerHTML = content;
    }
    
    // Set up event handlers if not already done
    if (!listenerAttached) {
      const textWindow = document.getElementById(id);
      if (textWindow) {
        // Remove any existing listeners to prevent duplicates
        textWindow.removeEventListener('custom:undo', window._textWindowGlobals.undoHandlers[id]);
        textWindow.removeEventListener('keydown', handleKeyDown);
        
        // Add the new listeners
        textWindow.addEventListener('custom:undo', window._textWindowGlobals.undoHandlers[id]);
        textWindow.addEventListener('keydown', handleKeyDown);
        
        setListenerAttached(true);
      }
    }
  };

  // Call init content on first render
  if (document.getElementById(id)) {
    initContent();
  }

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
    setUndoStack(prevStack => [...prevStack, content]);
    
    onContentChange(updatedContent);
    saveCursorPosition();
  };

  // right click
  const handleContextMenu = (e) => {
    e.preventDefault();
    
    // Only show format menu if there is text selected
    const selection = window.getSelection();
    if (selection.toString().trim().length > 0) {
      setFormatMenuPosition({ x: e.pageX, y: e.pageY });
      setShowFormatMenu(true);
    }
  };

  // Handle text deletion via keyboard or context menu
  const handleDeleteSelectedText = () => {
    const selection = window.getSelection();
    if (selection.toString().trim().length > 0) {
      // Save current state for undo
      const textWindow = document.getElementById(id);
      setUndoStack(prevStack => [...prevStack, textWindow.innerHTML]);
      
      // Delete selected text
      document.execCommand('delete', false);
      
      // Update content
      const updatedContent = textWindow.innerHTML;
      onContentChange(updatedContent);
      
      // Hide format menu if it's open
      setShowFormatMenu(false);
      
      // Save cursor position
      saveCursorPosition();
    }
  };

  const applyFormat = (command, value = null) => {
    // Save current state for undo
    const textWindow = document.getElementById(id);
    if (textWindow) {
      setUndoStack(prevStack => [...prevStack, textWindow.innerHTML]);
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
      if (!findText) return;
      
      const textWindow = document.getElementById(id);
      if (!textWindow) return;
      
      // Save current state for undo
      setUndoStack(prevStack => [...prevStack, textWindow.innerHTML]);
      
      const content = textWindow.innerHTML;
      
      // Create regex from the find text
      const regex = new RegExp(findText, 'g');
      
      // Get the text content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const textContent = tempDiv.textContent;
      
      // Find all matches
      let match;
      const matches = [];
      
      while ((match = regex.exec(textContent)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          text: match[0]
        });
      }
      
      if (matches.length === 0) {
        alert("No matches found");
        return;
      }
      
      // Check if text is selected - if so, only replace in selection
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText.length > 0) {
        // Replace only in selection
        const replacedText = selectedText.replace(regex, replaceText);
        if (replacedText !== selectedText) {
          document.execCommand('insertText', false, replacedText);
          
          const updatedContent = textWindow.innerHTML;
          onContentChange(updatedContent);
          alert(`Replaced in selection: ${selectedText.match(regex).length} occurrences`);
        } else {
          alert("No matches found in selection");
        }
      } else {
        // Replace in entire content with DOM manipulation
        let updatedHTML = content;
        let offset = 0;
        
        // Process matches in reverse order to avoid offset changes
        for (let i = matches.length - 1; i >= 0; i--) {
          const match = matches[i];
          const walker = document.createTreeWalker(
            textWindow,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );
          
          let node;
          let charCount = 0;
          
          // Find the node containing the match
          while ((node = walker.nextNode())) {
            const nodeLength = node.nodeValue.length;
            if (charCount + nodeLength > match.index) {
              // This node contains our match
              const startOffset = match.index - charCount;
              const endOffset = Math.min(startOffset + match.length, nodeLength);
              
              // Calculate the position in the HTML string
              const nodeHTML = node.nodeValue;
              const beforeText = nodeHTML.substring(0, startOffset);
              const matchText = nodeHTML.substring(startOffset, endOffset);
              const afterText = nodeHTML.substring(endOffset);
              
              // Replace the text in this node
              node.nodeValue = beforeText + replaceText + afterText;
              break;
            }
            charCount += nodeLength;
          }
        }
        
        // Update content
        const finalContent = textWindow.innerHTML;
        onContentChange(finalContent);
        alert(`Replaced ${matches.length} occurrences`);
      }
      
      setShowFormatMenu(false);
      setTimeout(saveCursorPosition, 0);
      
    } catch (error) {
      console.error("Error in find/replace:", error);
      alert("Invalid regular expression pattern");
    }
  };

  // Global click handler for outside format menu
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    // Safe way to add a document click handler
    if (!window._formatMenuClickHandler) {
      window._formatMenuClickHandler = function(e) {
        if (showFormatMenu && e.target && !e.target.closest(`.${styles.formatMenu}`)) {
          setShowFormatMenu(false);
        }
      };
      
      // Remove then add to prevent duplicates
      document.removeEventListener('mousedown', window._formatMenuClickHandler);
      document.addEventListener('mousedown', window._formatMenuClickHandler);
    }
  }

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
          <button onClick={handleDeleteSelectedText} className={styles.deleteButton}>
            Delete Selection
          </button>
          
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
          <button onClick={handleFindReplace}>Replace All</button>
        </div>
      )}
    </>
  );
}

export default TextWindow;