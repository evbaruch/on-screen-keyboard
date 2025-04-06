import React, { useState, useEffect } from "react";
import styles from "./keyboard.module.css";

const keyboardLayout = [
  [
    { key: "Esc", className: "esc" },
    { key: "`", shift: "~", fourth: ";" }, // Example Hebrew punctuation
    { key: "1", shift: "!" },
    { key: "2", shift: "@" },
    { key: "3", shift: "#" },
    { key: "4", shift: "$", fourth: "shekel" },
    { key: "5", shift: "%" },
    { key: "6", shift: "^"},
    { key: "7", shift: "&"},
    { key: "8", shift: "*"},
    { key: "9", shift: "(" },
    { key: "0", shift: ")" },
    { key: "-", shift: "_", fourth: "-" },
    { key: "=", shift: "+"},
    { key: "Backspace", className: "backspace" },
  ],
  [
    { key: "Tab", className: "tab" },
    { key: "Q", fourth: "/" },
    { key: "W", fourth: "'" },
    { key: "E", alt: "€", fourth: "ק" },
    { key: "R", fourth: "ר" },
    { key: "T", fourth: "א" },
    { key: "Y", fourth: "ט" },
    { key: "U", fourth: "ו" },
    { key: "I", fourth: "ן" },
    { key: "O", fourth: "ם" },
    { key: "P", fourth: "פ" },
    { key: "[", shift: "{", fourth: "]" },
    { key: "]", shift: "}", fourth: "[" },
    { key: "\\", shift: "|", fourth: "\\" },
  ],
  [
    { key: "CapsLock", className: "capslock" },
    { key: "A", fourth: "ש" },
    { key: "S", fourth: "ד" },
    { key: "D", fourth: "ג" },
    { key: "F", fourth: "כ" },
    { key: "G", fourth: "ע" },
    { key: "H", fourth: "י" },
    { key: "J", fourth: "ח" },
    { key: "K", fourth: "ל" },
    { key: "L", fourth: "ך" },
    { key: ";", shift: ":", fourth: ";" },
    { key: "'", shift: '"', fourth: "'" },
    { key: "Enter", className: "enter" },
  ],
  [
    { key: "Shift", className: "shift" },
    { key: "Z", fourth: "ז" },
    { key: "X", fourth: "ס" },
    { key: "C", fourth: "ב" },
    { key: "V", fourth: "נ" },
    { key: "B", fourth: "מ" },
    { key: "N", fourth: "צ" },
    { key: "M", fourth: "ת" },
    { key: ",", shift: "<", fourth: ">" },
    { key: ".", shift: ">", fourth: "<" },
    { key: "/", shift: "?", fourth: "/" },
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
            {row.map(({ key, className, shift, alt, fourth }, index) => (
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
                <div className={styles.primary}>{key}</div>
                {shift && <div className={styles.secondary}>{shift}</div>}
                {alt && <div className={styles.tertiary}>{alt}</div>}
                {fourth && <div className={styles.fourth}>{fourth}</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Keyboard;