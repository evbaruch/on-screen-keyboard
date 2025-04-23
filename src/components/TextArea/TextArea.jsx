import React, { useState } from "react";
import styles from "./TextArea.module.css";
import TextWindow from "./TextWindow";
import {
  loadFilesForUser,
  saveFilesForUser,
} from "../../utils/localStorageUtils";

function TextArea({
  username,
  lastActiveTextWindow,
  setLastActiveTextWindow,
  lastActiveFileName,
  setlastActiveFileName,
}) {
  const [files, setFiles] = useState(loadFilesForUser(username) || {});
  const [textWindows, setTextWindows] = useState([
    { id: "textWindow1", fileName: "", content: "" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSearchResults, setCurrentSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [isKeypressListenerAttached, setIsKeypressListenerAttached] =
    useState(false);

  // Helper function to get file content
  const getFileContent = (fileName) => {
    return files[fileName] || "";
  };

  // Attach key event listener for search shortcut (Ctrl+F)
  if (!isKeypressListenerAttached && typeof document !== "undefined") {
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        // Focus the search input
        document.querySelector(`.${styles.searchInput}`)?.focus();
      }
    });
    setIsKeypressListenerAttached(true);
  }

  const handleSave = (windowId) => {
    // Find the target text window
    const targetWindow = textWindows.find((window) => window.id === windowId);
    if (!targetWindow) return;

    // Get the content directly from the DOM
    const textWindowElement = document.getElementById(windowId);
    const currentContent = textWindowElement
      ? textWindowElement.innerHTML
      : targetWindow.content;

    // If the window already has a fileName, save directly to that file
    if (targetWindow.fileName) {
      const updatedFiles = {
        ...files,
        [targetWindow.fileName]: currentContent,
      };
      setFiles(updatedFiles);
      saveFilesForUser(username, updatedFiles);
      alert(`File '${targetWindow.fileName}' saved successfully!`);
    } else {
      // If no fileName, prompt for one
      const fileName = prompt("Enter a name for the file:", "Untitled.txt");
      if (fileName) {
        // Check if the filename already exists
        if (
          files[fileName] &&
          !confirm(`File "${fileName}" already exists. Overwrite?`)
        ) {
          return;
        }

        // Update the files and the text window with the new file name
        const updatedFiles = { ...files, [fileName]: currentContent };
        setFiles(updatedFiles);
        saveFilesForUser(username, updatedFiles);

        // Update the text window's fileName
        const updatedWindows = textWindows.map((window) =>
          window.id === windowId ? { ...window, fileName } : window
        );
        setTextWindows(updatedWindows);
        setlastActiveFileName(fileName);
        alert(`File '${fileName}' saved successfully!`);
      }
    }
  };

  const handleFileClick = (fileName) => {
    const fileContent = getFileContent(fileName);

    // If we have an active window, open the file in that window
    if (lastActiveTextWindow) {
      const updatedWindows = textWindows.map((window) =>
        window.id === lastActiveTextWindow
          ? { ...window, fileName, content: fileContent }
          : window
      );
      setTextWindows(updatedWindows);

      // Update the DOM directly
      const textWindowElement = document.getElementById(lastActiveTextWindow);
      if (textWindowElement) {
        textWindowElement.innerHTML = fileContent;

        // Clear any previous search results when opening a new file
        clearSearchHighlights(textWindowElement);
        setCurrentSearchResults([]);
        setCurrentResultIndex(-1);
      }
    } else if (textWindows.length > 0) {
      // If no active window but we have windows, use the first one
      const updatedWindows = textWindows.map((window, index) =>
        index === 0 ? { ...window, fileName, content: fileContent } : window
      );
      setTextWindows(updatedWindows);
      setLastActiveTextWindow(textWindows[0].id);

      // Update the DOM directly
      const textWindowElement = document.getElementById(textWindows[0].id);
      if (textWindowElement) {
        textWindowElement.innerHTML = fileContent;
      }
    }

    setlastActiveFileName(fileName);
  };

  const handleContentChange = (windowId, newContent) => {
    // Find the window and update its content
    const updatedWindows = textWindows.map((window) => {
      if (window.id === windowId) {
        // If the window has a filename, also update the file in storage
        if (window.fileName) {
          const updatedFiles = { ...files, [window.fileName]: newContent };
          setFiles(updatedFiles);
          saveFilesForUser(username, updatedFiles);
        }
        return { ...window, content: newContent };
      }
      return window;
    });

    setTextWindows(updatedWindows);

    // Clear search results when content changes
    const textWindowElement = document.getElementById(windowId);
    if (textWindowElement && currentSearchResults.length > 0) {
      clearSearchHighlights(textWindowElement);
      setCurrentSearchResults([]);
      setCurrentResultIndex(-1);
    }
  };

  const handleSetActive = (id) => {
    setLastActiveTextWindow(id);

    // Also update lastActiveFileName if the window has a file
    const window = textWindows.find((w) => w.id === id);
    if (window && window.fileName) {
      setlastActiveFileName(window.fileName);
    }
  };

  const handleAddTextWindow = () => {
    const newId = `textWindow${textWindows.length + 1}`;
    setTextWindows([...textWindows, { id: newId, fileName: "", content: "" }]);
    setLastActiveTextWindow(newId);
  };

  const handleCloseTextWindow = (windowId) => {
    // Get the content directly from the DOM to ensure we have the latest
    const textWindowElement = document.getElementById(windowId);
    const currentContent = textWindowElement ? textWindowElement.innerHTML : "";

    const windowToClose = textWindows.find((window) => window.id === windowId);
    const hasUnsavedChanges =
      windowToClose && !windowToClose.fileName && currentContent.trim() !== "";

    // If window has unsaved changes, prompt to save
    if (hasUnsavedChanges) {
      if (confirm("Do you want to save changes before closing?")) {
        handleSave(windowId);
      }
    }

    // Remove the window from the array
    const updatedWindows = textWindows.filter(
      (window) => window.id !== windowId
    );
    setTextWindows(updatedWindows);

    // If we're closing the active window, set a new active window
    if (lastActiveTextWindow === windowId && updatedWindows.length > 0) {
      setLastActiveTextWindow(updatedWindows[0].id);
      if (updatedWindows[0].fileName) {
        setlastActiveFileName(updatedWindows[0].fileName);
      } else {
        setlastActiveFileName("");
      }
    } else if (updatedWindows.length === 0) {
      setLastActiveTextWindow(null);
      setlastActiveFileName("");
    }
  };

  const handleDeleteAll = (windowId) => {
    if (
      confirm("Are you sure you want to delete all content in this window?")
    ) {
      const textWindowElement = document.getElementById(windowId);
      if (textWindowElement) {
        textWindowElement.innerHTML = "";
        handleContentChange(windowId, "");
      }
    }
  };

  // Update the handleUndo function:

  const handleUndo = (windowId) => {
    // Use the global handler directly if available
    if (
      window._textWindowGlobals &&
      window._textWindowGlobals.undoHandlers &&
      window._textWindowGlobals.undoHandlers[windowId]
    ) {
      window._textWindowGlobals.undoHandlers[windowId]();
    } else {
      // Fallback to event dispatch method
      const textWindowElement = document.getElementById(windowId);
      if (textWindowElement) {
        const undoEvent = new CustomEvent("custom:undo");
        textWindowElement.dispatchEvent(undoEvent);
      }
    }
  };

  const signText = () => {
    if (!lastActiveTextWindow) return;

    // Check if text is selected
    const selection = window.getSelection();
    const hasSelection = selection.toString().trim().length > 0;

    const textWindow = document.getElementById(lastActiveTextWindow);
    if (!textWindow) return;

    const signatureText = prompt("Enter your signature:", `${username}`);
    if (!signatureText) return;

    const currentDate = new Date().toLocaleDateString();

    if (hasSelection) {
      // Sign the selected text
      const range = selection.getRangeAt(0);
      const selectedContent = range.cloneContents();
      const wrapper = document.createElement("div");
      wrapper.appendChild(selectedContent);

      const signedHTML = `<div style="border: 1px solid #ccc; padding: 10px; margin: 5px 0; background-color: #f9f9f9;">
                           <div>${wrapper.innerHTML}</div>
                           <div style="margin-top: 10px; border-top: 1px solid #ccc; padding-top: 5px;">
                             <div style="font-style: italic; color: #666;">
                               Signed by: <strong>${signatureText}</strong> on ${currentDate}
                             </div>
                           </div>
                         </div>`;

      // Replace the selection with the signed content
      document.execCommand("insertHTML", false, signedHTML);
    } else {
      // Sign at the end of the document
      const signatureHTML = `<div style="margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px;">
                              <div style="font-style: italic; color: #666;">
                                Signed by: <strong>${signatureText}</strong> on ${currentDate}
                              </div>
                            </div>`;

      // Append the signature to the end
      textWindow.innerHTML += signatureHTML;
    }

    // Save the updated content
    const updatedContent = textWindow.innerHTML;
    handleContentChange(lastActiveTextWindow, updatedContent);
  };

  // FIXED: Search functionality
  const handleSearch = () => {
    if (!searchTerm || !lastActiveTextWindow) return;

    const textWindow = document.getElementById(lastActiveTextWindow);
    if (!textWindow) return;

    try {
      // Clear any previous highlights
      clearSearchHighlights(textWindow);

      // Create a regex from the search term
      const regex = new RegExp(searchTerm, "gi");

      // Get text content
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = textWindow.innerHTML;
      const textContent = tempDiv.textContent;

      // Find all matches
      const matches = [];
      let match;

      while ((match = regex.exec(textContent)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          text: match[0],
        });
      }

      // Update search results
      setCurrentSearchResults(matches);

      if (matches.length > 0) {
        setCurrentResultIndex(0);
        highlightSearchResult(textWindow, matches[0]);
        // Make sure the highlighted element is visible
        const firstHighlight = textWindow.querySelector(".search-highlight");
        if (firstHighlight) {
          firstHighlight.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      } else {
        setCurrentResultIndex(-1);
        alert("No matches found");
      }
    } catch (e) {
      console.error("Search error:", e);
      alert("Invalid search pattern");
    }
  };

  const clearSearchHighlights = (textWindow) => {
    // First store the current cursor position
    const selection = window.getSelection();
    let savedRange = null;

    if (selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
    }

    // Remove all highlights
    const highlightElements = textWindow.querySelectorAll(".search-highlight");
    highlightElements.forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        // Replace highlight span with its text content
        const textNode = document.createTextNode(el.textContent);
        parent.replaceChild(textNode, el);
      }
    });

    // Restore cursor position
    if (savedRange) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }
  };

  const highlightSearchResult = (textWindow, result) => {
    // First clear all existing highlights
    clearSearchHighlights(textWindow);

    // Then find and highlight the specific result
    const walker = document.createTreeWalker(
      textWindow,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let charCount = 0;
    let node;

    // Find the text node containing this match
    while ((node = walker.nextNode())) {
      const nodeLength = node.nodeValue.length;

      if (charCount <= result.index && result.index < charCount + nodeLength) {
        // This node contains our match
        const startOffset = result.index - charCount;
        const endOffset = Math.min(startOffset + result.length, nodeLength);

        // Create range for the match
        const range = document.createRange();
        range.setStart(node, startOffset);
        range.setEnd(node, endOffset);

        // Create highlight span
        const highlightSpan = document.createElement("span");
        highlightSpan.className = "search-highlight";
        highlightSpan.style.backgroundColor = "yellow";
        highlightSpan.style.color = "black";

        // Wrap the matched text with the highlight span
        range.surroundContents(highlightSpan);

        // Ensure it's visible
        highlightSpan.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      charCount += nodeLength;
    }
  };

  const navigateSearchResults = (direction) => {
    if (currentSearchResults.length === 0) return;

    const textWindow = document.getElementById(lastActiveTextWindow);
    if (!textWindow) return;

    let newIndex;
    if (direction === "next") {
      newIndex = (currentResultIndex + 1) % currentSearchResults.length;
    } else {
      newIndex =
        (currentResultIndex - 1 + currentSearchResults.length) %
        currentSearchResults.length;
    }

    setCurrentResultIndex(newIndex);
    highlightSearchResult(textWindow, currentSearchResults[newIndex]);
  };

  // Filter text windows based on search query
  const filteredTextWindows = textWindows.filter((window) => {
    if (!searchTerm) return true;

    try {
      const regex = new RegExp(searchTerm, "i");
      return (
        (window.fileName && regex.test(window.fileName)) ||
        regex.test(window.content)
      );
    } catch (e) {
      // If regex is invalid, fallback to simple includes search
      return (
        (window.fileName && window.fileName.includes(searchTerm)) ||
        window.content.includes(searchTerm)
      );
    }
  });

  return (
    <div className={styles.container}>
      <div className={styles.fileExplorer}>
        <h3>Files</h3>
        <ul>
          {Object.keys(files).map((fileName, index) => (
            <li
              key={index}
              className={
                lastActiveFileName === fileName ? styles.activeFile : ""
              }
              onClick={() => handleFileClick(fileName)}
            >
              {fileName}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.editorContainer}>
        <div className={styles.editorToolbar}>
          <button
            className={styles.addWindowButton}
            onClick={handleAddTextWindow}
          >
            + Add Window
          </button>
          <button className={styles.signButton} onClick={signText}>
            Sign Text
          </button>

          {/* Search functionality */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search text (RegEx)..."
              className={styles.searchInput}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch} className={styles.searchButton}>
              Search
            </button>
            {currentSearchResults.length > 0 && (
              <>
                <span className={styles.searchResults}>
                  {currentResultIndex + 1} of {currentSearchResults.length}
                </span>
                <button
                  onClick={() => navigateSearchResults("prev")}
                  className={styles.navButton}
                >
                  ▲
                </button>
                <button
                  onClick={() => navigateSearchResults("next")}
                  className={styles.navButton}
                >
                  ▼
                </button>
              </>
            )}
          </div>
        </div>

        <div className={styles.textWindowsContainer}>
          {filteredTextWindows.map((window) => (
            <div key={window.id} className={styles.textWindowWrapper}>
              <div className={styles.textWindowHeader}>
                {window.fileName ? (
                  <span className={styles.fileName}>{window.fileName}</span>
                ) : (
                  <span className={styles.untitledFile}>Untitled</span>
                )}
                <div className={styles.windowButtons}>
                  <button
                    className={styles.saveButton}
                    onClick={() => handleSave(window.id)}
                    title="Save"
                  >
                    Save
                  </button>
                  <button
                    className={styles.undoButton}
                    onClick={() => handleUndo(window.id)}
                    title="Undo"
                  >
                    ↩
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteAll(window.id)}
                    title="Delete All Content"
                  >
                    🗑️
                  </button>
                  <button
                    className={styles.closeButton}
                    onClick={() => handleCloseTextWindow(window.id)}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <TextWindow
                id={window.id}
                lastActiveFileName={window.fileName}
                initfileName={window.fileName}
                username={username}
                content={window.content}
                onContentChange={(newContent) =>
                  handleContentChange(window.id, newContent)
                }
                isActive={lastActiveTextWindow === window.id}
                onSetActive={() => handleSetActive(window.id)}
                onClearContent={() => handleDeleteAll(window.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TextArea;
