import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataContainer } from "../../App";
import { Col, Container, Row } from "react-bootstrap";
import { db } from "../../FirebaseConfig";
import { getAuth } from "firebase/auth";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import "./Cart.css";
import "../../index.css";
import { toast } from "react-toastify";

const Cart = () => {
  const { CartItem, setCartItem, addToCart, decreaseQty, deleteProduct } =
    useContext(DataContainer);
  const totalPrice = CartItem.reduce(
    (price, item) => price + item.qty * item.price,
    0
  );
  const [userAddress, setUserAddress] = useState("");
  const history = useNavigate();

  // Fetch user address
  useEffect(() => {
    const fetchUserAddress = async () => {
      const user = getAuth().currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserAddress(data.address || "No address found");
        }
      }
    };
    fetchUserAddress();
  }, []);

  const handleCheckout = async () => {
    const user = getAuth().currentUser;

    if (!user) {
      console.log("User is not logged in");
      return;
    }

    if (!userAddress) {
      toast.error("User address not found.");
      return;
    }

    let hasSufficientQuantity = true;

    for (const item of CartItem) {
      const productDocRef = doc(db, "products", item.id);
      const productSnapshot = await getDoc(productDocRef);

      if (productSnapshot.exists()) {
        const productData = productSnapshot.data();
        const warehouseKey = `wh1qty`;

        if (productData[warehouseKey] < item.qty) {
          hasSufficientQuantity = false;
          toast.error(
            `Insufficient ${productData.title} in warehouse. Please drop item or try again.`
          );
          break;
        }
      }
    }

    if (!hasSufficientQuantity) {
      return;
    }

    const ordersCollection = collection(db, "orders");
    const orderData = {
      userId: user.uid,
      products: CartItem,
      shippingAddress: userAddress,
      totalPrice: totalPrice,
      timeStamp: serverTimestamp(),
      status: "processing",
    };

    await addDoc(ordersCollection, orderData);

    for (const item of CartItem) {
      const productDocRef = doc(db, "products", item.id);
      const productSnapshot = await getDoc(productDocRef);

      if (productSnapshot.exists()) {
        const productData = productSnapshot.data();
        const warehouseKey = `wh1qty`;
        const newQuantity = productData[warehouseKey] - item.qty;
        await updateDoc(productDocRef, { [warehouseKey]: newQuantity });
      }
    }

    setCartItem([]);
    localStorage.removeItem("cartItem");
    history("/home");
    toast.success("Order successfully created!");
  };

  useEffect(() => {
    window.scrollTo(0, 1);
    const user = getAuth().currentUser;
    if (CartItem.length === 0 && user) {
      const storedCart = localStorage.getItem("cartItem");
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        const userCart = parsedCart.filter(
          (item) => item.userId === user.uid
        );
        setCartItem(userCart);
      }
    }
  }, []);

  return (
    <section className="cart-items">
      <Container>
        <Row className="justify-content-center">
          <Col className="cartCol">
            {CartItem.length === 0 && (
              <h1 className="no-items">No Items are in the Cart</h1>
            )}
            {CartItem.map((item) => {
              const productQty = item.price * item.qty;
              return (
                <div className="cart-list" key={item.id}>
                  <Row>
                    <Col className="image-holder">
                      <img src={item.img} alt="" />
                    </Col>
                    <Col sm={8} md={9}>
                      <Row className="cart-content justify-content-center">
                        <Col xs={12} sm={9} className="cart-details">
                          <h3>{item.title}</h3>
                          <h4>
                            RM{item.price}.00 x {item.qty}
                            <span>RM{productQty}.00</span>
                          </h4>
                        </Col>
                        <Col xs={12} sm={3} className="cartControl">
                          <button
                            className="incCart"
                            onClick={() => addToCart(item)}
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                          <button
                            className="desCart"
                            onClick={() => {
                              if (item.qty === 1) {
                                const updatedCart = CartItem.filter(
                                  (product) => product.id !== item.id
                                );
                                setCartItem(updatedCart);
                                if (updatedCart.length === 0) {
                                  localStorage.removeItem("cartItem");
                                } else {
                                  localStorage.setItem(
                                    "cartItem",
                                    JSON.stringify(updatedCart)
                                  );
                                }
                              } else {
                                decreaseQty(item);
                              }
                            }}
                          >
                            <i className="fa-solid fa-minus"></i>
                          </button>
                        </Col>
                      </Row>
                    </Col>
                    <button
                      className="delete"
                      onClick={() => {
                        deleteProduct(item);
                        const updatedCart = CartItem.filter(
                          (product) => product.id !== item.id
                        );
                        if (updatedCart.length === 0) {
                          localStorage.removeItem("cartItem");
                          setCartItem([]);
                        } else {
                          setCartItem(updatedCart);
                          localStorage.setItem(
                            "cartItem",
                            JSON.stringify(updatedCart)
                          );
                        }
                      }}
                    >
                      <ion-icon name="close"></ion-icon>
                    </button>
                  </Row>
                </div>
              );
            })}
          </Col>

          {CartItem.length > 0 && (
            <Col md={4} className="cartCol">
              <div className="cart-total">
                <h2>Cart Summary</h2>
                <div className="d_flex">
                  <h4>Shipping Address:</h4>
                  <p>{userAddress}</p>
                  <h7>Free Shipping</h7>
                  <h4>Total Price:</h4>
                  <h3>RM{totalPrice}.00</h3>
                </div>
                <button className="checkout-button" onClick={handleCheckout}>
                  Checkout
                </button>
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </section>
  );
};

export default Cart;
