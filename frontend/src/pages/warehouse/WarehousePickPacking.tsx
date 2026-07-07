import React, { useState, useRef } from 'react';
import { Button } from '../../components/sales-ui/button';
import { Input } from '../../components/sales-ui/input';
import { Search, Eye, Download, RefreshCw, Play, CheckCircle, Printer, Upload, X, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/sales-ui/dialog';

const PRIMARY = '#1F3B64';
const SUCCESS = '#16A34A';
const WARNING = '#D97706';
const ERROR   = '#DC2626';
const INFO    = '#2563EB';
const NEUTRAL = '#64748B';
const PURPLE  = '#7C3AED';

const STATUS_CFG: Record<string, { label: string; bg: string }> = {
  waiting:   { label: 'Chờ picking',     bg: NEUTRAL },
  picking:   { label: 'Đang picking',    bg: INFO    },
  picked:    { label: 'Đã pick xong',    bg: '#0891B2' },
  packing:   { label: 'Đang packing',    bg: PURPLE  },
  completed: { label: 'Hoàn tất',        bg: SUCCESS },
  cancelled: { label: 'Đã hủy',          bg: ERROR   },
};

interface PickItem {
  sku: string; name: string; aisle: string; rack: string; shelf: string; bin: string;
  barcode: string; batch: string; lot: string;
  requestedQty: number; pickedQty: number;
}

interface PickTask {
  id: string; fulfillmentId: string; warehouse: string; picker: string;
  priority: 'urgent' | 'high' | 'normal';
  totalItems: number; pickedItems: number; packingStatus: string;
  startedTime: string; completedTime: string;
  status: 'waiting' | 'picking' | 'picked' | 'packing' | 'completed' | 'cancelled';
  boxCount: number; weight: string; packingNotes: string;
  items: PickItem[];
}

const TASKS: PickTask[] = [
  {
    id: 'PT-2406-0067', fulfillmentId: 'FO-2406-0134', warehouse: 'Kho Hà Nội',
    picker: 'Nguyễn Văn Thành', priority: 'urgent',
    totalItems: 3, pickedItems: 0, packingStatus: 'Chưa bắt đầu',
    startedTime: '—', completedTime: '—', status: 'waiting',
    boxCount: 0, weight: '—', packingNotes: '',
    items: [
      { sku: 'VT-CT-001', name: 'Vải cotton khổ 1.5m', aisle: 'A', rack: '01', shelf: '2', bin: '03', barcode: '8938500123456', batch: 'B2406-01', lot: 'L001', requestedQty: 200, pickedQty: 0 },
      { sku: 'VT-SM-012', name: 'Sơ mi nam slim fit',   aisle: 'B', rack: '02', shelf: '1', bin: '11', barcode: '8938500123457', batch: 'B2406-02', lot: 'L002', requestedQty: 150, pickedQty: 0 },
      { sku: 'VT-QT-007', name: 'Quần tây slim fit',    aisle: 'B', rack: '03', shelf: '1', bin: '05', barcode: '8938500123458', batch: 'B2406-01', lot: 'L001', requestedQty: 100, pickedQty: 0 },
    ],
  },
  {
    id: 'PT-2406-0066', fulfillmentId: 'FO-2406-0133', warehouse: 'Kho Hà Nội',
    picker: 'Lê Văn Dũng', priority: 'high',
    totalItems: 2, pickedItems: 1, packingStatus: 'Chưa bắt đầu',
    startedTime: '06/07 08:00', completedTime: '—', status: 'picking',
    boxCount: 0, weight: '—', packingNotes: '',
    items: [
      { sku: 'VT-DP-021', name: 'Đồng phục VP nữ', aisle: 'C', rack: '01', shelf: '1', bin: '02', barcode: '8938500123459', batch: 'B2406-03', lot: 'L003', requestedQty: 20, pickedQty: 20 },
      { sku: 'VT-DP-020', name: 'Đồng phục VP nam', aisle: 'C', rack: '01', shelf: '1', bin: '01', barcode: '8938500123460', batch: 'B2406-03', lot: 'L003', requestedQty: 20, pickedQty: 0 },
    ],
  },
  {
    id: 'PT-2406-0065', fulfillmentId: 'FO-2406-0132', warehouse: 'Kho HCM',
    picker: 'Phạm Thị Hương', priority: 'normal',
    totalItems: 2, pickedItems: 2, packingStatus: 'Hoàn tất',
    startedTime: '05/07 15:00', completedTime: '05/07 16:30', status: 'completed',
    boxCount: 3, weight: '24.5 kg', packingNotes: 'Hàng fragile, ghi chú nhẹ tay',
    items: [],
  },
  {
    id: 'PT-2406-0064', fulfillmentId: 'FO-2406-0131', warehouse: 'Kho HCM',
    picker: 'Nguyễn Văn Thành', priority: 'urgent',
    totalItems: 5, pickedItems: 3, packingStatus: 'Chưa bắt đầu',
    startedTime: '05/07 13:30', completedTime: '—', status: 'picking',
    boxCount: 0, weight: '—', packingNotes: '',
    items: [],
  },
];

function Breadcrumb() {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-0.5">
      <span className="text-gray-400">Kho hàng</span>
      <span className="text-gray-300">/</span>
      <span className="text-gray-400">Xuất kho (Outbound)</span>
      <span className="text-gray-300">/</span>
      <span className="text-gray-800 font-semibold">Pick &amp; Packing</span>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const c = STATUS_CFG[status] || { label: status, bg: NEUTRAL };
  return <span className="text-[10px] font-semibold text-white px-2 py-0.5 inline-block whitespace-nowrap" style={{ backgroundColor: c.bg, borderRadius: 4 }}>{c.label}</span>;
}

function PriBadge({ p }: { p: string }) {
  const m: Record<string, { label: string; bg: string }> = {
    urgent: { label: 'Khẩn cấp', bg: ERROR },
    high:   { label: 'Cao',      bg: WARNING },
    normal: { label: 'Thường',   bg: NEUTRAL },
  };
  const c = m[p] || m.normal;
  return <span className="text-[10px] font-semibold text-white px-2 py-0.5 inline-block whitespace-nowrap" style={{ backgroundColor: c.bg, borderRadius: 4 }}>{c.label}</span>;
}

export default function WarehousePickPacking() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<PickTask | null>(null);
  const [tasks, setTasks] = useState(TASKS);

  const [uploadingTask, setUploadingTask] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filtered = tasks.filter(t => {
    const q = search.toLowerCase();
    const ms = !q || t.id.toLowerCase().includes(q) || t.fulfillmentId.toLowerCase().includes(q) || t.picker.toLowerCase().includes(q);
    const mst = statusFilter === 'all' || t.status === statusFilter;
    return ms && mst;
  });

  const toggleSelect = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(t => t.id));

  const updateStatus = (id: string, status: PickTask['status']) => {
    setTasks(p => p.map(t => t.id === id ? { ...t, status } : t));
    setDetail(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const handleCompletePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingTask) return;
    try {
      const { completePickTask } = await import('../../services/warehouseService.js');
      await completePickTask(uploadingTask, file);
      alert('Hoàn tất Pick Task và upload ảnh thành công!');
      updateStatus(uploadingTask, 'picked');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi hoàn tất Pick Task');
    } finally {
      setUploadingTask(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex-shrink-0">
        <Breadcrumb />
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Pick &amp; Packing</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {tasks.length} tác vụ · {tasks.filter(t => t.status === 'waiting').length} chờ · {tasks.filter(t => t.status === 'picking').length} đang picking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><RefreshCw className="w-3 h-3" /> Làm mới</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><Printer className="w-3 h-3" /> In Pick List</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><Download className="w-3 h-3" /> Xuất Excel</Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input className="pl-8 h-7 text-xs bg-gray-50" placeholder="Mã pick, mã lệnh, người pick..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)}>
            <option value="">Tất cả kho</option>
            <option>Kho Hà Nội</option>
            <option>Kho HCM</option>
            <option>Kho Đà Nẵng</option>
          </select>
          <input type="date" className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="Từ ngày" />
          <input type="date" className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={dateTo} onChange={e => setDateTo(e.target.value)} title="Đến ngày" />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        {selected.length > 0 && (
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded px-3 py-2 mb-2 flex items-center gap-2 text-xs">
            <span className="font-semibold text-blue-700">Đã chọn {selected.length} tác vụ</span>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100">Bắt đầu Picking</button>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100">Hoàn tất Picking</button>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100">In Pick List</button>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100 ml-auto" onClick={() => setSelected([])}>Hủy chọn</button>
          </div>
        )}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-3.5 h-3.5" /></th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Mã Pick Task</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Mã lệnh</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Kho</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Người pick</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Ưu tiên</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Tiến độ</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Bắt đầu</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Hoàn tất</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Trạng thái</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>
                    <p className="text-sm font-medium text-gray-500">Không có Pick Task</p>
                    <p className="text-xs text-gray-400">Thay đổi bộ lọc để xem kết quả khác</p>
                  </div>
                </td></tr>
              )}
              {filtered.map((t, i) => (
                <tr key={t.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-3 py-2.5"><input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggleSelect(t.id)} className="w-3.5 h-3.5" /></td>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: PRIMARY }}>{t.id}</td>
                  <td className="px-3 py-2.5 text-gray-600">{t.fulfillmentId}</td>
                  <td className="px-3 py-2.5 text-gray-700">{t.warehouse}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-800">{t.picker}</td>
                  <td className="px-3 py-2.5 text-center"><PriBadge p={t.priority} /></td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${t.totalItems > 0 ? (t.pickedItems / t.totalItems) * 100 : 0}%`, backgroundColor: SUCCESS }} />
                      </div>
                      <span className="text-gray-600 font-mono">{t.pickedItems}/{t.totalItems}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">{t.startedTime}</td>
                  <td className="px-3 py-2.5 text-gray-500">{t.completedTime}</td>
                  <td className="px-3 py-2.5 text-center"><Badge status={t.status} /></td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" onClick={() => setDetail(t)}><Eye className="w-3.5 h-3.5" /></button>
                      {t.status === 'waiting' && <button className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" onClick={() => updateStatus(t.id, 'picking')}><Play className="w-3.5 h-3.5" /></button>}
                      {t.status === 'picking' && <button className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" onClick={() => updateStatus(t.id, 'picked')}><CheckCircle className="w-3.5 h-3.5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-xs text-gray-500">Hiển thị {filtered.length} / {tasks.length} bản ghi</span>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 text-xs rounded font-medium text-white flex items-center justify-center" style={{ backgroundColor: PRIMARY }}>1</button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Package className="w-4 h-4" style={{ color: PRIMARY }} />
              Chi tiết Pick &amp; Packing — {detail?.id}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Thông tin tác vụ</p>
                  <div className="flex justify-between"><span className="text-gray-500">Mã Pick Task:</span><span className="font-semibold" style={{ color: PRIMARY }}>{detail.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Mã lệnh xuất:</span><span className="font-medium">{detail.fulfillmentId}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Kho:</span><span>{detail.warehouse}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Người pick:</span><span className="font-medium text-gray-800">{detail.picker}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Trạng thái:</span><Badge status={detail.status} /></div>
                </div>
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Thông tin packing</p>
                  <div className="flex justify-between"><span className="text-gray-500">Tiến độ:</span><span className="font-semibold">{detail.pickedItems}/{detail.totalItems} items</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Số thùng:</span><span className="font-medium">{detail.boxCount || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tổng khối lượng:</span><span>{detail.weight}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Bắt đầu:</span><span>{detail.startedTime}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Hoàn tất:</span><span>{detail.completedTime}</span></div>
                </div>
              </div>

              {detail.items.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-600 text-[10px] uppercase tracking-wide mb-2">Danh sách pick</p>
                  <table className="w-full border border-gray-200 rounded overflow-hidden">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-3 py-2 text-gray-700 font-semibold">SKU</th>
                        <th className="text-left px-3 py-2 text-gray-700 font-semibold">Sản phẩm</th>
                        <th className="text-center px-3 py-2 text-gray-700 font-semibold">Dãy/Kệ/Ngăn</th>
                        <th className="text-left px-3 py-2 text-gray-700 font-semibold">Barcode</th>
                        <th className="text-left px-3 py-2 text-gray-700 font-semibold">Batch/Lot</th>
                        <th className="text-center px-3 py-2 text-gray-700 font-semibold">Yêu cầu</th>
                        <th className="text-center px-3 py-2 text-gray-700 font-semibold">Đã pick</th>
                        <th className="text-center px-3 py-2 text-gray-700 font-semibold">Còn lại</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detail.items.map(item => {
                        const remaining = item.requestedQty - item.pickedQty;
                        return (
                          <tr key={item.sku} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-mono text-gray-500">{item.sku}</td>
                            <td className="px-3 py-2 text-gray-800">{item.name}</td>
                            <td className="px-3 py-2 text-center font-mono text-gray-600">{item.aisle}-{item.rack}-{item.bin}</td>
                            <td className="px-3 py-2 font-mono text-gray-500 text-[10px]">{item.barcode}</td>
                            <td className="px-3 py-2 text-gray-600">{item.batch} / {item.lot}</td>
                            <td className="px-3 py-2 text-center font-semibold">{item.requestedQty}</td>
                            <td className="px-3 py-2 text-center font-semibold" style={{ color: item.pickedQty >= item.requestedQty ? SUCCESS : WARNING }}>{item.pickedQty}</td>
                            <td className="px-3 py-2 text-center font-semibold" style={{ color: remaining > 0 ? ERROR : SUCCESS }}>{remaining}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {detail.status === 'waiting' && (
                  <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: PRIMARY }} onClick={() => updateStatus(detail.id, 'picking')}>
                    <Play className="w-3.5 h-3.5" /> Bắt đầu Picking
                  </Button>
                )}
                {detail.status === 'picking' && (
                  <>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleCompletePick} />
                    <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: SUCCESS }} onClick={() => {
                      setUploadingTask(detail.id);
                      fileInputRef.current?.click();
                    }}>
                      <CheckCircle className="w-3.5 h-3.5" /> Upload & Hoàn tất Picking
                    </Button>
                  </>
                )}
                {(detail.status === 'picked' || detail.status === 'packing') && (
                  <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: PURPLE }} onClick={() => updateStatus(detail.id, 'completed')}>
                    <CheckCircle className="w-3.5 h-3.5" /> Hoàn tất Packing
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                  <Printer className="w-3.5 h-3.5" /> In Pick List
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs ml-auto" onClick={() => setDetail(null)}>Đóng</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
