const API_BASE = '/api';

async function request(method, url, body) {
  const accessToken = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json' };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || `Lỗi ${res.status}`);
  }

  return json;
}

export async function getWarehouseOrders(tabType, pageNumber = 1, pageSize = 10) {
  return request('GET', `/warehouse/orders?tabType=${tabType}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
}

export async function getWarehouseOrderDetail(orderId) {
  return request('GET', `/warehouse/orders/${orderId}/detail`);
}

export async function acceptWarehouseOrder(orderId) {
  return request('POST', `/warehouse/orders/${orderId}/accept`);
}

export async function reportShortage(orderId, data) {
  return request('POST', `/warehouse/orders/${orderId}/shortage-alert`, data);
}

// ─── Advanced Warehouse (v6.0) ───────────────────────────────────────────────

export async function completePickTask(id, imageFile) {
  const formData = new FormData();
  formData.append('imageProof', imageFile);
  // Need to use fetchFormDataWithToken instead of request
  // Let's import fetchFormDataWithToken at the top of warehouseService or just use fetch here
  const accessToken = localStorage.getItem('accessToken');
  const headers = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}/pick-tasks/${id}/complete`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error(`Lỗi ${res.status}`);
  return res.json();
}

export async function createStockTransfer(data) {
  return request('POST', `/stock-transfers`, data);
}

export async function dispatchStockTransfer(id) {
  return request('POST', `/stock-transfers/${id}/dispatch`);
}

export async function receiveStockTransfer(id) {
  return request('POST', `/stock-transfers/${id}/receive`);
}

export async function warehouseConfirmHandover(id) {
  return request('POST', `/handover-records/${id}/warehouse-confirm`);
}

export async function salesConfirmHandover(id) {
  return request('POST', `/handover-records/${id}/sales-confirm`);
}

export async function postGoodsIssue(id) {
  return request('POST', `/goods-issues/${id}/post`);
}

export async function postProductionMaterialIssue(id, file) {
  const formData = new FormData();
  formData.append('signedProof', file);
  const accessToken = localStorage.getItem('accessToken');
  const headers = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}/production-material-issues/${id}/post`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error(`Lỗi ${res.status}`);
  return res.json();
}

export async function createStockCountSession(data) {
  return request('POST', `/stock-counts`, data);
}

export async function submitStockCount(id, data) {
  return request('POST', `/stock-counts/${id}/submit`, data);
}

export async function ceoDecisionStockAdjustment(id, data) {
  return request('POST', `/stock-adjustments/${id}/decision`, data);
}
