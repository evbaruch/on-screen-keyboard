import React from "react";
import styles from "./keyboard.module.css";

function KeyboardKey({ keyObj, highlighted, modifiers, isCapsLockActive, onMouseDown, onMouseUp }) {
  const { id, key, className, shift, alt, fourth } = keyObj;

  // Determine the label to display based on modifiers
  const getKeyLabel = () => {
    if (modifiers.Shift && shift) {
      return shift;
    }
    if (modifiers.Alt && alt) {
      return alt;
    }
    return key;
  };

  return (
    <div
      className={`${styles.key} ${className ? styles[className] : ""} ${
        highlighted.includes(id) ? styles.highlighted : ""
      }`}
      onMouseDown={() => onMouseDown(id, key)} // Trigger mouse down behavior
      onMouseUp={() => onMouseUp(id, key)} // Trigger mouse up behavior
    >
      {/* Primary key label */}
      <div className={styles.primary}>{getKeyLabel()}</div>

      {/* Secondary key label (e.g., Shift) */}
      {shift && <div className={styles.secondary}>{shift}</div>}

      {/* Tertiary key label (e.g., Alt) */}
      {alt && <div className={styles.tertiary}>{alt}</div>}

      {/* Fourth key label (if applicable) */}
      {fourth && <div className={styles.fourth}>{fourth}</div>}

      {/* CapsLock indicator (dot of light) */}
      {id === "capslock" && isCapsLockActive && (
        <div className={styles.capsLockIndicator}></div>
      )}
    </div>
  );
}

export default KeyboardKey;