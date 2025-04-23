import React from "react";
import styles from "./keyboard.module.css";
import KeyboardKey from "./KeyboardKey";

function KeyboardRow({ row, highlighted, modifiers, isCapsLockActive, onMouseDown, onMouseUp, keyboardLanguage }) {
  return (
    <div className={styles.row}>
      {row.map((keyObj, index) => (
        <KeyboardKey
          key={keyObj.id || `key-${index}`}
          keyObj={keyObj}
          highlighted={highlighted}
          modifiers={modifiers}
          isCapsLockActive={isCapsLockActive}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          keyboardLanguage={keyboardLanguage}
        />
      ))}
    </div>
  );
}

export default KeyboardRow;