import React from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../FirebaseConfig";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css"
import logoImage from "../../Images/Ecom.png";

function ForgotPassword() {
  const history = useNavigate();
  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailVal = e.target.email.value;
    sendPasswordResetEmail(auth, emailVal)
      .then((data) => {
        alert("Check your email");
        history("/");
      })
      .catch((err) => {
        alert(err.code);
      });
  }

  return (
  <div className="App">
    <div className="form-container">
      <img src={logoImage} alt="Logo" className="logo" />
      <div className="form-reset-header-container">
        <h1 className="form-title">Forgot Password</h1>
        <form onSubmit={(e) => handleSubmit(e)}>
          <input className="form-input" name="email" /><br/><br/>
          <button className="form-button">Reset</button>
        </form>
        <button className="back-button" onClick={() => navigate(-1)}>Cancel</button> 
      </div>
    </div>
  </div>
  );
}

export default ForgotPassword;
