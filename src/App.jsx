import React, { useState } from "react";
import GenericSign from "./components/Auth/GenericSign";
import Keyboard from "./components/Keyboard/Keyboard";
import TextArea from "./components/TextArea/TextArea";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [lastActiveTextWindow, setLastActiveTextWindow] = useState(null); // Track the last active TextWindow
  const [lastActivefileName, setlastActiveFileName] = useState(""); // Track the file name

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
          <TextArea
            username={username}
            lastActiveTextWindow={lastActiveTextWindow}
            setLastActiveTextWindow={setLastActiveTextWindow}
            lastActivefileName={lastActivefileName}
            setlastActiveFileName={setlastActiveFileName}
          />
          <Keyboard
            username={username}
            lastActiveTextWindow={lastActiveTextWindow}
            lastActivefileName={lastActivefileName}
          />
        </>
      ) : (
        <div>
          <GenericSign
            type={isSigningUp ? "signup" : "signin"}
            onSuccess={(username) => {
              // Simply set authentication state and username
              setIsAuthenticated(true);
              setUsername(username);
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