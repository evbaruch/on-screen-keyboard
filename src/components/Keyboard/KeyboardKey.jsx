import React from "react";
import styles from "./keyboard.module.css";

function KeyboardKey({ keyObj, highlighted, modifiers, isCapsLockActive, onMouseDown, onMouseUp, keyboardLanguage, specialKeysMode }) {
  const { id, key, className, shift, alt, fourth } = keyObj;

  // Determine the label to display based on language, modifiers and special keys mode
  const getKeyLabel = () => {
    // If Hebrew is active and there's a Hebrew character available, show it
    if (keyboardLanguage === "HE" && fourth) {
      return fourth;
    }
    
    // Show shift character if shift is pressed OR special keys mode is active
    if ((modifiers.Shift || specialKeysMode) && shift) {
      return shift;
    }
    
    if (modifiers.Alt && alt) {
      return alt;
    }
    
    // Apply capslock for regular characters in English mode
    if (key.length === 1) {
      return isCapsLockActive ? key.toUpperCase() : key.toLowerCase();
    }
    
    return key;
  };
  
  // Check if this key is currently highlighted
  const isHighlighted = highlighted.includes(id);
  
  // Special class for active modifier keys
  const isModifierActive = 
    (id === "left-shift" || id === "right-shift") && (modifiers.Shift || specialKeysMode) ||
    (id === "alt-left" || id === "alt-right") && modifiers.Alt ||
    id === "capslock" && isCapsLockActive;

  return (
    <div
      className={`${styles.key} 
                 ${className ? styles[className] : ""} 
                 ${isHighlighted ? styles.highlighted : ""} 
                 ${isModifierActive ? styles.active : ""} 
                 ${keyboardLanguage === "HE" && fourth ? styles.hebrewKey : ""}`}
      onMouseDown={() => onMouseDown(id, key, keyObj)}
      onMouseUp={() => onMouseUp(id, key)}
    >
      {/* Primary key label */}
      <div className={styles.primary}>
        {getKeyLabel()}
      </div>

      {/* Display different secondary labels based on language */}
      {keyboardLanguage === "EN" ? (
        <>
          {/* For English mode, show standard secondary labels */}
          {shift && !specialKeysMode && <div className={styles.secondary}>{shift}</div>}
          {alt && <div className={styles.tertiary}>{alt}</div>}
          {fourth && <div className={styles.fourth}>{fourth}</div>}
        </>
      ) : (
        <>
          {/* For Hebrew mode, show English key as secondary */}
          {key.length === 1 && <div className={styles.secondary}>{key}</div>}
          {shift && <div className={styles.tertiary}>{shift}</div>}
        </>
      )}

      {/* CapsLock indicator */}
      {id === "capslock" && isCapsLockActive && (
        <div className={styles.capsLockIndicator}></div>
      )}
      
      {/* Special keys mode indicator */}
      {id === "left-shift" && specialKeysMode && (
        <div className={styles.specialModeIndicator}></div>
      )}
    </div>
  );
}

export default KeyboardKey;