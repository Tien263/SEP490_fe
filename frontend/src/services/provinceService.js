// ─── Province / District / Ward API (public) ────────────────────────────────
// Nguồn: https://provinces.open-api.vn/api/
// FE gọi trực tiếp — không qua backend.

const PROVINCE_API = 'https://provinces.open-api.vn/api'

/**
 * Lấy danh sách tỉnh/thành phố.
 * @returns {Promise<Array<{ code: number, name: string }>>}
 */
export async function getProvinces() {
  const res = await fetch(`${PROVINCE_API}/p/`)
  if (!res.ok) throw new Error('Không thể tải danh sách tỉnh/thành phố')
  return res.json()
}

/**
 * Lấy danh sách quận/huyện theo tỉnh.
 * @param {number|string} provinceCode
 * @returns {Promise<Array<{ code: number, name: string }>>}
 */
export async function getDistricts(provinceCode) {
  if (!provinceCode) return []
  const res = await fetch(`${PROVINCE_API}/p/${provinceCode}?depth=2`)
  if (!res.ok) throw new Error('Không thể tải danh sách quận/huyện')
  const data = await res.json()
  return data.districts || []
}

/**
 * Lấy danh sách phường/xã theo quận/huyện.
 * @param {number|string} districtCode
 * @returns {Promise<Array<{ code: number, name: string }>>}
 */
export async function getWards(districtCode) {
  if (!districtCode) return []
  const res = await fetch(`${PROVINCE_API}/d/${districtCode}?depth=2`)
  if (!res.ok) throw new Error('Không thể tải danh sách phường/xã')
  const data = await res.json()
  return data.wards || []
}
