import { Fragment, useContext, useEffect } from "react";
import { DataContainer } from "../../App";
import { Container } from "react-bootstrap";
import { products } from "../../utils/products";
import SliderHome from "../../components/SliderCard/Slider";
import ShopList from "../../components/ShopList/ShopList";
import "./Home.css";
import "../../index.css";

const Home = () => {
  const { addToCart } = useContext(DataContainer);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Fragment className="home">
      <SliderHome />
      <section className="products">
        <Container>
          <h1>New Arrivals</h1>
            <ShopList productItems={products} addToCart={addToCart}/>
        </Container>
      </section>
    </Fragment>
  );
};

export default Home;
