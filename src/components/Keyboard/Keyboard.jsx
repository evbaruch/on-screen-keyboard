import React, { useState, useEffect } from "react";
import styles from "./keyboard.module.css";
import KeyboardRow from "./KeyboardRow";

const keyboardLayout = [
  [
    { id: "backtick", key: "`", shift: "~", fourth: ";" },
    { id: "1", key: "1", shift: "!" },
    { id: "2", key: "2", shift: "@" },
    { id: "3", key: "3", shift: "#" },
    { id: "4", key: "4", shift: "$", fourth: "₪" },
    { id: "5", key: "5", shift: "%" },
    { id: "6", key: "6", shift: "^" },
    { id: "7", key: "7", shift: "&" },
    { id: "8", key: "8", shift: "*" },
    { id: "9", key: "9", shift: "(" },
    { id: "0", key: "0", shift: ")" },
    { id: "dash", key: "-", shift: "_", fourth: "-" },
    { id: "equals", key: "=", shift: "+" },
    { id: "backspace", key: "Backspace", className: "backspace" },
  ],
  [
    { id: "tab", key: "Tab", className: "tab" },
    { id: "q", key: "Q", fourth: "/" },
    { id: "w", key: "W", fourth: "'" },
    { id: "e", key: "E", alt: "€", fourth: "ק" },
    { id: "r", key: "R", fourth: "ר" },
    { id: "t", key: "T", fourth: "א" },
    { id: "y", key: "Y", fourth: "ט" },
    { id: "u", key: "U", fourth: "ו" },
    { id: "i", key: "I", fourth: "ן" },
    { id: "o", key: "O", fourth: "ם" },
    { id: "p", key: "P", fourth: "פ" },
    { id: "left-bracket", key: "[", shift: "{", fourth: "]" },
    { id: "right-bracket", key: "]", shift: "}", fourth: "[" },
    { id: "backslash", key: "\\", shift: "|", fourth: "\\" },
  ],
  [
    { id: "capslock", key: "CapsLock", className: "capslock" },
    { id: "a", key: "A", fourth: "ש" },
    { id: "s", key: "S", fourth: "ד" },
    { id: "d", key: "D", fourth: "ג" },
    { id: "f", key: "F", fourth: "כ" },
    { id: "g", key: "G", fourth: "ע" },
    { id: "h", key: "H", fourth: "י" },
    { id: "j", key: "J", fourth: "ח" },
    { id: "k", key: "K", fourth: "ל" },
    { id: "l", key: "L", fourth: "ך" },
    { id: "semicolon", key: ";", shift: ":", fourth: "ף" },
    { id: "quote", key: "'", shift: '"', fourth: "'" },
    { id: "enter", key: "Enter", className: "enter" },
  ],
  [
    { id: "left-shift", key: "Shift", className: "shift" },
    { id: "z", key: "Z", fourth: "ז" },
    { id: "x", key: "X", fourth: "ס" },
    { id: "c", key: "C", fourth: "ב" },
    { id: "v", key: "V", fourth: "ה" },
    { id: "b", key: "B", fourth: "נ" },
    { id: "n", key: "N", fourth: "מ" },
    { id: "m", key: "M", fourth: "צ" },
    { id: "comma", key: ",", shift: "<", fourth: "ת" },
    { id: "period", key: ".", shift: ">", fourth: "ץ" },
    { id: "slash", key: "/", shift: "?", fourth: "." },
    { id: "right-shift", key: "Shift", className: "shift" },
    { id: "arrow-up", key: "↑", className: "arrow" },
  ],
  [
    { id: "ctrl-left", key: "Ctrl", className: "ctrl" },
    { id: "alt-left", key: "Alt", className: "alt" },
    { id: "space", key: "Space", className: "space" },
    { id: "alt-right", key: "Alt", className: "alt" },
    { id: "ctrl-right", key: "Ctrl", className: "ctrl" },
    { id: "arrow-left", key: "←", className: "arrow" },
    { id: "arrow-down", key: "↓", className: "arrow" },
    { id: "arrow-right", key: "→", className: "arrow" },
  ],
];

function Keyboard() {
  const [highlighted, setHighlighted] = useState([]);
  const [modifiers, setModifiers] = useState({ Shift: false, Alt: false });

  const handleKeyDown = (event) => {
    console.log("KeyDown Event:", event);
  
    const key = event.key === " " ? "Space" : event.key;
    const normalizedKey = key.toUpperCase();
  
    const matchingKeys = keyboardLayout
      .flat()
      .filter((k) => k.key.toUpperCase() === normalizedKey);
  
    console.log("Matching Keys:", matchingKeys);
  
    if (matchingKeys.length > 0) {
      const specificKey = matchingKeys.find((k) => {
        if (k.id.includes("left") && event.location === 1) return true;
        if (k.id.includes("right") && event.location === 2) return true;
        return !k.id.includes("left") && !k.id.includes("right");
      });
  
      console.log("Specific Key:", specificKey);
  
      if (specificKey) {
        if (["SHIFT", "ALT", "CONTROL"].includes(normalizedKey)) {
          setModifiers((prev) => ({ ...prev, [normalizedKey]: true }));
        }
  
        setHighlighted((prev) => [...new Set([...prev, specificKey.id])]);
        console.log("Highlighted Keys (After KeyDown):", highlighted);
      }
    }
  };
  
  const handleKeyUp = (event) => {
    console.log("KeyUp Event:", event);
  
    const key = event.key === " " ? "Space" : event.key;
    const normalizedKey = key.toUpperCase();
  
    const matchingKeys = keyboardLayout
      .flat()
      .filter((k) => k.key.toUpperCase() === normalizedKey);
  
    console.log("Matching Keys:", matchingKeys);
  
    if (matchingKeys.length > 0) {
      const specificKey = matchingKeys.find((k) => {
        if (k.id.includes("left") && event.location === 1) return true;
        if (k.id.includes("right") && event.location === 2) return true;
        return !k.id.includes("left") && !k.id.includes("right");
      });
  
      console.log("Specific Key:", specificKey);
  
      if (specificKey) {
        if (["SHIFT", "ALT", "CONTROL"].includes(normalizedKey)) {
          setModifiers((prev) => ({ ...prev, [normalizedKey]: false }));
        }
  
        setHighlighted((prev) => prev.filter((id) => id !== specificKey.id));
        console.log("Highlighted Keys (After KeyUp):", highlighted);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className={styles.keyboardContainer}>
      <div className={styles.keyboard}>
        {keyboardLayout.map((row, rowIndex) => (
          <KeyboardRow
            key={rowIndex}
            row={row}
            highlighted={highlighted}
            modifiers={modifiers}
          />
        ))}
      </div>
    </div>
  );
}

export default Keyboard;
