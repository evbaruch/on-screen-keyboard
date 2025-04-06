import React, { useState, useEffect } from "react";
import styles from "./keyboard.module.css";

const keyboardLayout = [
  [
    { key: "Esc", className: "esc" },
    { key: "`", shift: "~" },
    { key: "1", shift: "!" },
    { key: "2", shift: "@" },
    { key: "3", shift: "#" },
    { key: "4", shift: "$" },
    { key: "5", shift: "%" },
    { key: "6", shift: "^" },
    { key: "7", shift: "&" },
    { key: "8", shift: "*" },
    { key: "9", shift: "(" },
    { key: "0", shift: ")" },
    { key: "-", shift: "_" },
    { key: "=", shift: "+" },
    { key: "Backspace", className: "backspace" },
  ],
  [
    { key: "Tab", className: "tab" },
    { key: "Q" },
    { key: "W" },
    { key: "E", alt: "€" },
    { key: "R" },
    { key: "T" },
    { key: "Y" },
    { key: "U" },
    { key: "I" },
    { key: "O" },
    { key: "P" },
    { key: "[", shift: "{" },
    { key: "]", shift: "}" },
    { key: "\\", shift: "|" },
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
    { key: ";", shift: ":" },
    { key: "'", shift: '"' },
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
    { key: ",", shift: "<" },
    { key: ".", shift: ">" },
    { key: "/", shift: "?" },
    { key: "Shift", className: "shift" },
    { key: "↑", className: "arrow" },
  ],
  [
    { key: "Ctrl", className: "ctrl" },
    { key: "Alt", className: "alt" },
    { key: "Space", className: "space" },
    { key: "Alt", className: "alt" },
    { key: "Ctrl", className: "ctrl" },
    { key: "←", className: "arrow" },
    { key: "↓", className: "arrow" },
    { key: "→", className: "arrow" },
  ],
];

function Keyboard() {
  const [highlighted, setHighlighted] = useState([]);
  const [modifiers, setModifiers] = useState({ Shift: false, Alt: false });

  const handleKeyDown = (event) => {
    const key = event.key === " " ? "Space" : event.key; // Map spacebar to "Space"
    const normalizedKey = key.toUpperCase(); // Normalize to uppercase for consistency

    // Update modifiers
    if (normalizedKey === "SHIFT" || normalizedKey === "ALT") {
      setModifiers((prev) => ({ ...prev, [normalizedKey]: true }));
    }

    setHighlighted((prev) => [...new Set([...prev, normalizedKey])]);
  };

  const handleKeyUp = (event) => {
    const key = event.key === " " ? "Space" : event.key; // Map spacebar to "Space"
    const normalizedKey = key.toUpperCase(); // Normalize to uppercase for consistency

    // Update modifiers
    if (normalizedKey === "SHIFT" || normalizedKey === "ALT") {
      setModifiers((prev) => ({ ...prev, [normalizedKey]: false }));
    }

    setHighlighted((prev) => prev.filter((k) => k !== normalizedKey));
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const getKeyLabel = (keyObj) => {
    if (modifiers.Shift && keyObj.shift) {
      return keyObj.shift;
    }
    if (modifiers.Alt && keyObj.alt) {
      return keyObj.alt;
    }
    return keyObj.key;
  };

  return (
    <div className={styles.keyboardContainer}>
      <div className={styles.keyboard}>
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map(({ key, className, shift, alt }, index) => (
              <div
                key={index}
                className={`${styles.key} ${
                  className ? styles[className] : ""
                } ${
                  highlighted.includes(key.toUpperCase())
                    ? styles.highlighted
                    : ""
                }`}
              >
                {getKeyLabel({ key, shift, alt })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Keyboard;