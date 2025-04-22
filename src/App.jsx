import React, { useState } from "react";
import GenericSign from "./components/Auth/GenericSign";
import Keyboard from "./components/Keyboard/Keyboard";
import TextArea from "./components/TextArea/TextArea";
import {
  loadUsersFromLocalStorage,
  addUserToLocalStorage,
} from "./utils/localStorageUtils";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastActiveTextWindow, setLastActiveTextWindow] = useState(null); // Track the last active TextWindow
  const [lastActivefileName, setlastActiveFileName] = useState(""); // Track the file name


  const handleLogin = (username, password) => {
    const users = loadUsersFromLocalStorage();
    const user = users.find((u) => u.username === username);

    if (user) {
      if (user.password === password) {
        setIsAuthenticated(true);
        setUsername(username);
        setErrorMessage("");
      } else {
        setErrorMessage("Incorrect password. Please try again.");
      }
    } else {
      setErrorMessage("User does not exist. Please sign up.");
    }
  };

  const handleSignUp = (username, password) => {
    const error = addUserToLocalStorage(username, password);
    if (error) {
      setErrorMessage(error);
    } else {
      setIsSigningUp(false);
      setErrorMessage("");
    }
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
          <TextArea
            username={username}
            lastActiveTextWindow={lastActiveTextWindow}
            setLastActiveTextWindow={setLastActiveTextWindow}
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
            onSuccess={(username, password) => {
              if (isSigningUp) {
                handleSignUp(username, password);
              } else {
                handleLogin(username, password);
              }
            }}
          />
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
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
