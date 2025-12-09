import axios from "axios";
import {
  API_BASE,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  refreshAccessToken,
  apiFetch,
} from "./api"; //

// 🌍 Backend base URL (auto-switch local vs production)
// export const BACKEND_BASE =
//   import.meta.env.MODE === "production"
//     ? "https://uncanny-valley-comics-backend.onrender.com"
//     : "http://127.0.0.1:8000";

export const BACKEND_BASE = window.API_BASE_URL_SHORT;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Login failed");
  }

  const data = await res.json();
  saveTokens(data);
  return data;
}

export async function logoutUser() {
  await fetch(`${API_BASE}/auth/logout/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  clearTokens();
  window.location.href = "/"; // 🔽 Redirect after logout
}
/* ==========================================================
📊 DASHBOARD ENDPOINTS — FIXED & RANGE-AWARE
========================================================== */

export const getDashboardStats = (range = "30") =>
  apiFetch(`/admin/analytics/stats/?range=${range}`);

export const getMonthlySales = (range = "30") =>
  apiFetch(`/admin/analytics/monthly_sales/?range=${range}`);

export const getSalesOverTime = (range = "30") =>
  apiFetch(`/admin/analytics/sales_over_time/?range=${range}`);

export const getProfitOverTime = (range = "30") =>
  apiFetch(`/admin/analytics/profit_over_time/?range=${range}`);

export const getProfit = (range = "30") =>
  apiFetch(`/admin/analytics/profit/?range=${range}`);

export const getOrderStatusSummary = (range = "30") =>
  apiFetch(`/admin/analytics/order_status_summary/?range=${range}`);

export const getTopProductsByCategory = (catId = "", range = "30") =>
  apiFetch(
    `/admin/analytics/top_products_by_category/?category=${catId}&range=${range}`
  );

export const getLowStockProducts = () => apiFetch(`/products/low_stock/`);

/* ==========================================================
   🛍️ PRODUCTS
========================================================== */
export const getProducts = async () => apiFetch("/products/");

export async function apiAddProduct(data) {
  return apiFetch("/products/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiEditProduct(id, data) {
  return apiFetch(`/products/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id) {
  return apiFetch(`/products/${id}/`, { method: "DELETE" });
}

export async function bulkUploadProducts(excelFile, zipFile = null) {
  const formData = new FormData();
  formData.append("excel_file", excelFile);
  if (zipFile) formData.append("images_zip", zipFile);

  const res = await fetch(`${API_BASE}/products/bulk-upload/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Bulk upload failed.");
  return data;
}

export async function bulkDeleteProducts(ids) {
  const token = getAccessToken(); // ✔ Correct

  const res = await fetch(`${API_BASE}/products/bulk-delete/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) throw new Error("Bulk delete failed");
  return res.json();
}

export async function deleteAllProducts() {
  const token = getAccessToken();

  const res = await fetch(`${API_BASE}/products/delete-all/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Delete-all failed: " + text);
  }

  return res.json();
}

export async function downloadAllProductsCSV() {
  const token = getAccessToken();

  const res = await fetch(`${API_BASE}/products/download-csv/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!res.ok) throw new Error("Failed to download product CSV");

  return res.blob(); // caller will trigger download
}

export const toggleProductTrending = async (id) =>
  apiFetch(`/products/${id}/toggle_trending/`, { method: "POST" });

export async function uploadProductImage(productId, file) {
  const formData = new FormData();
  formData.append("product", productId);
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/product-images/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: formData,
  });

  if (!res.ok) throw new Error("Image upload failed");
  return res.json();
}

export async function deleteProductImage(imageId) {
  return apiFetch(`/product-images/${imageId}/`, { method: "DELETE" });
}

export const downloadSampleExcel = async () => {
  const token = getAccessToken();

  const res = await fetch(`${API_BASE}/products/download-sample-excel/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to download Excel sample");
  }

  const blob = await res.blob();
  return blob;
};

/* ==========================================================
   🗂️ CATEGORIES
========================================================== */
export const getCategories = async () => apiFetch("/categories/");

export async function createCategory(data) {
  return apiFetch("/categories/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id, data) {
  return apiFetch(`/categories/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id) {
  return apiFetch(`/categories/${id}/`, { method: "DELETE" });
}

export async function uploadCategoryImage(categoryId, file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/categories/${categoryId}/`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload category image");
  return res.json();
}

export async function deleteCategoryImage(categoryId) {
  return apiFetch(`/categories/${categoryId}/delete-image/`, {
    method: "DELETE",
  });
}

/* ==========================================================
   👥 USER ADMIN
========================================================== */
export const getUsers = async () => apiFetch("/admin/users/");
export const toggleStaff = async (id) =>
  apiFetch(`/admin/users/${id}/toggle_staff/`, { method: "POST" });
export const promoteToOwner = async (id) =>
  apiFetch(`/admin/users/${id}/promote_to_owner/`, { method: "POST" });

export const adminGetMessages = () => apiFetch("/contact/admin/messages/");
export const adminGetMailingList = () =>
  apiFetch("/contact/admin/mailing-list/");

export const adminEmailBlast = (subject, body, emails) =>
  apiFetch("/contact/admin/email-blast/", {
    method: "POST",
    body: JSON.stringify({ subject, body, emails }),
  });

export const adminReplyToMessage = (id, body) =>
  apiFetch(`/contact/admin/message/${id}/reply/`, {
    method: "POST",
    body: JSON.stringify({
      subject: "Re: Your message to Uncanny Valley",
      body,
    }),
  });

export const removeFromMailingList = (id) =>
  apiFetch(`/contact/admin/mailing-list/${id}/`, {
    method: "DELETE",
  });

export const adminDeleteSubscriber = (id) =>
  apiFetch(`/contact/admin/mailing-list/${id}/delete/`, {
    method: "DELETE",
  });

/* ==========================================================
   🎫 EVENT TICKET ADMIN SCANNING
========================================================== */

export async function adminVerifyTicket(uuid) {
  return apiFetch(`/events/verify/${uuid}/`);
}

export async function adminScanTicket(uuid) {
  return apiFetch(`/events/scan/${uuid}/`);
}
