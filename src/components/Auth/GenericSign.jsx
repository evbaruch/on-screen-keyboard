import React, { useState } from "react";
import styles from "./Auth.module.css";
import {
  loadUsersFromLocalStorage,
  addUserToLocalStorage,
} from "../../utils/localStorageUtils";

function GenericSign({ type, onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isSignUp = type === "signup";

  const handleSubmit = () => {
    // Input validation
    if (!username || !password) {
      setMessage("Please fill in all fields.");
      setMessageType("error");
      return;
    }

    // Username validation
    if (username.length < 3) {
      setMessage("Username must be at least 3 characters long.");
      setMessageType("error");
      return;
    }

    // Password validation
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);

    if (isSignUp) {
      // Handle Sign Up using the localStorage utility
      const error = addUserToLocalStorage(username, password);
      
      if (error) {
        setMessage(error);
        setMessageType("error");
        setIsLoading(false);
      } else {
        // Auto sign-in after successful registration
        setMessage("Account created successfully! Signing you in...");
        setMessageType("success");
        
        // Immediately notify the parent component to authenticate the user
        // No need for a delay since we want instant sign-in
        onSuccess(username, password);
      }
    } else {
      // Handle Sign In using the localStorage utility
      const users = loadUsersFromLocalStorage();
      const user = users.find((u) => u.username === username);

      if (user) {
        if (user.password === password) {
          setMessage("Login successful!");
          setMessageType("success");
          
          // Notify the parent component of successful login
          setTimeout(() => {
            onSuccess(username, password);
          }, 300); // Short delay to show success message
        } else {
          setMessage("Incorrect password. Please try again.");
          setMessageType("error");
          setIsLoading(false);
        }
      } else {
        setMessage("User does not exist. Please sign up.");
        setMessageType("error");
        setIsLoading(false);
      }
    }
  };

  const handleReset = () => {
    setMessage("");
    setUsername("");
    setPassword("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className={styles.authContainer}>
      <h1 className={styles.authTitle}>
        {isSignUp ? "Create Account" : "Welcome Back"}
      </h1>
      
      {message && (
        <p className={`${styles.authMessage} ${messageType === "error" ? styles.error : styles.success}`}>
          {message}
        </p>
      )}
      
      <div className={styles.authForm}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.authInput}
          autoComplete="username"
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.authInput}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        
        <div className={styles.buttonGroup}>
          <button 
            onClick={handleSubmit} 
            className={styles.authButton}
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className={styles.authResetButton}
            disabled={isLoading}
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className={styles.authFooter}>
        {isSignUp ? (
          <p>
            By creating an account, you agree to our Terms and Privacy Policy.
          </p>
        ) : (
          <p>
            Forgot your password? Please contact support.
          </p>
        )}
      </div>
    </div>
  );
}

export default GenericSign;