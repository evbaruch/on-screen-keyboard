import React, { useState, useEffect } from "react";
import styles from "./keyboard.module.css";
import KeyboardRow from "./KeyboardRow";
import keyboardLayout from "./KeyboardLayout"; // Import the keyboard layout

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
