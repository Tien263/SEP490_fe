import React, { useEffect, useState } from 'react';
import { X, Package, DollarSign, MapPin, Phone, User, Calendar, CreditCard } from 'lucide-react';

const PRIMARY = '#1F3B64';
const INFO = '#2563EB';
const SUCCESS = '#16A34A';
const WARNING = '#F97316';
const ERROR = '#DC2626';
const NEUTRAL = '#64748B';

const ORDER_STATUS: Record<string, { label: string; bg: string }> = {
  New: { label: 'Đơn mới', bg: NEUTRAL },
  Received: { label: 'Đã nhận', bg: INFO },
  Packing: { label: 'Đang đóng gói', bg: '#8B5CF6' },
  Shortage: { label: 'Thiếu hàng', bg: ERROR },
  InTransit: { label: 'Đang giao', bg: WARNING },
  Delivered: { label: 'Đã giao', bg: SUCCESS },
  Cancelled: { label: 'Đã hủy', bg: ERROR },
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

export default function SalesOrderDetailModal({ 
  orderId, 
  onClose 
}: { 
  orderId: string; 
  onClose: () => void 
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<SalesOrderDetail | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/sales/${orderId}`, {
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
    if (orderId) fetchDetail();
  }, [orderId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Chi tiết đơn hàng {order?.orderCode ? `#${order.orderCode}` : ''}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center text-red-500 font-medium">
              {error}
            </div>
          ) : !order ? (
            <div className="flex h-40 items-center justify-center text-gray-500">
              Không tìm thấy thông tin đơn hàng
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Cột trái: Thông tin chung */}
              <div className="md:col-span-1 space-y-6">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 space-y-4">
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
                      <p className="text-sm font-medium text-gray-900 line-clamp-3">{order.shippingAddress || '---'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Thanh toán</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.paymentMethod} - <span className={order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'}>{order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột phải: Danh sách sản phẩm & Tổng tiền */}
              <div className="md:col-span-2 space-y-6">
                <div className="rounded-xl border border-gray-100 bg-white">
                  <div className="flex items-center gap-2 border-b px-5 py-4">
                    <Package className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">Chi tiết sản phẩm</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
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

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
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
                      <span className="text-lg font-bold text-red-600 tabular-nums">{formatPrice(order.finalPayment)} ₫</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t bg-gray-50 px-6 py-4 rounded-b-xl">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
