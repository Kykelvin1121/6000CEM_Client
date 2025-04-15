import { useContext, useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import "./navbar.css";
import logoImage from "../../Images/Ecom.png";
import { DataContainer } from "../../App";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../FirebaseConfig";
import { useNavigate } from "react-router-dom";

const NavBar = ({}) => {
    const { CartItem, setCartItem } = useContext(DataContainer);
    const [isFixed, setIsFixed] = useState(false);
    const [openProfile, setOpenProfile] = useState(false);
    const history = useNavigate();
    const [userRole, setUserRole] = useState(null);

    const handleSignOut = () => {
        localStorage.removeItem("userRole");
        signOut(auth).then((val) => {
            console.log(val, "val");
            history("/");
        });
    };

    function scrollHandler() {
        setIsFixed(true);
    }
    window.addEventListener("scroll", scrollHandler);

    useEffect(() => {
        const storedUserRole = localStorage.getItem("userRole");
        if (storedUserRole) {
            setUserRole(storedUserRole);
        }
    }, []);

    useEffect(() => {
        if (CartItem.length === 0) {
            const storedCart = localStorage.getItem("cartItem");
            setCartItem(JSON.parse(storedCart));
        }
    }, []);

    return (
        <Navbar
            fixed="top"
            expand="md"
            className={isFixed ? "navbar fixed" : "navbar"}>
            <Container className="navbar-container">
                <img src={logoImage} alt="Logo" className="nav-logo" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="justify-content-end flex-grow-1 pe-3">
                        <Nav.Item>
                            <Link
                                aria-label="Go to Home Page"
                                className="navbar-link"
                                to="/home">
                                <span className="nav-link-label">Home</span>
                            </Link>
                        </Nav.Item>

                        <Nav.Item>
                            <Link
                                aria-label="Go to Shop Page"
                                className="navbar-link"
                                to="/shop">
                                <span className="nav-link-label">Shop</span>
                            </Link>
                        </Nav.Item>

                        <Nav.Item>
                            <Link
                                aria-label="Go to Cart Page"
                                className="navbar-link"
                                to="/cart">
                                <span className="nav-link-label">Cart</span>
                            </Link>
                        </Nav.Item>

                        {userRole === "admin" ||
                            ("super_admin" && (
                                <Nav.Item>
                                    <a
                                        aria-label="Go to Admin Page"
                                        className="navbar-link"
                                        href="https://dashboard-project-five.vercel.app/" // Specify the URL you want to link to
                                        target="_blank" // Open in a new tab
                                        rel="noopener noreferrer" // Recommended for security and performance
                                    >
                                        <span className="nav-link-label">
                                            Admin
                                        </span>
                                    </a>
                                </Nav.Item>
                            ))}

                        <Nav.Item className="expanded-cart">
                            <div className="icon-container">
                                <i
                                    className="fas fa-user nav-icon"
                                    onClick={() =>
                                        setOpenProfile((prev) => !prev)
                                    }></i>
                            </div>
                            {openProfile && (
                                <div className="dropDownProfile">
                                    <ul className="dropDownContent">
                                        <li>
                                            <Link
                                                to="/profile"
                                                className="dropDown">
                                                Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/trackorder"
                                                className="dropDown">
                                                Track Order
                                            </Link>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                onClick={handleSignOut}
                                                className="dropDown">
                                                Sign Out
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            )}
                            <Link
                                aria-label="Go to Cart Page"
                                to="/cart"
                                className="cart"
                                data-num={CartItem.length}>
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
