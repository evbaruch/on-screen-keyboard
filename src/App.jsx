import React, { useState } from "react";
import GenericSign from "./components/Auth/GenericSign";
import Keyboard from "./components/Keyboard/Keyboard";
import TextArea from "./components/TextArea/TextArea";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false); // Toggle between Sign In and Sign Up

  const handleLogin = (username) => {
    setIsAuthenticated(true);
    setUsername(username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
  };

  return (
    <>
      {isAuthenticated ? (
        <>
          <p>Welcome, {username}!</p>
          <button onClick={handleLogout}>Logout</button>
          <TextArea />
          <Keyboard />
        </>
      ) : (
        <div>
          <GenericSign
            type={isSigningUp ? "signup" : "signin"}
            onSuccess={(username) => {
              if (isSigningUp) {
                setIsSigningUp(false); // Switch to Sign In after successful Sign Up
              } else {
                handleLogin(username); // Log in the user
              }
            }}
          />
          <button
            onClick={() => setIsSigningUp((prev) => !prev)}
            style={{
              marginTop: "1rem",
              fontSize: "0.9rem",
              color: "#007bff",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {isSigningUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      )}
    </>
  );
}

export default App;