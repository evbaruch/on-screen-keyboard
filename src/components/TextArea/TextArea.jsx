import React, { useState, useEffect } from "react";

function TextArea() {
  const [text, setText] = useState("");

  const handleKeyPress = (event) => {
    if (event.key === "Backspace") {
      // Remove the last character from the text
      setText((prevText) => prevText.slice(0, -1));
    } else if (event.key.length === 1) {
      // Append the pressed key to the text (only for printable characters)
      setText((prevText) => prevText + event.key);
    }
  };

  useEffect(() => {
    // Add event listener for keydown (to capture Backspace and other keys)
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      // Cleanup event listener on component unmount
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <textarea
      value={text}
      readOnly // Prevent manual editing to avoid conflicts
      style={{
        width: "100%",
        height: "150px",
        fontSize: "16px",
        padding: "10px",
        boxSizing: "border-box",
      }}
    />
  );
}

export default TextArea;