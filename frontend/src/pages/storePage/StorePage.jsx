// src/pages/StorePage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Pagination, Badge } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../../Components/productCard/ProductCard";
import Filter from "../../Components/filter/Filter";
import { fetchProducts, fetchCategories } from "../../api";
import { useCart } from "../../contexts/CartContext";

const StorePage = () => {
  const [productsData, setProductsData] = useState({ results: [], count: 0 });
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const { reload } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Prevent react twice initialization of load
  const firstLoadRef = useRef(true);

  /* -------------------- 1) Load categories (cached) -------------------- */
  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data || []))
      .catch(() => setCategories([]));
  }, []);

  /* -------------------- 2) Decode URL -> state -------------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qParam = params.get("q") || "";
    const catParam = params.get("category");

    setQ(qParam);
    setPage(1);

    if (!categories.length) return;

    let resolved = null;
    if (catParam) {
      resolved =
        categories.find((c) => c.slug === catParam) ||
        categories.find((c) => String(c.id) === String(catParam));
      if (resolved) {
        resolved = {
          id: resolved.id,
          isParent: !resolved.parent,
        };
      }
    }
    setCategoryFilter(resolved);

    // Trigger main load
    loadProducts({
      page: 1,
      q: qParam,
      categoryFilter: resolved,
    });
  }, [location.search, categories]);

  /* -------------------- 3) Load products -------------------- */
  const loadProducts = async ({
    page = 1,
    q = "",
    categoryFilter = null,
  } = {}) => {
    setLoading(true);
    try {
      const data = await fetchProducts({
        page,
        ...(categoryFilter
          ? categoryFilter.isParent
            ? { category: categoryFilter.id }
            : { subcategory: categoryFilter.id }
          : {}),
        q,
      });

      setProductsData({
        results: data.results || data,
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
      });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- 4) Cart reload on mount -------------------- */
  // useEffect(() => {
  //   reload();
  // }, [reload]);

  /* -------------------- 5) When clicking pagination -------------------- */
  const changePage = (p) => {
    const params = new URLSearchParams(location.search);
    params.set("page", p);
    navigate(`/store?${params.toString()}`);
    setPage(p);
    loadProducts({ page: p, q, categoryFilter });
  };

  /* -------------------- 6) When selecting category -------------------- */
  const onSelectCategory = (value) => {
    setCategoryFilter(value);
    const params = new URLSearchParams();

    const cat = categories.find((c) => c.id === value?.id);
    if (cat) params.set("category", cat.slug);
    if (q) params.set("q", q);

    navigate(`/store?${params.toString()}`);
  };

  /* -------------------- 7) Pretty label for active filter -------------------- */
  const getFilterLabel = () => {
    if (!categoryFilter) return "All Products";
    const selected = categories.find((c) => c.id === categoryFilter.id);
    return selected ? selected.name : "All Products";
  };

  const pages = Math.max(1, Math.ceil(productsData.count / 12));

  return (
    <Container fluid className="py-4">
      <Row>
        <Col md={3} className="mb-3">
          <Filter
            onSelectCategory={onSelectCategory}
            selectedCategory={categoryFilter}
          />
        </Col>

        <Col md={9}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="m-0">Store</h4>
          </div>

          {/* Active Filters */}
          <div className="mb-3">
            <h6 className="text-muted mb-0">
              Showing:{" "}
              <Badge bg="dark" className="me-2">
                {getFilterLabel()}
              </Badge>
              {q && <Badge bg="secondary">Search: “{q}”</Badge>}
            </h6>
          </div>

          <Row xs={1} sm={2} md={3} lg={4} className="g-3">
            {loading ? (
              <div className="text-center py-5">Loading…</div>
            ) : productsData.results.length > 0 ? (
              productsData.results.map((product) => (
                <Col key={product.id}>
                  <ProductCard product={product} />
                </Col>
              ))
            ) : (
              <div className="text-center py-5 text-muted">
                No products found.
              </div>
            )}
          </Row>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="text-muted small">
              Page {page} / {pages}
            </div>
            <Pagination>
              <Pagination.Prev
                disabled={!productsData.previous}
                onClick={() => changePage(page - 1)}
              />
              {[...Array(pages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === page}
                  onClick={() => changePage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={!productsData.next}
                onClick={() => changePage(page + 1)}
              />
            </Pagination>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default StorePage;
