import React, { useState, createContext, useEffect, lazy, Suspense } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import NavBar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Loader from "./components/Loader/Loader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    const productExist = CartItem.find((item) => item.id === product.id);
    if (productExist) {
      setCartItem(CartItem.map((item) => (item.id === product.id ? { ...productExist, qty: productExist.qty + num } : item)));
    } else {
      setCartItem([...CartItem, { ...product, qty: num }]);
    }
  }

  const decreaseQty = (product) => {
    const productExist = CartItem.find((item) => item.id === product.id);
    if (productExist.qty === 1) {
      setCartItem(CartItem.filter((item) => item.id !== product.id));
    } else {
      setCartItem(CartItem.map((item) => (item.id === product.id ? { ...productExist, qty: productExist.qty - 1 } : item)));
    }
  }

  const deleteProduct = (product) => {
    setCartItem(CartItem.filter((item) => item.id !== product.id));
  }

  useEffect(() => {
    localStorage.setItem("cartItem", JSON.stringify(CartItem));
  }, [CartItem]);

  const handleLogin = (userData) => {
    setUserRole(userData.role);
  }

  return (
    <DataContainer.Provider value={{ CartItem, setCartItem, addToCart, decreaseQty, deleteProduct, selectedProduct, setSelectedProduct }}>
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
            <Route path="/" element={<RegisterAndLogin onLogin={handleLogin}/>} />
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
