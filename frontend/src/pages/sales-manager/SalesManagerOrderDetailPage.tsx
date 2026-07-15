import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package, MapPin, Phone, User, Calendar, CreditCard, ArrowLeft,
  CheckCircle, Truck, Box, ShieldCheck, ChevronRight, Hash
} from 'lucide-react';

const PRIMARY = '#1F3B64';

const ORDER_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  Draft:               { label: 'Chờ xác nhận (COD)', color: '#92400E', bg: '#FEF3C7' },
  PendingPayment:      { label: 'Chờ thanh toán',     color: '#9A3412', bg: '#FFEDD5' },
  PendingConfirmation: { label: 'Chờ xác nhận',       color: '#92400E', bg: '#FEF3C7' },
  Confirmed:           { label: 'Đã xác nhận',        color: '#1E40AF', bg: '#DBEAFE' },
  Processing:          { label: 'Đang xử lý',         color: '#6D28D9', bg: '#EDE9FE' },
  Completed:           { label: 'Hoàn thành',         color: '#065F46', bg: '#D1FAE5' },
  Cancelled:           { label: 'Đã hủy',             color: '#991B1B', bg: '#FEE2E2' },
  CancelRequested:     { label: 'Yêu cầu hủy',       color: '#991B1B', bg: '#FEE2E2' },
  CancelledReallocated:{ label: 'Đã hủy & chuyển',    color: '#991B1B', bg: '#FEE2E2' },
  PaidReviewRequired:  { label: 'Cần duyệt thanh toán', color: '#92400E', bg: '#FEF3C7' },
  New:                 { label: 'Đơn mới',            color: '#1E40AF', bg: '#DBEAFE' },
};

const FULFILLMENT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  Unallocated:    { label: 'Chưa phân bổ',   color: '#6B7280', bg: '#F3F4F6' },
  Reserved:       { label: 'Đã giữ kho',     color: '#1D4ED8', bg: '#DBEAFE' },
  Allocated:      { label: 'Đã phân bổ',     color: '#1D4ED8', bg: '#DBEAFE' },
  Picking:        { label: 'Đang lấy hàng',  color: '#7C3AED', bg: '#EDE9FE' },
  PartiallyReady: { label: 'Sẵn sàng 1 phần', color: '#D97706', bg: '#FEF3C7' },
  Ready:          { label: 'Sẵn sàng',       color: '#059669', bg: '#D1FAE5' },
  Consolidating:  { label: 'Đang gom',       color: '#7C3AED', bg: '#EDE9FE' },
  Consolidated:   { label: 'Đã gom',         color: '#059669', bg: '#D1FAE5' },
  HandedOver:     { label: 'Đã bàn giao',    color: '#059669', bg: '#D1FAE5' },
  Fulfilled:      { label: 'Đã hoàn tất',    color: '#065F46', bg: '#D1FAE5' },
};

const DELIVERY_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  NotScheduled:      { label: 'Chưa lên lịch',    color: '#6B7280', bg: '#F3F4F6' },
  Scheduled:         { label: 'Đã lên lịch',      color: '#1D4ED8', bg: '#DBEAFE' },
  InDelivery:        { label: 'Đang giao',         color: '#D97706', bg: '#FEF3C7' },
  Delivered:         { label: 'Đã giao thành công', color: '#065F46', bg: '#D1FAE5' },
  Failed:            { label: 'Giao thất bại',     color: '#991B1B', bg: '#FEE2E2' },
  PartiallyDelivered:{ label: 'Giao 1 phần',       color: '#D97706', bg: '#FEF3C7' },
  Rescheduled:       { label: 'Đã dời lịch',       color: '#D97706', bg: '#FEF3C7' },
  Cancelled:         { label: 'Đã hủy giao',       color: '#991B1B', bg: '#FEE2E2' },
};

const PAYMENT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  Unpaid:        { label: 'Chưa thanh toán',  color: '#991B1B', bg: '#FEE2E2' },
  Pending:       { label: 'Đang chờ',         color: '#D97706', bg: '#FEF3C7' },
  Paid:          { label: 'Đã thanh toán',    color: '#065F46', bg: '#D1FAE5' },
  PartiallyPaid: { label: 'Thanh toán 1 phần', color: '#D97706', bg: '#FEF3C7' },
  Failed:        { label: 'Thất bại',          color: '#991B1B', bg: '#FEE2E2' },
};

function StatusChip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-semibold rounded-full"
      style={{ backgroundColor: bg, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
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
  productSku?: string;
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
  fulfillmentStatus?: string;
  deliveryStatus?: string;
  items: OrderItem[];
};

// ─── Timeline Steps ─────────────────────────────────────────────────────
function getTimelineSteps(order: SalesOrderDetail) {
  const os = order.orderStatus;
  const fs = order.fulfillmentStatus || 'Unallocated';
  const ds = order.deliveryStatus || 'NotScheduled';

  const steps = [
    {
      label: 'Đơn hàng được tạo',
      icon: Package,
      done: true,
      time: order.createdAt,
    },
    {
      label: order.paymentMethod === 'COD' ? 'Sales xác nhận COD' : 'Thanh toán thành công',
      icon: CreditCard,
      done: ['Confirmed', 'Processing', 'Completed'].includes(os),
    },
    {
      label: 'Kho xử lý & đóng gói',
      icon: Box,
      done: ['Picking', 'PartiallyReady', 'Ready', 'Consolidating', 'Consolidated', 'HandedOver', 'Fulfilled'].includes(fs),
    },
    {
      label: 'Bàn giao vận chuyển',
      icon: Truck,
      done: ['HandedOver', 'Fulfilled'].includes(fs),
    },
    {
      label: 'Giao hàng thành công',
      icon: CheckCircle,
      done: ds === 'Delivered' || os === 'Completed',
    },
  ];

  return steps;
}

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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#1F3B64]" />
          <p className="text-sm text-slate-500">Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="rounded-full bg-red-50 p-4">
          <ShieldCheck className="h-8 w-8 text-red-400" />
        </div>
        <p className="text-red-600 font-medium">{error || 'Không tìm thấy thông tin đơn hàng'}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </button>
      </div>
    );
  }

  const timeline = getTimelineSteps(order);
  const activeStep = timeline.filter(s => s.done).length;

  const orderMeta = ORDER_STATUS[order.orderStatus] || { label: order.orderStatus, color: '#6B7280', bg: '#F3F4F6' };
  const paymentMeta = PAYMENT_STATUS[order.paymentStatus] || { label: order.paymentStatus, color: '#6B7280', bg: '#F3F4F6' };
  const fulfillmentMeta = FULFILLMENT_STATUS[order.fulfillmentStatus || ''] || { label: order.fulfillmentStatus || '--', color: '#6B7280', bg: '#F3F4F6' };
  const deliveryMeta = DELIVERY_STATUS[order.deliveryStatus || ''] || { label: order.deliveryStatus || '--', color: '#6B7280', bg: '#F3F4F6' };

  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">Đơn hàng #{order.orderCode}</h1>
                <StatusChip {...orderMeta} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Quản lý đơn hàng
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ── Timeline Progress ───────────────────────────────────────── */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Tiến trình xử lý đơn</h3>
            <span className="text-xs text-slate-400 ml-auto">{activeStep}/{timeline.length} bước</span>
          </div>
          <div className="flex items-start justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100" style={{ marginLeft: '40px', marginRight: '40px' }} />
            <div
              className="absolute top-5 left-0 h-0.5 transition-all duration-500"
              style={{
                marginLeft: '40px',
                width: `calc(${((activeStep - 1) / (timeline.length - 1)) * 100}% - 80px)`,
                backgroundColor: PRIMARY,
              }}
            />

            {timeline.map((step, i) => {
              const Icon = step.icon;
              const isDone = step.done;
              const isCurrent = i === activeStep;
              return (
                <div key={i} className="flex flex-col items-center relative z-10 flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isDone
                        ? 'text-white shadow-md'
                        : isCurrent
                        ? 'bg-white border-2 text-slate-400 shadow-sm'
                        : 'bg-slate-100 text-slate-300'
                    }`}
                    style={isDone ? { backgroundColor: PRIMARY } : isCurrent ? { borderColor: PRIMARY, color: PRIMARY } : {}}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <p
                    className={`mt-2 text-[11px] text-center max-w-[100px] leading-tight font-medium ${
                      isDone ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left Column: Info Cards ────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-5">
            {/* Khách hàng */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
                  <User className="w-4 h-4" style={{ color: PRIMARY }} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Khách hàng</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Khách hàng</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{order.customerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Điện thoại</p>
                    <p className="text-sm font-medium text-slate-900">{order.customerPhone || '---'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Giao hàng */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50">
                  <Truck className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Giao hàng</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Địa chỉ giao</p>
                    <p className="text-sm font-medium text-slate-900 leading-relaxed">{order.shippingAddress || '---'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Kho</p>
                    <div className="mt-1">
                      <StatusChip {...fulfillmentMeta} />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Vận chuyển</p>
                    <div className="mt-1">
                      <StatusChip {...deliveryMeta} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thanh toán */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-50">
                  <CreditCard className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Thanh toán</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-xs text-slate-500">Phương thức</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-xs text-slate-500">Trạng thái</span>
                  <StatusChip {...paymentMeta} />
                </div>
              </div>

              {/* Bảng tóm tắt chi phí */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Tạm tính</span>
                  <span className="font-medium text-slate-700 tabular-nums">{formatPrice(order.totalAmount)} ₫</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-600">Chiết khấu</span>
                    <span className="font-medium text-emerald-600 tabular-nums">-{formatPrice(order.discountAmount)} ₫</span>
                  </div>
                )}
                {order.vatAmount > 0 && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Thuế VAT (10%)</span>
                    <span className="font-medium text-slate-700 tabular-nums">{formatPrice(order.vatAmount)} ₫</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200">
                  <span className="text-sm font-bold text-slate-900">Tổng cộng</span>
                  <span className="text-xl font-extrabold tabular-nums" style={{ color: PRIMARY }}>
                    {formatPrice(order.finalPayment)} ₫
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Product List ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">Chi tiết sản phẩm</h3>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                  {order.items.length} sản phẩm · {totalQty} đơn vị
                </span>
              </div>
              
              <div className="divide-y divide-slate-100">
                {order.items?.map((item, idx) => (
                  <div key={item.id || idx} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.productName}</p>
                      {item.productSku && (
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {item.productSku}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center shrink-0 w-16">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">SL</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0 w-28">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Đơn giá</p>
                        <p className="text-sm font-medium text-slate-600 tabular-nums mt-0.5">{formatPrice(item.priceSnapshot)} ₫</p>
                      </div>
                      <div className="text-right shrink-0 w-32">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Thành tiền</p>
                        <p className="text-sm font-bold text-slate-900 tabular-nums mt-0.5">{formatPrice(item.lineTotal)} ₫</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2">
                  <Hash className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Mã đơn</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{order.orderCode}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-4 h-4 text-violet-600" />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Ngày đặt</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{formatDateTime(order.createdAt).split(',')[0] || formatDateTime(order.createdAt)}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Sản phẩm</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{totalQty} đơn vị</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#EEF2FF' }}>
                  <CreditCard className="w-4 h-4" style={{ color: PRIMARY }} />
                </div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Thanh toán</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: PRIMARY }}>
                  {formatPrice(order.finalPayment)} ₫
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
