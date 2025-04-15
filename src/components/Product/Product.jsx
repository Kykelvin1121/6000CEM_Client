import { useContext, useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { DataContainer } from "../../App";
import { toast } from "react-toastify";
import { db } from '../../FirebaseConfig';
import { collection, getDocs } from "firebase/firestore";
import "./product.css";

const Product = ({ addToCart }) => {
  const { setSelectedProduct } = useContext(DataContainer);
  const router = useNavigate();
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        let list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setProductData(list);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
  
    return () => {
        fetchData();
    };
  }, []);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    localStorage.setItem(`selectedProduct-${product.id}`, JSON.stringify(product));
    router(`/shop/${product.id}`);
  };

  const handleAddToCart = (product) => {
    const totalQuantity = product.wh1qty + product.wh2qty + product.wh3qty;
  
    if (totalQuantity > 0) {
      addToCart(product);
      toast.success("Product has been added to the cart!");
    } else {
      toast.error("This product is out of stock and cannot be added to the cart.");
    }
  };
  

  return (
    <Row className="justify-content-center">
      {productData.map((product) => (
        <div key={product.id} className="product mtop">
          <img
            loading="lazy"
            onClick={() => handleProductClick(product)}
            src={product.img}
            alt=""
          />
          <div className="product-details">
            <h3 onClick={() => handleProductClick(product)}>
              {product.title}
            </h3>
            <div className="stock">
              {product.wh1qty > 0 || product.wh2qty > 0 || product.wh3qty > 0 ? (
                <h6 className="inStock">In Stock!</h6>
              ) : (
                <h6 className="outOfStock">Out of Stock!</h6>
              )}
            </div>
            <div className="price">
              <h4>RM{product.price}</h4>
              <button
                id="addButton"
                aria-label="Add"
                type="button"
                className="add"
                onClick={() => handleAddToCart(product)}
              >
                <ion-icon name="add"></ion-icon>
              </button>
            </div>
          </div>
        </div>
      ))}
    </Row>
  );
};

export default Product;
