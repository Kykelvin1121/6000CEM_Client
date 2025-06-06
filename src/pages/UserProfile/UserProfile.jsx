import React, { useState, useEffect } from "react";
import { db, auth } from "../../FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
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

const parseAddress = (addressString) => {
  if (!addressString) return { street: "", postcode: "", state: "" };

  const parts = addressString.split(",").map(part => part.trim());

  if (parts.length >= 3) {
    return {
      street: parts.slice(0, parts.length - 2).join(", "),
      postcode: parts[parts.length - 2],
      state: parts[parts.length - 1],
    };
  } else {
    return {
      street: parts[0] || "",
      postcode: parts[1] || "",
      state: parts[2] || ""
    };
  }
};

const combineAddress = (street, postcode, state) => {
  return `${street.trim()}, ${postcode.trim()}, ${state.trim()}`;
};

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState({
    email: "",
    username: "",
    phoneNumber: "",
  });

  const [street, setStreet] = useState("");
  const [postcode, setPostcode] = useState("");
  const [state, setState] = useState("");

  useEffect(() => {
    window.scrollTo(0, 1);
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
    fetchUserProfile();
  }, []);

  const handleProfileUpdate = async () => {
    if (!isValidAddress(street, postcode, state)) {
      toast.error(
        "Invalid address. Ensure street ≥ 5 characters, postcode = 5 digits, and state is selected."
      );
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error("No authenticated user.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const combinedAddress = combineAddress(street, postcode, state);

      await updateDoc(userDocRef, {
        username: userProfile.username,
        phoneNumber: userProfile.phoneNumber,
        address: combinedAddress,
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile.");
    }
  };

  return (
    <div className="profile-container">
      {/* ToastContainer can be here or in your App.js */}
      {/* <ToastContainer /> */}

      <h1>User Profile</h1>

      <div className="profile-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            className="profile-input"
            type="email"
            id="email"
            value={userProfile.email}
            readOnly
            style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
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
