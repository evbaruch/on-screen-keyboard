// Load all users from local storage
export const loadUsersFromLocalStorage = () => {
  const users = localStorage.getItem("users"); // Retrieve the "users" key from local storage
  return users ? JSON.parse(users) : []; // Parse the JSON or return an empty array if no users exist
};

// Save all users to local storage
export const saveUsersToLocalStorage = (users) => {
  localStorage.setItem("users", JSON.stringify(users)); // Save the users array as a JSON string
};

// Load files for a specific user
export const loadFilesForUser = (username) => {
  const users = loadUsersFromLocalStorage(); // Load all users
  const user = users.find((u) => u.username === username); // Find the user by username
  return user ? user.files || {} : {}; // Return the user's files or an empty object if no files exist
};

// Save files for a specific user
export const saveFilesForUser = (username, files) => {
  const users = loadUsersFromLocalStorage(); // Load all users
  const userIndex = users.findIndex((u) => u.username === username); // Find the index of the user

  if (userIndex !== -1) {
    // Update the user's files
    users[userIndex].files = files;
    saveUsersToLocalStorage(users); // Save the updated users array back to local storage
  } else {
    console.error(`User "${username}" does not exist. Cannot save files.`); // Log an error if the user does not exist
  }
};

// Add a new user to local storage
export const addUserToLocalStorage = (username, password) => {
  const users = loadUsersFromLocalStorage(); // Load all users
  if (users.find((u) => u.username === username)) {
    return "User already exists."; // Return an error message if the user already exists
  }
  // Add the new user with an empty files object
  users.push({ username, password, files: {} });
  saveUsersToLocalStorage(users); // Save the updated users array back to local storage
  return null; // Return null to indicate success
};