// 🌍 Backend base URL (local vs production)
// export const BACKEND_BASE =
//   import.meta.env.MODE === "production"
//     ? "https://uncanny-valley-comics-backend.onrender.com"
//     : "http://127.0.0.1:8000";
export const BACKEND_BASE = window.API_BASE_URL_SHORT;

export const API_BASE = `${BACKEND_BASE}/api`;

export function getCSRFToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];
}

/* ==========================================================
   🔐 TOKEN & AUTH HELPERS
========================================================== */

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

export function saveTokens({ access, refresh }) {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// 🔄 Refresh JWT
export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    console.warn("⚠️ Failed to refresh token");
    clearTokens();
    return null;
  }

  const data = await res.json();
  saveTokens({ access: data.access });
  return data.access;
}

/* ==========================================================
   🔁 UNIVERSAL FETCH WRAPPER
   - Adds Authorization
   - Auto-refreshes expired access token
   - Includes local caching for heavy endpoints
========================================================== */

const CACHE_TTL = 60 * 1000; // 1 minute

function getCache(key) {
  const item = sessionStorage.getItem(key);
  if (!item) return null;

  const parsed = JSON.parse(item);
  if (Date.now() - parsed.timestamp > CACHE_TTL) {
    sessionStorage.removeItem(key);
    return null;
  }
  return parsed.data;
}

function setCache(key, data) {
  sessionStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
}

export async function apiFetch(
  endpoint,
  options = {},
  { cacheKey = null } = {}
) {
  if (cacheKey) {
    const cached = getCache(cacheKey);
    if (cached) return cached;
  }

  let token = getAccessToken();
  const csrfToken = getCSRFToken();

  const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(
    (options.method || "GET").toUpperCase()
  );

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isWrite ? { "X-CSRFToken": getCSRFToken() } : {}),
    "Content-Type": "application/json",
  };

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
        credentials: "include",
      });
    } else {
      throw new Error("Unauthorized — please log in again.");
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }

  const json = res.status === 204 ? {} : await res.json();

  if (cacheKey) setCache(cacheKey, json);
  return json;
}

/* ==========================================================
   👤 AUTH API
========================================================== */

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });

  if (!res.ok) throw new Error("Invalid credentials");

  const data = await res.json();
  saveTokens(data);
  return data;
}

export async function logoutUser() {
  try {
    await fetch(`${API_BASE}/auth/full-logout/`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {}

  clearTokens();
  window.location.replace("/login");
}

export async function fetchCurrentUser() {
  const token = getAccessToken();

  // First try with session cookies (Google login)
  try {
    const res = await fetch(`${API_BASE}/auth/user/`, {
      credentials: "include",
    });

    if (res.ok) {
      return await res.json(); // 🎉 Logged in with session (Google)
    }
  } catch (e) {
    console.error("Session auth failed", e);
  }

  // If no session user, try JWT user
  if (token) {
    const res = await fetch(`${API_BASE}/auth/user/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      const refreshed = await refreshAccessToken();
      return refreshed ? await fetchCurrentUser() : null;
    }

    if (res.ok) return res.json();
  }

  return null;
}

/* ==========================================================
   🛒 CART API
========================================================== */

export const apiGetCart = () => apiFetch("/cart/");

export const apiAddCartItem = (productId, quantity = 1) =>
  apiFetch("/cart/add_item/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity }),
  });

export const apiRemoveCartItem = (itemId) =>
  apiFetch("/cart/remove_item/", {
    method: "POST",
    body: JSON.stringify({ item_id: itemId }),
  });

export const apiIncreaseCartItem = (productId) =>
  apiFetch("/cart/increase_item/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  });

export const apiDecreaseCartItem = (productId) =>
  apiFetch("/cart/decrease_item/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  });

export const apiCartCheckout = (data) =>
  apiFetch("/cart/checkout/", {
    method: "POST",
    body: JSON.stringify(data),
  });

/* ==========================================================
   🛍 PRODUCTS & CATEGORIES
   (Fully optimized caching!)
========================================================== */

export function fetchCategories() {
  return apiFetch("/categories/", {}, { cacheKey: "categories" });
}

export function fetchProducts({
  page = 1,
  category = null,
  subcategory = null,
  q = "",
} = {}) {
  let url = `/products/?page=${page}`;

  if (subcategory) url += `&category=${subcategory}`;
  else if (category) url += `&category__parent=${category}`;
  if (q) url += `&search=${encodeURIComponent(q)}`;

  const cacheKey = `products:${url}`;
  return apiFetch(url, {}, { cacheKey });
}

export function fetchTrendingProducts(parentSlug = null) {
  let url = `/products/?trending=true`;
  if (parentSlug) url += `&category__parent__slug=${parentSlug}`;

  return apiFetch(url, {}, { cacheKey: `trending:${parentSlug || "all"}` });
}

export const fetchProductById = async (id) => {
  const res = await fetch(`${API_BASE}/products/${id}/`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
};

/* ==========================================================
   💳 ORDERS
========================================================== */

export const apiGetOrders = () =>
  apiFetch("/orders/", {}, { cacheKey: "orders" });

export const apiGetOrderDetail = (id) => apiFetch(`/orders/${id}/`);

/* ==========================================================
   🌐 GOOGLE LOGIN
========================================================== */

export async function apiGoogleLoginRedirect() {
  window.location.href = `${BACKEND_BASE}/accounts/google/login/?process=login`;
}

export function completeGoogleLogin(access, refresh) {
  saveTokens({ access, refresh });
  window.location.href = "/";
}

async function waitForPayment(orderId) {
  let tries = 0;

  while (tries < 20) {
    const res = await fetch(`${API_BASE}/orders/status/${orderId}/`);
    const data = await res.json();

    if (data.status === "PAID") {
      window.location.href = "/order-success";
      return;
    }

    if (data.status === "FAILED") {
      window.location.href = "/payment-failed";
      return;
    }

    tries++;
    await new Promise((r) => setTimeout(r, 3000)); // retry after 3s
  }

  window.location.href = "/payment-pending";
}

/* ==========================================================
   ✉️ CONTACT FORM
========================================================== */

export const apiSendMessage = (data) =>
  apiFetch("/contact/send/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const subscribeToMailingList = ({ email, first_name, last_name }) =>
  apiFetch("/contact/subscribe/", {
    method: "POST",
    body: JSON.stringify({ email, first_name, last_name }),
  });
