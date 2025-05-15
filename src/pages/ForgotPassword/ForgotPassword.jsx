import React, { useState } from "react";
import { db } from "../../FirebaseConfig";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
import logoImage from "../../Images/Ecom.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setMessage("User not found.");
        return;
      }

      const userDoc = snapshot.docs[0];
      await updateDoc(userDoc.ref, { password: newPassword });

      setMessage("Password reset successfully.");
      setEmail("");
      setNewPassword("");
    } catch (err) {
      setMessage("Error resetting password.");
      console.error(err);
    }
  };

  const getMessageClass = () => {
    if (message.toLowerCase().includes("success")) return "success-message";
    if (message.toLowerCase().includes("error") || message.toLowerCase().includes("not")) return "error-message";
    return "";
  };

  return (
    <div className="App">
      <div className="form-container">
        <img src={logoImage} alt="Logo" className="logo" />
        <h2 className="form-title">Reset Password</h2>
        {message && <p className={getMessageClass()}>{message}</p>}
        <form onSubmit={handleReset}>
          <input
            className="form-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="form-input"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button className="form-button" type="submit">Reset</button>
        </form>
        <button className="form-button" onClick={() => navigate(-1)} style={{ marginTop: "10px" }}>Back</button>
      </div>
    </div>
  );
};

export default ForgotPassword;
