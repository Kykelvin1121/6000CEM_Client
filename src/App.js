import React, { useState, createContext, useEffect, lazy, Suspense } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import NavBar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Loader from "./components/Loader/Loader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth } from "firebase/auth";

const Home = lazy(() => import("./pages/Home/Home"));
const Shop = lazy(() => import("./pages/Shop/Shop"));
const Cart = lazy(() => import("./pages/Cart/Cart"));
const ProductDetails = lazy(() => import("./pages/Product/ProductDetails"));
const RegisterAndLogin = lazy(() => import("./pages/RegisterAndLogin/RegisterAndLogin"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword/ForgotPassword"));
const Profile = lazy(() => import("./pages/UserProfile/UserProfile"));
const TrackOrder = lazy(() => import("./pages/TrackOrder/TrackOrder"));

export const DataContainer = createContext();

function App() {
  const [CartItem, setCartItem] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const addToCart = (product, num = 1) => {
    const user = getAuth().currentUser;
    if (!user) {
      console.error("User not logged in");
      return;
    }
    const userId = user.uid;

    const productExist = CartItem.find(
      (item) => item.id === product.id && item.userId === userId
    );

    let updatedCart;
    if (productExist) {
      updatedCart = CartItem.map((item) =>
        item.id === product.id && item.userId === userId
          ? { ...productExist, qty: productExist.qty + num }
          : item
      );
    } else {
      updatedCart = [...CartItem, { ...product, qty: num, userId }];
    }

    setCartItem(updatedCart);
    localStorage.setItem("cartItem", JSON.stringify(updatedCart));
  };

  const decreaseQty = (product) => {
    const user = getAuth().currentUser;
    if (!user) return;

    const productExist = CartItem.find(
      (item) => item.id === product.id && item.userId === user.uid
    );
    if (!productExist) return;

    const updatedCart =
      productExist.qty === 1
        ? CartItem.filter((item) => !(item.id === product.id && item.userId === user.uid))
        : CartItem.map((item) =>
            item.id === product.id && item.userId === user.uid
              ? { ...productExist, qty: productExist.qty - 1 }
              : item
          );

    setCartItem(updatedCart);
    localStorage.setItem("cartItem", JSON.stringify(updatedCart));
  };

  const deleteProduct = (product) => {
    const user = getAuth().currentUser;
    if (!user) return;

    const updatedCart = CartItem.filter(
      (item) => !(item.id === product.id && item.userId === user.uid)
    );
    setCartItem(updatedCart);
    localStorage.setItem("cartItem", JSON.stringify(updatedCart));
  };

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return;

    const storedCart = localStorage.getItem("cartItem");
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      const userCart = parsedCart.filter((item) => item.userId === user.uid);
      setCartItem(userCart);
    }
  }, []);

  const handleLogin = (userData) => {
    setUserRole(userData.role);
  };

  return (
    <DataContainer.Provider
      value={{
        CartItem,
        setCartItem,
        addToCart,
        decreaseQty,
        deleteProduct,
        selectedProduct,
        setSelectedProduct,
      }}
    >
      <Suspense fallback={<Loader />}>
        <Router>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <Routes>
            <Route path="/" element={<RegisterAndLogin onLogin={handleLogin} />} />
            <Route path="/reset" element={<ForgotPassword />} />
            <Route
              path="/"
              element={
                <>
                  <NavBar userRole={userRole} />
                  <Outlet />
                  <Footer />
                </>
              }
            >
              <Route path="/home" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/reset" element={<ForgotPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/trackorder" element={<TrackOrder />} />
            </Route>
          </Routes>
        </Router>
      </Suspense>
    </DataContainer.Provider>
  );
}

export default App;
