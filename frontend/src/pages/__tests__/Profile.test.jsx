import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../../context/AuthContext.jsx'
import Profile from '../Profile.jsx'

function renderProfile(initialEntry = '/profile') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('Profile', () => {
  it('updates tax information after saving MST details', async () => {
    renderProfile('/profile?tab=tax')

    fireEvent.click(screen.getByRole('button', { name: /Chỉnh sửa/i }))

    fireEvent.change(screen.getByDisplayValue('0123456789'), { target: { value: '9876543210' } })
    fireEvent.change(screen.getByDisplayValue('Công ty TNHH Văn Phòng ABC'), { target: { value: 'Demo XYZ' } })
    fireEvent.change(screen.getByDisplayValue('123 Nguyễn Huệ, Q.1, TP.HCM'), { target: { value: '88 Lê Lợi, Q.1' } })
    fireEvent.change(screen.getByDisplayValue('invoice@company.com'), { target: { value: 'ketoan@demo.vn' } })

    fireEvent.click(screen.getByRole('button', { name: /^Lưu$/i }))

    expect(screen.getByText('9876543210')).toBeInTheDocument()
    expect(screen.getByText('Demo XYZ')).toBeInTheDocument()
    expect(screen.getByText('88 Lê Lợi, Q.1')).toBeInTheDocument()
    expect(screen.getByText('ketoan@demo.vn')).toBeInTheDocument()
    expect(screen.getByText(/Lưu thông tin MST thành công/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /^Lưu$/i })).not.toBeInTheDocument()
    })
  })

  it('filters order history by search keyword', () => {
    renderProfile('/profile?tab=orders')

    fireEvent.change(screen.getByPlaceholderText(/Tìm theo mã đơn hoặc sản phẩm/i), {
      target: { value: 'VT-2024-10039' },
    })

    expect(screen.getByText('VT-2024-10039')).toBeInTheDocument()
    expect(screen.queryByText('VT-2024-10042')).not.toBeInTheDocument()
  })
})
