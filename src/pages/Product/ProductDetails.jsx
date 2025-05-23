import { Fragment, useContext, useEffect, useState } from "react";
import { db } from '../../FirebaseConfig';
import { collection, getDocs } from "firebase/firestore";
import Banner from "../../components/Banner/Banner";
import { DataContainer } from "../../App";
import { Col, Container, Row } from "react-bootstrap";
import ShopList from "../../components/ShopList/ShopList";
import { products } from "../../utils/products";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../../index.css";
import "./ProductDetails.css";

const ProductDetails = () => {
    const [listSelected, setListSelected] = useState("desc");
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [productData, setProductData] = useState([]);
    const { selectedProduct, setSelectedProduct, addToCart } = useContext(DataContainer);
    const { id } = useParams();

    const [quantity, setQuantity] = useState(1);
    const [remark, setRemark] = useState("");  // Remark state

    // Fetch product data from Firestore
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

        fetchData();
    }, []);

    // Restore selectedProduct from localStorage if page refreshes
    if (!selectedProduct) {
        const storedProduct = localStorage.getItem(`selectedProduct-${id}`);
        setSelectedProduct(JSON.parse(storedProduct));
    }

    // Handle quantity change with minimum of 1
    const handleQuantityChange = (event) => {
        const value = parseInt(event.target.value);
        if (value >= 1) {
            setQuantity(value);
        } else {
            setQuantity(1);
        }
    };

    const handleRemarkChange = (event) => {
        setRemark(event.target.value);
    };

    const handleAdd = (selectedProduct, quantity, product, remark) => {
        const totalQuantity = product.wh1qty + product.wh2qty + product.wh3qty;

        if (quantity < 1) {
            toast.error("Please enter a valid quantity.");
            return;
        }

        if (totalQuantity > 0) {
            addToCart(selectedProduct, quantity, remark);
            toast.success("Product has been added to cart!");
        } else {
            toast.error("This product is out of stock and cannot be added to the cart.");
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        setRelatedProducts(
            products.filter(
                (item) => item.category === selectedProduct?.category && item.id !== selectedProduct?.id
            )
        );
    }, [selectedProduct]);

    return (
        <Fragment>
            <Banner title={selectedProduct?.title} />
            <section className="product-page">
                <Container>
                    <Row className="justify-content-center">
                        <Col>
                            <img loading="lazy" src={selectedProduct?.img} alt="" />
                        </Col>
                        <Col style={{ paddingTop: '50px', paddingLeft: '100px' }}>
                            <h2>{selectedProduct?.title}</h2>
                            <span className="desc">{selectedProduct?.desc}</span>
                            <div className="info">
                                <span className="price">RM{selectedProduct?.price}</span>

                                {/* Remark input */}
                                <input
                                    type="text"
                                    className="remark-input"
                                    placeholder="Remark"
                                    value={remark}
                                    onChange={handleRemarkChange}
                                    style={{
                                        marginTop: '10px',
                                        padding: '6px 10px',
                                        width: '100%',
                                        maxWidth: '300px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                    }}
                                />
                            </div>

                            {/* Quantity input */}
                            <input
                                className="qty-input"
                                type="number"
                                placeholder="Qty"
                                value={quantity}
                                min={1}
                                onChange={handleQuantityChange}
                            />

                            {/* Add To Cart button */}
                            <button
                                aria-label="Add"
                                type="submit"
                                className="add"
                                onClick={() => handleAdd(selectedProduct, quantity, selectedProduct, remark)}
                            >
                                Add To Cart
                            </button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Related Products */}
            <section className="related-products">
                <Container>
                    <h3>You might also like</h3>
                </Container>
                <ShopList productItems={relatedProducts} addToCart={addToCart} />
            </section>
        </Fragment>
    );
};

export default ProductDetails;
