import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Filter from "./../../Components/filter/Filter";

const Shop = () => {
  return (
    <div>
      <Container>
        <Row>
          <Col sm={4}>
            <Filter />
          </Col>
          <Col sm={8}>sm=8</Col>
        </Row>
      </Container>{" "}
    </div>
  );
};

export default Shop;
