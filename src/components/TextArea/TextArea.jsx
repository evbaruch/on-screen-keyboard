import React, { useState } from "react";
import styles from "./TextArea.module.css";
import TextWindow from "./TextWindow";
import { loadFilesForUser, saveFilesForUser } from "../../utils/localStorageUtils";

function TextArea({ username, lastActiveTextWindow, setLastActiveTextWindow, lastActiveFileName, setlastActiveFileName }) {
  const [files, setFiles] = useState(loadFilesForUser(username) || {});
  const [textWindows, setTextWindows] = useState([
    { id: "textWindow1", fileName: "", content: "" }
  ]);

  const handleSave = (windowId) => {
    // Find the target text window
    const targetWindow = textWindows.find(window => window.id === windowId);
    if (!targetWindow) return;

    // If the window already has a fileName, save directly to that file
    if (targetWindow.fileName) {
      const updatedFiles = { ...files, [targetWindow.fileName]: targetWindow.content };
      setFiles(updatedFiles);
      saveFilesForUser(username, updatedFiles);
    } else {
      // If no fileName, prompt for one
      const fileName = prompt("Enter a name for the file:", "Untitled.txt");
      if (fileName) {
        // Check if the filename already exists
        if (files[fileName] && !confirm(`File "${fileName}" already exists. Overwrite?`)) {
          return;
        }

        // Update the files and the text window with the new file name
        const updatedFiles = { ...files, [fileName]: targetWindow.content };
        setFiles(updatedFiles);
        saveFilesForUser(username, updatedFiles);

        // Update the text window's fileName
        const updatedWindows = textWindows.map(window => 
          window.id === windowId ? { ...window, fileName } : window
        );
        setTextWindows(updatedWindows);
        setlastActiveFileName(fileName);
      }
    }
  };

  const handleFileClick = (fileName) => {
    const fileContent = files[fileName] || "";
    
    // If we have an active window, open the file in that window
    if (lastActiveTextWindow) {
      const updatedWindows = textWindows.map(window => 
        window.id === lastActiveTextWindow 
          ? { ...window, fileName, content: fileContent } 
          : window
      );
      setTextWindows(updatedWindows);
    } else if (textWindows.length > 0) {
      // If no active window but we have windows, use the first one
      const updatedWindows = textWindows.map((window, index) => 
        index === 0 ? { ...window, fileName, content: fileContent } : window
      );
      setTextWindows(updatedWindows);
      setLastActiveTextWindow(textWindows[0].id);
    }
    
    setlastActiveFileName(fileName);
  };

  const handleContentChange = (windowId, newContent) => {
    // Find the window and update its content
    const updatedWindows = textWindows.map(window => {
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
  };

  const handleSetActive = (id) => {
    setLastActiveTextWindow(id);
    
    // Also update lastActiveFileName if the window has a file
    const window = textWindows.find(w => w.id === id);
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
    const windowToClose = textWindows.find(window => window.id === windowId);
    
    // If window has unsaved changes, prompt to save
    if (windowToClose && !windowToClose.fileName && windowToClose.content.trim() !== "") {
      if (confirm("Do you want to save changes before closing?")) {
        handleSave(windowId);
      }
    }
    
    // Remove the window from the array
    const updatedWindows = textWindows.filter(window => window.id !== windowId);
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

  return (
    <div className={styles.container}>
      <div className={styles.fileExplorer}>
        <h3>Files</h3>
        <ul>
          {Object.keys(files).map((fileName, index) => (
            <li
              key={index}
              className={lastActiveFileName === fileName ? styles.activeFile : ""}
              onClick={() => handleFileClick(fileName)}
            >
              {fileName}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.editorContainer}>
        <div className={styles.editorToolbar}>
          <button className={styles.addWindowButton} onClick={handleAddTextWindow}>
            + Add Window
          </button>
        </div>
        <div className={styles.textWindowsContainer}>
          {textWindows.map((window) => (
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
                  >
                    Save
                  </button>
                  <button 
                    className={styles.closeButton} 
                    onClick={() => handleCloseTextWindow(window.id)}
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
                onContentChange={(newContent) => handleContentChange(window.id, newContent)}
                isActive={lastActiveTextWindow === window.id}
                onSetActive={() => handleSetActive(window.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TextArea;