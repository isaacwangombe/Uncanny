import React from "react";
import { Form, Button } from "react-bootstrap";
import AuthCard from "../../Components/authcard/AuthCard";

const Register = () => {
  return (
    <AuthCard title="Create Account">
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeholder="Enter email" required />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" required />
        </Form.Group>
        <Button variant="dark" type="submit" className="w-100 mb-3">
          Register
        </Button>
      </Form>
    </AuthCard>
  );
};

export default Register;
