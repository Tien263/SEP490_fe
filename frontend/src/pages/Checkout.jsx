import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertCircle,
  Banknote,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Edit2,
  FileText,
  Mail,
  MapPin,
  Package,
  Plus,
  Truck,
  XCircle,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import AddressModal, { buildFullAddress, emptyAddressForm } from '../components/AddressModal.jsx'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import SuccessToast from '../components/SuccessToast.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { formatPrice, products } from '../data/products.js'

const defaultCart = [
  { productId: '1', quantity: 2 },
  { productId: '2', quantity: 1 },
  { productId: '6', quantity: 1 },
]

const defaultAddresses = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    phone: '0901 234 567',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    addressLine: '123 Nguyễn Huệ',
    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    type: 'Công ty',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Nguyễn Văn A',
    phone: '0901 234 567',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận Gò Vấp',
    ward: 'Phường 2',
    addressLine: '456 Lê Lợi',
    address: '456 Lê Lợi, Phường 2, Quận Gò Vấp, TP. Hồ Chí Minh',
    type: 'Nhà riêng',
    isDefault: false,
  },
]

const orderSteps = [
  { label: 'Chọn địa chỉ giao hàng', icon: MapPin },
  { label: 'Xác nhận đơn hàng', icon: Package },
  { label: 'Chọn phương thức thanh toán', icon: CreditCard },
  { label: 'Tạo đơn hàng', icon: FileText },
  { label: 'Thông báo nhân viên', icon: Mail },
  { label: 'Gửi email xác nhận', icon: CheckCircle2 },
]

const paymentStatusConfig = {
  pending: { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { label: 'Đã xác nhận thanh toán', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  failed: { label: 'Thanh toán thất bại', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const defaultVatInfo = {
  taxCode: '0123456789',
  companyName: 'Công ty TNHH Văn Phòng ABC',
  companyAddress: '123 Nguyễn Huệ, Q.1, TP.HCM',
  invoiceEmail: 'invoice@company.com',
}

export default function Checkout() {
  const location = useLocation()
  const sourceCart =
    Array.isArray(location.state?.cartItems) && location.state.cartItems.length > 0 ? location.state.cartItems : defaultCart

  const [addresses, setAddresses] = useState(defaultAddresses)
  const [selectedAddressId, setSelectedAddressId] = useState('1')
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [successToast, setSuccessToast] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [vatRequested, setVatRequested] = useState(false)
  const [currentStep, setCurrentStep] = useState(2)
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [isEditingVat, setIsEditingVat] = useState(false)
  const [vatInfo, setVatInfo] = useState(defaultVatInfo)
  const [vatForm, setVatForm] = useState(defaultVatInfo)
  const [addressForm, setAddressForm] = useState(emptyAddressForm)

  const cartProducts = useMemo(
    () =>
      sourceCart
        .map((item) => ({
          ...item,
          product: products.find((product) => product.id === item.productId),
        }))
        .filter((item) => item.product),
    [sourceCart],
  )

  const subtotal = cartProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const vat = subtotal * 0.1
  const shippingFee = subtotal >= 500000 ? 0 : 30000
  const total = subtotal + vat + shippingFee
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId)
  const paymentStatusInfo = paymentStatusConfig[paymentStatus]
  const PaymentStatusIcon = paymentStatusInfo.icon

  function showSuccess(message) {
    setSuccessToast({ id: Date.now(), message })
  }

  function handleConfirmOrder() {
    setCurrentStep(4)
    setOrderConfirmed(true)
    setPaymentStatus(paymentMethod === 'sepay' ? 'pending' : 'confirmed')
  }

  function handleAddressFormChange(key, value) {
    setAddressForm((current) => ({ ...current, [key]: value }))
  }

  function openCreateAddressModal() {
    setEditingAddressId(null)
    setAddressForm({ ...emptyAddressForm })
    setShowAddressModal(true)
  }

  function openEditAddressModal(address) {
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
    setShowAddressModal(true)
  }

  function closeAddressModal() {
    setShowAddressModal(false)
    setEditingAddressId(null)
    setAddressForm({ ...emptyAddressForm })
  }

  function handleAddAddress(event) {
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
    setSelectedAddressId(nextAddress.id)
    closeAddressModal()
    showSuccess('Lưu địa chỉ thành công')
  }

  function handleEditVatInfo() {
    setVatForm(vatInfo)
    setIsEditingVat(true)
  }

  function handleSaveVatInfo(event) {
    event.preventDefault()
    setVatInfo(vatForm)
    setIsEditingVat(false)
    showSuccess('Cập nhật thông tin MST thành công')
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <AnimatePresence>
        {successToast && (
          <SuccessToast key={successToast.id} message={successToast.message} onClose={() => setSuccessToast(null)} />
        )}
      </AnimatePresence>

      <div className="pt-20">
        <div className="border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-gray-900">
                Trang chủ
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/cart" className="hover:text-gray-900">
                Giỏ Hàng
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-gray-900">Thanh Toán</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">Xác nhận đơn hàng</h1>

          <div className="mb-10 overflow-x-auto">
            <div className="flex min-w-max items-center gap-0">
              {orderSteps.map((step, index) => {
                const Icon = step.icon
                const done = index < currentStep
                const active = index === currentStep

                return (
                  <div key={step.label} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                          done
                            ? 'bg-gray-900 text-white'
                            : active
                              ? 'bg-gray-200 text-gray-900 ring-2 ring-gray-900'
                              : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span
                        className={`max-w-[84px] text-center text-[11px] leading-tight ${
                          active ? 'font-medium text-gray-900' : done ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < orderSteps.length - 1 && (
                      <div className={`mx-1 mb-5 h-[2px] w-12 ${index < currentStep ? 'bg-gray-900' : 'bg-gray-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-[1.5rem] border border-gray-100 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-700" />
                    <h2 className="text-lg font-semibold text-gray-900">Địa chỉ giao hàng</h2>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={openCreateAddressModal}>
                    <Plus className="h-3 w-3" />
                    Thêm địa chỉ
                  </Button>
                </div>

                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer gap-4 rounded-[1.25rem] border-2 p-4 transition-colors ${
                        selectedAddressId === address.id ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-1 accent-gray-900"
                      />
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-900">{address.name}</span>
                          <span className="text-sm text-gray-500">{address.phone}</span>
                          <Badge
                            className={`px-2.5 py-1 text-[11px] font-medium hover:opacity-90 ${
                              address.type === 'Công ty'
                                ? 'bg-blue-50 text-blue-700'
                                : address.type === 'Nhà riêng'
                                  ? 'bg-green-100 text-green-700'
                                  : address.type === 'Kho hàng'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {address.type}
                          </Badge>
                          {address.isDefault && <Badge className="bg-gray-900 text-[10px] text-white hover:bg-gray-900">Mặc định</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">{address.address}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEditAddressModal(address)}
                        className="self-start text-gray-400 hover:text-gray-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-gray-100 p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">Sản phẩm đặt hàng</h2>
                </div>

                <div className="space-y-4">
                  {cartProducts.map(({ product, productId, quantity }) => (
                    <div key={productId} className="flex items-center gap-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="mb-0.5 text-xs text-gray-500">{product.category}</p>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">x{quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(product.price * quantity)}</p>
                        <p className="text-xs text-gray-400">{formatPrice(product.price)}/sản phẩm</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-gray-100 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">Hóa đơn VAT</h2>
                </div>

                <label className="mb-4 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={vatRequested}
                    onChange={(event) => {
                      setVatRequested(event.target.checked)
                      if (!event.target.checked) {
                        setIsEditingVat(false)
                      }
                    }}
                    className="h-4 w-4 accent-gray-900"
                  />
                  <span className="text-sm font-medium text-gray-800">Yêu cầu hóa đơn VAT</span>
                </label>

                <AnimatePresence>
                  {vatRequested && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mb-3 space-y-3 rounded-[1.25rem] bg-gray-50 p-4">
                        {[
                          ['Mã số thuế', vatInfo.taxCode],
                          ['Tên công ty', vatInfo.companyName],
                          ['Địa chỉ công ty', vatInfo.companyAddress],
                          ['Email nhận hóa đơn', vatInfo.invoiceEmail],
                        ].map(([label, value]) => (
                          <div key={label} className="flex gap-4">
                            <span className="w-36 flex-shrink-0 pt-0.5 text-xs text-gray-500">{label}</span>
                            <span className="text-sm font-medium text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mb-3 flex items-start gap-2 text-xs text-gray-500">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                        <span>Khách có thể yêu cầu hóa đơn VAT tối đa 7 ngày sau khi giao hàng thành công.</span>
                      </div>

                      <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={handleEditVatInfo}>
                        <Edit2 className="h-3 w-3" />
                        Cập nhật thông tin MST
                      </Button>

                      <AnimatePresence>
                        {isEditingVat && (
                          <motion.form
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            onSubmit={handleSaveVatInfo}
                            className="mt-4 space-y-4 rounded-[1.25rem] border border-gray-200 p-4"
                          >
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Input
                                placeholder="Mã số thuế"
                                value={vatForm.taxCode}
                                onChange={(event) => setVatForm((value) => ({ ...value, taxCode: event.target.value }))}
                                required
                              />
                              <Input
                                placeholder="Tên công ty"
                                value={vatForm.companyName}
                                onChange={(event) => setVatForm((value) => ({ ...value, companyName: event.target.value }))}
                                required
                              />
                            </div>

                            <Input
                              placeholder="Địa chỉ công ty"
                              value={vatForm.companyAddress}
                              onChange={(event) => setVatForm((value) => ({ ...value, companyAddress: event.target.value }))}
                              required
                            />

                            <Input
                              type="email"
                              placeholder="Email nhận hóa đơn"
                              value={vatForm.invoiceEmail}
                              onChange={(event) => setVatForm((value) => ({ ...value, invoiceEmail: event.target.value }))}
                              required
                            />

                            <div className="flex gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  setVatForm(vatInfo)
                                  setIsEditingVat(false)
                                }}
                              >
                                Hủy
                              </Button>
                              <Button type="submit" className="flex-1 bg-gray-900 text-white hover:bg-gray-800">
                                Lưu thông tin MST
                              </Button>
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              <section className="rounded-[1.5rem] border border-gray-100 p-6">
                <div className="mb-5 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">Phương thức thanh toán</h2>
                </div>

                <div className="space-y-3">
                  <label
                    className={`flex cursor-pointer gap-4 rounded-[1.25rem] border-2 p-4 transition-colors ${
                      paymentMethod === 'cod' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 accent-gray-900"
                    />
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-gray-700" />
                        <span className="font-semibold text-gray-900">Thanh toán khi nhận hàng</span>
                      </div>
                      <p className="text-sm text-gray-600">Thanh toán tiền mặt sau khi nhận và kiểm tra hàng.</p>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer gap-4 rounded-[1.25rem] border-2 p-4 transition-colors ${
                      paymentMethod === 'sepay' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="sepay"
                      checked={paymentMethod === 'sepay'}
                      onChange={() => setPaymentMethod('sepay')}
                      className="mt-1 accent-gray-900"
                    />
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-700" />
                        <span className="font-semibold text-gray-900">Chuyển khoản SePay</span>
                      </div>
                      <p className="text-sm text-gray-600">Chuyển khoản nhanh, đối soát tự động và xác nhận trạng thái thanh toán.</p>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'sepay' && (
                  <div className="mt-4 rounded-[1.25rem] border border-dashed border-gray-300 bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-900">Thông tin chuyển khoản</p>
                    <div className="mt-3 grid gap-2 text-sm text-gray-600">
                      <p>Ngân hàng: MB Bank</p>
                      <p>Số tài khoản: 123456789</p>
                      <p>Chủ tài khoản: CONG TY VIET TIEN</p>
                      <p>Nội dung: VT {selectedAddress?.phone?.replaceAll(' ', '')}</p>
                    </div>
                  </div>
                )}
              </section>
            </div>

            <div>
              <div className="space-y-6 lg:sticky lg:top-24">
                <section className="rounded-[1.75rem] border border-gray-100 bg-gray-50 p-8">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Tóm tắt đơn hàng</h2>

                  <div className="mb-6 space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Tạm tính</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>VAT (10%)</span>
                      <span className="font-medium">{formatPrice(vat)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Vận chuyển</span>
                      <span className="font-medium">{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                    </div>
                  </div>

                  <div className="mb-6 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                      <span className="text-2xl font-bold text-gray-900">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button size="lg" className="w-full rounded-full bg-gray-900 text-white hover:bg-gray-800" onClick={handleConfirmOrder}>
                    Xác nhận đơn hàng
                  </Button>

                  {paymentMethod === 'sepay' && (
                    <Button
                      variant="outline"
                      className="mt-3 w-full rounded-full"
                      onClick={() => setPaymentStatus('confirmed')}
                    >
                      Giả lập xác nhận thanh toán
                    </Button>
                  )}
                </section>

                <section className="rounded-[1.5rem] border border-gray-100 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Trạng thái thanh toán</h3>
                    <Badge className={`${paymentStatusInfo.color} hover:opacity-100`}>
                      <PaymentStatusIcon className="mr-1 h-3.5 w-3.5" />
                      {paymentStatusInfo.label}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start gap-3">
                      <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                      <span>Đơn hàng sẽ được xác nhận và nhân viên xử lý ngay sau khi thanh toán hoàn tất.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                      <span>{selectedAddress?.address}</span>
                    </div>
                  </div>
                </section>

                {orderConfirmed && (
                  <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[1.5rem] border border-green-200 bg-green-50 p-6"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-700" />
                      <h3 className="font-semibold text-green-900">Đơn hàng đã được tạo</h3>
                    </div>
                    <p className="text-sm leading-6 text-green-800">
                      Hệ thống đã ghi nhận đơn hàng của bạn. Email xác nhận và cập nhật trạng thái sẽ được gửi trong ít phút tới.
                    </p>
                  </motion.section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddressModal && (
          <AddressModal
            title={editingAddressId ? 'Cập nhật địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng'}
            form={addressForm}
            onChange={handleAddressFormChange}
            onClose={closeAddressModal}
            onSubmit={handleAddAddress}
            submitLabel={editingAddressId ? 'Lưu thay đổi' : 'Lưu địa chỉ'}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
