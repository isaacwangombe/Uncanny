// src/pages/admin/CategoriesAdminPage.jsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  Table,
  Modal,
  Form,
  Spinner,
  Badge,
  Row,
  Col,
} from "react-bootstrap";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage, // ✅ Added
  deleteCategoryImage,
} from "../../apiAdmin";
import { ChevronRight, CornerDownRight } from "lucide-react";
import "../../styles/admin-theme.css";

const CategoriesAdminPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    parent: "",
  });
  const [expandedImage, setExpandedImage] = useState(null);

  const [selectedCategoryImage, setSelectedCategoryImage] = useState(null); // ✅ Added this state

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ id: null, name: "", parent: "" });
    setSelectedCategoryImage(null); // ✅ reset image
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setFormData({
      id: category.id,
      name: category.name,
      parent: category.parent || "",
      image: category.image_url || null,
    });
    setSelectedCategoryImage(category.image_url || null); // ✅ preload existing image
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        parent: formData.parent || null,
      };

      let category;
      if (formData.id) {
        category = await updateCategory(formData.id, payload);
      } else {
        category = await createCategory(payload);
      }

      // ✅ Upload image if selected
      if (selectedCategoryImage instanceof File) {
        await uploadCategoryImage(
          category.id || formData.id,
          selectedCategoryImage
        );
      }

      setShowModal(false);
      loadCategories();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // Top-level categories (no parent)
  const topLevelCategories = categories.filter((c) => !c.parent);

  // Subcategories grouped by parent id
  const getSubcategories = (parentId) =>
    categories.filter((c) => c.parent === parentId);

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h4>Categories</h4>
        </Col>
        <Col className="text-end">
          <Button onClick={handleAdd}>+ Add Category</Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Name</th>
              <th>Type</th>
              <th>Parent</th>
              <th>Image</th>
              <th className="text-center" style={{ width: "25%" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {topLevelCategories.length ? (
              topLevelCategories.map((cat) => (
                <React.Fragment key={cat.id}>
                  <tr>
                    <td className="fw-semibold">
                      <ChevronRight size={16} className="me-2 text-primary" />
                      {cat.name}
                    </td>
                    <td>
                      <Badge bg="primary">Category</Badge>
                    </td>
                    <td>—</td>
                    <td>
                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          onClick={() => setExpandedImage(cat.image_url)}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            cursor: "pointer",
                            transition: "transform 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = "scale(1.05)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        />
                      ) : (
                        <span className="text-muted">No image</span>
                      )}
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => handleEdit(cat)}
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(cat.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>

                  {/* Subcategories */}
                  {getSubcategories(cat.id).map((sub) => (
                    <tr key={sub.id} className="text-muted">
                      <td style={{ paddingLeft: "3rem" }}>
                        <CornerDownRight
                          size={16}
                          className="me-2 text-secondary"
                        />
                        {sub.name}
                      </td>
                      <td>
                        <Badge bg="secondary">Subcategory</Badge>
                      </td>
                      <td>{cat.name}</td>
                      <td>
                        {sub.image_url ? (
                          <img
                            src={sub.image_url}
                            alt={sub.name}
                            onClick={() => setExpandedImage(sub.image_url)}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "6px",
                              border: "1px solid #ccc",
                              cursor: "pointer",
                              transition: "transform 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.05)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                          />
                        ) : (
                          <span className="text-muted">No image</span>
                        )}
                      </td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => handleEdit(sub)}
                          className="me-2"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(sub.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* --- Add/Edit Modal --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {formData.id ? "Edit Category" : "Add Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Parent Category (optional)</Form.Label>
              <Form.Select
                value={formData.parent || ""}
                onChange={(e) =>
                  setFormData({ ...formData, parent: e.target.value || null })
                }
              >
                <option value="">None (Top-level Category)</option>
                {topLevelCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* ✅ Image Upload Section */}
            <Form.Group className="mb-3">
              <Form.Label>Category Image</Form.Label>

              {/* 👇 Only show upload input if no existing image */}
              {!selectedCategoryImage && !formData.image && (
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setSelectedCategoryImage(file);
                  }}
                />
              )}

              {/* 👇 Show preview when there is an image */}
              {(selectedCategoryImage || formData.image) && (
                <div className="mt-3 text-center position-relative">
                  <img
                    src={
                      selectedCategoryImage instanceof File
                        ? URL.createObjectURL(selectedCategoryImage)
                        : selectedCategoryImage || formData.image
                    }
                    alt="Category"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                    }}
                  />

                  {/* 🗑️ Delete button */}
                  {formData.id && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-2 p-1"
                      onClick={async () => {
                        if (window.confirm("Delete this image?")) {
                          try {
                            await deleteCategoryImage(formData.id);
                            setSelectedCategoryImage(null);
                            setFormData({ ...formData, image: null });
                            loadCategories(); // refresh UI
                          } catch (err) {
                            console.error("❌ Failed to delete image:", err);
                            alert("Failed to delete image");
                          }
                        }
                      }}
                    >
                      ×
                    </Button>
                  )}
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      {/* --- Fullscreen Image Modal --- */}
      <Modal
        show={!!expandedImage}
        onHide={() => setExpandedImage(null)}
        centered
        size="xl"
        contentClassName="bg-transparent border-0 shadow-none"
      >
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            minHeight: "90vh",
            background: "rgba(0,0,0,0.9)",
            borderRadius: "12px",
          }}
          onClick={() => setExpandedImage(null)}
        >
          <Button
            variant="light"
            size="sm"
            className="position-absolute top-0 end-0 m-3"
            onClick={() => setExpandedImage(null)}
          >
            ×
          </Button>
          {expandedImage && (
            <img
              src={expandedImage}
              alt="Expanded"
              style={{
                maxWidth: "95%",
                maxHeight: "90vh",
                borderRadius: "12px",
                boxShadow: "0 0 20px rgba(255,255,255,0.2)",
              }}
            />
          )}
        </div>
      </Modal>
    </Container>
  );
};

export default CategoriesAdminPage;
