import { useContext, useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import "./navbar.css";
import logoImage from "../../Images/Ecom.png";
import { DataContainer } from "../../App";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const NavBar = () => {
  const { CartItem, setCartItem } = useContext(DataContainer);
  const [isFixed, setIsFixed] = useState(false);
  const history = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [hoveringProfile, setHoveringProfile] = useState(false);
  const [userName, setUserName] = useState("");

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

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserName(userData.username || "User");
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
              <Link className="navbar-link" to="/home" title="Home">
                <div className="icon-container">
                  <i className="fas fa-home nav-icon"></i>
                </div>
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link className="navbar-link" to="/shop" title="Shop">
                <div className="icon-container">
                  <i className="fas fa-store nav-icon"></i>
                </div>
              </Link>
            </Nav.Item>

            <Nav.Item className="expanded-cart">
              <Link to="/cart" className="cart" data-num={CartItem.length} title="Cart">
                <div className="icon-container">
                  <i className="fas fa-shopping-cart nav-icon"></i>
                </div>
              </Link>

              <div
                className="profile-hover-container"
                onMouseEnter={() => setHoveringProfile(true)}
                onMouseLeave={() => setHoveringProfile(false)}
                title="Profile"
              >
                <div className="icon-container">
                  <i className="fas fa-user nav-icon"></i>
                </div>
                <span className="username-text">{userName || "Welcome Guest"}</span>

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
                        <button onClick={handleSignOut} className="dropDown">
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
