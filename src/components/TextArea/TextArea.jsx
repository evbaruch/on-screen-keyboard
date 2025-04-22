import React, { useState } from "react";
import styles from "./TextArea.module.css";
import TextWindow from "./TextWindow";
import {
  loadFilesForUser,
  saveFilesForUser,
} from "../../utils/localStorageUtils";

function TextArea({ username, lastActiveTextWindow, setLastActiveTextWindow }) {
  const [files, setFiles] = useState(loadFilesForUser(username) || {});
  const [currentFile, setCurrentFile] = useState(null);
  const [text, setText] = useState("");

  const handleSave = () => {
    const fileName = prompt("Enter a name for the file:", "Untitled.txt");
    if (fileName) {
      const updatedFiles = { ...files, [fileName]: text };
      setFiles(updatedFiles);
      setCurrentFile({ name: fileName, content: text });
      saveFilesForUser(username, updatedFiles);
    }
  };

  const handleFileClick = (fileName) => {
    setCurrentFile({ name: fileName, content: files[fileName] });
    setText(files[fileName]);
  };

  const handleContentChange = (newContent) => {
    setText(newContent);
    if (currentFile) {
      const updatedFiles = { ...files, [currentFile.name]: newContent };
      setFiles(updatedFiles);
      saveFilesForUser(username, updatedFiles);
    }
  };

  const handleSetActive = (id) => {
    setLastActiveTextWindow(id); // Update the last active TextWindow
  };

  return (
    <div className={styles.container}>
      <div className={styles.fileExplorer}>
        <h3>Files</h3>
        <ul>
          {Object.keys(files).map((fileName, index) => (
            <li
              key={index}
              className={
                currentFile?.name === fileName ? styles.activeFile : ""
              }
              onClick={() => handleFileClick(fileName)}
            >
              {fileName}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.editor}>
        <button className={styles.saveButton} onClick={handleSave}>
          Save
        </button>
        {currentFile && (
          <div className={styles.fileNameArea}>
            <span>{currentFile.name}</span>
          </div>
        )}
        <TextWindow
          id="textWindow1"
          content={text}
          onContentChange={handleContentChange}
          isActive={lastActiveTextWindow === "textWindow1"}
          onSetActive={() => handleSetActive("textWindow1")}
        />
      </div>
    </div>
  );
}

export default TextArea;