import React, { useState, useEffect } from "react";
import { db, auth } from "../../FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import './UserProfile.css';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState({
    displayName: "",
    username: "",
    phoneNumber: "",
    address: "",
    country: "",
  });

  // Function to fetch the user's profile data from Firestore
  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const docSnapshot = await getDoc(userDocRef);
      if (docSnapshot.exists()) {
        setUserProfile(docSnapshot.data());
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 1);
    fetchUserProfile();
  }, []);

  // Function to handle profile data updates
  const handleProfileUpdate = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, userProfile);
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
          <label htmlFor="email">Email:</label>
          <input
            className="profile-input"
            type="email"
            id="email"
            value={userProfile.email || ""}
            onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
            disabled // Optional: Disable editing if you don't want users to change their email
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
      </div>
    </div>
  );
}

export default UserProfile;
