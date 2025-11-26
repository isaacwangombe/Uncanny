// src/admin/products/ProductTable.jsx
import React from "react";
import { Table, Button, Badge, Form } from "react-bootstrap";
import "../../../styles/admin-theme.css";

const ProductTable = ({
  products,
  categories,
  onEdit,
  onView,
  onToggleTrending,
  onDelete, // NEW prop
  backendUrl,
}) => {
  const findCategory = (id) => categories.find((c) => c.id === id);

  return (
    <Table bordered hover responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Main Category</th>
          <th>Subcategory</th>
          <th>Cost</th>
          <th>Price</th>
          <th>Discounted</th>
          <th>Stock</th>
          <th>Status</th>
          <th>Trending</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {products.length ? (
          products.map((p) => {
            const sub = findCategory(p.category);
            const main = sub ? findCategory(sub.parent) : null;

            return (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.title}</td>
                <td>{main?.name || "—"}</td>
                <td>{sub?.name || "—"}</td>
                <td>
                  {p.cost !== null && p.cost !== undefined
                    ? Number(p.cost).toFixed(2)
                    : "—"}
                </td>
                <td>
                  {p.price !== null && p.price !== undefined
                    ? Number(p.price).toFixed(2)
                    : "—"}
                </td>
                <td>
                  {p.discounted_price !== null &&
                  p.discounted_price !== undefined
                    ? Number(p.discounted_price).toFixed(2)
                    : "—"}
                </td>
                <td>{p.stock}</td>
                <td>
                  {p.is_active ? (
                    <Badge bg="success">Active</Badge>
                  ) : (
                    <Badge bg="secondary">Inactive</Badge>
                  )}
                </td>
                <td>
                  <Form.Check
                    type="switch"
                    checked={!!p.trending}
                    onChange={() => onToggleTrending(p.id)}
                  />
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => onView(p)}
                    className="me-1"
                  >
                    View
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => onEdit(p)}
                    className="me-1"
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => onDelete && onDelete(p.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={11} className="text-center text-muted">
              No products found.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default ProductTable;
