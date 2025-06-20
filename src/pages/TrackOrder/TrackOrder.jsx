import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../../FirebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import "./TrackOrder.css";

const TrackOrder = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 1);

    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      let orders = [];
      snapshot.forEach((orderDoc) => {
        const order = orderDoc.data();
        if (order.userId === getAuth().currentUser?.uid) {
          orders.push({ orderId: orderDoc.id, ...order });
        }
      });

      // Sort orders by timestamp descending (latest first)
      orders.sort((a, b) => {
        const timeA = a.timeStamp?.toDate ? a.timeStamp.toDate().getTime() : 0;
        const timeB = b.timeStamp?.toDate ? b.timeStamp.toDate().getTime() : 0;
        return timeB - timeA;
      });

      setOrders(orders);
    });

    return () => unsubscribe();
  }, []);

  function getStatusColor(status) {
    switch (status) {
      case "processing":
        return "blue-color";
      case "delivering":
        return "yellow-color";
      case "completed":
        return "green-color";
      default:
        return "";
    }
  }

  function formatTimestamp(timestamp) {
    if (!timestamp || !timestamp.toDate) return "N/A";
    const dateObj = timestamp.toDate();
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return dateObj.toLocaleString("en-MY", options);
  }

  function getTotalItems(products) {
    if (!products || products.length === 0) return 0;
    return products.reduce((total, product) => total + (product.qty || 1), 0);
  }

  return (
    <div className="track-order-container">
      <h1 className="track-order-title">Track Orders</h1>
      <div className="order-list">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.orderId} className="order-item">
              <div className="order-header">
                <h2 className="order-id">Order ID: {order.orderId}</h2>
                <div className="order-status-group">
                  <h3 className={`${getStatusColor(order.status)}`}>
                    Order Status: {order.status}
                  </h3>
                  <p className="order-timestamp">
                    Placed On: {formatTimestamp(order.timeStamp)}
                  </p>
                </div>
              </div>

              <div className="order-details">
                <ul className="ordered-products-list">
                  {order.products.map((product) => (
                    <li key={product.id} className="product-item">
                      <img
                        src={product.img}
                        alt={product.title}
                        className="product-image"
                      />
                      <p className="product-name">{product.title}</p>
                      <span className="product-quantity">x{product.qty || 1}</span>
                    </li>
                  ))}
                </ul>

                <h4 className="total-price">
                  Total {getTotalItems(order.products)} item
                  {getTotalItems(order.products) > 1 ? "s" : ""} : RM
                  {order.totalPrice}.00
                </h4>

                <hr className="separator-line" />

                <h5 className="delivery-info-title">Delivery Information</h5>
                <p className="delivery-username">
                  {order.username} ({order.phoneNumber})
                </p>
                <p className="delivery-address">
                  {order.shippingAddress || "No delivery address provided"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-orders">No orders found for the current user.</p>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
