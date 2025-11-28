// ProductFormModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import "../../../styles/admin-theme.css";

const UPCOMING_CATEGORY_ID = 10; // 🔥 Hard-coded as requested

const ProductFormModal = ({
  show,
  onHide,
  selectedProduct,
  categories,
  mainCategories,
  subCategories,
  apiAddProduct,
  apiEditProduct,
  uploadProductImage,
  deleteProductImage,
  onSaved,
  backendUrl,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mainCategory: "",
    category: "",
    price: "",
    cost: "",
    discounted_price: "",
    stock: "",
    is_active: true,
  });

  const [isEvent, setIsEvent] = useState(false);

  const [eventFields, setEventFields] = useState({
    start: "",
    end: "",
    location: "",
  });

  const [localProduct, setLocalProduct] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [saving, setSaving] = useState(false);

  // 🔍 category lookup
  const getUpcomingCategory = () =>
    subCategories.find((c) => c.id === UPCOMING_CATEGORY_ID);

  // ───────────────────────────────────────────────
  // LOAD PRODUCT FOR EDIT
  // ───────────────────────────────────────────────
  useEffect(() => {
    if (selectedProduct) {
      const subCat = categories.find((c) => c.id === selectedProduct.category);
      const mainCat = subCat?.parent || "";

      const hasEvent = !!selectedProduct.event_data;
      setIsEvent(hasEvent);

      // Load event details
      if (hasEvent) {
        const up = getUpcomingCategory();
        if (up) {
          setFormData((prev) => ({
            ...prev,
            mainCategory: up.parent,
            category: up.id,
          }));
        }

        setEventFields({
          start: selectedProduct.event_data?.start || "",
          end: selectedProduct.event_data?.end || "",
          location: selectedProduct.event_data?.location || "",
        });
      }

      setFormData((prev) => ({
        ...prev,
        id: selectedProduct.id,
        title: selectedProduct.title || "",
        description: selectedProduct.description || "",
        mainCategory: hasEvent ? prev.mainCategory : mainCat,
        category: hasEvent ? prev.category : selectedProduct.category || "",
        price: selectedProduct.price ?? "",
        cost: selectedProduct.cost ?? "",
        discounted_price: selectedProduct.discounted_price ?? "",
        stock: selectedProduct.stock ?? 0,
        is_active: selectedProduct.is_active ?? true,
      }));

      setLocalProduct(JSON.parse(JSON.stringify(selectedProduct)));
      setSelectedImages([]);
    } else {
      // NEW PRODUCT
      setIsEvent(false);
      setEventFields({ start: "", end: "", location: "" });

      setFormData({
        title: "",
        description: "",
        mainCategory: "",
        category: "",
        price: "",
        cost: "",
        discounted_price: "",
        stock: "",
        is_active: true,
      });

      setLocalProduct(null);
      setSelectedImages([]);
    }
  }, [selectedProduct, categories]);

  // ───────────────────────────────────────────────
  // EVENT TOGGLE HANDLER
  // ───────────────────────────────────────────────
  const handleEventToggle = (checked) => {
    setIsEvent(checked);

    if (checked) {
      const up = getUpcomingCategory();
      if (up) {
        setFormData((prev) => ({
          ...prev,
          mainCategory: up.parent,
          category: up.id,
        }));
      }
    }
  };

  // ───────────────────────────────────────────────
  // SAVE PRODUCT
  // ───────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category || null,
        price: formData.price ? Number(formData.price) : null,
        cost: formData.cost ? Number(formData.cost) : null,
        discounted_price: formData.discounted_price
          ? Number(formData.discounted_price)
          : null,
        stock: formData.stock ? Number(formData.stock) : 0,
        is_active: !!formData.is_active,
      };

      // Event payload
      if (isEvent) {
        payload.event_data = {
          start: eventFields.start
            ? new Date(eventFields.start).toISOString()
            : null,
          end: eventFields.end ? new Date(eventFields.end).toISOString() : null,
          location: eventFields.location || "",
        };
      }

      let product;
      if (formData.id) {
        product = await apiEditProduct(formData.id, payload);
      } else {
        product = await apiAddProduct(payload);
      }

      // Upload new images
      for (const file of selectedImages) {
        await uploadProductImage(product.id, file);
      }

      onSaved?.();
      onHide?.();
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ───────────────────────────────────────────────
  // IMAGE HELPERS
  // ───────────────────────────────────────────────
  const imageUrlFor = (img) => {
    if (!img) return null;
    if (typeof img.image === "string") {
      if (img.image.startsWith("http")) return img.image;
      return backendUrl + img.image;
    }
    return img.image?.url || null;
  };

  // ───────────────────────────────────────────────
  // DELETE EXISTING IMAGE
  // ───────────────────────────────────────────────
  const handleDeleteExistingImage = async (imgId) => {
    if (!window.confirm("Delete this image permanently?")) return;

    try {
      await deleteProductImage(imgId);

      setLocalProduct((prev) => ({
        ...prev,
        images: (prev.images || []).filter((i) => i.id !== imgId),
      }));
    } catch (err) {
      alert("Failed to delete image");
    }
  };

  // ------------------------------------------------------------------
  // UI
  // ------------------------------------------------------------------
  return (
    <Modal show={show} onHide={onHide} centered size="lg" fullscreen="sm-down">
      <Modal.Header closeButton>
        <Modal.Title>
          {formData.id ? "Edit Product" : "Add Product"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* ─────────────────────────────────────────────── */}
          {/* 🔥 EVENT FIRST */}
          {/* ─────────────────────────────────────────────── */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Check
                type="switch"
                label="Is Event?"
                checked={isEvent}
                onChange={(e) => handleEventToggle(e.target.checked)}
              />
            </Col>

            <Col md={6}>
              <Form.Check
                type="switch"
                label="Active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
              />
            </Col>
          </Row>

          {/* ─────────────────────────────────────────────── */}
          {/* CATEGORY (HIDDEN WHEN EVENT) */}
          {/* ─────────────────────────────────────────────── */}
          {!isEvent && (
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Main Category</Form.Label>
                <Form.Select
                  value={formData.mainCategory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mainCategory: e.target.value,
                      category: "",
                    })
                  }
                >
                  <option value="">Select</option>
                  {mainCategories.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Subcategory</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  {subCategories
                    .filter(
                      (s) =>
                        !formData.mainCategory ||
                        s.parent === parseInt(formData.mainCategory)
                    )
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </Form.Select>
              </Col>
            </Row>
          )}

          {/* ─────────────────────────────────────────────── */}
          {/* EVENT FIELDS */}
          {/* ─────────────────────────────────────────────── */}
          {isEvent && (
            <>
              <hr />
              <h5>Event Details</h5>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Start</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={eventFields.start}
                    onChange={(e) =>
                      setEventFields({ ...eventFields, start: e.target.value })
                    }
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>End</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={eventFields.end}
                    onChange={(e) =>
                      setEventFields({ ...eventFields, end: e.target.value })
                    }
                  />
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    value={eventFields.location}
                    onChange={(e) =>
                      setEventFields({
                        ...eventFields,
                        location: e.target.value,
                      })
                    }
                  />
                </Col>
              </Row>
            </>
          )}

          {/* ─────────────────────────────────────────────── */}
          {/* BASIC PRODUCT FIELDS */}
          {/* ─────────────────────────────────────────────── */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </Col>

            <Col md={3}>
              <Form.Label>Cost</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.cost || ""}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
              />
            </Col>

            <Col md={3}>
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Discounted Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.discounted_price || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discounted_price: e.target.value,
                  })
                }
              />
            </Col>

            <Col md={6}>
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
              />
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </Form.Group>

          {/* ─────────────────────────────────────────────── */}
          {/* EXISTING IMAGES */}
          {/* ─────────────────────────────────────────────── */}
          {localProduct?.images?.length > 0 && (
            <>
              <hr />
              <h6>Existing Images</h6>
              <div className="d-flex flex-wrap">
                {localProduct.images.map((img) => {
                  const url = imageUrlFor(img);
                  return (
                    <div
                      key={img.id}
                      className="position-relative me-2 mb-2"
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        overflow: "hidden",
                      }}
                    >
                      {url && (
                        <img
                          src={url}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        className="position-absolute top-0 end-0 m-1 p-1 rounded-circle"
                        onClick={() => handleDeleteExistingImage(img.id)}
                      >
                        ×
                      </Button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ─────────────────────────────────────────────── */}
          {/* NEW IMAGES */}
          {/* ─────────────────────────────────────────────── */}
          <Form.Group className="mt-3">
            <Form.Label>Upload New Images</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setSelectedImages([
                  ...selectedImages,
                  ...Array.from(e.target.files),
                ])
              }
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : formData.id ? "Save Changes" : "Add Product"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductFormModal;
