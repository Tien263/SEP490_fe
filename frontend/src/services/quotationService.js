const API_BASE = '/api';


async function fetchWithToken(method, url, body) {
  const accessToken = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new Error(json.message || `Lỗi ${res.status}`);
  }
  return json;
}

export async function createFromCart(generalNote) {
  return fetchWithToken('POST', '/Quotation/from-cart', { generalNote });
}

export async function getQuotations() {
  return fetchWithToken('GET', '/Quotation');
}

export async function getQuotationById(id) {
  return fetchWithToken('GET', `/Quotation/${id}`);
}

export async function pickUpQuotation(id) {
  return fetchWithToken('POST', `/Quotation/${id}/pickup`);
}

export async function updateProposedPrice(id, payload) {
  return fetchWithToken('PUT', `/Quotation/${id}/propose-price`, payload);
}

export async function acceptQuotation(id) {
  return fetchWithToken('POST', `/Quotation/${id}/accept`);
}

export async function rejectQuotation(id) {
  return fetchWithToken('POST', `/Quotation/${id}/reject`);
}

export async function adminApproveQuotation(id) {
  return fetchWithToken('POST', `/Quotation/${id}/admin-approve`);
}

export async function adminRejectQuotation(id) {
  return fetchWithToken('POST', `/Quotation/${id}/admin-reject`);
}

export async function getMessages(id) {
  return fetchWithToken('GET', `/Quotation/${id}/messages`);
}
