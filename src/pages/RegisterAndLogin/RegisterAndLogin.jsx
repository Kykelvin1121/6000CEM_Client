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
import bcrypt from "bcryptjs";

function RegisterAndLogin({ onLogin }) {
  const [login, setLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [emailWarning, setEmailWarning] = useState("");
  const [additionalFields, setAdditionalFields] = useState({
    username: "",
    phoneNumber: "",
    street: "",
    postcode: "",
    state: "",
  });

  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleEmailBlur = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setEmailWarning("Invalid email format.");
      return;
    }

    if (email.endsWith(".con")) {
      const corrected = email.replace(/\.con$/, ".com");
      setEmail(corrected);
      setEmailWarning("Did you mean '.com'? Auto-corrected.");
      return;
    }

    setEmailWarning("");
  };

  const handleAdditionalFieldChange = (e) => {
    const { name, value } = e.target;
    setAdditionalFields({ ...additionalFields, [name]: value });
  };

  const isValidAddress = (street, postcode, state) => {
    const postcodePattern = /^\d{5}$/;
    const validStates = [
      "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
      "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak",
      "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya", "Labuan",
    ];
    return street.trim().length >= 5 &&
      postcodePattern.test(postcode) &&
      validStates.includes(state);
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    const password = e.target.password.value;

    // ✅ Validate email first
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email.");
      return;
    }

    if (email.endsWith(".con")) {
      alert("Email ends with '.con'. Did you mean '.com'?");
      return;
    }

    // ✅ Validate password and address after email is valid
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (!login) {
      const phonePattern = /^\d{10,11}$/;
      if (!phonePattern.test(additionalFields.phoneNumber)) {
        alert("Phone number must be 10 or 11 digits.");
        return;
      }

      const { street, postcode, state } = additionalFields;
      if (!isValidAddress(street, postcode, state)) {
        alert("Please enter a valid address:\n• Street ≥ 5 characters\n• Postcode = 5 digits\n• Valid state selected.");
        return;
      }
    }

    try {
      if (type === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDocRef = doc(db, "users", user.uid);

        const hashedPassword = await bcrypt.hash(password, 10);

        const { street, postcode, state, ...rest } = additionalFields;
        const address = `${street.trim()}, ${postcode.trim()} ${state.trim()}`;

        await setDoc(userDocRef, {
          email,
          password: hashedPassword,
          role: "user",
          address,
          ...rest,
          timeStamp: serverTimestamp(),
        });

        console.log("User signed up and saved. Redirecting to /home...");
        navigate("/home");
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDocRef = doc(db, "users", user.uid);
        const docSnapshot = await getDoc(userDocRef);

        if (docSnapshot.exists()) {
          const userRole = docSnapshot.data().role || "user";
          onLogin({ role: userRole });
          localStorage.setItem("userRole", userRole);
          console.log("Login successful. Redirecting to /home...");
          navigate("/home");
        } else {
          alert("User profile not found. Please contact support.");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error.code, error.message);
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please use a different email or Sign In.");
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        alert("Incorrect email or password.");
      } else {
        alert("An error occurred: " + error.message);
      }
    }
  };

  const handleReset = () => {
    navigate("/reset");
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
        <input
          className="form-input"
          name="email"
          placeholder="Email"
          required
          type="email"
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
        />
        {emailWarning && (
          <p style={{ color: "orange", fontSize: "0.9rem" }}>{emailWarning}</p>
        )}

        <input
          className="form-input"
          name="password"
          type="password"
          placeholder="Password"
          required
        />

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
              name="street"
              placeholder="Street Address"
              value={additionalFields.street}
              onChange={handleAdditionalFieldChange}
              required
            />
            <input
              className="form-input"
              name="postcode"
              placeholder="Postcode (e.g. 81200)"
              value={additionalFields.postcode}
              onChange={handleAdditionalFieldChange}
              required
            />
            <select
              className="form-input"
              name="state"
              value={additionalFields.state}
              onChange={handleAdditionalFieldChange}
              required
            >
              <option value="">Select State</option>
              {[
                "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
                "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak",
                "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya", "Labuan"
              ].map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
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
