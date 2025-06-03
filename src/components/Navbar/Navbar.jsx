import { useContext, useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import "./navbar.css";
import logoImage from "../../Images/Ecom.png";
import { DataContainer } from "../../App";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../FirebaseConfig"; // Make sure 'db' is Firestore instance
import { doc, getDoc } from "firebase/firestore";

const NavBar = () => {
  const { CartItem, setCartItem } = useContext(DataContainer);
  const [isFixed, setIsFixed] = useState(false);
  const history = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [hoveringProfile, setHoveringProfile] = useState(false);
  const [userName, setUserName] = useState(""); // username from Firestore

  const handleSignOut = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    signOut(auth).then(() => {
      history("/");
    });
  };

  useEffect(() => {
    const scrollHandler = () => {
      setIsFixed(true);
    };

    window.addEventListener("scroll", scrollHandler);

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, []);

  useEffect(() => {
    const storedUserRole = localStorage.getItem("userRole");
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }

    // Listen for Firebase Auth state change
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user document from Firestore
        try {
          const userDocRef = doc(db, "users", user.uid); // adjust "users" collection if different
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserName(userData.username || "User"); // your firestore field is 'username'
            localStorage.setItem("userName", userData.username || "User");
          } else {
            setUserName("User");
          }
        } catch (error) {
          console.error("Error fetching username:", error);
          setUserName("User");
        }
      } else {
        setUserName("");
        localStorage.removeItem("userName");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (CartItem.length === 0) {
      const storedCart = localStorage.getItem("cartItem");
      if (storedCart) {
        setCartItem(JSON.parse(storedCart));
      }
    }
  }, [CartItem.length, setCartItem]);

  return (
    <Navbar fixed="top" expand="md" className={isFixed ? "navbar fixed" : "navbar"}>
      <Container className="navbar-container">
        <img src={logoImage} alt="Logo" className="nav-logo" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="justify-content-end flex-grow-1 pe-3">
            <Nav.Item>
              <Link className="navbar-link" to="/home">
                <div className="icon-container" title="Home">
                  <i className="fas fa-home nav-icon"></i>
                </div>
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link className="navbar-link" to="/shop">
                <div className="icon-container" title="Shop">
                  <i className="fas fa-store nav-icon"></i>
                </div>
              </Link>
            </Nav.Item>

            <Nav.Item className="expanded-cart" style={{ position: "relative", display: "flex", gap: "10px" }}>
              {/* Cart Icon FIRST */}
              <Link to="/cart" className="cart" data-num={CartItem.length}>
                <div className="icon-container" title="Cart">
                  <i className="fas fa-shopping-cart nav-icon"></i>
                </div>
              </Link>

              {/* Profile Icon and Username NEXT */}
              <div
                onMouseEnter={() => setHoveringProfile(true)}
                onMouseLeave={() => setHoveringProfile(false)}
                style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                title="Profile"
              >
                <div className="icon-container">
                  <i className="fas fa-user nav-icon"></i>
                </div>
                <span style={{ color: "#0077FF", fontWeight: "600", fontSize: "16px", userSelect: "none" }}>
                  {userName || "Guest"}
                </span>

                {hoveringProfile && (
                  <div className="dropDownProfile">
                    <ul className="dropDownContent">
                      {(userRole === "admin" || userRole === "super_admin") && (
                        <li>
                          <a
                            className="dropDown"
                            href="https://dashboard-project-five.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Admin
                          </a>
                        </li>
                      )}
                      <li>
                        <Link to="/profile" className="dropDown">
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link to="/trackorder" className="dropDown">
                          Track Order
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleSignOut}
                          className="dropDown"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "inherit",
                            cursor: "pointer",
                          }}
                        >
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
