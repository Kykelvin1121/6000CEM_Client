import { useContext, useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import "./navbar.css";
import logoImage from "../../Images/Ecom.png";
import { DataContainer } from "../../App";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../FirebaseConfig";

const NavBar = () => {
  const { CartItem, setCartItem } = useContext(DataContainer);
  const [isFixed, setIsFixed] = useState(false);
  const history = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [hoveringProfile, setHoveringProfile] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem("userRole");
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
                <span className="nav-link-label">Home</span>
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link className="navbar-link" to="/shop">
                <span className="nav-link-label">Shop</span>
              </Link>
            </Nav.Item>

            <Nav.Item className="expanded-cart" style={{ position: "relative", display: "flex", gap: "10px" }}>
              {/* Profile Icon and Dropdown */}
              <div
                onMouseEnter={() => setHoveringProfile(true)}
                onMouseLeave={() => setHoveringProfile(false)}
                style={{ position: "relative" }}
              >
                <div className="icon-container">
                  <i className="fas fa-user nav-icon"></i>
                </div>

                {hoveringProfile && (
                  <div className="dropDownProfile">
                    <ul className="dropDownContent">
                      {/* Conditionally show Admin link */}
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

              {/* Cart Icon */}
              <Link to="/cart" className="cart" data-num={CartItem.length}>
                <div className="icon-container">
                  <i className="fas fa-shopping-cart nav-icon"></i>
                </div>
              </Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
