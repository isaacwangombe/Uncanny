// src/admin/products/ProductsPage.jsx
import React, { useEffect, useState } from "react";
import { Button, Container, Form, Row, Col, Spinner } from "react-bootstrap";
import { fetchProducts, fetchCategories } from "../../../api";
import {
  apiAddProduct,
  apiEditProduct,
  uploadProductImage,
  deleteProductImage,
  toggleProductTrending,
  bulkUploadProducts,
  downloadSampleExcel,
  deleteProduct, // <<-- added import
} from "../../../apiAdmin";
import "../../../styles/admin-theme.css";

import ProductTable from "./ProductTable";
import ProductFormModal from "./ProductFormModal";
import ProductDetailsModal from "./ProductDetailsModal";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [mainFilter, setMainFilter] = useState("");
  const [subFilter, setSubFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [trendingFilter, setTrendingFilter] = useState("");

  const [excelFile, setExcelFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const backendUrl = import.meta.env.VITE_API_URL_SHORT;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ]);
      setProducts(prodRes.results || prodRes);
      setCategories(catRes || []);
      const parents = (catRes || []).filter((c) => c.parent === null);
      const children = (catRes || []).filter((c) => c.parent !== null);
      setMainCategories(parents);
      setSubCategories(children);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    try {
      if (!excelFile) {
        alert("Please select an Excel file first.");
        return;
      }
      const data = await bulkUploadProducts(excelFile, zipFile);
      alert(data.message || "Upload completed successfully.");
      setExcelFile(null);
      setZipFile(null);
      loadData();
    } catch (err) {
      console.error("❌ Bulk upload failed:", err);
      alert("Upload failed: " + (err?.message || err));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await deleteProduct(id);
      // remove from local state quickly for UX (or just reload)
      setProducts((prev) => prev.filter((p) => p.id !== id));
      // optionally reload to ensure consistency
      // await loadData();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete product.");
    }
  };

  const filteredProducts = (products || [])
    .filter((p) => {
      const sub = categories.find((c) => c.id === p.category);
      const main = categories.find((c) => c.id === sub?.parent);
      return (
        (!mainFilter || main?.id === parseInt(mainFilter)) &&
        (!subFilter || sub?.id === parseInt(subFilter)) &&
        (!stockFilter || (stockFilter === "in" ? p.stock > 0 : p.stock <= 0)) &&
        (!search ||
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase())) &&
        (!trendingFilter ||
          (trendingFilter === "true" && !!p.trending) ||
          (trendingFilter === "false" && !p.trending))
      );
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === "title") {
        valA = (valA || "").toLowerCase();
        valB = (valB || "").toLowerCase();
      } else {
        valA = parseFloat(valA || 0);
        valB = parseFloat(valB || 0);
      }
      return sortDirection === "asc"
        ? valA > valB
          ? 1
          : -1
        : valA < valB
        ? 1
        : -1;
    });

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="align-items-center mb-3">
        <Col>
          <h4>Products</h4>
        </Col>
        <Col className="text-end">
          <Button
            onClick={() => {
              setSelectedProduct(null);
              setShowEditModal(true);
            }}
          >
            + Add Product
          </Button>
        </Col>

        <Col md={4} className="text-end">
          <Form.Group className="mb-2">
            <Form.Label>Excel File (.xlsx)</Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx"
              onChange={(e) => setExcelFile(e.target.files[0])}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>ZIP of Images (optional)</Form.Label>
            <Form.Control
              type="file"
              accept=".zip"
              onChange={(e) => setZipFile(e.target.files[0])}
            />
          </Form.Group>

          <Button onClick={handleBulkUpload}>Upload Products</Button>
          <Button
            variant="secondary"
            className="mt-2"
            onClick={async () => {
              try {
                const blob = await downloadSampleExcel();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "sample_products.xlsx";
                a.click();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                console.error("Failed to download excel:", err);
                alert("Could not download sample Excel.");
              }
            }}
          >
            Download Sample Excel
          </Button>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-3 g-2">
        <Col md={3}>
          <Form.Control
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Select
            value={mainFilter}
            onChange={(e) => {
              setMainFilter(e.target.value);
              setSubFilter("");
            }}
          >
            <option value="">All Main Categories</option>
            {mainCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={subFilter}
            onChange={(e) => setSubFilter(e.target.value)}
          >
            <option value="">All Subcategories</option>
            {subCategories
              .filter((s) => !mainFilter || s.parent === parseInt(mainFilter))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="">All Stock</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={trendingFilter}
            onChange={(e) => setTrendingFilter(e.target.value)}
          >
            <option value="">All Products</option>
            <option value="true">Trending</option>
            <option value="false">Not Trending</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select
            value={sortField + "-" + sortDirection}
            onChange={(e) => {
              const [field, dir] = e.target.value.split("-");
              setSortField(field);
              setSortDirection(dir);
            }}
          >
            <option value="title-asc">Title A→Z</option>
            <option value="title-desc">Title Z→A</option>
            <option value="price-asc">Price Low→High</option>
            <option value="price-desc">Price High→Low</option>
            <option value="stock-asc">Stock Low→High</option>
            <option value="stock-desc">Stock High→Low</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Table or spinner */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <ProductTable
          products={filteredProducts}
          categories={categories}
          onEdit={(p) => {
            setSelectedProduct(p);
            setShowEditModal(true);
          }}
          onView={(p) => {
            setSelectedProduct(p);
            setShowDetailModal(true);
          }}
          onToggleTrending={async (id) => {
            try {
              const res = await toggleProductTrending(id);
              setProducts((prev) =>
                prev.map((prod) =>
                  prod.id === res.id
                    ? { ...prod, trending: res.trending }
                    : prod
                )
              );
            } catch (err) {
              console.error("❌ Failed to toggle trending:", err);
              alert("Failed to toggle trending");
            }
          }}
          onDelete={handleDeleteProduct} // <<-- pass handler
          backendUrl={backendUrl}
        />
      )}

      {/* Details Modal */}
      <ProductDetailsModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        product={selectedProduct}
        categories={categories}
        backendUrl={backendUrl}
      />

      {/* Add / Edit Modal */}
      <ProductFormModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        selectedProduct={selectedProduct}
        categories={categories}
        mainCategories={mainCategories}
        subCategories={subCategories}
        apiAddProduct={apiAddProduct}
        apiEditProduct={apiEditProduct}
        uploadProductImage={uploadProductImage}
        deleteProductImage={deleteProductImage}
        onSaved={() => {
          loadData();
          setShowEditModal(false);
        }}
        backendUrl={backendUrl}
      />
    </Container>
  );
};

export default ProductsPage;
