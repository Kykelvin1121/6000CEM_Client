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
          <label htmlFor="displayName">Display Name:</label>
          <input
            className="profile-input"
            type="text"
            id="displayName"
            value={userProfile.displayName}
            onChange={(e) => setUserProfile({ ...userProfile, displayName: e.target.value })}
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
            id="phone"
            value={userProfile.phone}
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
        <div className="form-group">
          <label htmlFor="country">Country:</label>
          <input
            className="profile-input"
            type="text"
            id="country"
            value={userProfile.country}
            onChange={(e) => setUserProfile({ ...userProfile, country: e.target.value })}
          />
        </div>
        <button className="profile-button" onClick={handleProfileUpdate}>Update Profile</button>
      </div>
    </div>
  );
}

export default UserProfile;
