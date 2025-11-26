import React from "react";
import { Card, Button, Form } from "react-bootstrap";

const AuthCard = ({ title, children }) => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card
        className="shadow p-4"
        style={{ maxWidth: "400px", width: "100%", borderRadius: "16px" }}
      >
        <Card.Body>
          <h3 className="text-center mb-4">{title}</h3>
          {children}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AuthCard;
