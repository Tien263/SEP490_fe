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
