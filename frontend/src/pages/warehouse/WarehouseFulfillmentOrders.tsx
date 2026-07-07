import { useState } from 'react';
import { Button } from '../../components/sales-ui/button';
import { Input } from '../../components/sales-ui/input';
import { Search, Eye, Download, RefreshCw, Filter, UserPlus, ClipboardList, X, Clock, CheckCircle, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/sales-ui/dialog';

const PRIMARY = '#1F3B64';
const SUCCESS = '#16A34A';
const WARNING = '#D97706';
const ERROR   = '#DC2626';
const INFO    = '#2563EB';
const NEUTRAL = '#64748B';
const PURPLE  = '#7C3AED';

const STATUS_CFG: Record<string, { label: string; bg: string }> = {
  waiting:     { label: 'Chờ xử lý',    bg: NEUTRAL },
  picking:     { label: 'Đang pick',     bg: INFO    },
  packing:     { label: 'Đang packing',  bg: PURPLE  },
  ready:       { label: 'Sẵn sàng',      bg: SUCCESS },
  transferred: { label: 'Đã bàn giao',   bg: '#0891B2' },
  cancelled:   { label: 'Đã hủy',        bg: ERROR   },
};

const PRIORITY_CFG: Record<string, { label: string; bg: string }> = {
  urgent: { label: 'Khẩn cấp', bg: ERROR   },
  high:   { label: 'Cao',       bg: WARNING },
  normal: { label: 'Thường',    bg: NEUTRAL },
};

interface FulfillmentOrder {
  id: string; soNo: string; customer: string; warehouse: string;
  priority: 'urgent' | 'high' | 'normal';
  delivery: string; allocatedQty: number; reservedQty: number;
  pickStatus: string; packStatus: string; consolidation: string; handover: string;
  createdDate: string; assignedPicker: string;
  status: 'waiting' | 'picking' | 'packing' | 'ready' | 'transferred' | 'cancelled';
  products: { sku: string; name: string; aisle: string; rack: string; bin: string; orderedQty: number; allocatedQty: number; reservedQty: number }[];
  timeline: { time: string; event: string; user: string }[];
}

const ORDERS: FulfillmentOrder[] = [
  {
    id: 'FO-2406-0134', soNo: 'SO-2406-0892', customer: 'Cty TNHH Minh Anh Textile',
    warehouse: 'Kho Hà Nội', priority: 'urgent', delivery: 'Giao tận nơi',
    allocatedQty: 450, reservedQty: 450, pickStatus: 'Chưa bắt đầu', packStatus: 'Chưa bắt đầu',
    consolidation: 'Chưa', handover: 'Chưa', createdDate: '06/07/2026 08:15', assignedPicker: 'Nguyễn Văn Thành',
    status: 'waiting',
    products: [
      { sku: 'VT-CT-001', name: 'Vải cotton khổ 1.5m', aisle: 'A', rack: '01', bin: '03', orderedQty: 200, allocatedQty: 200, reservedQty: 200 },
      { sku: 'VT-SM-012', name: 'Sơ mi nam slim fit',   aisle: 'B', rack: '02', bin: '11', orderedQty: 150, allocatedQty: 150, reservedQty: 150 },
      { sku: 'VT-QT-007', name: 'Quần tây slim fit',    aisle: 'B', rack: '03', bin: '05', orderedQty: 100, allocatedQty: 100, reservedQty: 100 },
    ],
    timeline: [
      { time: '06/07 08:15', event: 'Tạo Fulfillment Order', user: 'Hệ thống' },
      { time: '06/07 08:20', event: 'Phân bổ kho thành công', user: 'Hệ thống' },
      { time: '06/07 08:25', event: 'Giao cho nhân viên Thành', user: 'Trần Văn Bình' },
    ],
  },
  {
    id: 'FO-2406-0133', soNo: 'SO-2406-0891', customer: 'Shop Vải Lan Anh',
    warehouse: 'Kho Hà Nội', priority: 'high', delivery: 'Giao GHTK',
    allocatedQty: 40, reservedQty: 40, pickStatus: 'Đang thực hiện', packStatus: 'Chưa bắt đầu',
    consolidation: 'Chưa', handover: 'Chưa', createdDate: '06/07/2026 07:50', assignedPicker: 'Lê Văn Dũng',
    status: 'picking',
    products: [
      { sku: 'VT-DP-021', name: 'Đồng phục VP nữ', aisle: 'C', rack: '01', bin: '02', orderedQty: 20, allocatedQty: 20, reservedQty: 20 },
      { sku: 'VT-DP-020', name: 'Đồng phục VP nam', aisle: 'C', rack: '01', bin: '01', orderedQty: 20, allocatedQty: 20, reservedQty: 20 },
    ],
    timeline: [
      { time: '06/07 07:50', event: 'Tạo Fulfillment Order', user: 'Hệ thống' },
      { time: '06/07 08:00', event: 'Bắt đầu Pick Task', user: 'Lê Văn Dũng' },
    ],
  },
  {
    id: 'FO-2406-0132', soNo: 'SO-2406-0890', customer: 'May Mặc Tân Phú',
    warehouse: 'Kho HCM', priority: 'normal', delivery: 'Giao J&T',
    allocatedQty: 95, reservedQty: 95, pickStatus: 'Hoàn tất', packStatus: 'Hoàn tất',
    consolidation: 'Hoàn tất', handover: 'Chờ xác nhận', createdDate: '05/07/2026 14:30', assignedPicker: 'Phạm Thị Hương',
    status: 'ready',
    products: [
      { sku: 'VT-AK-009', name: 'Áo khoác công sở nữ', aisle: 'C', rack: '02', bin: '04', orderedQty: 15, allocatedQty: 15, reservedQty: 15 },
      { sku: 'VT-DM-005', name: 'Vải denim cao cấp',    aisle: 'A', rack: '03', bin: '06', orderedQty: 80, allocatedQty: 80, reservedQty: 80 },
    ],
    timeline: [
      { time: '05/07 14:30', event: 'Tạo Fulfillment Order', user: 'Hệ thống' },
      { time: '05/07 15:00', event: 'Bắt đầu picking', user: 'Phạm Thị Hương' },
      { time: '05/07 16:30', event: 'Hoàn tất picking', user: 'Phạm Thị Hương' },
      { time: '05/07 17:00', event: 'Hoàn tất packing', user: 'Phạm Thị Hương' },
      { time: '06/07 08:00', event: 'Chuyển khu consolidation', user: 'Hệ thống' },
    ],
  },
  {
    id: 'FO-2406-0131', soNo: 'SO-2406-0889', customer: 'Cửa hàng Đức Thịnh',
    warehouse: 'Kho HCM', priority: 'urgent', delivery: 'Tự lấy',
    allocatedQty: 780, reservedQty: 740, pickStatus: 'Đang thực hiện', packStatus: 'Chưa bắt đầu',
    consolidation: 'Chưa', handover: 'Chưa', createdDate: '05/07/2026 13:00', assignedPicker: 'Nguyễn Văn Thành',
    status: 'picking',
    products: [],
    timeline: [
      { time: '05/07 13:00', event: 'Tạo Fulfillment Order', user: 'Hệ thống' },
      { time: '05/07 13:30', event: 'Bắt đầu picking', user: 'Nguyễn Văn Thành' },
    ],
  },
  {
    id: 'FO-2406-0130', soNo: 'SO-2406-0888', customer: 'HTX Dệt Hà Đông',
    warehouse: 'Kho Hà Nội', priority: 'normal', delivery: 'Giao tận nơi',
    allocatedQty: 320, reservedQty: 320, pickStatus: 'Hoàn tất', packStatus: 'Hoàn tất',
    consolidation: 'Hoàn tất', handover: 'Hoàn tất', createdDate: '04/07/2026 09:00', assignedPicker: 'Lê Văn Dũng',
    status: 'transferred',
    products: [],
    timeline: [],
  },
];

function Breadcrumb() {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-0.5">
      <span className="text-gray-400">Kho hàng</span>
      <span className="text-gray-300">/</span>
      <span className="text-gray-400">Xuất kho (Outbound)</span>
      <span className="text-gray-300">/</span>
      <span className="text-gray-800 font-semibold">Lệnh xuất kho</span>
    </div>
  );
}

function Badge({ status, cfg }: { status: string; cfg: Record<string, { label: string; bg: string }> }) {
  const c = cfg[status] || { label: status, bg: NEUTRAL };
  return (
    <span className="text-[10px] font-semibold text-white px-2 py-0.5 inline-block whitespace-nowrap" style={{ backgroundColor: c.bg, borderRadius: 4 }}>
      {c.label}
    </span>
  );
}

export default function WarehouseFulfillmentOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [detail, setDetail] = useState<FulfillmentOrder | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = ORDERS.filter(o => {
    const q = search.toLowerCase();
    const ms = !q || o.id.toLowerCase().includes(q) || o.soNo.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
    const mst = statusFilter === 'all' || o.status === statusFilter;
    const mp  = priorityFilter === 'all' || o.priority === priorityFilter;
    return ms && mst && mp;
  });

  const toggleSelect = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(o => o.id));

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex-shrink-0">
        <Breadcrumb />
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Lệnh xuất kho (Fulfillment Orders)</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {ORDERS.length} lệnh · {ORDERS.filter(o => o.status === 'waiting').length} chờ xử lý · {ORDERS.filter(o => o.status === 'picking').length} đang picking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><RefreshCw className="w-3 h-3" /> Làm mới</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><Download className="w-3 h-3" /> Xuất Excel</Button>
            {selected.length > 0 && (
              <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: PRIMARY }}>
                <UserPlus className="w-3 h-3" /> Phân công ({selected.length})
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input className="pl-8 h-7 text-xs bg-gray-50" placeholder="Mã lệnh, SO, khách hàng..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="all">Tất cả ưu tiên</option>
            {Object.entries(PRIORITY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)}>
            <option value="">Tất cả kho</option>
            <option>Kho Hà Nội</option>
            <option>Kho HCM</option>
            <option>Kho Đà Nẵng</option>
          </select>
          <input type="date" className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="Từ ngày" />
          <input type="date" className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={dateTo} onChange={e => setDateTo(e.target.value)} title="Đến ngày" />
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><Filter className="w-3 h-3" /> Lọc nâng cao</Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        {selected.length > 0 && (
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded px-3 py-2 mb-2 flex items-center gap-2 text-xs">
            <span className="font-semibold text-blue-700">Đã chọn {selected.length} lệnh</span>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100">Phân công Picker</button>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100">Tạo Pick Task</button>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100">Xuất Excel</button>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100 ml-auto" onClick={() => setSelected([])}>Hủy chọn</button>
          </div>
        )}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-3.5 h-3.5" /></th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Mã lệnh</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Đơn hàng</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Khách hàng</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Kho</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Ưu tiên</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Phân bổ</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Người pick</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Trạng thái</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Ngày tạo</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>
                    <p className="text-sm font-medium text-gray-500">Không có lệnh xuất kho</p>
                    <p className="text-xs text-gray-400">Thay đổi bộ lọc để xem kết quả khác</p>
                  </div>
                </td></tr>
              )}
              {filtered.map((o, i) => (
                <tr key={o.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-3 py-2.5"><input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggleSelect(o.id)} className="w-3.5 h-3.5" /></td>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: PRIMARY }}>{o.id}</td>
                  <td className="px-3 py-2.5 text-gray-600 font-medium">{o.soNo}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-800">{o.customer}</td>
                  <td className="px-3 py-2.5 text-gray-600">{o.warehouse}</td>
                  <td className="px-3 py-2.5 text-center"><Badge status={o.priority} cfg={PRIORITY_CFG} /></td>
                  <td className="px-3 py-2.5 text-center font-mono text-gray-700">{o.allocatedQty}/{o.reservedQty}</td>
                  <td className="px-3 py-2.5 text-gray-700">{o.assignedPicker}</td>
                  <td className="px-3 py-2.5 text-center"><Badge status={o.status} cfg={STATUS_CFG} /></td>
                  <td className="px-3 py-2.5 text-gray-500">{o.createdDate}</td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" onClick={() => setDetail(o)} title="Xem chi tiết"><Eye className="w-3.5 h-3.5" /></button>
                      {o.status === 'waiting' && (
                        <button className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" title="Tạo Pick Task"><ClipboardList className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-xs text-gray-500">Hiển thị {filtered.length} / {ORDERS.length} bản ghi</span>
            <div className="flex items-center gap-1">
              {[1].map(p => (
                <button key={p} className="w-6 h-6 text-xs rounded font-medium text-white flex items-center justify-center" style={{ backgroundColor: PRIMARY }}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Package className="w-4 h-4" style={{ color: PRIMARY }} />
              Chi tiết lệnh xuất kho — {detail?.id}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Thông tin đơn hàng</p>
                  <div className="flex justify-between"><span className="text-gray-500">Mã lệnh:</span><span className="font-semibold" style={{ color: PRIMARY }}>{detail.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Đơn SO:</span><span className="font-medium">{detail.soNo}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Khách hàng:</span><span className="font-medium text-gray-800">{detail.customer}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Giao hàng:</span><span>{detail.delivery}</span></div>
                </div>
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Phân bổ kho</p>
                  <div className="flex justify-between"><span className="text-gray-500">Kho:</span><span className="font-medium">{detail.warehouse}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Đã phân bổ:</span><span className="font-semibold">{detail.allocatedQty}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Đã dự trữ:</span><span className="font-semibold">{detail.reservedQty}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Người pick:</span><span>{detail.assignedPicker}</span></div>
                </div>
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Tiến trình</p>
                  <div className="flex justify-between"><span className="text-gray-500">Trạng thái:</span><Badge status={detail.status} cfg={STATUS_CFG} /></div>
                  <div className="flex justify-between"><span className="text-gray-500">Picking:</span><span>{detail.pickStatus}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Packing:</span><span>{detail.packStatus}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Consolidation:</span><span>{detail.consolidation}</span></div>
                </div>
              </div>

              {detail.products.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-600 text-[10px] uppercase tracking-wide mb-2">Danh sách sản phẩm</p>
                  <table className="w-full border border-gray-200 rounded overflow-hidden">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-3 py-2 text-gray-700 font-semibold">SKU</th>
                        <th className="text-left px-3 py-2 text-gray-700 font-semibold">Tên sản phẩm</th>
                        <th className="text-center px-3 py-2 text-gray-700 font-semibold">Dãy</th>
                        <th className="text-center px-3 py-2 text-gray-700 font-semibold">Kệ</th>
                        <th className="text-center px-3 py-2 text-gray-700 font-semibold">Ngăn</th>
                        <th className="text-center px-3 py-2 text-gray-700 font-semibold">Đặt hàng</th>
                        <th className="text-center px-3 py-2 text-gray-700 font-semibold">Phân bổ</th>
                        <th className="text-center px-3 py-2 text-gray-700 font-semibold">Dự trữ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detail.products.map(p => (
                        <tr key={p.sku} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-mono text-gray-500">{p.sku}</td>
                          <td className="px-3 py-2 text-gray-800">{p.name}</td>
                          <td className="px-3 py-2 text-center font-mono">{p.aisle}</td>
                          <td className="px-3 py-2 text-center font-mono">{p.rack}</td>
                          <td className="px-3 py-2 text-center font-mono">{p.bin}</td>
                          <td className="px-3 py-2 text-center font-semibold">{p.orderedQty}</td>
                          <td className="px-3 py-2 text-center font-semibold" style={{ color: SUCCESS }}>{p.allocatedQty}</td>
                          <td className="px-3 py-2 text-center font-semibold" style={{ color: INFO }}>{p.reservedQty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {detail.timeline.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-600 text-[10px] uppercase tracking-wide mb-2">Lịch sử thao tác</p>
                  <div className="space-y-2">
                    {detail.timeline.map((t, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: PRIMARY }} />
                        <div>
                          <span className="text-gray-500">{t.time}</span>
                          <span className="mx-1.5 text-gray-400">·</span>
                          <span className="font-medium text-gray-800">{t.event}</span>
                          <span className="mx-1.5 text-gray-400">·</span>
                          <span className="text-gray-500">{t.user}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {detail.status === 'waiting' && (
                  <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: PRIMARY }}>
                    <ClipboardList className="w-3.5 h-3.5" /> Tạo Pick Task
                  </Button>
                )}
                {detail.status === 'waiting' && (
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" /> Phân công Picker
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-7 text-xs ml-auto" onClick={() => setDetail(null)}>Đóng</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
