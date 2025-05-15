import React, { useState } from "react";
import { auth, db } from "../../FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import logoImage from "../../Images/Ecom.png";
import "./RegisterAndLogin.css";
import "../../index.css";

function RegisterAndLogin({ onLogin }) {
  const [login, setLogin] = useState(false); // false = signup, true = signin
  const [additionalFields, setAdditionalFields] = useState({
    username: "",
    phoneNumber: "",
    address: "",
    country: "",
    displayName: "",
  });

  const history = useNavigate();

  const handleAdditionalFieldChange = (e) => {
    const { name, value } = e.target;
    setAdditionalFields({ ...additionalFields, [name]: value });
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      if (type === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDocRef = doc(db, "users", user.uid);

        await setDoc(userDocRef, {
          email,
          password,
          role: "user",
          ...additionalFields,
          timeStamp: serverTimestamp(),
        });

        console.log("User registered and stored in Firestore");
        history("/home");

      } else if (type === "signin") {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDocRef = doc(db, "users", user.uid);
        const docSnapshot = await getDoc(userDocRef);

        if (docSnapshot.exists()) {
          const userRole = docSnapshot.data().role;
          onLogin({ role: userRole });
          localStorage.setItem("userRole", userRole);
          history("/home");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert(error.code);
    }
  };

  const handleReset = () => {
    history("/reset");
  };

  return (
    <div className="form-container">
      <img src={logoImage} alt="Logo" className="logo" />
      <div className="form-header-container">
        <div className="form-header">
          <div
            className={`form-tab ${login ? "active-tab" : ""}`}
            onClick={() => setLogin(true)}
          >
            Sign In
          </div>
        </div>
        <div className="form-header">
          <div
            className={`form-tab ${!login ? "active-tab" : ""}`}
            onClick={() => setLogin(false)}
          >
            Sign Up
          </div>
        </div>
      </div>

      <h1 className="form-title">{login ? "Sign In" : "Sign Up"}</h1>

      <form onSubmit={(e) => handleSubmit(e, login ? "signin" : "signup")}>
        <input className="form-input" name="email" placeholder="Email" required />
        <input className="form-input" name="password" type="password" placeholder="Password" required />

        {!login && (
          <>
            <input
              className="form-input"
              name="username"
              placeholder="Username"
              value={additionalFields.username}
              onChange={handleAdditionalFieldChange}
              required
            />
            <input
              className="form-input"
              name="phoneNumber"
              placeholder="Phone Number"
              value={additionalFields.phoneNumber}
              onChange={handleAdditionalFieldChange}
              required
            />
            <input
              className="form-input"
              name="address"
              placeholder="Address"
              value={additionalFields.address}
              onChange={handleAdditionalFieldChange}
              required
            />
          </>
        )}

        <p className="forgot-password" onClick={handleReset}>
          Forgot Password?
        </p>

        <button className="form-button" type="submit">
          {login ? "Sign In" : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default RegisterAndLogin;
