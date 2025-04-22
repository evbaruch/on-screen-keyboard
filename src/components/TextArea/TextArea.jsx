import React, { useState } from "react";
import styles from "./TextArea.module.css";
import TextWindow from "./TextWindow";
import { loadFilesForUser, saveFilesForUser } from "../../utils/localStorageUtils";

function TextArea({ username, lastActiveTextWindow, setLastActiveTextWindow, lastActiveFileName, setlastActiveFileName }) {
  const [files, setFiles] = useState(loadFilesForUser(username) || {});
  const [textWindows, setTextWindows] = useState([
    { id: "textWindow1", fileName: "", content: "" }
  ]);

  // Helper function to get file content
  const getFileContent = (fileName) => {
    return files[fileName] || "";
  };

  const handleSave = (windowId) => {
    // Find the target text window
    const targetWindow = textWindows.find(window => window.id === windowId);
    if (!targetWindow) return;

    // Get the content directly from the DOM
    const textWindowElement = document.getElementById(windowId);
    const currentContent = textWindowElement ? textWindowElement.innerHTML : targetWindow.content;

    // If the window already has a fileName, save directly to that file
    if (targetWindow.fileName) {
      const updatedFiles = { ...files, [targetWindow.fileName]: currentContent };
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
        const updatedFiles = { ...files, [fileName]: currentContent };
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
    const fileContent = getFileContent(fileName);
    
    // If we have an active window, open the file in that window
    if (lastActiveTextWindow) {
      const updatedWindows = textWindows.map(window => 
        window.id === lastActiveTextWindow 
          ? { ...window, fileName, content: fileContent } 
          : window
      );
      setTextWindows(updatedWindows);
      
      // Update the DOM directly
      const textWindowElement = document.getElementById(lastActiveTextWindow);
      if (textWindowElement) {
        textWindowElement.innerHTML = fileContent;
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
    // Get the content directly from the DOM to ensure we have the latest
    const textWindowElement = document.getElementById(windowId);
    const currentContent = textWindowElement ? textWindowElement.innerHTML : "";
    
    const windowToClose = textWindows.find(window => window.id === windowId);
    const hasUnsavedChanges = windowToClose && !windowToClose.fileName && currentContent.trim() !== "";
    
    // If window has unsaved changes, prompt to save
    if (hasUnsavedChanges) {
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
      const wrapper = document.createElement('div');
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
      document.execCommand('insertHTML', false, signedHTML);
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
          <button className={styles.addWindowButton} onClick={signText} style={{ backgroundColor: '#007BFF' }}>
            Sign Text
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