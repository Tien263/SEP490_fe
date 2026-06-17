import {
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
  User,
} from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import { getOrderById, isVatExpired, paymentStatusMeta, shippingStatusMeta } from '../data/orders.js'
import { formatPrice } from '../data/products.js'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-gray-50 px-4 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export default function OrderDetail() {
  const { orderId } = useParams()
  const order = getOrderById(orderId)

  if (!order) {
    return <Navigate to="/profile?tab=orders" replace />
  }

  const paymentMeta = paymentStatusMeta[order.payStatus]
  const shippingMeta = shippingStatusMeta[order.shipStatus]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20">
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-[1440px] px-6 py-4 lg:px-8">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-gray-900">
                Trang Chủ
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/profile?tab=orders" className="hover:text-gray-900">
                Lịch sử đơn hàng
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-gray-900">{order.id}</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                to="/profile?tab=orders"
                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại lịch sử đơn hàng
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Chi tiết đơn hàng {order.id}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-500">
                Theo dõi trạng thái đơn hàng, xem lại thông tin giao nhận và kiểm tra chứng từ của đơn đã đặt.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`${paymentMeta.badgeClass} px-3 py-1.5 text-xs font-medium hover:opacity-100`}>
                {paymentMeta.label}
              </Badge>
              <Badge className={`${shippingMeta.badgeClass} px-3 py-1.5 text-xs font-medium hover:opacity-100`}>
                {shippingMeta.label}
              </Badge>
              <Button variant="outline" className="rounded-full text-sm">
                <Download className="h-4 w-4" />
                Tải PDF
              </Button>
              {!isVatExpired(order) && (
                <Button variant="outline" className="rounded-full text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                  <Receipt className="h-4 w-4" />
                  Tải VAT
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Tổng quan</p>
                    <h2 className="mt-2 text-xl font-semibold text-gray-900">Thông tin đơn hàng</h2>
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Tổng thanh toán</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{formatPrice(order.total)}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <InfoRow icon={Package} label="Mã đơn" value={order.id} />
                  <InfoRow icon={CalendarDays} label="Ngày đặt" value={order.date} />
                  <InfoRow icon={CreditCard} label="Thanh toán" value={order.paymentMethod} />
                  <InfoRow icon={MapPin} label="Giao đến" value={order.shippingAddress} />
                </div>

                <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Ghi chú đơn hàng</p>
                  <p className="mt-2 text-sm leading-7 text-gray-600">{order.note}</p>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Sản phẩm</p>
                    <h2 className="mt-2 text-xl font-semibold text-gray-900">Danh sách sản phẩm</h2>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {order.items.length} sản phẩm
                  </span>
                </div>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 md:grid-cols-[1.8fr_0.8fr_0.8fr_0.8fr]"
                    >
                      <div>
                        <p className="text-base font-semibold text-gray-900">{item.name}</p>
                        <p className="mt-1 text-sm text-gray-500">SKU: {item.sku}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Đơn giá</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{formatPrice(item.price)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Số lượng</p>
                        <p className="mt-1 text-sm font-medium text-gray-900">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Thành tiền</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Tiến trình</p>
                <h2 className="mt-2 text-xl font-semibold text-gray-900">Lộ trình xử lý đơn</h2>

                <div className="mt-6 space-y-4">
                  {order.timeline.map((step, index) => (
                    <div key={step.title} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                            step.done ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index < order.timeline.length - 1 && <div className="mt-2 h-full w-px bg-gray-200" />}
                      </div>
                      <div className="pb-6">
                        <p className="text-base font-semibold text-gray-900">{step.title}</p>
                        <p className="mt-1 text-sm text-gray-500">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Người nhận</p>
                <h2 className="mt-2 text-xl font-semibold text-gray-900">Thông tin giao hàng</h2>

                <div className="mt-5 space-y-4">
                  <InfoRow icon={User} label="Người nhận" value={order.customer.name} />
                  <InfoRow icon={Phone} label="Số điện thoại" value={order.customer.phone} />
                  <InfoRow icon={MapPin} label="Địa chỉ nhận hàng" value={order.shippingAddress} />
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-gray-100 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Thanh toán</p>
                <h2 className="mt-2 text-xl font-semibold text-gray-900">Tóm tắt chi phí</h2>

                <div className="mt-5 space-y-4 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Tạm tính</span>
                    <span className="font-medium text-gray-900">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium text-gray-900">{order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Trạng thái VAT</span>
                    <span className={`font-medium ${isVatExpired(order) ? 'text-gray-400' : 'text-blue-600'}`}>
                      {isVatExpired(order) ? 'Quá hạn VAT' : order.hasVat ? 'Đã có VAT' : 'Có thể tải VAT'}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-900">Tổng cộng</span>
                      <span className="text-xl font-bold text-gray-900">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </section>

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
                    <Button variant="outline" className="rounded-full">
                      Xem đơn khác
                    </Button>
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
