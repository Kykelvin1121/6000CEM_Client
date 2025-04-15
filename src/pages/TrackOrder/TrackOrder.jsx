import React, { useEffect, useState } from "react";
import { getAuth } from 'firebase/auth';
import { db } from '../../FirebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import './TrackOrder.css';

const TrackOrder = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 1);
    const trackOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      let orders = [];
      snapshot.forEach((orderDoc) => {
        const order = orderDoc.data();
        if (order.userId === getAuth().currentUser.uid) {
          orders.push({ orderId: orderDoc.id, ...order });
        }
      });
      setOrders(orders);
    })
    return () => {
      trackOrders();
    };
  }, []);

  function getStatusColor(status) {
    switch (status) {
      case "processing":
        return "blue-color";
      case "shipping":
        return "yellow-color";
      case "delivered":
        return "green-color";
      default:
        return "";
    }
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
                <h3 className={`${getStatusColor(order.status)}`}>Order Status: {order.status}</h3>
              </div>
              <div className="order-details">
                <h4 className="total-price">Total Price: RM{order.totalPrice}.00</h4>
                <h5 className="product-title">Product Items</h5>
                <ul className="ordered-products-list">
                  {order.products.map((product) => (
                    <li key={product.id} className="product-item">
                      <p className="product-name">{product.title}</p>
                      <p className="product-quantity">Quantity: {product.qty}</p>
                    </li>
                  ))}
                </ul>
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
