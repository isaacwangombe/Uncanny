import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Table,
  Form,
  Button,
} from "react-bootstrap";

import {
  getDashboardStats,
  getMonthlySales,
  getSalesOverTime,
  getProfit,
  getProfitOverTime,
  getTopProductsByCategory,
  getOrderStatusSummary,
  getLowStockProducts,
} from "../../apiAdmin";

import { fetchCategories } from "../../api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import "../../styles/admin-theme.css";
import "./DashboardPage.css"; // ⭐ ALL styling goes here now

const COLORS = ["#0d6efd", "#6f42c1", "#198754", "#dc3545", "#fd7e14"];

const DashboardPage = () => {
  const [stats, setStats] = useState({});
  const [profit, setProfit] = useState({});
  const [orderStatus, setOrderStatus] = useState({});
  const [monthlySales, setMonthlySales] = useState([]);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [profitOverTime, setProfitOverTime] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [range, setRange] = useState("30");

  const [loading, setLoading] = useState(true);
  const [parentToChildren, setParentToChildren] = useState({});

  // Load data (global)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [s, m, t, pf, pft, p, os, ls, c] = await Promise.all([
          getDashboardStats(range),
          getMonthlySales(range),
          getSalesOverTime(range),
          getProfit(range),
          getProfitOverTime(range),
          getTopProductsByCategory("", range),
          getOrderStatusSummary(range),
          getLowStockProducts(),
          fetchCategories(),
        ]);

        if (cancelled) return;

        setStats(s || {});
        setMonthlySales(m || []);
        setSalesOverTime(t || []);
        setProfit(pf || {});
        setProfitOverTime(pft || []);
        setTopProducts(p || []);
        setOrderStatus(os || {});
        setLowStock(ls || []);
        setCategories(c || []);

        const map = {};
        c.forEach((cat) => {
          if (cat.parent !== null) {
            if (!map[cat.parent]) map[cat.parent] = [];
            map[cat.parent].push(cat.id);
          }
        });
        setParentToChildren(map);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => (cancelled = true);
  }, [range]);

  // Top products update
  useEffect(() => {
    let cancelled = false;

    async function loadTop() {
      try {
        if (!categoryFilter) {
          const res = await getTopProductsByCategory("", range);
          if (!cancelled) setTopProducts(res || []);
          return;
        }
        const children = parentToChildren[categoryFilter] || [];
        const filterIds = children.length ? children.join(",") : categoryFilter;
        const res = await getTopProductsByCategory(filterIds, range);
        if (!cancelled) setTopProducts(res || []);
      } catch (e) {
        console.error(e);
      }
    }

    loadTop();
    return () => (cancelled = true);
  }, [categoryFilter, parentToChildren, range]);

  const mainCategories = categories.filter((c) => c.parent === null);

  // Loader splash
  if (loading) {
    return (
      <div className="dashboard-loading-screen">
        <Card className="dashboard-loading-card">
          <Spinner animation="border" />
          <div>
            <div className="dashboard-loading-title">Refreshing dashboard…</div>
            <div className="dashboard-loading-sub">Applying date filter</div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Container fluid className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header container-fluid px-0">
          <div className="row align-items-start align-items-md-center gy-3">
            {/* Left: Title + Subtitle */}
            <div className="col-12 col-md-auto">
              <h3 className="dashboard-title mb-1">Admin Dashboard</h3>
              <div className="dashboard-subtitle">
                Overview — {range === "all" ? "All time" : `Last ${range} days`}
              </div>
            </div>

            {/* Right: Controls */}
            <div className="col-12 col-md d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-md-end gap-2">
              {/* Date range first on mobile */}
              <Form.Select
                className="dashboard-range-select w-100 w-md-auto"
                value={range}
                onChange={(e) => setRange(e.target.value)}
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last 1 Year</option>
                <option value="all">All Time</option>
              </Form.Select>

              {/* Last updated */}
              <div className="dashboard-pill text-nowrap">
                Last updated: <strong>{new Date().toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Top metrics */}
        <Row className="g-3 mb-4">
          {[
            {
              label: "Revenue",
              value: profit?.revenue ?? 0,
              sub: "Total sales in the selected period",
            },
            {
              label: "Profit",
              value: profit?.profit ?? 0,
              sub: "Net profit (revenue − cost)",
            },
            {
              label: "Total Orders",
              value: stats?.total_orders ?? 0,
              sub: "Paid orders",
            },
            {
              label: "Total Users",
              value: stats?.total_users ?? 0,
              sub: "New users in period",
            },
          ].map((m, i) => (
            <Col md={3} key={i}>
              <Card className="dashboard-card hover-lift">
                <Card.Body>
                  <div className="metric-label">{m.label}</div>
                  <div className="metric-value">
                    {typeof m.value === "number"
                      ? m.value.toLocaleString()
                      : m.value}
                  </div>
                  <div className="metric-sub">{m.sub}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Order status */}
        <Row className="g-3 mb-4">
          {Object.entries(orderStatus).map(([status, count]) => (
            <Col md={2} key={status}>
              <Card className="dashboard-card text-center">
                <Card.Body>
                  <div className="status-label">{status.replace("_", " ")}</div>
                  <div className="status-value">{count}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Sales + Profit charts */}
        <Row className="g-3 mb-4">
          {/* Sales */}
          <Col md={6} className="chart-wrapper">
            <Card className="dashboard-card">
              <Card.Body>
                <div className="chart-header">
                  <span>Sales Over Time</span>
                  <span className="chart-sub">Cumulative</span>
                </div>

                <div className="chart-area">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minHeight={300}
                  >
                    <LineChart data={salesOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="cumulative_total"
                        stroke="#0d6efd"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Profit */}
          <Col md={6} className="chart-wrapper">
            <Card className="dashboard-card">
              <Card.Body>
                <div className="chart-header">
                  <span>Profit Over Time</span>
                  <span className="chart-sub">Cumulative</span>
                </div>

                <div className="chart-area">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minHeight={300}
                  >
                    <LineChart data={profitOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="cumulative_profit"
                        stroke="#198754"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Top products + Monthly sales */}
        <Row className="g-3 mb-4">
          {/* Top products */}
          <Col md={4} className="chart-wrapper">
            <Card className="dashboard-card">
              <Card.Body>
                <div className="chart-header">
                  <span>Top Products</span>
                  <span className="chart-sub">By sales count</span>
                </div>

                <Form.Select
                  className="dashboard-category-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {mainCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Form.Select>

                <div className="chart-area-small">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minHeight={300}
                  >
                    <PieChart>
                      <Pie
                        data={topProducts}
                        dataKey="sales_count"
                        nameKey="title"
                        outerRadius={92}
                      >
                        {topProducts.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <details className="legend-box">
                  <summary>Legend</summary>

                  <ul className="legend-list">
                    {topProducts.map((p, i) => (
                      <li key={p.id}>
                        <span
                          className="legend-color"
                          style={{ background: COLORS[i % COLORS.length] }}
                        ></span>
                        {p.title}
                        <span className="legend-count">{p.sales_count}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </Card.Body>
            </Card>
          </Col>

          {/* Monthly Sales */}
          <Col md={8} className="chart-wrapper">
            <Card className="dashboard-card">
              <Card.Body>
                <div className="chart-header">
                  <span>Monthly Sales</span>
                  <span className="chart-sub">Totals by month</span>
                </div>

                <div className="chart-area">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minHeight={300}
                  >
                    <BarChart data={monthlySales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="total"
                        fill="#6f42c1"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Low stock */}
        <Row className="g-3 mb-4">
          <Col md={6} className="chart-wrapper">
            <Card className="dashboard-card">
              <Card.Body>
                <div className="lowstock-header">
                  <span>Low Stock Products</span>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={async () => {
                      setLoading(true);
                      const ls = await getLowStockProducts();
                      setLowStock(ls || []);
                      setLoading(false);
                    }}
                  >
                    Refresh
                  </Button>
                </div>

                <Table hover responsive className="lowstock-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Stock</th>
                      <th>Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.length ? (
                      lowStock.map((p) => (
                        <tr key={p.id}>
                          <td className="truncate-cell">{p.title}</td>
                          <td>{p.stock}</td>
                          <td>{p.sales_count}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-muted">
                          No low-stock products 🎉
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardPage;
