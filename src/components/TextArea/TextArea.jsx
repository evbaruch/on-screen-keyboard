import React, { useState } from "react";
import styles from "./TextArea.module.css";
import TextWindow from "./TextWindow";
import { loadFilesForUser, saveFilesForUser } from "../../utils/localStorageUtils";

function TextArea({ username, lastActiveTextWindow, setLastActiveTextWindow , lastActiveFileName ,setlastActiveFileName}) {
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
      setlastActiveFileName(fileName); // Notify parent about the last active file name
    }
  };

  const handleFileClick = (fileName) => {
    const fileContent = files[fileName] || ""; // Get the content of the clicked file
    setCurrentFile({ name: fileName, content: fileContent }); // Update the current file
    setText(fileContent); // Update the text state to reflect the new file's content
    setlastActiveFileName(fileName); // Notify parent about the last active file name
    console.log("File clicked:", lastActiveFileName); // Log the clicked file name
  };

  const handleContentChange = (newContent) => {
    setText(newContent); // Update the text state
    if (currentFile) {
      const updatedFiles = { ...files, [currentFile.name]: newContent };
      setFiles(updatedFiles);
      saveFilesForUser(username, updatedFiles); // Save the updated content to local storage
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
              className={currentFile?.name === fileName ? styles.activeFile : ""}
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
          lastActiveFileName={lastActiveFileName}
          initfileName={currentFile?.name || ""}
          username={username}
          content={text} // Dynamically update the content
          onContentChange={handleContentChange}
          isActive={lastActiveTextWindow === "textWindow1"}
          onSetActive={() => handleSetActive("textWindow1")}
        />
      </div>
    </div>
  );
}

export default TextArea;