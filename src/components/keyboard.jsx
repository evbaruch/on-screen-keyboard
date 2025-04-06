import React, { useState } from "react";
import styles from "./keyboard.module.css";

const keyboardLayout = [
  [
    { key: "Esc", className: "esc" },
    { key: "`" },
    { key: "1" },
    { key: "2" },
    { key: "3" },
    { key: "4" },
    { key: "5" },
    { key: "6" },
    { key: "7" },
    { key: "8" },
    { key: "9" },
    { key: "0" },
    { key: "-" },
    { key: "=" },
    { key: "Backspace", className: "backspace" },
  ],
  [
    { key: "Tab", className: "tab" },
    { key: "Q" },
    { key: "W" },
    { key: "E" },
    { key: "R" },
    { key: "T" },
    { key: "Y" },
    { key: "U" },
    { key: "I" },
    { key: "O" },
    { key: "P" },
    { key: "[" },
    { key: "]" },
    { key: "\\" },
  ],
  [
    { key: "CapsLock", className: "capslock" },
    { key: "A" },
    { key: "S" },
    { key: "D" },
    { key: "F" },
    { key: "G" },
    { key: "H" },
    { key: "J" },
    { key: "K" },
    { key: "L" },
    { key: ";" },
    { key: "'", className: "" },
    { key: "Enter", className: "enter" },
  ],
  [
    { key: "Shift", className: "shift" },
    { key: "Z" },
    { key: "X" },
    { key: "C" },
    { key: "V" },
    { key: "B" },
    { key: "N" },
    { key: "M" },
    { key: "," },
    { key: "." },
    { key: "/" },
    { key: "Shift", className: "shift" },
  ],
  [
    { key: "Ctrl", className: "ctrl" },
    { key: "Alt", className: "alt" },
    { key: "Space", className: "space" },
    { key: "Alt", className: "alt" },
    { key: "Ctrl", className: "ctrl" },
  ],
];

const arrowKeys = [
  { key: "↑", className: "arrowup" },
  { key: "←", className: "arrow" },
  { key: "↓", className: "arrow" },
  { key: "→", className: "arrow" },
];

function Keyboard() {
  const [highlighted, setHighlighted] = useState(null);

  const handleKeyDown = (event) => {
    const key = event.key === " " ? "Space" : event.key; // Map spacebar to "Space"
    const normalizedKey = key.toUpperCase(); // Normalize to uppercase for consistency
    if (
      keyboardLayout
        .flat()
        .map((k) => k.key.toUpperCase())
        .includes(normalizedKey) ||
      arrowKeys.map((k) => k.key).includes(key)
    ) {
      setHighlighted(normalizedKey);
    }
  };

  const handleKeyUp = () => {
    setHighlighted(null);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  }

  return (
    <div className={styles.keyboardContainer}>
      <div className={styles.keyboard}>
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map(({ key, className }, index) => (
              <div
                key={index}
                className={`${styles.key} ${
                  className ? styles[className] : ""
                } ${
                  highlighted === key.toUpperCase() ? styles.highlighted : ""
                }`}
              >
                {key}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.arrowKeys}>
        <div className={styles.arrowRowUp}>
          <div
            className={`${styles.key} ${styles.arrow} ${
              highlighted === "↑" ? styles.highlighted : ""
            }`}
          >
            ↑
          </div>
        </div>
        <div className={styles.arrowRowDown}>
          <div
            className={`${styles.key} ${styles.arrow} ${
              highlighted === "←" ? styles.highlighted : ""
            }`}
          >
            ←
          </div>
          <div
            className={`${styles.key} ${styles.arrow} ${
              highlighted === "↓" ? styles.highlighted : ""
            }`}
          >
            ↓
          </div>
          <div
            className={`${styles.key} ${styles.arrow} ${
              highlighted === "→" ? styles.highlighted : ""
            }`}
          >
            →
          </div>
        </div>
      </div>
    </div>
  );
}

export default Keyboard;
