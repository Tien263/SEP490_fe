import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute.jsx'

/**
 * Sheet: FE-Components — L1-FCMP-01..02 (ProtectedRoute role gating).
 * Mock useAuth để cô lập component khỏi network/localStorage.
 */
const mockUseAuth = vi.fn()
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderAt(initialPath, element) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Trang đăng nhập</div>} />
        <Route path="/" element={<div>Trang chủ</div>} />
        <Route path={initialPath} element={element} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('L1-FCMP · ProtectedRoute', () => {
  // L1-FCMP-01 | BC-TRUE | Chưa đăng nhập vào route được bảo vệ -> chuyển sang /login
  it('L1-FCMP-01 người dùng chưa đăng nhập bị chuyển về /login, nội dung được bảo vệ không render', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false, isAuthenticated: false })

    renderAt('/checkout', (
      <ProtectedRoute>
        <div>Nội dung thanh toán</div>
      </ProtectedRoute>
    ))

    expect(screen.getByText('Trang đăng nhập')).toBeInTheDocument()
    expect(screen.queryByText('Nội dung thanh toán')).not.toBeInTheDocument()
  })

  // L1-FCMP-02 | EP-Invalid | Vai trò Customer mở cổng kho -> bị chặn, không thấy nội dung kho
  it('L1-FCMP-02 vai trò Customer không vào được route dành cho WarehouseStaff', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'U1', role: 'Customer' },
      loading: false,
      isAuthenticated: true,
    })

    renderAt('/warehouse', (
      <ProtectedRoute allowedRoles={['WarehouseStaff']}>
        <div>Cổng quản lý kho</div>
      </ProtectedRoute>
    ))

    expect(screen.queryByText('Cổng quản lý kho')).not.toBeInTheDocument()
    expect(screen.getByText('Trang chủ')).toBeInTheDocument()
  })

  // Nhánh hợp lệ: đúng vai trò thì nội dung được render bình thường
  it('L1-FCMP-02 vai trò đúng thì nội dung được bảo vệ hiển thị', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'W1', role: 'WarehouseStaff' },
      loading: false,
      isAuthenticated: true,
    })

    renderAt('/warehouse', (
      <ProtectedRoute allowedRoles={['WarehouseStaff']}>
        <div>Cổng quản lý kho</div>
      </ProtectedRoute>
    ))

    expect(screen.getByText('Cổng quản lý kho')).toBeInTheDocument()
  })
})
