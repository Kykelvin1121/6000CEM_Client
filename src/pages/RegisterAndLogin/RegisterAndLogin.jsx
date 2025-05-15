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
  const [login, setLogin] = useState(false);
  const [additionalFields, setAdditionalFields] = useState({
    username: "",
    phoneNumber: "",
    street: "",
    postcode: "",
    state: "",
  });

  const history = useNavigate();

  const handleAdditionalFieldChange = (e) => {
    const { name, value } = e.target;
    setAdditionalFields({ ...additionalFields, [name]: value });
  };

  const isValidAddress = (street, postcode, state) => {
    const postcodePattern = /^\d{5}$/;
    const validStates = [
      "Johor",
      "Kedah",
      "Kelantan",
      "Melaka",
      "Negeri Sembilan",
      "Pahang",
      "Penang",
      "Perak",
      "Perlis",
      "Sabah",
      "Sarawak",
      "Selangor",
      "Terengganu",
      "Kuala Lumpur",
      "Putrajaya",
      "Labuan",
    ];

    const isValidStreet = street.trim().length >= 5;
    const isValidPostcode = postcodePattern.test(postcode);
    const isValidState = validStates.includes(state);

    return isValidStreet && isValidPostcode && isValidState;
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

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
        alert(
          "Please enter a valid address:\n• Street ≥ 5 characters\n• Postcode = 5 digits\n• Select a valid state"
        );
        return;
      }
    }

    try {
      if (type === "signup") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        const userDocRef = doc(db, "users", user.uid);

        // Merge address fields into one string
        const { street, postcode, state, ...rest } = additionalFields;
        const address = `${street.trim()}, ${postcode.trim()} ${state.trim()}`;

        await setDoc(userDocRef, {
          email,
          password,
          role: "user",
          address,
          ...rest,
          timeStamp: serverTimestamp(),
        });

        history("/home");
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
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

      if (error.code === "auth/email-already-in-use") {
        alert(
          "This email is already registered. Please use a different email or Sign In."
        );
      } else {
        alert(error.message);
      }
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
        <input
          className="form-input"
          name="email"
          placeholder="Email"
          required
          type="email"
        />
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
              <option>Johor</option>
              <option>Kedah</option>
              <option>Kelantan</option>
              <option>Melaka</option>
              <option>Negeri Sembilan</option>
              <option>Pahang</option>
              <option>Penang</option>
              <option>Perak</option>
              <option>Perlis</option>
              <option>Sabah</option>
              <option>Sarawak</option>
              <option>Selangor</option>
              <option>Terengganu</option>
              <option>Kuala Lumpur</option>
              <option>Putrajaya</option>
              <option>Labuan</option>
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
