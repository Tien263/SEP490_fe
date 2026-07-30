import { describe, expect, it } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/msw/server.js'
import { cartWith } from '../../test/msw/handlers.js'
import { AuthProvider, useAuth } from '../AuthContext.jsx'
import { CartProvider, useCart } from '../CartContext.jsx'

/**
 * Sheet: FE-Contexts — L1-FEC-03..04 (CartContext).
 */
const wrapper = ({ children }) => (
  <AuthProvider>
    <CartProvider>{children}</CartProvider>
  </AuthProvider>
)

function useAuthAndCart() {
  return { auth: useAuth(), cart: useCart() }
}

describe('L1-FEC · CartContext', () => {
  // L1-FEC-03 | EP-Valid | addToCart cập nhật state giỏ và số lượng
  it('L1-FEC-03 addToCart cập nhật giỏ hàng và tổng số lượng', async () => {
    server.use(http.post('/api/cart/items', () => HttpResponse.json(cartWith('P1', 2))))
    const { result } = renderHook(() => useAuthAndCart(), { wrapper })

    await act(async () => {
      await result.current.auth.login('a@test.com', 'P@ss123')
    })
    await waitFor(() => expect(result.current.auth.isAuthenticated).toBe(true))

    await act(async () => {
      await result.current.cart.addToCart('P1', 2)
    })

    await waitFor(() => expect(result.current.cart.cart?.items).toHaveLength(1))
    expect(result.current.cart.cart.items[0]).toMatchObject({ productId: 'P1', quantity: 2 })
    expect(result.current.cart.cart.totalItems).toBe(2)
  })

  // L1-FEC-04 | BC-TRUE | Khách VÃNG LAI thêm giỏ -> chuyển sang /login VÀ GIỮ LẠI sản phẩm định mua
  //
  // 🔴 SPEC GAP v2.2: CartContext.addToCart chỉ ném Error('Vui lòng đăng nhập...') khi chưa đăng nhập.
  // Nó KHÔNG điều hướng sang /login và KHÔNG lưu sản phẩm khách định mua, nên sau khi đăng nhập
  // khách phải tự tìm lại sản phẩm. FT-01 AC-05/NAC-05 yêu cầu giữ lại ý định mua.
  // Test ĐỎ cho tới khi bổ sung lưu pending product + điều hướng.
  it('L1-FEC-04 khách vãng lai thêm giỏ thì giữ lại sản phẩm định mua để tự thêm sau khi đăng nhập', async () => {
    const { result } = renderHook(() => useAuthAndCart(), { wrapper })
    expect(result.current.auth.isAuthenticated).toBe(false)

    await act(async () => {
      await result.current.cart.addToCart('P1', 1).catch(() => {})
    })

    const pending =
      localStorage.getItem('pendingCartItem') ??
      sessionStorage.getItem('pendingCartItem') ??
      localStorage.getItem('intendedProduct')

    expect(pending, 'sản phẩm khách định mua phải được lưu lại để thêm tự động sau khi đăng nhập')
      .toBeTruthy()
    expect(pending).toContain('P1')
  })
})
