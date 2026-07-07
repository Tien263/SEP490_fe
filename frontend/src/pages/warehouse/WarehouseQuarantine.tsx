import { useState } from 'react';
import { Button } from '../../components/sales-ui/button';
import { Input } from '../../components/sales-ui/input';
import { Search, Eye, RefreshCw, Download, CheckCircle, XCircle, Archive, Trash2, ArrowUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/sales-ui/dialog';

const PRIMARY = '#1F3B64';
const SUCCESS = '#16A34A';
const WARNING = '#D97706';
const ERROR   = '#DC2626';
const INFO    = '#2563EB';
const NEUTRAL = '#64748B';

const STATUS_CFG: Record<string, { label: string; bg: string }> = {
  waiting:    { label: 'Chờ kiểm tra',    bg: NEUTRAL },
  inspecting: { label: 'Đang kiểm tra',   bg: INFO    },
  approved:   { label: 'Đã duyệt',        bg: SUCCESS },
  rejected:   { label: 'Từ chối',         bg: ERROR   },
  returned:   { label: 'Đã trả NCC',      bg: '#0891B2' },
  destroyed:  { label: 'Đã hủy',          bg: '#374151' },
};

interface QuarantineItem {
  id: string; warehouse: string; sku: string; product: string;
  batch: string; lot: string; quantity: number; reason: string;
  currentLocation: string; inspectionStatus: string; inspector: string; createdDate: string;
  status: string;
  physicalCondition: string; packagingCondition: string; notes: string;
  supplier: string; receivedDate: string;
  timeline: { time: string; event: string; user: string }[];
}

const DATA: QuarantineItem[] = [
  {
    id: 'QZ-2406-0015', warehouse: 'Kho HCM', sku: 'VT-SM-012', product: 'Sơ mi nam slim fit',
    batch: 'B2407-SM-001', lot: 'L2407-001', quantity: 5, reason: 'Hư hỏng khi nhập hàng',
    currentLocation: 'Khu QZ-A-01', inspectionStatus: 'Đang kiểm tra', inspector: 'Trần Văn Bình',
    createdDate: '06/07/2026 10:30', status: 'inspecting',
    physicalCondition: 'Rách nhẹ cổ áo 2 chiếc, vết bẩn 3 chiếc',
    packagingCondition: 'Túi PE nguyên vẹn', notes: 'Cần báo NCC để đổi hàng',
    supplier: 'NCC Vải Phong Phú', receivedDate: '06/07/2026',
    timeline: [
      { time: '06/07 10:00', event: 'Phát hiện khi nhập hàng', user: 'Trần Văn Bình' },
      { time: '06/07 10:30', event: 'Chuyển khu cách ly', user: 'Trần Văn Bình' },
      { time: '06/07 11:00', event: 'Bắt đầu kiểm tra', user: 'Trần Văn Bình' },
    ],
  },
  {
    id: 'QZ-2406-0014', warehouse: 'Kho Hà Nội', sku: 'VT-CT-001', product: 'Vải cotton khổ 1.5m',
    batch: 'B2407-CT-002', lot: 'L2407-002', quantity: 30, reason: 'Lỗi màu sắc sản xuất',
    currentLocation: 'Khu QZ-B-03', inspectionStatus: 'Chờ kiểm tra', inspector: '—',
    createdDate: '04/07/2026 14:00', status: 'waiting',
    physicalCondition: 'Màu loang, đường dệt không đều',
    packagingCondition: 'Cuộn vải nguyên', notes: 'Đang chờ QA giám sát',
    supplier: 'Cty Dệt Thái Bình', receivedDate: '04/07/2026',
    timeline: [
      { time: '04/07 14:00', event: 'Phát hiện lỗi khi nhận hàng', user: 'Nguyễn Văn Thành' },
      { time: '04/07 14:30', event: 'Chuyển khu cách ly', user: 'Nguyễn Văn Thành' },
    ],
  },
  {
    id: 'QZ-2406-0013', warehouse: 'Kho Hà Nội', sku: 'VT-DM-005', product: 'Vải denim cao cấp',
    batch: 'B2406-DM-005', lot: 'L2406-008', quantity: 10, reason: 'Hư hỏng khi vận chuyển',
    currentLocation: 'Khu QZ-A-02', inspectionStatus: 'Hoàn tất', inspector: 'Lê Văn Dũng',
    createdDate: '02/07/2026 09:00', status: 'approved',
    physicalCondition: 'Rách nhẹ mép cuộn, không ảnh hưởng chất lượng vải',
    packagingCondition: 'Bọc nhựa bên ngoài rách', notes: 'Có thể dùng được, cắt phần rách',
    supplier: 'Import Asia Textile', receivedDate: '02/07/2026',
    timeline: [
      { time: '02/07 09:00', event: 'Chuyển cách ly', user: 'Trần Văn Bình' },
      { time: '02/07 14:00', event: 'Kiểm tra xong', user: 'Lê Văn Dũng' },
      { time: '03/07 10:00', event: 'Phê duyệt chuyển kho khả dụng', user: 'Lê Văn Dũng' },
    ],
  },
];

function Badge({ status }: { status: string }) {
  const c = STATUS_CFG[status] || { label: status, bg: NEUTRAL };
  return <span className="text-[10px] font-semibold text-white px-2 py-0.5 inline-block whitespace-nowrap" style={{ backgroundColor: c.bg, borderRadius: 4 }}>{c.label}</span>;
}

export default function WarehouseQuarantine() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<QuarantineItem | null>(null);
  const [items, setItems] = useState(DATA);

  const toggleSelect = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelected(p => p.length === filtered.length ? [] : filtered.map(d => d.id));

  const filtered = items.filter(d => {
    const q = search.toLowerCase();
    const ms = !q || d.id.toLowerCase().includes(q) || d.sku.toLowerCase().includes(q) || d.product.toLowerCase().includes(q) || d.reason.toLowerCase().includes(q);
    const mw = warehouseFilter === 'all' || d.warehouse === warehouseFilter;
    return ms && (statusFilter === 'all' || d.status === statusFilter) && mw;
  });

  const approve  = (id: string) => { setItems(p => p.map(i => i.id === id ? { ...i, status: 'approved' } : i)); setDetail(p => p?.id === id ? { ...p, status: 'approved' } : p); };
  const doReject = (id: string) => { setItems(p => p.map(i => i.id === id ? { ...i, status: 'rejected' } : i)); setDetail(p => p?.id === id ? { ...p, status: 'rejected' } : p); };
  const doReturn = (id: string) => { setItems(p => p.map(i => i.id === id ? { ...i, status: 'returned' } : i)); setDetail(p => p?.id === id ? { ...p, status: 'returned' } : p); };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] mb-0.5"><span className="text-gray-400">Kho hàng</span><span className="text-gray-300">/</span><span className="text-gray-400">Quản lý tồn kho (Inventory)</span><span className="text-gray-300">/</span><span className="text-gray-800 font-semibold">Cách ly &amp; Kiểm định</span></div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Cách ly &amp; Kiểm định (Quarantine)</h2>
            <p className="text-xs text-gray-500 mt-0.5">{items.length} lô hàng cách ly · {items.filter(i => ['waiting', 'inspecting'].includes(i.status)).length} đang xử lý</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><RefreshCw className="w-3 h-3" /> Làm mới</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><Download className="w-3 h-3" /> Xuất Excel</Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input className="pl-8 h-7 text-xs bg-gray-50" placeholder="Mã cách ly, SKU, lý do..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)}>
            <option value="all">Tất cả kho</option>
            <option>Kho Hà Nội</option>
            <option>Kho HCM</option>
            <option>Kho Đà Nẵng</option>
          </select>
          <input type="date" className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <input type="date" className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        {selected.length > 0 && (
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded px-3 py-2 mb-2 flex items-center gap-2 text-xs text-blue-700">
            <span className="font-medium">{selected.length} đã chọn</span>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100 whitespace-nowrap">Duyệt đạt</button>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100 whitespace-nowrap">Trả NCC</button>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100 whitespace-nowrap">Xuất Excel</button>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100 whitespace-nowrap" onClick={() => setSelected([])}>Hủy chọn</button>
          </div>
        )}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2.5"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Mã cách ly</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Kho</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">SKU</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Sản phẩm</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Batch / Lot</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Số lượng</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Lý do</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Vị trí</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Người kiểm</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Ngày tạo</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Trạng thái</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={12} className="py-12 text-center"><div className="flex flex-col items-center gap-2"><div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><span className="text-gray-400 text-xl">📋</span></div><p className="text-sm font-medium text-gray-500">Không có dữ liệu</p><p className="text-xs text-gray-400">Thay đổi bộ lọc để xem kết quả khác</p></div></td></tr>
              )}
              {filtered.map((d, i) => (
                <tr key={d.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-3 py-2.5"><input type="checkbox" checked={selected.includes(d.id)} onChange={() => toggleSelect(d.id)} /></td>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: PRIMARY }}>{d.id}</td>
                  <td className="px-3 py-2.5 text-gray-700">{d.warehouse}</td>
                  <td className="px-3 py-2.5 font-mono text-gray-500">{d.sku}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-800">{d.product}</td>
                  <td className="px-3 py-2.5 text-gray-600"><span className="block">{d.batch}</span><span className="text-gray-400 text-[10px]">{d.lot}</span></td>
                  <td className="px-3 py-2.5 text-center font-semibold text-gray-800">{d.quantity}</td>
                  <td className="px-3 py-2.5 text-gray-600 max-w-[140px] truncate">{d.reason}</td>
                  <td className="px-3 py-2.5 font-mono text-gray-600">{d.currentLocation}</td>
                  <td className="px-3 py-2.5 text-gray-700">{d.inspector}</td>
                  <td className="px-3 py-2.5 text-gray-500">{d.createdDate}</td>
                  <td className="px-3 py-2.5 text-center"><Badge status={d.status} /></td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" onClick={() => setDetail(d)}><Eye className="w-3.5 h-3.5" /></button>
                      {['waiting', 'inspecting'].includes(d.status) && (
                        <>
                          <button className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" onClick={() => approve(d.id)} title="Duyệt - Chuyển khả dụng"><CheckCircle className="w-3.5 h-3.5" /></button>
                          <button className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600" onClick={() => doReject(d.id)} title="Từ chối"><XCircle className="w-3.5 h-3.5" /></button>
                          <button className="p-1 rounded hover:bg-orange-50 text-gray-400 hover:text-orange-600" onClick={() => doReturn(d.id)} title="Trả NCC"><ArrowUp className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-xs text-gray-500">Hiển thị {filtered.length} / {items.length} bản ghi</span>
            <button className="w-6 h-6 text-xs rounded font-medium text-white flex items-center justify-center" style={{ backgroundColor: PRIMARY }}>1</button>
          </div>
        </div>
      </div>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Chi tiết cách ly — {detail?.id}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Thông tin hàng cách ly</p>
                  <div className="flex justify-between"><span className="text-gray-500">Mã cách ly:</span><span className="font-semibold" style={{ color: PRIMARY }}>{detail.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Kho:</span><span>{detail.warehouse}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">SKU:</span><span className="font-mono">{detail.sku}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Sản phẩm:</span><span className="font-medium text-gray-800">{detail.product}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Batch/Lot:</span><span>{detail.batch} / {detail.lot}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Số lượng:</span><span className="font-semibold text-base" style={{ color: WARNING }}>{detail.quantity}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Nhà cung cấp:</span><span>{detail.supplier}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Ngày nhập:</span><span>{detail.receivedDate}</span></div>
                </div>
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Kết quả kiểm định</p>
                  <div className="flex justify-between"><span className="text-gray-500">Trạng thái:</span><Badge status={detail.status} /></div>
                  <div className="flex justify-between"><span className="text-gray-500">Người kiểm:</span><span>{detail.inspector}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Vị trí lưu:</span><span className="font-mono">{detail.currentLocation}</span></div>
                  <div className="space-y-1 pt-1">
                    <span className="text-gray-500">Tình trạng vật lý:</span>
                    <p className="text-gray-800">{detail.physicalCondition}</p>
                  </div>
                  <div className="space-y-1 pt-1">
                    <span className="text-gray-500">Tình trạng bao bì:</span>
                    <p className="text-gray-800">{detail.packagingCondition}</p>
                  </div>
                  {detail.notes && <div className="space-y-1 pt-1"><span className="text-gray-500">Ghi chú:</span><p className="text-gray-700">{detail.notes}</p></div>}
                </div>
              </div>

              {detail.timeline.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-600 text-[10px] uppercase tracking-wide mb-2">Lịch sử</p>
                  <div className="space-y-2">
                    {detail.timeline.map((t, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: PRIMARY }} />
                        <div><span className="text-gray-500">{t.time}</span><span className="mx-1.5 text-gray-400">·</span><span className="font-medium text-gray-800">{t.event}</span><span className="mx-1.5 text-gray-400">·</span><span className="text-gray-500">{t.user}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {['waiting', 'inspecting'].includes(detail.status) && (
                  <>
                    <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: SUCCESS }} onClick={() => approve(detail.id)}><CheckCircle className="w-3.5 h-3.5" /> Chuyển Khả dụng</Button>
                    <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: WARNING }}><Archive className="w-3.5 h-3.5" /> Chuyển Hư hỏng</Button>
                    <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: INFO }} onClick={() => doReturn(detail.id)}><ArrowUp className="w-3.5 h-3.5" /> Trả NCC</Button>
                    <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: ERROR }}><Trash2 className="w-3.5 h-3.5" /> Hủy hàng</Button>
                  </>
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
