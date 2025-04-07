import React from "react";
import styles from "./keyboard.module.css";

function KeyboardKey({ keyObj, highlighted, modifiers }) {
  const { id, key, className, shift, alt, fourth } = keyObj;

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
    >
      <div className={styles.primary}>{getKeyLabel()}</div>
      {shift && <div className={styles.secondary}>{shift}</div>}
      {alt && <div className={styles.tertiary}>{alt}</div>}
      {fourth && <div className={styles.fourth}>{fourth}</div>}
    </div>
  );
}

export default KeyboardKey;