import React, { useState, useEffect } from "react";
import { db, auth } from "../../FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import './UserProfile.css';

const validStates = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang",
  "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor",
  "Terengganu", "Kuala Lumpur", "Putrajaya", "Labuan"
];

const isValidAddress = (street, postcode, state) => {
  const postcodePattern = /^\d{5}$/;
  const isValidStreet = street.trim().length >= 5;
  const isValidPostcode = postcodePattern.test(postcode);
  const isValidState = validStates.includes(state);
  return isValidStreet && isValidPostcode && isValidState;
};

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState({
    email: "",
    username: "",
    phoneNumber: "",
  });

  // Separate address fields for form
  const [street, setStreet] = useState("");
  const [postcode, setPostcode] = useState("");
  const [state, setState] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Parse address string to separate fields
  const parseAddress = (addressString) => {
    if (!addressString) return { street: "", postcode: "", state: "" };
    const parts = addressString.split(",").map(part => part.trim());
    // Assume format: "street, postcode, state"
    return {
      street: parts[0] || "",
      postcode: parts[1] || "",
      state: parts[2] || ""
    };
  };

  // Combine address fields to single string
  const combineAddress = (street, postcode, state) => {
    return `${street.trim()}, ${postcode.trim()}, ${state.trim()}`;
  };

  // Fetch user profile from Firestore
  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const docSnapshot = await getDoc(userDocRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setUserProfile({
          email: data.email || user.email || "",
          username: data.username || "",
          phoneNumber: data.phoneNumber || "",
        });

        const { street, postcode, state } = parseAddress(data.address || "");
        setStreet(street);
        setPostcode(postcode);
        setState(state);
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 1);
    fetchUserProfile();
  }, []);

  const handleProfileUpdate = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!isValidAddress(street, postcode, state)) {
      setErrorMessage(
        "Invalid address. Ensure street ≥ 5 characters, postcode = 5 digits, and state is selected."
      );
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setErrorMessage("No authenticated user.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const combinedAddress = combineAddress(street, postcode, state);

      await updateDoc(userDocRef, {
        ...userProfile,
        address: combinedAddress,
      });

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error updating user profile:", error);
      setErrorMessage(error.message || "Failed to update profile.");
    }
  };

  return (
    <div className="profile-container">
      <h1>User Profile</h1>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="profile-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            className="profile-input"
            type="email"
            id="email"
            value={userProfile.email}
            onChange={(e) =>
              setUserProfile({ ...userProfile, email: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            className="profile-input"
            type="text"
            id="username"
            value={userProfile.username}
            onChange={(e) =>
              setUserProfile({ ...userProfile, username: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            className="profile-input"
            type="text"
            id="phoneNumber"
            value={userProfile.phoneNumber}
            onChange={(e) =>
              setUserProfile({ ...userProfile, phoneNumber: e.target.value })
            }
          />
        </div>

        {/* Address fields broken down */}

        <div className="form-group">
          <label htmlFor="street">Street Address:</label>
          <input
            className="profile-input"
            type="text"
            id="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="postcode">Postcode:</label>
          <input
            className="profile-input"
            type="text"
            id="postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="state">State:</label>
          <select
            className="profile-input"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
          >
            <option value="">Select State</option>
            {validStates.map((stateName) => (
              <option key={stateName} value={stateName}>
                {stateName}
              </option>
            ))}
          </select>
        </div>

        <button className="profile-button" onClick={handleProfileUpdate}>
          Update Profile
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
