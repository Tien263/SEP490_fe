import { useEffect, useState } from 'react';
import { Eye, FileText, Filter, RefreshCw, Search, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRIMARY = '#1F3B64';
const INFO = '#2563EB';
const SUCCESS = '#16A34A';
const WARNING = '#F97316';
const ERROR = '#DC2626';
const NEUTRAL = '#64748B';

const ORDER_STATUS: Record<string, { label: string; bg: string }> = {
  New: { label: 'Don moi', bg: NEUTRAL },
  Received: { label: 'Da nhan', bg: INFO },
  InTransit: { label: 'Dang giao', bg: WARNING },
  Delivered: { label: 'Da giao', bg: SUCCESS },
  Cancelled: { label: 'Da huy', bg: ERROR },
  new: { label: 'Don moi', bg: NEUTRAL },
  confirmed: { label: 'Xac nhan', bg: INFO },
  preparing: { label: 'Chuan bi', bg: NEUTRAL },
  shipping: { label: 'Dang giao', bg: WARNING },
  delivered: { label: 'Da giao', bg: SUCCESS },
  cancelled: { label: 'Da huy', bg: ERROR },
};

type SalesOrder = {
  id?: string;
  orderCode: string;
  customerName?: string;
  createdAt?: string;
  finalPayment?: number;
  paymentMethod?: string;
  orderStatus?: string;
  invoicePdfUrl?: string | null;
};

type SalesDashboardPayload = {
  kpi?: {
    newOrdersCount?: number;
    processingOrdersCount?: number;
    deliveredTodayCount?: number;
    revenueToday?: number;
  };
  recentOrders?: SalesOrder[];
};

function StatusBadge({ label, bg }: { label: string; bg: string }) {
  return (
    <span
      className="inline-block px-2 text-white text-[11px] font-medium"
      style={{ backgroundColor: bg, borderRadius: 4, lineHeight: '22px', height: 22, whiteSpace: 'nowrap' }}
    >
      {label}
    </span>
  );
}

function PaymentBadge({ method }: { method: string }) {
  let bg = NEUTRAL;
  if (method === 'SePay') bg = INFO;
  else if (method === 'Cash') bg = SUCCESS;
  else if (method === 'COD') bg = WARNING;

  return (
    <span
      className="inline-block px-2 text-white text-[11px] font-medium"
      style={{ backgroundColor: bg, borderRadius: 4, lineHeight: '22px', height: 22 }}
    >
      {method}
    </span>
  );
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">{label}</p>
      <p className="mt-2 text-[22px] font-extrabold leading-none text-[#374151]">{value}</p>
      <p className="mt-2 text-[11px] text-[#9CA3AF]">{hint}</p>
    </div>
  );
}

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

const parseDate = (dateStr: string) => {
  const hasTimezone = /([+-]\d{2}(:?\d{2})?|Z)$/.test(dateStr);
  return new Date(hasTimezone ? dateStr : `${dateStr}Z`);
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '--';
  const date = parseDate(dateStr);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export default function SalesOrdersPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<SalesDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/orders/sales-dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Khong the tai danh sach don hang.');
      }

      const data: SalesDashboardPayload = await response.json();
      setDashboard(data);

      const now = new Date();
      setLastUpdated(
        now.toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Loi ket noi toi may chu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const orders = [...(dashboard?.recentOrders || [])].sort((a, b) => {
    const aTime = a.createdAt ? parseDate(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? parseDate(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      order.orderCode?.toLowerCase().includes(normalizedQuery) ||
      order.customerName?.toLowerCase().includes(normalizedQuery);

    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter;

    return matchesQuery && matchesStatus && matchesPayment;
  });

  const statusOptions = Array.from(new Set(orders.map((order) => order.orderStatus).filter(Boolean))) as string[];
  const paymentOptions = Array.from(new Set(orders.map((order) => order.paymentMethod).filter(Boolean))) as string[];

  return (
    <div className="flex h-full flex-col bg-[#F5F7FA]">
      <div className="flex h-11 items-center justify-between border-b border-[#E5E7EB] bg-white px-5">
        <div>
          <span className="text-[13px] font-bold text-[#374151]">Quan ly don hang Sales</span>
          <span className="ml-3 text-[11px] text-[#9CA3AF]">Cap nhat luc: {lastUpdated || '--'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="flex h-7 items-center gap-1.5 rounded border border-[#D1D5DB] bg-white px-3 text-[12px] text-[#374151] transition-colors hover:bg-gray-50"
          >
            <RefreshCw className={`h-3 w-3 text-[#9CA3AF] ${loading ? 'animate-spin' : ''}`} />
            Lam moi
          </button>
          <button
            onClick={() => navigate('/sales/direct-purchase')}
            className="flex h-7 items-center gap-1.5 rounded px-3 text-[12px] text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: PRIMARY }}
          >
            <ShoppingCart className="h-3 w-3" />
            Tao don POS
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Don moi"
            value={String(dashboard?.kpi?.newOrdersCount ?? 0)}
            hint="Can uu tien xu ly"
          />
          <SummaryCard
            label="Dang xu ly"
            value={String(dashboard?.kpi?.processingOrdersCount ?? 0)}
            hint="Cho xac nhan, kho, giao hang"
          />
          <SummaryCard
            label="Da giao hom nay"
            value={String(dashboard?.kpi?.deliveredTodayCount ?? 0)}
            hint="Ket qua giao hang trong ngay"
          />
          <SummaryCard
            label="Doanh thu hom nay"
            value={`${formatPrice(dashboard?.kpi?.revenueToday ?? 0)} d`}
            hint="Tong doanh thu ghi nhan"
          />
        </div>

        <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Danh sach don hang</p>
              <p className="mt-1 text-xs text-[#9CA3AF]">Loc nhanh theo khach hang, trang thai va phuong thuc thanh toan</p>
            </div>
            <div className="rounded-full bg-[#EEF2F8] px-3 py-1 text-[11px] font-semibold text-[#1F3B64]">
              {filteredOrders.length} don
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 lg:grid-cols-[minmax(0,1.4fr)_180px_180px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tim ma don hoac ten khach hang"
                className="h-9 w-full rounded border border-[#D1D5DB] bg-white pl-9 pr-3 text-sm text-[#374151] outline-none transition-colors focus:border-[#1F3B64]"
              />
            </label>

            <label className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-9 w-full rounded border border-[#D1D5DB] bg-white pl-9 pr-3 text-sm text-[#374151] outline-none transition-colors focus:border-[#1F3B64]"
              >
                <option value="all">Tat ca trang thai</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUS[status]?.label || status}
                  </option>
                ))}
              </select>
            </label>

            <select
              value={paymentFilter}
              onChange={(event) => setPaymentFilter(event.target.value)}
              className="h-9 w-full rounded border border-[#D1D5DB] bg-white px-3 text-sm text-[#374151] outline-none transition-colors focus:border-[#1F3B64]"
            >
              <option value="all">Tat ca thanh toan</option>
              {paymentOptions.map((payment) => (
                <option key={payment} value={payment}>
                  {payment}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex h-52 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-[#1F3B64]" />
                <span className="text-xs font-semibold text-slate-500">Dang tai danh sach don hang...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-52 flex-col items-center justify-center gap-3 px-4 text-center">
              <p className="text-sm font-semibold text-red-600">{error}</p>
              <button
                onClick={fetchOrders}
                className="rounded px-3 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: PRIMARY }}
              >
                Thu lai
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex h-52 flex-col items-center justify-center gap-3 px-4 text-center">
              <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Khong co don hang phu hop</p>
                <p className="mt-1 text-xs text-slate-400">Thu doi tu khoa tim kiem hoac bo bot bo loc hien tai.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['Ma don', 'Khach hang', 'Thoi gian dat', 'Tong tien', 'Thanh toan', 'Trang thai', 'Hoa don'].map((header) => (
                      <th
                        key={header}
                        className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] ${header === 'Tong tien' ? 'text-right' : ''}`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr
                      key={order.id || order.orderCode || `${order.customerName}-${index}`}
                      className="transition-colors hover:bg-blue-50/30"
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        background: index % 2 === 1 ? '#FAFAFA' : '#FFFFFF',
                      }}
                    >
                      <td className="px-4 py-3 font-bold whitespace-nowrap" style={{ color: PRIMARY }}>
                        {order.orderCode || '--'}
                      </td>
                      <td className="max-w-[240px] truncate px-4 py-3 text-[#374151]">
                        {order.customerName || '--'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums text-[#6B7280]">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold whitespace-nowrap text-[#374151]">
                        {formatPrice(order.finalPayment ?? 0)}
                      </td>
                      <td className="px-4 py-3">
                        <PaymentBadge method={order.paymentMethod || '--'} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={ORDER_STATUS[order.orderStatus || '']?.label || order.orderStatus || '--'}
                          bg={ORDER_STATUS[order.orderStatus || '']?.bg || NEUTRAL}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {order.invoicePdfUrl ? (
                          <a
                            href={`/api${order.invoicePdfUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex rounded p-1.5 text-[#9CA3AF] transition-colors hover:bg-blue-100 hover:text-[#1F3B64]"
                            title="Xem hoa don PDF"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="inline-flex rounded p-1.5 text-slate-300" title="Khong co hoa don PDF">
                            <Eye className="h-4 w-4" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
