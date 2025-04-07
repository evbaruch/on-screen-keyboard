import React from "react";
import styles from "./keyboard.module.css";
import KeyboardKey from "./KeyboardKey";

function KeyboardRow({ row, highlighted, modifiers }) {
  return (
    <div className={styles.row}>
      {row.map((keyObj, index) => (
        <KeyboardKey
          key={index}
          keyObj={keyObj}
          highlighted={highlighted}
          modifiers={modifiers}
        />
      ))}
    </div>
  );
}

export default KeyboardRow;