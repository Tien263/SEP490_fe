import { useMemo, useState } from 'react'
import { Camera, ChevronRight, Eye, EyeOff, Mail, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const profileTabs = [{ id: 'info', label: 'Thông tin cá nhân', icon: User }]

function ToggleRow({ checked, label, onToggle }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-gray-900' : 'bg-gray-200'}`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`}
        />
      </button>
    </div>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [notifications, setNotifications] = useState({
    orderConfirm: true,
    shipStatus: true,
    vatInvoice: false,
    promotions: true,
  })

  const userName = user?.fullName || 'Nguyễn Văn A'
  const userEmail = user?.email || 'nguyen.van.a@company.com'
  const userPhone = user?.phoneNumber || '0901 234 567'
  const userInitial = userName.charAt(0).toUpperCase()

  const personalFields = useMemo(
    () => [
      { label: 'Họ tên', value: userName },
      { label: 'Số điện thoại', value: userPhone },
      { label: 'Email', value: userEmail },
      { label: 'Địa chỉ mặc định', value: '123 Nguyễn Huệ, Q.1, TP.HCM' },
    ],
    [userEmail, userName, userPhone],
  )

  const passwordFields = [
    {
      label: 'Mật khẩu hiện tại',
      show: showCurrent,
      onToggle: () => setShowCurrent((value) => !value),
    },
    {
      label: 'Mật khẩu mới',
      show: showNew,
      onToggle: () => setShowNew((value) => !value),
    },
    {
      label: 'Xác nhận mật khẩu mới',
      show: showConfirm,
      onToggle: () => setShowConfirm((value) => !value),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20">
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-gray-900">
                Trang Chủ
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-gray-900">Tài khoản của tôi</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <aside className="lg:w-60 lg:flex-shrink-0">
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white lg:sticky lg:top-24">
                <div className="border-b border-gray-100 bg-gray-50 px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{userName}</p>
                      <p className="truncate text-xs text-gray-500">{userEmail}</p>
                    </div>
                  </div>
                </div>

                <nav className="py-2">
                  {profileTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className="flex w-full items-center gap-3 bg-gray-900 px-4 py-2.5 text-left text-sm text-white"
                    >
                      <tab.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{tab.label}</span>
                      <ChevronRight className="ml-auto h-3.5 w-3.5 flex-shrink-0" />
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            <main className="min-w-0 flex-1">
              <div className="mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-700" />
                <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                <section className="rounded-2xl border border-gray-100 bg-white p-6">
                  <h3 className="mb-5 text-base font-semibold text-gray-900">Thông tin cơ bản</h3>
                  <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-start">
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-900 text-2xl font-bold text-white">
                        {userInitial}
                      </div>
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-gray-50"
                      >
                        <Camera className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>

                    <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                      {personalFields.map((field) => (
                        <div key={field.label}>
                          <label className="mb-1 block text-xs text-gray-500">{field.label}</label>
                          <Input defaultValue={field.value} className="rounded-xl text-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="rounded-full bg-gray-900 text-sm text-white hover:bg-gray-800">Lưu thông tin</Button>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-white p-6">
                  <h3 className="mb-5 text-base font-semibold text-gray-900">Đổi mật khẩu</h3>
                  <div className="max-w-sm space-y-4">
                    {passwordFields.map((field) => (
                      <div key={field.label}>
                        <label className="mb-1 block text-xs text-gray-500">{field.label}</label>
                        <div className="relative">
                          <Input
                            type={field.show ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="rounded-xl pr-10 text-sm"
                          />
                          <button
                            type="button"
                            onClick={field.onToggle}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                          >
                            {field.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <Button className="rounded-full bg-gray-900 text-sm text-white hover:bg-gray-800">Cập nhật mật khẩu</Button>
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-white p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-700" />
                    <h3 className="text-base font-semibold text-gray-900">Thông báo email</h3>
                  </div>
                  <div className="space-y-4">
                    <ToggleRow
                      checked={notifications.orderConfirm}
                      label="Nhận email xác nhận đơn hàng"
                      onToggle={() => setNotifications((value) => ({ ...value, orderConfirm: !value.orderConfirm }))}
                    />
                    <ToggleRow
                      checked={notifications.shipStatus}
                      label="Nhận email trạng thái giao hàng"
                      onToggle={() => setNotifications((value) => ({ ...value, shipStatus: !value.shipStatus }))}
                    />
                    <ToggleRow
                      checked={notifications.vatInvoice}
                      label="Nhận email hóa đơn VAT"
                      onToggle={() => setNotifications((value) => ({ ...value, vatInvoice: !value.vatInvoice }))}
                    />
                    <ToggleRow
                      checked={notifications.promotions}
                      label="Nhận email khuyến mãi"
                      onToggle={() => setNotifications((value) => ({ ...value, promotions: !value.promotions }))}
                    />
                  </div>
                </section>
              </motion.div>
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
