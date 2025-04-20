import React, { useState } from "react";
import styles from "./emojiKeyboard.module.css";

// Dynamically load all emoji images from the folder and its subdirectories
const importEmojis = async () => {
  const emojiModules = import.meta.glob("../../assets/Emojis/**/*.{png,jpg,jpeg,gif}");
  const emojis = [];

  for (const path in emojiModules) {
    const module = await emojiModules[path](); // Resolve the dynamic import
    emojis.push(module.default); // Push the resolved image URL
  }

  return emojis;
};

function EmojiKeyboard() {
  const [emojis, setEmojis] = useState([]); // Initialize state with an empty array

  // Load emojis synchronously when the component initializes
  if (emojis.length === 0) {
    importEmojis().then((loadedEmojis) => setEmojis(loadedEmojis));
  }

  return (
    <div className={styles.emojiContainer}>
      <div className={styles.emojiGrid}>
        {emojis.map((emoji, index) => (
          <div key={index} className={styles.emoji}>
            <img
              src={emoji}
              alt={`Emoji ${index}`}
              onError={(e) => (e.target.style.display = "none")} // Hide broken images
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmojiKeyboard;