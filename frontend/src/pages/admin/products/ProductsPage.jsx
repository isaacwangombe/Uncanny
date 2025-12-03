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
  deleteProduct,
  bulkDeleteProducts,
  downloadAllProductsCSV,
  deleteAllProducts,
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
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false); // ⭐ NEW

  const backendUrl = import.meta.env.VITE_API_URL_SHORT;
  const SHOW_DELETE_ALL = true;

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
      setMainCategories((catRes || []).filter((c) => c.parent === null));
      setSubCategories((catRes || []).filter((c) => c.parent !== null));
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // ⭐ UPDATED: Bulk Upload with loadingAction
  // ------------------------------------------------------------
  const handleBulkUpload = async () => {
    if (!excelFile) {
      alert("Please select an Excel file first.");
      return;
    }
    setLoadingAction("bulk_upload");
    try {
      const data = await bulkUploadProducts(excelFile, zipFile);
      alert(data.message || "Upload completed successfully.");
      setExcelFile(null);
      setZipFile(null);
      loadData();
    } catch (err) {
      console.error("❌ Bulk upload failed:", err);
      alert("Upload failed: " + (err?.message || err));
    }
    setLoadingAction(false);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete product.");
    }
  };

  // ------------------------------------------------------------
  // ⭐ UPDATED: Bulk Delete Selected with loadingAction
  // ------------------------------------------------------------
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (!window.confirm(`Delete ${selectedIds.length} selected products?`))
      return;

    setLoadingAction("bulk_delete");

    try {
      await bulkDeleteProducts(selectedIds);
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      alert("Products deleted successfully!");
    } catch (err) {
      console.error("❌ Bulk delete failed:", err);
      alert("Bulk delete failed.");
    }

    setLoadingAction(false);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (list) => {
    if (selectedIds.length === list.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.map((p) => p.id));
    }
  };

  // ------------------------------------------------------------
  // FILTER + SORT
  // ------------------------------------------------------------
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
      {/* ⭐ NEW: Global Action Banner */}
      {loadingAction && (
        <div className="alert alert-info text-center fw-bold">
          {loadingAction === "bulk_upload" &&
            "Uploading products… Please wait."}
          {loadingAction === "bulk_delete" && "Deleting selected products…"}
          {loadingAction === "delete_all" &&
            "Deleting ALL products… This may take a moment."}
        </div>
      )}

      {/* Header */}
      <Row className="align-items-center mb-3">
        {/* Left Side Title */}
        <Col xs={12} md={4}>
          <h4 className="mb-3">Products</h4>
        </Col>

        {/* Center: Primary actions */}
        <Col xs={12} md={4} className="text-md-center text-start mb-3">
          <Button
            disabled={!!loadingAction}
            onClick={() => {
              setSelectedProduct(null);
              setShowEditModal(true);
            }}
            className="me-2"
          >
            + Add Product
          </Button>

          <Button
            variant="outline-success"
            disabled={!!loadingAction}
            onClick={async () => {
              try {
                const blob = await downloadAllProductsCSV();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "all_products.csv";
                a.click();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                alert("Failed to download CSV");
              }
            }}
          >
            Download CSV
          </Button>
        </Col>

        {/* Right: Admin Controls */}
        <Col xs={12} md={4} className="text-md-end text-start">
          {/* Delete selected */}
          <Button
            variant="danger"
            className="me-2 mb-2"
            disabled={selectedIds.length === 0 || !!loadingAction}
            onClick={handleBulkDelete}
          >
            Delete Selected ({selectedIds.length})
          </Button>

          {/* Delete all */}
          {SHOW_DELETE_ALL && (
            <Button
              variant="danger"
              className="me-2 mb-2"
              disabled={!!loadingAction}
              onClick={async () => {
                if (
                  !window.confirm(
                    "⚠ This will delete ALL products permanently!"
                  )
                )
                  return;

                setLoadingAction("delete_all");

                try {
                  await deleteAllProducts();
                  alert("All products deleted.");
                  loadData();
                } catch (err) {
                  alert("Failed to delete all products.");
                }

                setLoadingAction(false);
              }}
            >
              Delete ALL
            </Button>
          )}

          {/* Toggle Bulk Upload */}
          <Button
            variant="outline-primary"
            className="mb-2"
            disabled={!!loadingAction}
            onClick={() => setShowBulkUpload((s) => !s)}
          >
            {showBulkUpload ? "Hide Bulk Upload" : "Upload Bulk Products"}
          </Button>

          {/* Bulk Upload Panel */}
          {showBulkUpload && (
            <div className="mt-3 border rounded p-3 bg-light">
              <Button
                variant="secondary"
                className="w-100 mb-3"
                disabled={!!loadingAction}
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
                    alert("Could not download sample Excel.");
                  }
                }}
              >
                Download Sample Excel
              </Button>

              <Form.Group className="mb-3">
                <Form.Label>Excel File (.xlsx) *</Form.Label>
                <Form.Control
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => setExcelFile(e.target.files[0])}
                  disabled={!!loadingAction}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>ZIP of Images (optional)</Form.Label>
                <Form.Control
                  type="file"
                  accept=".zip"
                  onChange={(e) => setZipFile(e.target.files[0])}
                  disabled={!!loadingAction}
                />
              </Form.Group>

              <Button
                variant="primary"
                className="w-100"
                disabled={!excelFile || !!loadingAction}
                onClick={handleBulkUpload}
              >
                Upload Products
              </Button>
            </div>
          )}
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-3 g-2 flex-wrap">
        {/* preserved as-is */}
        <Col xs={12} md={3}>
          <Form.Control
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>

        <Col xs={12} md={2}>
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

        <Col xs={12} md={2}>
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

        <Col xs={12} md={2}>
          <Form.Select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="">All Stock</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </Form.Select>
        </Col>

        <Col xs={12} md={2}>
          <Form.Select
            value={trendingFilter}
            onChange={(e) => setTrendingFilter(e.target.value)}
          >
            <option value="">All Products</option>
            <option value="true">Trending</option>
            <option value="false">Not Trending</option>
          </Form.Select>
        </Col>

        <Col xs={12} md={3}>
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

      {/* Table */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <ProductTable
          products={filteredProducts}
          categories={categories}
          selectedIds={selectedIds}
          toggleSelect={toggleSelect}
          toggleSelectAll={() => toggleSelectAll(filteredProducts)}
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
              alert("Failed to toggle trending");
            }
          }}
          onDelete={handleDeleteProduct}
          backendUrl={backendUrl}
        />
      )}

      {/* Product Detail Modal */}
      <ProductDetailsModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        product={selectedProduct}
        categories={categories}
        backendUrl={backendUrl}
      />

      {/* Add/Edit Modal */}
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
