import React from "react";
import { Table, Button, Badge, Form } from "react-bootstrap";
import "../../../styles/admin-theme.css";

const ProductTable = ({
  products,
  categories,
  selectedIds,
  toggleSelect,
  toggleSelectAll,
  onEdit,
  onView,
  onToggleTrending,
  onDelete,
}) => {
  const findCategory = (id) => categories.find((c) => c.id === id);

  return (
    <div className="table-responsive">
      <Table bordered hover>
        <thead>
          <tr>
            <th>
              {/* Select All */}
              <Form.Check
                type="checkbox"
                checked={
                  products.length > 0 && selectedIds.length === products.length
                }
                onChange={toggleSelectAll}
              />
            </th>
            <th>ID</th>
            <th>Title</th>
            <th>Main</th>
            <th>Sub</th>
            <th>Cost</th>
            <th>Price</th>
            <th>Discount</th>
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
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>

                  <td>{p.id}</td>
                  <td>{p.title}</td>
                  <td>{main?.name || "—"}</td>
                  <td>{sub?.name || "—"}</td>

                  <td>{p.cost ? Number(p.cost).toFixed(2) : "—"}</td>
                  <td>{p.price ? Number(p.price).toFixed(2) : "—"}</td>
                  <td>
                    {p.discounted_price
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
                      className="me-1"
                      onClick={() => onView(p)}
                    >
                      View
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-secondary"
                      className="me-1"
                      onClick={() => onEdit(p)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => onDelete(p.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={13} className="text-center text-muted">
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ProductTable;
