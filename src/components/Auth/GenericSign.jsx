import React, { useState, useEffect } from "react";
import styles from "./Auth.module.css";

function GenericSign({ type, onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const isSignUp = type === "signup";

  const handleSubmit = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (!username || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (isSignUp) {
      // Handle Sign Up
      const userExists = users.find((user) => user.username === username);
      if (userExists) {
        setMessage("User already exists. Please choose a different username.");
        return;
      }
      users.push({ username, password });
      localStorage.setItem("users", JSON.stringify(users));
      setMessage("Signup successful! You can now log in.");
      setUsername("");
      setPassword("");
      onSuccess(); // Trigger success callback (e.g., switch to Sign In)
    } else {
      // Handle Sign In
      const user = users.find(
        (user) => user.username === username && user.password === password
      );
      if (user) {
        setMessage("Login successful!");
        onSuccess(username); // Trigger success callback (e.g., log in the user)
      } else {
        setMessage("Invalid username or password.");
      }
    }
  };

  // Clear the message only when switching between Sign In and Sign Up
  useEffect(() => {
    setMessage("");
  }, [type]);

  return (
    <div className={styles.authContainer}>
      <h1 className={styles.authTitle}>{isSignUp ? "Sign Up" : "Sign In"}</h1>
      {message && <p className={styles.authMessage}>{message}</p>}
      <div className={styles.authForm}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.authInput}
          autoComplete="username" /* Enable browser autocomplete for username */
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.authInput}
          autoComplete={isSignUp ? "new-password" : "current-password"} /* Enable browser autocomplete for password */
        />
        <button onClick={handleSubmit} className={styles.authButton}>
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </div>
    </div>
  );
}

export default GenericSign;