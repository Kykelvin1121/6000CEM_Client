import React, { useState, useEffect } from "react";
import { db, auth } from "../../FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import './UserProfile.css';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState({
    email: "",
    username: "",
    phoneNumber: "",
    address: "",
  });

  // Fetch the user's profile data from Firestore
  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const docSnapshot = await getDoc(userDocRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setUserProfile({
          email: user.email || "", // from Firebase Auth
          username: data.username || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
        });
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 1);
    fetchUserProfile();
  }, []);

  // Update profile
  const handleProfileUpdate = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const { email, ...updatableData } = userProfile; // exclude email from update
        await updateDoc(userDocRef, updatableData);
        console.log("User profile updated");
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  return (
    <div className="profile-container">
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
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            className="profile-input"
            type="text"
            id="username"
            value={userProfile.username}
            onChange={(e) => setUserProfile({ ...userProfile, username: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            className="profile-input"
            type="text"
            id="phoneNumber"
            value={userProfile.phoneNumber}
            onChange={(e) => setUserProfile({ ...userProfile, phoneNumber: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            className="profile-input"
            type="text"
            id="address"
            value={userProfile.address}
            onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
          />
        </div>
        <button className="profile-button" onClick={handleProfileUpdate}>
          Update Profile
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
