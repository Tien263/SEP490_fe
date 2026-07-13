import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, Phone, User, Calendar, CreditCard, ArrowLeft, ShieldCheck } from 'lucide-react';

const PRIMARY = '#1F3B64';
const NEUTRAL = '#64748B';

const ORDER_STATUS: Record<string, { label: string; bg: string }> = {
  Draft: { label: 'Chờ xác nhận (COD)', bg: '#F59E0B' },
  PendingConfirmation: { label: 'Chờ xác nhận', bg: '#F59E0B' },
  Confirmed: { label: 'Đã xác nhận', bg: '#3B82F6' },
  New: { label: 'Đơn mới', bg: NEUTRAL },
  Received: { label: 'Đã nhận', bg: '#2563EB' },
  Packing: { label: 'Đang đóng gói', bg: '#8B5CF6' },
  Shortage: { label: 'Thiếu hàng', bg: '#DC2626' },
  InTransit: { label: 'Đang giao', bg: '#F97316' },
  Delivered: { label: 'Đã giao', bg: '#16A34A' },
  Cancelled: { label: 'Đã hủy', bg: '#DC2626' },
};

function StatusBadge({ label, bg }: { label: string; bg: string }) {
  return (
    <span
      className="inline-flex items-center justify-center px-2.5 py-1 text-white text-[12px] font-medium rounded"
      style={{ backgroundColor: bg }}
    >
      {label}
    </span>
  );
}

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '--';
  const hasTimezone = /([+-]\d{2}(:?\d{2})?|Z)$/.test(dateStr);
  const date = new Date(hasTimezone ? dateStr : `${dateStr}Z`);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  priceSnapshot: number;
  lineTotal: number;
};

type SalesOrderDetail = {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
  createdAt: string;
  totalAmount: number;
  discountAmount: number;
  vatAmount: number;
  finalPayment: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  items: OrderItem[];
};

export default function SalesManagerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<SalesOrderDetail | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/sales/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (!res.ok) throw new Error('Không thể tải chi tiết đơn hàng.');
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-gray-900 gap-4">
        <p className="text-red-500 font-medium">{error || 'Không tìm thấy thông tin đơn hàng'}</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">Quay lại danh sách</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-full bg-white shadow-sm text-gray-500 hover:text-gray-900 transition-colors border"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng #{order.orderCode}</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Góc nhìn Quản lý
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cột trái: Thông tin chung */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Thông tin chung</h3>
              
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Trạng thái</span>
                <div className="mt-1">
                  <StatusBadge
                    label={ORDER_STATUS[order.orderStatus]?.label || order.orderStatus}
                    bg={ORDER_STATUS[order.orderStatus]?.bg || NEUTRAL}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Ngày đặt</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(order.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Khách hàng</p>
                  <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Số điện thoại</p>
                  <p className="text-sm font-medium text-gray-900">{order.customerPhone || '---'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Giao đến</p>
                  <p className="text-sm font-medium text-gray-900">{order.shippingAddress || '---'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Thanh toán</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold">{order.paymentMethod}</span>
                    <span className={order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'}>
                      {order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Danh sách sản phẩm & Tổng tiền */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 border-b px-5 py-4 bg-gray-50/50">
                <Package className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Chi tiết sản phẩm</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white border-b text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Sản phẩm</th>
                      <th className="px-5 py-3 font-medium text-center">Số lượng</th>
                      <th className="px-5 py-3 font-medium text-right">Đơn giá</th>
                      <th className="px-5 py-3 font-medium text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-medium text-gray-900">
                          {item.productName}
                        </td>
                        <td className="px-5 py-3 text-center text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-600 tabular-nums">
                          {formatPrice(item.priceSnapshot)}
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-gray-900 tabular-nums">
                          {formatPrice(item.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="ml-auto w-full max-w-sm space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="tabular-nums font-medium">{formatPrice(order.totalAmount)} ₫</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Chiết khấu</span>
                    <span className="tabular-nums font-medium">-{formatPrice(order.discountAmount)} ₫</span>
                  </div>
                )}
                {order.vatAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Thuế VAT (10%)</span>
                    <span className="tabular-nums font-medium">{formatPrice(order.vatAmount)} ₫</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="font-semibold text-gray-900">Khách phải trả</span>
                  <span className="text-xl font-bold text-red-600 tabular-nums">{formatPrice(order.finalPayment)} ₫</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
