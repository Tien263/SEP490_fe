import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Building2,
  Camera,
  ChevronRight,
  Download,
  Edit2,
  Eye,
  EyeOff,
  ExternalLink,
  Mail,
  MapPin,
  Package,
  Plus,
  Search,
  Trash2,
  User,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Link, useSearchParams } from 'react-router-dom'
import AddressModal, { buildFullAddress, emptyAddressForm } from '../components/AddressModal.jsx'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import SuccessToast from '../components/SuccessToast.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { isVatExpired, orders, paymentStatusMeta, shippingStatusMeta } from '../data/orders.js'
import { formatPrice } from '../data/products.js'

const profileTabs = [
  { id: 'info', label: 'Thông tin cá nhân', icon: User },
  { id: 'addresses', label: 'Địa chỉ giao hàng', icon: MapPin },
  { id: 'tax', label: 'Thông tin MST', icon: Building2 },
  { id: 'orders', label: 'Lịch sử đơn hàng', icon: Package },
]

const mockAddresses = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    phone: '0901 234 567',
    city: 'TP.HCM',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    addressLine: '123 Nguyễn Huệ',
    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    type: 'Công ty',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Nguyễn Văn A',
    phone: '0901 234 567',
    city: 'TP.HCM',
    district: 'Quận Gò Vấp',
    ward: 'Phường 2',
    addressLine: '456 Lê Lợi',
    address: '456 Lê Lợi, Phường 2, Quận Gò Vấp, TP.HCM',
    type: 'Nhà riêng',
    isDefault: false,
  },
  {
    id: '3',
    name: 'Kho Hàng A',
    phone: '0901 234 568',
    city: 'TP.HCM',
    district: 'Bình Chánh',
    ward: '',
    addressLine: '789 Quốc Lộ 1A',
    address: '789 Quốc Lộ 1A, Bình Chánh, TP.HCM',
    type: 'Kho hàng',
    isDefault: false,
  },
]

const defaultTaxInfo = {
  taxCode: '0123456789',
  companyName: 'Công ty TNHH Văn Phòng ABC',
  companyAddress: '123 Nguyễn Huệ, Q.1, TP.HCM',
  invoiceEmail: 'invoice@company.com',
  representative: 'Nguyễn Văn A',
  companyPhone: '028 3822 1234',
}

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

function PersonalInfoTab({ userName, userEmail, userPhone, userInitial, onSuccess }) {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [notifications, setNotifications] = useState({
    orderConfirm: true,
    shipStatus: true,
    vatInvoice: false,
    promotions: true,
  })

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
    <div className="space-y-6">
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
        <Button
          className="rounded-full bg-gray-900 text-sm text-white hover:bg-gray-800"
          onClick={() => onSuccess('Lưu thông tin cá nhân thành công')}
        >
          Lưu thông tin
        </Button>
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
          <Button
            className="rounded-full bg-gray-900 text-sm text-white hover:bg-gray-800"
            onClick={() => onSuccess('Thay đổi mật khẩu thành công')}
          >
            Cập nhật mật khẩu
          </Button>
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
    </div>
  )
}

function AddressesTab({ onSuccess }) {
  const [addresses, setAddresses] = useState(mockAddresses)
  const [showModal, setShowModal] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressForm, setAddressForm] = useState(emptyAddressForm)

  function setDefaultAddress(id) {
    setAddresses((items) => items.map((item) => ({ ...item, isDefault: item.id === id })))
  }

  function removeAddress(id) {
    setAddresses((items) => items.filter((item) => item.id !== id))
    onSuccess('Xóa địa chỉ thành công')
  }

  function handleAddressFormChange(key, value) {
    setAddressForm((current) => ({ ...current, [key]: value }))
  }

  function openCreateModal() {
    setEditingAddressId(null)
    setAddressForm({ ...emptyAddressForm })
    setShowModal(true)
  }

  function openEditModal(address) {
    setEditingAddressId(address.id)
    setAddressForm({
      id: address.id,
      name: address.name,
      phone: address.phone,
      city: address.city,
      district: address.district,
      ward: address.ward,
      addressLine: address.addressLine,
      type: address.type,
      isDefault: address.isDefault,
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingAddressId(null)
    setAddressForm({ ...emptyAddressForm })
  }

  function handleSubmitAddress(event) {
    event.preventDefault()

    const nextAddress = {
      ...addressForm,
      id: editingAddressId || `${Date.now()}`,
      type: editingAddressId ? addressForm.type : 'Nhà riêng',
      address: buildFullAddress(addressForm),
    }

    setAddresses((items) => {
      const normalizedItems = addressForm.isDefault ? items.map((item) => ({ ...item, isDefault: false })) : items

      if (editingAddressId) {
        return normalizedItems.map((item) => (item.id === editingAddressId ? nextAddress : item))
      }

      return [...normalizedItems, nextAddress]
    })

    closeModal()
    onSuccess('Lưu địa chỉ thành công')
  }

  const typeColor = {
    'Công ty': 'bg-blue-50 text-blue-700',
    'Nhà riêng': 'bg-green-100 text-green-700',
    'Kho hàng': 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">{addresses.length} địa chỉ đã lưu</p>
        <Button className="gap-1.5 rounded-full bg-gray-900 text-sm text-white hover:bg-gray-800" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Thêm địa chỉ
        </Button>
      </div>

      {addresses.map((address) => (
        <section key={address.id} className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-900">{address.name}</span>
                <span className="text-sm text-gray-500">{address.phone}</span>
                <Badge
                  className={`${typeColor[address.type] ?? 'bg-gray-100 text-gray-600'} px-2.5 py-1 text-[11px] font-medium hover:opacity-90`}
                >
                  {address.type}
                </Badge>
                {address.isDefault && <Badge className="bg-gray-900 text-[10px] text-white hover:bg-gray-900">Mặc định</Badge>}
              </div>
              <p className="text-sm text-gray-600">{address.address}</p>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => openEditModal(address)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeAddress(address.id)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!address.isDefault && (
            <button
              type="button"
              onClick={() => setDefaultAddress(address.id)}
              className="mt-3 text-xs text-gray-500 underline underline-offset-2 transition hover:text-gray-900"
            >
              Đặt làm mặc định
            </button>
          )}
        </section>
      ))}

      <AnimatePresence>
        {showModal && (
          <AddressModal
            title={editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
            form={addressForm}
            onChange={handleAddressFormChange}
            onClose={closeModal}
            onSubmit={handleSubmitAddress}
            submitLabel={editingAddressId ? 'Lưu thay đổi' : 'Lưu địa chỉ'}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function TaxInfoTab({ onSuccess }) {
  const [editing, setEditing] = useState(false)
  const [taxInfo, setTaxInfo] = useState(defaultTaxInfo)
  const [taxForm, setTaxForm] = useState(defaultTaxInfo)

  const fields = [
    { key: 'taxCode', label: 'Mã số thuế', placeholder: '0123456789' },
    { key: 'companyName', label: 'Tên công ty', placeholder: 'Công ty TNHH Văn Phòng ABC' },
    { key: 'companyAddress', label: 'Địa chỉ công ty', placeholder: '123 Nguyễn Huệ, Q.1, TP.HCM' },
    { key: 'invoiceEmail', label: 'Email nhận hóa đơn', placeholder: 'invoice@company.com' },
    { key: 'representative', label: 'Người đại diện', placeholder: 'Nguyễn Văn A' },
    { key: 'companyPhone', label: 'Số điện thoại công ty', placeholder: '028 3822 1234' },
  ]

  function startEditing() {
    setTaxForm(taxInfo)
    setEditing(true)
  }

  function cancelEditing() {
    setTaxForm(taxInfo)
    setEditing(false)
  }

  function saveTaxInfo() {
    setTaxInfo(taxForm)
    setEditing(false)
    onSuccess('Lưu thông tin MST thành công')
  }

  function removeTaxInfo() {
    setTaxInfo({
      taxCode: '',
      companyName: '',
      companyAddress: '',
      invoiceEmail: '',
      representative: '',
      companyPhone: '',
    })
    setTaxForm({
      taxCode: '',
      companyName: '',
      companyAddress: '',
      invoiceEmail: '',
      representative: '',
      companyPhone: '',
    })
    setEditing(false)
    onSuccess('Xóa thông tin MST thành công')
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-gray-900">Thông tin thuế</h3>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" className="h-8 rounded-full px-3 text-[11px]" onClick={cancelEditing}>
                Hủy
              </Button>
              <Button
                size="sm"
                className="h-8 rounded-full bg-gray-900 px-3 text-[11px] text-white hover:bg-gray-800"
                onClick={saveTaxInfo}
              >
                Lưu
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="h-8 gap-1 rounded-full px-3 text-[11px]" onClick={startEditing}>
                <Edit2 className="h-3 w-3" />
                Chỉnh sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 rounded-full border-red-200 px-3 text-[11px] text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={removeTaxInfo}
              >
                <Trash2 className="h-3 w-3" />
                Xóa
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-5 flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-600">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
        <span>Khi yêu cầu hóa đơn VAT, hệ thống sẽ tự động điền thông tin MST từ hồ sơ này.</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-xs text-gray-500">{field.label}</label>
            {editing ? (
              <Input
                placeholder={field.placeholder}
                value={taxForm[field.key]}
                className="rounded-xl text-sm"
                onChange={(event) => setTaxForm((value) => ({ ...value, [field.key]: event.target.value }))}
              />
            ) : (
              <p className="rounded-xl bg-gray-50 px-3 py-3 text-sm font-medium text-gray-900">
                {taxInfo[field.key] || 'Chưa cập nhật'}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function OrderHistoryTab({ onSuccess }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const normalizedSearch = search.trim().toLowerCase()
        const matchSearch =
          normalizedSearch.length === 0 ||
          order.id.toLowerCase().includes(normalizedSearch) ||
          order.product.toLowerCase().includes(normalizedSearch)
        const matchStatus = statusFilter === 'all' || order.shipStatus === statusFilter

        return matchSearch && matchStatus
      }),
    [search, statusFilter],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            placeholder="Tìm theo mã đơn hoặc sản phẩm..."
            className="rounded-xl pl-9 text-sm"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="delivered">Đã giao</option>
          <option value="shipping">Đang giao</option>
          <option value="pending">Chờ xử lý</option>
        </select>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[11%]" />
            <col className="w-[12%]" />
            <col className="w-[23%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[9%]" />
            <col className="w-[21%]" />
          </colgroup>
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {['Mã đơn hàng', 'Ngày đặt', 'Sản phẩm', 'Tổng tiền', 'Thanh toán', 'Giao hàng', 'Hành động'].map((heading) => (
                  <th key={heading} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-3 py-4 align-top">
                    <span className="block break-words font-mono text-sm font-semibold leading-8 text-gray-900">{order.id}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 align-top text-sm text-gray-600">{order.date}</td>
                  <td className="px-3 py-4 align-top text-sm leading-7 text-gray-700">{order.product}</td>
                  <td className="whitespace-nowrap px-3 py-4 align-top text-sm font-semibold text-gray-900">{formatPrice(order.total)}</td>
                  <td className="px-2 py-4 align-top">
                    <Badge
                      className={`${paymentStatusMeta[order.payStatus].badgeClass} whitespace-nowrap px-2.5 py-1 text-[10px] font-medium hover:opacity-100`}
                    >
                      {paymentStatusMeta[order.payStatus].label}
                    </Badge>
                  </td>
                  <td className="px-2 py-4 align-top">
                    <Badge
                      className={`${shippingStatusMeta[order.shipStatus].badgeClass} whitespace-nowrap px-2.5 py-1 text-[10px] font-medium hover:opacity-100`}
                    >
                      {shippingStatusMeta[order.shipStatus].label}
                    </Badge>
                  </td>
                  <td className="px-3 py-4 align-top">
                    <div className="flex items-center gap-2 whitespace-nowrap text-xs">
                      <Link
                        to={`/profile/orders/${order.id}`}
                        className="inline-flex items-center gap-1 font-medium text-gray-600 transition hover:text-gray-900 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Chi tiết
                      </Link>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 font-medium text-gray-600 transition hover:text-gray-900 hover:underline"
                        onClick={() => onSuccess(`Đã tải PDF đơn hàng ${order.id}`)}
                      >
                        <Download className="h-3 w-3" />
                        PDF
                      </button>
                      {isVatExpired(order) ? (
                        <span className="text-xs font-medium text-gray-400">Quá hạn VAT</span>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 font-medium text-blue-600 transition hover:text-blue-800 hover:underline"
                          onClick={() => onSuccess(`Đã tải hóa đơn VAT của ${order.id}`)}
                        >
                          VAT
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        {filteredOrders.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-400">Không tìm thấy đơn hàng phù hợp.</div>
        )}
      </section>
    </div>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [successToast, setSuccessToast] = useState(null)
  const activeTab = searchParams.get('tab') || 'info'
  const activeTabMeta = profileTabs.find((tab) => tab.id === activeTab) ?? profileTabs[0]

  const userName = user?.fullName || 'Nguyễn Văn A'
  const userEmail = user?.email || 'nguyen.van.a@company.com'
  const userPhone = user?.phoneNumber || '0901 234 567'
  const userInitial = userName.charAt(0).toUpperCase()

  function showSuccess(message) {
    setSuccessToast({ id: Date.now(), message })
  }

  const tabContent = {
    info: (
      <PersonalInfoTab
        userName={userName}
        userEmail={userEmail}
        userPhone={userPhone}
        userInitial={userInitial}
        onSuccess={showSuccess}
      />
    ),
    addresses: <AddressesTab onSuccess={showSuccess} />,
    tax: <TaxInfoTab onSuccess={showSuccess} />,
    orders: <OrderHistoryTab onSuccess={showSuccess} />,
  }

  function setTab(tabId) {
    setSearchParams({ tab: tabId })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <AnimatePresence>
        {successToast && (
          <SuccessToast key={successToast.id} message={successToast.message} onClose={() => setSuccessToast(null)} />
        )}
      </AnimatePresence>

      <div className="pt-20">
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-[1440px] px-6 py-4 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-gray-900">
                Trang Chủ
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-gray-900">Tài khoản của tôi</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <aside className="lg:w-56 lg:flex-shrink-0">
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
                  {profileTabs.map((tab) => {
                    const isActive = activeTab === tab.id

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setTab(tab.id)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                          isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <tab.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{tab.label}</span>
                        {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 flex-shrink-0" />}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </aside>

            <main className="min-w-0 flex-1">
              <div className="mb-6 flex items-center gap-2">
                <activeTabMeta.icon className="h-5 w-5 text-gray-700" />
                <h1 className="text-2xl font-bold text-gray-900">{activeTabMeta.label}</h1>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {tabContent[activeTab] ?? tabContent.info}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
