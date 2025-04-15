import { Col, Container, Row } from "react-bootstrap";
import { Fragment, useContext, useEffect, useState } from "react";
import { products } from "../../utils/products";
import ShopList from "../../components/ShopList/ShopList";
import Banner from "../../components/Banner/Banner";
import { DataContainer } from "../../App";
import "./Shop.css"

const Shop = () => {
    const {addToCart} =useContext(DataContainer);
    useEffect(()=> {
        window.scrollTo(0,0);
    },[])
    return ( 
        <Fragment>
            <Banner className="image-container" title="Products"/>
            <section className="filter-bar">
                <Container>
                    <ShopList productItems={products} addToCart={addToCart}/>
                </Container>
            </section>
        </Fragment>
    );
}

export default Shop;