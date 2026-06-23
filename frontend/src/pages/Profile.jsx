import { useEffect, useMemo, useState, useRef } from 'react'
import {
  AlertCircle,
  BarChart3,
  Building2,
  Camera,
  Check,
  ChevronRight,
  Download,
  Edit2,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Star,
  TrendingUp,
  Trash2,
  Truck,
  User,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link, useSearchParams } from 'react-router-dom'
import AddressModal, { buildFullAddress, emptyAddressForm } from '../components/AddressModal.jsx'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import SuccessToast from '../components/SuccessToast.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getTrackingSteps, isVatExpired, orders, paymentStatusMeta, shippingStatusMeta } from '../data/orders.js'
import { formatPrice } from '../data/products.js'
import { getCustomerProfile, updateCustomerProfile } from '../services/authService.js'
import {
  uploadAvatar,
  updateUserProfile,
  changePassword,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../services/userService.js'

const profileTabs = [
  { id: 'info', label: 'Thông tin cá nhân', icon: User },
  { id: 'addresses', label: 'Địa chỉ giao hàng', icon: MapPin },
  { id: 'tax', label: 'Thông tin MST', icon: Building2 },
  { id: 'orders', label: 'Lịch sử đơn hàng', icon: Package },
  { id: 'stats', label: 'Thống kê cá nhân', icon: BarChart3 },
  { id: 'tracking', label: 'Theo dõi đơn hàng', icon: Truck },
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

function PersonalInfoTab({ user, onSuccess }) {
  const { updateUser } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '')
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingInfo, setSavingInfo] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const [notifications, setNotifications] = useState({
    orderConfirm: true,
    shipStatus: true,
    vatInvoice: false,
    promotions: true,
  })

  const fileInputRef = useRef(null)

  const userInitial = (fullName || user?.fullName || 'U').charAt(0).toUpperCase()

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      onSuccess('Đang tải ảnh đại diện lên...')
      const res = await uploadAvatar(file)
      updateUser({ avatarUrl: res.avatarUrl })
      onSuccess('Cập nhật ảnh đại diện thành công')
    } catch (err) {
      alert(err.message || 'Lỗi khi tải ảnh đại diện')
    }
  }

  const handleSaveInfo = async () => {
    if (!fullName.trim()) {
      alert('Họ tên không được để trống')
      return
    }
    if (!phoneNumber.trim()) {
      alert('Số điện thoại không được để trống')
      return
    }

    try {
      setSavingInfo(true)
      const res = await updateUserProfile({ fullName, phoneNumber })
      updateUser({ fullName: res.fullName, phoneNumber: res.phoneNumber })
      onSuccess('Lưu thông tin cá nhân thành công')
    } catch (err) {
      alert(err.message || 'Lỗi khi cập nhật thông tin cá nhân')
    } finally {
      setSavingInfo(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      alert('Vui lòng nhập mật khẩu hiện tại')
      return
    }
    if (!newPassword) {
      alert('Vui lòng nhập mật khẩu mới')
      return
    }
    if (newPassword !== confirmPassword) {
      alert('Xác nhận mật khẩu mới không trùng khớp')
      return
    }

    try {
      setUpdatingPassword(true)
      await changePassword({ currentPassword, newPassword, confirmPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onSuccess('Thay đổi mật khẩu thành công')
    } catch (err) {
      alert(err.message || 'Lỗi khi đổi mật khẩu')
    } finally {
      setUpdatingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-6">
        <h3 className="mb-5 text-base font-semibold text-gray-900">Thông tin cơ bản</h3>
        <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-900 text-2xl font-bold text-white">
                {userInitial}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-gray-50"
            >
              <Camera className="h-3 w-3 text-gray-600" />
            </button>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Họ tên</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Số điện thoại</label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Email</label>
              <Input
                value={user?.email || ''}
                disabled
                className="rounded-xl bg-gray-50 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Địa chỉ mặc định</label>
              <Input
                value={user?.defaultAddressId ? 'Có địa chỉ mặc định' : 'Chưa thiết lập'}
                disabled
                className="rounded-xl bg-gray-50 text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </div>
        <Button
          className="rounded-full bg-gray-900 text-sm text-white hover:bg-gray-800"
          onClick={handleSaveInfo}
          disabled={savingInfo}
        >
          {savingInfo ? 'Đang lưu...' : 'Lưu thông tin'}
        </Button>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6">
        <h3 className="mb-5 text-base font-semibold text-gray-900">Đổi mật khẩu</h3>
        <div className="max-w-sm space-y-4">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Mật khẩu hiện tại</label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="rounded-xl pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Mật khẩu mới</label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            className="rounded-full bg-gray-900 text-sm text-white hover:bg-gray-800"
            onClick={handleUpdatePassword}
            disabled={updatingPassword}
          >
            {updatingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
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
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressForm, setAddressForm] = useState(emptyAddressForm)

  useEffect(() => {
    async function loadAddresses() {
      try {
        setLoading(true)
        const list = await getAddresses()
        setAddresses(list || [])
      } catch (err) {
        console.error("Lỗi tải danh sách địa chỉ:", err)
      } finally {
        setLoading(false)
      }
    }
    loadAddresses()
  }, [])

  async function handleSetDefaultAddress(id) {
    try {
      await setDefaultAddress(id)
      setAddresses((items) =>
        items.map((item) => ({ ...item, isDefault: item.id === id }))
      )
      onSuccess('Đặt địa chỉ mặc định thành công')
    } catch (err) {
      alert(err.message || 'Lỗi khi đặt địa chỉ mặc định')
    }
  }

  async function removeAddress(id) {
    try {
      await deleteAddress(id)
      setAddresses((items) => items.filter((item) => item.id !== id))
      onSuccess('Xóa địa chỉ thành công')
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa địa chỉ')
    }
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
      ward: address.ward || '',
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

  async function handleSubmitAddress(event) {
    event.preventDefault()

    const payload = {
      name: addressForm.name,
      phone: addressForm.phone,
      city: addressForm.city,
      district: addressForm.district,
      ward: addressForm.ward || '',
      addressLine: addressForm.addressLine,
      type: addressForm.type || 'Nhà riêng',
      isDefault: addressForm.isDefault,
    }

    try {
      if (editingAddressId) {
        const updated = await updateAddress(editingAddressId, payload)
        setAddresses((items) => {
          if (updated.isDefault) {
            return items.map((item) =>
              item.id === editingAddressId ? updated : { ...item, isDefault: false }
            )
          }
          return items.map((item) => (item.id === editingAddressId ? updated : item))
        })
        onSuccess('Cập nhật địa chỉ thành công')
      } else {
        const created = await createAddress(payload)
        setAddresses((items) => {
          if (created.isDefault) {
            return [...items.map((item) => ({ ...item, isDefault: false })), created]
          }
          return [...items, created]
        })
        onSuccess('Thêm địa chỉ thành công')
      }
      closeModal()
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu địa chỉ')
    }
  }

  const typeColor = {
    'Công ty': 'bg-blue-50 text-blue-700',
    'Nhà riêng': 'bg-green-100 text-green-700',
    'Kho hàng': 'bg-orange-100 text-orange-700',
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-100 bg-white p-6 flex flex-col items-center justify-center min-h-[200px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-950" />
        <p className="mt-4 text-sm text-gray-500">Đang tải danh sách địa chỉ...</p>
      </section>
    )
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
              <p className="text-sm text-gray-600">{address.fullAddress || address.address}</p>
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
              onClick={() => handleSetDefaultAddress(address.id)}
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

function TaxInfoTab({ userName, userEmail, userPhone, onSuccess }) {
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [taxInfo, setTaxInfo] = useState({
    taxCode: '',
    companyName: '',
    companyAddress: '',
    invoiceEmail: '',
    representative: '',
    companyPhone: '',
  })
  const [taxForm, setTaxForm] = useState({
    taxCode: '',
    companyName: '',
    companyAddress: '',
    invoiceEmail: '',
    representative: '',
    companyPhone: '',
  })
  const [searchingMst, setSearchingMst] = useState(false)

  const fields = [
    { key: 'taxCode', label: 'Mã số thuế', placeholder: 'Nhập mã số thuế (10 hoặc 13 số)' },
    { key: 'companyName', label: 'Tên công ty', placeholder: 'Tên công ty sẽ tự động điền khi tra cứu' },
    { key: 'companyAddress', label: 'Địa chỉ công ty', placeholder: 'Địa chỉ công ty sẽ tự động điền khi tra cứu' },
    { key: 'invoiceEmail', label: 'Email nhận hóa đơn', placeholder: 'invoice@company.com' },
    { key: 'representative', label: 'Người đại diện', placeholder: 'Nguyễn Văn A' },
    { key: 'companyPhone', label: 'Số điện thoại công ty', placeholder: '028 3822 1234' },
  ]

  useEffect(() => {
    async function fetchTaxInfo() {
      try {
        setLoading(true)
        const data = await getCustomerProfile()
        const info = {
          taxCode: data.taxCode || '',
          companyName: data.companyName || '',
          companyAddress: data.companyAddress || '',
          invoiceEmail: data.invoiceEmail || '',
          representative: data.representative || '',
          companyPhone: data.companyPhone || '',
        }
        setTaxInfo(info)
        setTaxForm(info)
      } catch (err) {
        console.error("Lỗi khi tải thông tin thuế:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTaxInfo()
  }, [])

  function startEditing() {
    setTaxForm({ ...taxInfo })
    setEditing(true)
  }

  function cancelEditing() {
    setTaxForm({ ...taxInfo })
    setEditing(false)
  }

  async function saveTaxInfo() {
    try {
      await updateCustomerProfile(taxForm)
      setTaxInfo(taxForm)
      setEditing(false)
      onSuccess('Lưu thông tin MST thành công')
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu thông tin thuế')
    }
  }

  async function removeTaxInfo() {
    const emptyForm = {
      taxCode: '',
      companyName: '',
      companyAddress: '',
      invoiceEmail: '',
      representative: '',
      companyPhone: '',
    }
    try {
      await updateCustomerProfile(emptyForm)
      setTaxInfo(emptyForm)
      setTaxForm(emptyForm)
      setEditing(false)
      onSuccess('Xóa thông tin MST thành công')
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa thông tin thuế')
    }
  }

  async function handleMstLookup() {
    const code = taxForm.taxCode?.trim()
    if (!code) {
      alert('Vui lòng nhập mã số thuế để tra cứu.')
      return
    }

    const cleanedCode = code.replace(/[\s-]/g, '')
    if (cleanedCode.length !== 10 && cleanedCode.length !== 13) {
      alert('Mã số thuế của doanh nghiệp phải có độ dài 10 hoặc 13 số.')
      return
    }

    try {
      setSearchingMst(true)
      const res = await fetch(`https://api.vietqr.io/v2/business/${cleanedCode}`)
      const json = await res.json()

      if (json && json.code === '00' && json.data) {
        const businessName = json.data.name
        const businessAddress = json.data.address

        setTaxForm(prev => ({
          ...prev,
          taxCode: cleanedCode,
          companyName: businessName || prev.companyName,
          companyAddress: businessAddress || prev.companyAddress,
          // Autofill email/representative/phone with profile info if they are empty
          invoiceEmail: prev.invoiceEmail || userEmail || '',
          representative: prev.representative || userName || '',
          companyPhone: prev.companyPhone || userPhone || '',
        }))
        onSuccess(`Tìm thấy doanh nghiệp: ${businessName}`)
      } else {
        alert(json.desc || 'Không tìm thấy doanh nghiệp tương ứng với mã số thuế này. Vui lòng kiểm tra lại.')
      }
    } catch (err) {
      console.error(err)
      alert('Không thể kết nối đến hệ thống tra cứu. Vui lòng thử lại sau.')
    } finally {
      setSearchingMst(false)
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-100 bg-white p-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-950" />
        <p className="mt-4 text-sm text-gray-500">Đang tải thông tin thuế...</p>
      </section>
    )
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
              field.key === 'taxCode' ? (
                <div className="flex gap-2">
                  <Input
                    placeholder={field.placeholder}
                    value={taxForm[field.key]}
                    className="flex-1 rounded-xl text-sm"
                    onChange={(event) => setTaxForm((value) => ({ ...value, [field.key]: event.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl px-4 text-xs font-semibold hover:bg-gray-100 flex items-center gap-1.5 border-gray-200"
                    onClick={handleMstLookup}
                    disabled={searchingMst}
                  >
                    {searchingMst ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-gray-800" />
                        Đang tìm...
                      </>
                    ) : (
                      <>
                        <Search className="h-3.5 w-3.5" />
                        Tra cứu
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Input
                  placeholder={field.placeholder}
                  value={taxForm[field.key]}
                  className="rounded-xl text-sm"
                  onChange={(event) => setTaxForm((value) => ({ ...value, [field.key]: event.target.value }))}
                  disabled={field.key === 'companyName' || field.key === 'companyAddress'}
                />
              )
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

function PersonalStatsTab() {
  const [period, setPeriod] = useState('month')

  const statsData = useMemo(() => {
    const latestOrderDate = orders.reduce((latest, order) => {
      const orderDate = new Date(order.date)
      return orderDate > latest ? orderDate : latest
    }, new Date(orders[0]?.date ?? Date.now()))

    const periodDays = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    }

    const days = periodDays[period] ?? periodDays.month
    const cutoff = new Date(latestOrderDate)
    cutoff.setDate(cutoff.getDate() - days)

    const scopedOrders = orders.filter((order) => new Date(order.date) >= cutoff)
    const relevantOrders = scopedOrders.length > 0 ? scopedOrders : orders
    const totalSpent = relevantOrders.reduce((sum, order) => sum + order.total, 0)
    const vatInvoices = relevantOrders.filter((order) => order.hasVat).length

    const monthMap = new Map()
    relevantOrders.forEach((order) => {
      const orderDate = new Date(order.date)
      const key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`
      const label = `T${orderDate.getMonth() + 1}`
      const current = monthMap.get(key) ?? { name: label, value: 0, sortValue: orderDate.getTime() }
      current.value += order.total
      monthMap.set(key, current)
    })

    const spendingData = Array.from(monthMap.values())
      .sort((a, b) => a.sortValue - b.sortValue)
      .map(({ name, value }) => ({ name, value }))

    const productMap = new Map()
    relevantOrders.forEach((order) => {
      order.items.forEach((item) => {
        productMap.set(item.name, (productMap.get(item.name) ?? 0) + item.quantity)
      })
    })

    const productData = Array.from(productMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }))

    const topProduct = productData[0]?.name ?? 'Chưa có dữ liệu'

    return {
      productData,
      spendingData,
      statCards: [
        {
          label: 'Tổng đơn hàng',
          value: String(relevantOrders.length),
          icon: ShoppingBag,
          color: 'bg-blue-50 text-blue-600',
        },
        {
          label: 'Tổng chi tiêu',
          value: formatPrice(totalSpent),
          icon: TrendingUp,
          color: 'bg-green-50 text-green-600',
        },
        {
          label: 'Sản phẩm đặt nhiều nhất',
          value: topProduct,
          icon: Star,
          color: 'bg-yellow-50 text-yellow-600',
        },
        {
          label: 'Số hóa đơn VAT',
          value: String(vatInvoices),
          icon: FileText,
          color: 'bg-purple-50 text-purple-600',
        },
      ],
    }
  }, [period])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsData.statCards.map(({ label, value, icon: Icon, color }) => (
          <section key={label} className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mb-1 text-xs text-gray-500">{label}</p>
            <p className="truncate text-lg font-bold text-gray-900">{value}</p>
          </section>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'week', label: 'Tuần' },
          { key: 'month', label: 'Tháng' },
          { key: 'quarter', label: 'Quý' },
          { key: 'year', label: 'Năm' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setPeriod(item.key)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              period === item.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h4 className="mb-4 text-sm font-semibold text-gray-900">Chi tiêu theo tháng</h4>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={statsData.spendingData}>
              <defs>
                <linearGradient id="profile-spending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(value) => formatPrice(Number(value))} />
              <Area type="monotone" dataKey="value" stroke="#111827" strokeWidth={2} fill="url(#profile-spending)" />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h4 className="mb-4 text-sm font-semibold text-gray-900">Sản phẩm đặt nhiều nhất</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statsData.productData} layout="vertical" margin={{ top: 4, right: 12, left: 12, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                width={140}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(value) => `${value} sản phẩm`} />
              <Bar dataKey="value" fill="#111827" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  )
}

function OrderTrackingTab() {
  const trackableOrders = useMemo(
    () => orders.filter((order) => order.shipStatus === 'shipping' || order.shipStatus === 'pending' || order.shipStatus === 'delivered'),
    [],
  )
  const defaultOrderId = trackableOrders.find((order) => order.trackingStatus === 'shipping')?.id ?? trackableOrders[0]?.id ?? ''
  const [selectedOrderId, setSelectedOrderId] = useState(defaultOrderId)

  const selectedOrder = trackableOrders.find((order) => order.id === selectedOrderId) ?? trackableOrders[0]

  if (!selectedOrder) {
    return (
      <section className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
        Chưa có đơn hàng nào để theo dõi.
      </section>
    )
  }

  const trackingSteps = getTrackingSteps(selectedOrder)
  const activeStepIndex = trackingSteps.findIndex((step) => step.key === selectedOrder.trackingStatus)

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-1 text-xs text-gray-500">Mã đơn hàng</p>
            <p className="font-mono text-lg font-bold text-gray-900">{selectedOrder.id}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Badge
              className={`${shippingStatusMeta[selectedOrder.shipStatus].badgeClass} px-3 py-1.5 text-xs font-medium hover:opacity-100`}
            >
              {shippingStatusMeta[selectedOrder.shipStatus].label}
            </Badge>
            <select
              value={selectedOrderId}
              onChange={(event) => setSelectedOrderId(event.target.value)}
              className="h-11 min-w-[240px] rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            >
              {trackableOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.id} - {order.product}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-start gap-0 overflow-x-auto pb-2">
          {trackingSteps.map((step, index) => {
            const isActive = index === activeStepIndex
            const isDone = index < activeStepIndex || (selectedOrder.trackingStatus === 'delivered' && step.key === 'delivered')

            return (
              <div key={step.key} className="flex min-w-[220px] flex-1 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      isDone
                        ? 'bg-gray-900 text-white'
                        : isActive
                          ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isDone ? <Check className="h-5 w-5" /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </div>
                  <p
                    className={`mt-2 max-w-[120px] text-center text-[10px] font-semibold leading-tight ${
                      isActive ? 'text-orange-600' : isDone ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 hidden max-w-[120px] text-center text-[10px] leading-tight text-gray-400 lg:block">{step.desc}</p>
                </div>
                {index < trackingSteps.length - 1 && (
                  <div className={`mx-3 mt-5 h-[2px] flex-1 ${index < activeStepIndex ? 'bg-gray-900' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6">
        <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Truck className="h-4 w-4" />
          Thông tin vận chuyển
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            { label: 'Mã xe', value: selectedOrder.vehicle.code },
            { label: 'Tài xế / NV giao hàng', value: selectedOrder.vehicle.driver },
            { label: 'Ca vận chuyển', value: selectedOrder.vehicle.shift },
            { label: 'Thời gian dự kiến giao', value: selectedOrder.vehicle.eta },
          ].map((item) => (
            <div key={item.label}>
              <p className="mb-0.5 text-xs text-gray-500">{item.label}</p>
              <p className="text-sm font-medium text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Package className="h-4 w-4" />
          Sản phẩm
        </h4>
        <p className="text-sm text-gray-600">{selectedOrder.product}</p>
        <p className="mt-2 text-sm font-bold text-gray-900">{formatPrice(selectedOrder.total)}</p>
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
        user={user}
        onSuccess={showSuccess}
      />
    ),
    addresses: <AddressesTab onSuccess={showSuccess} />,
    tax: (
      <TaxInfoTab
        userName={userName}
        userEmail={userEmail}
        userPhone={userPhone}
        onSuccess={showSuccess}
      />
    ),
    orders: <OrderHistoryTab onSuccess={showSuccess} />,
    stats: <PersonalStatsTab />,
    tracking: <OrderTrackingTab />,
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
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                        {userInitial}
                      </div>
                    )}
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
