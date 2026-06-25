import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Download,
  ExternalLink,
  MapPin,
  Package,
  Phone,
  Receipt,
  RefreshCw,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import {
  downloadInvoicePdf,
  getOrderDetail,
  getOrderTimeline,
  orderStatusMeta,
  paymentStatusMeta,
  redInvoiceStatusMeta,
  requestVatInvoice,
} from '../services/orderService.js'
import { exportInvoiceToPdf } from '../utils/exportPdf.js'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-gray-50 px-4 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-1 text-sm font-medium text-gray-900 break-words">{value || '—'}</p>
      </div>
    </div>
  )
}

const formatPrice = (n) =>
  n?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) ?? '—'

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function OrderDetail() {
  const { orderId } = useParams()
  const navigate    = useNavigate()

  const [order,      setOrder]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [vatLoading, setVatLoading] = useState(false)
  const [vatDone,    setVatDone]    = useState(false)

  async function fetchOrder() {
    setLoading(true)
    setError(null)
    try {
      const data = await getOrderDetail(orderId)
      setOrder(data)
    } catch (err) {
      setError(err.message || 'Không thể tải chi tiết đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrder() }, [orderId])

  async function handleRequestVat() {
    setVatLoading(true)
    try {
      await requestVatInvoice(order.id)
      setOrder((prev) => ({ ...prev, canRequestVat: false, redInvoiceStatus: 'Pending' }))
      setVatDone(true)
    } catch (err) {
      alert(err.message || 'Lỗi khi yêu cầu hóa đơn VAT.')
    } finally {
      setVatLoading(false)
    }
  }

  async function handleDownloadPdf() {
    try {
      if (!order) return
      // Hiển thị trạng thái đang tải (có thể dùng button loading sau này)
      await exportInvoiceToPdf(order)
    } catch (err) {
      alert(err.message)
    }
  }

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center pt-40">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
          <p className="mt-4 text-sm text-gray-500">Đang tải chi tiết đơn hàng...</p>
        </div>
        <Footer />
      </div>
    )
  }

  // ─── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center pt-40">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p className="mt-3 text-sm font-medium text-gray-700">{error}</p>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" className="rounded-full gap-2" onClick={fetchOrder}>
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </Button>
            <Link to="/profile?tab=orders">
              <Button variant="outline" className="rounded-full">
                Về lịch sử đơn hàng
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!order) return null

  const payMeta   = paymentStatusMeta[order.paymentStatus]   || { label: order.paymentStatus,   badgeClass: 'bg-gray-100 text-gray-500' }
  const orderMeta = orderStatusMeta[order.orderStatus]       || { label: order.orderStatus,     badgeClass: 'bg-gray-100 text-gray-500' }
  const vatMeta   = redInvoiceStatusMeta[order.redInvoiceStatus] || redInvoiceStatusMeta.None
  const timeline  = getOrderTimeline(order.orderStatus)

  const vatDeadlineStr = order.vatDeadline
    ? new Date(order.vatDeadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20">
        {/* Breadcrumb */}
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-[1440px] px-6 py-4 lg:px-8">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-gray-900">Trang Chủ</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/profile?tab=orders" className="hover:text-gray-900">Lịch sử đơn hàng</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-gray-900">{order.orderCode}</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-8">
          {/* Header row */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                to="/profile?tab=orders"
                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại lịch sử đơn hàng
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Chi tiết đơn hàng {order.orderCode}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-500">
                Theo dõi trạng thái đơn hàng, xem lại thông tin giao nhận và kiểm tra chứng từ.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`${payMeta.badgeClass} px-3 py-1.5 text-xs font-medium hover:opacity-100`}>
                {payMeta.label}
              </Badge>
              <Badge className={`${orderMeta.badgeClass} px-3 py-1.5 text-xs font-medium hover:opacity-100`}>
                {orderMeta.label}
              </Badge>

              {/* Nút tải PDF */}
              <Button
                variant="outline"
                className="rounded-full text-sm gap-2"
                onClick={handleDownloadPdf}
                title="Tải hóa đơn PDF"
              >
                <Download className="h-4 w-4" />
                Tải PDF
              </Button>

              {/* Nút yêu cầu VAT */}
              {order.canRequestVat && !vatDone && (
                <Button
                  variant="outline"
                  className="rounded-full text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700 gap-2"
                  onClick={handleRequestVat}
                  disabled={vatLoading}
                >
                  <Receipt className="h-4 w-4" />
                  {vatLoading ? 'Đang gửi...' : 'Yêu cầu VAT'}
                </Button>
              )}

              {/* Trạng thái VAT (sau khi đã yêu cầu) */}
              {(!order.canRequestVat || vatDone) && order.redInvoiceStatus !== 'None' && (
                <Badge className={`${vatMeta.badgeClass} px-3 py-1.5 text-xs font-medium hover:opacity-100`}>
                  VAT: {vatMeta.label}
                </Badge>
              )}
            </div>
          </div>

          {/* VAT deadline banner */}
          {order.canRequestVat && vatDeadlineStr && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <Receipt className="h-4 w-4 flex-shrink-0" />
              <span>Bạn có thể yêu cầu hóa đơn VAT trước <strong>{vatDeadlineStr}</strong>.</span>
            </div>
          )}

          {/* VAT done banner */}
          {vatDone && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <Receipt className="h-4 w-4 flex-shrink-0" />
              Yêu cầu hóa đơn VAT đã được ghi nhận. Đội kế toán sẽ liên hệ trong thời gian sớm nhất.
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            {/* Left column */}
            <div className="space-y-6">
              {/* Order overview */}
              <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Tổng quan</p>
                    <h2 className="mt-2 text-xl font-semibold text-gray-900">Thông tin đơn hàng</h2>
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Tổng thanh toán</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{formatPrice(order.finalPayment)}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <InfoRow icon={Package}     label="Mã đơn hàng"  value={order.orderCode} />
                  <InfoRow icon={CalendarDays} label="Ngày đặt"     value={formatDate(order.createdAt)} />
                  <InfoRow icon={CreditCard}   label="Thanh toán"   value={order.paymentMethod} />
                  {order.deliveryShift && (
                    <InfoRow icon={MapPin} label="Ca giao hàng" value={order.deliveryShift} />
                  )}
                </div>
              </section>

              {/* Product list */}
              <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Sản phẩm</p>
                    <h2 className="mt-2 text-xl font-semibold text-gray-900">Danh sách sản phẩm</h2>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {order.items?.length ?? 0} sản phẩm
                  </span>
                </div>

                <div className="space-y-4">
                  {(order.items || []).map((item) => (
                    <div
                      key={item.productId}
                      className="grid gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 md:grid-cols-[2fr_0.8fr_0.8fr_0.8fr]"
                    >
                      <div className="flex items-center gap-3">
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-12 w-12 rounded-xl object-cover flex-shrink-0"
                          />
                        )}
                        <div>
                          <p className="text-base font-semibold text-gray-900">{item.productName}</p>
                          {item.productSku && (
                            <p className="mt-0.5 text-xs text-gray-400">SKU: {item.productSku}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Đơn giá</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{formatPrice(item.priceSnapshot)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Số lượng</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Thành tiền</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{formatPrice(item.lineTotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Timeline */}
              <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Tiến trình</p>
                <h2 className="mt-2 text-xl font-semibold text-gray-900">Lộ trình xử lý đơn</h2>

                <div className="mt-6 space-y-4">
                  {timeline.map((step, index) => (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                            step.done ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index < timeline.length - 1 && (
                          <div className={`mt-2 h-full w-px ${step.done ? 'bg-gray-300' : 'bg-gray-100'}`} />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className={`text-base font-semibold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.title}
                        </p>
                        {step.done && (
                          <p className="mt-1 text-sm text-emerald-600">Hoàn thành</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Payment summary */}
              <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Thanh toán</p>
                <h2 className="mt-2 text-xl font-semibold text-gray-900">Tóm tắt chi phí</h2>

                <div className="mt-5 space-y-4 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Tạm tính</span>
                    <span className="font-medium text-gray-900">{formatPrice(order.totalAmount)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Chiết khấu</span>
                      <span className="font-medium text-emerald-600">- {formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  {order.vatAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span>VAT (10%)</span>
                      <span className="font-medium text-gray-900">{formatPrice(order.vatAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Trạng thái hóa đơn VAT</span>
                    <span className={`font-medium ${order.canRequestVat ? 'text-blue-600' : vatMeta.badgeClass.includes('emerald') ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {vatMeta.label}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-900">Tổng cộng</span>
                      <span className="text-xl font-bold text-gray-900">{formatPrice(order.finalPayment)}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Support */}
              <section className="rounded-[1.75rem] border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Hỗ trợ</p>
                <h2 className="mt-2 text-xl font-semibold text-gray-900">Cần hỗ trợ đơn hàng?</h2>
                <p className="mt-3 text-sm leading-7 text-gray-500">
                  Nếu bạn cần kiểm tra chứng từ, thay đổi người nhận hoặc xác nhận tiến độ giao hàng, đội Sales sẽ hỗ trợ nhanh nhất.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button className="rounded-full bg-gray-900 text-white hover:bg-gray-800">
                    <ExternalLink className="h-4 w-4" />
                    Liên hệ Sales
                  </Button>
                  <Link to="/profile?tab=orders">
                    <Button variant="outline" className="rounded-full">Xem đơn khác</Button>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
