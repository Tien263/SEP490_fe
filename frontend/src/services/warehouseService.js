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

export async function consolidateWarehouseOrder(orderId) {
  return request('POST', `/warehouse/orders/${orderId}/consolidate`);
}

export async function handoverWarehouseOrder(orderId, signature) {
  return request('POST', `/warehouse/orders/${orderId}/handover`, { signature });
}

export async function postGoodsIssueWarehouseOrder(orderId) {
  return request('POST', `/warehouse/orders/${orderId}/goods-issue`);
}

export async function reportShortage(orderId, data) {
  return request('POST', `/warehouse/orders/${orderId}/shortage-alert`, data);
}

// ─── Advanced Warehouse (v6.0) ───────────────────────────────────────────────

export async function getPickTasks() {
  return request('GET', `/warehouse/orders?tabType=InProgress`);
}

export async function getPickTaskById(id) {
  return request('GET', `/warehouse/orders/${id}/detail`);
}

export async function completePickTask(id, imageFile) {
  // WarehouseController CompletePickTask uses POST /warehouse/orders/{id}/complete-pick
  const formData = new FormData();
  if (imageFile) formData.append('imageProof', imageFile);
  const accessToken = localStorage.getItem('accessToken');
  const headers = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}/warehouse/orders/${id}/complete-pick`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error(`Lỗi ${res.status}`);
  return res.json();
}

export async function getStockTransfers(status) {
  return request('GET', `/stock-transfers?status=${status || ''}`);
}

export async function getStockTransferById(id) {
  return request('GET', `/stock-transfers/${id}`);
}

export async function createStockTransfer(data) {
  return request('POST', `/stock-transfers`, data);
}

export async function dispatchStockTransfer(id) {
  return request('POST', `/stock-transfers/${id}/dispatch`);
}

export async function cancelStockTransfer(id) {
  return request('POST', `/stock-transfers/${id}/cancel`);
}

export async function receiveStockTransfer(id, formData) {
  const accessToken = localStorage.getItem('accessToken');
  const headers = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}/stock-transfers/${id}/receive`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Lỗi ${res.status}`);
  }
  return res.json();
}

export async function getHandoverById(id) {
  return request('GET', `/handover-records/${id}`);
}

export async function createHandover(data) {
  return request('POST', `/handover-records`, data);
}

export async function warehouseConfirmHandover(id) {
  return request('POST', `/handover-records/${id}/warehouse-confirm`);
}

export async function salesConfirmHandover(id) {
  return request('POST', `/handover-records/${id}/sales-confirm`);
}

export async function getGoodsIssues(type) {
  return request('GET', `/goods-issues?type=${type || ''}`);
}

export async function getGoodsIssueById(id) {
  return request('GET', `/goods-issues/${id}`);
}

export async function createGoodsIssue(data) {
  return request('POST', `/goods-issues`, data);
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

export async function getWarehouseInventory(warehouseId, params) {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/inventory/${warehouseId}?${qs}`);
}

export async function adjustInventory(inventoryId, data) {
  return request('PUT', `/inventory/${inventoryId}/adjust`, data);
}

export async function addInventory(data) {
  return request('POST', `/inventory/add`, data);
}

// Dummy for backward compatibility with WarehouseStockAdjustment
export async function ceoDecisionStockAdjustment(id, data) {
  return request('POST', `/stock-adjustments/${id}/decision`, data);
}

// ==========================================
// WAREHOUSE MANAGEMENT (CEO)
// ==========================================

export async function getWarehouses() {
  return request('GET', `/warehouse-management`);
}

export async function getWarehouse(id) {
  return request('GET', `/warehouse-management/${id}`);
}

export async function createWarehouse(data) {
  return request('POST', `/warehouse-management`, data);
}

export async function updateWarehouse(id, data) {
  return request('PUT', `/warehouse-management/${id}`, data);
}

export async function deleteWarehouse(id) {
  return request('DELETE', `/warehouse-management/${id}`);
}

export async function getStaffUsers() {
  return request('GET', `/warehouse-management/staff`);
}
