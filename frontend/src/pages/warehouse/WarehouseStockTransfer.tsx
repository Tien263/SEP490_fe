import { useState } from 'react';
import { Button } from '../../components/sales-ui/button';
import { Input } from '../../components/sales-ui/input';
import { Search, Eye, RefreshCw, Download, Plus, Truck, CheckCircle, X, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/sales-ui/dialog';

const PRIMARY = '#1F3B64';
const SUCCESS = '#16A34A';
const WARNING = '#D97706';
const ERROR   = '#DC2626';
const INFO    = '#2563EB';
const NEUTRAL = '#64748B';
const PURPLE  = '#7C3AED';

// Tabs: Create Transfer (10), Dispatch (11), Receive (12)
type Tab = 'create' | 'dispatch' | 'receive';

const STATUS_TRANSFER: Record<string, { label: string; bg: string }> = {
  draft:      { label: 'Nháp',          bg: NEUTRAL },
  submitted:  { label: 'Chờ xuất kho',  bg: INFO    },
  dispatched: { label: 'Đang vận chuyển', bg: PURPLE },
  arrived:    { label: 'Đã đến nơi',    bg: WARNING },
  completed:  { label: 'Hoàn tất',      bg: SUCCESS },
  cancelled:  { label: 'Đã hủy',        bg: ERROR   },
};

interface TransferItem { sku: string; product: string; availableQty: number; transferQty: number; unit: string }
interface Transfer {
  id: string; sourceWarehouse: string; destWarehouse: string; requestedBy: string;
  createdDate: string; priority: string; status: string;
  vehicle: string; driver: string; dispatchTime: string; arrivalTime: string;
  packageCount: number; notes: string;
  items: TransferItem[];
  timeline: { time: string; event: string }[];
}

const TRANSFERS: Transfer[] = [
  {
    id: 'TRF-2406-0045', sourceWarehouse: 'Kho Hà Nội', destWarehouse: 'Kho HCM',
    requestedBy: 'Nguyễn Văn Bình', createdDate: '06/07/2026 08:00', priority: 'Cao',
    status: 'submitted', vehicle: '—', driver: '—', dispatchTime: '—', arrivalTime: '—',
    packageCount: 0, notes: 'Bổ sung tồn kho HCM cuối tuần',
    items: [
      { sku: 'VT-SM-012', product: 'Sơ mi nam slim fit', availableQty: 240, transferQty: 80, unit: 'chiếc' },
      { sku: 'VT-QT-007', product: 'Quần tây slim fit',  availableQty: 185, transferQty: 60, unit: 'chiếc' },
    ],
    timeline: [
      { time: '06/07 08:00', event: 'Tạo lệnh chuyển kho' },
      { time: '06/07 09:00', event: 'Phê duyệt & chờ xuất kho' },
    ],
  },
  {
    id: 'TRF-2406-0044', sourceWarehouse: 'Kho HCM', destWarehouse: 'Kho Đà Nẵng',
    requestedBy: 'Trần Văn Bình', createdDate: '05/07/2026 14:00', priority: 'Thường',
    status: 'dispatched', vehicle: 'Xe tải 51A-45678', driver: 'Phạm Văn Tùng',
    dispatchTime: '05/07 16:00', arrivalTime: '—', packageCount: 4, notes: '',
    items: [
      { sku: 'VT-CT-001', product: 'Vải cotton khổ 1.5m', availableQty: 850, transferQty: 200, unit: 'mét' },
    ],
    timeline: [
      { time: '05/07 14:00', event: 'Tạo lệnh chuyển kho' },
      { time: '05/07 15:30', event: 'Xác nhận & đóng gói' },
      { time: '05/07 16:00', event: 'Xuất kho HCM' },
    ],
  },
  {
    id: 'TRF-2406-0043', sourceWarehouse: 'Kho Hà Nội', destWarehouse: 'Kho HCM',
    requestedBy: 'Lê Văn Dũng', createdDate: '04/07/2026 10:00', priority: 'Thường',
    status: 'arrived', vehicle: 'Xe tải 29B-98765', driver: 'Nguyễn Đức Anh',
    dispatchTime: '04/07 13:00', arrivalTime: '05/07 08:30', packageCount: 6, notes: '',
    items: [
      { sku: 'VT-LN-003', product: 'Vải linen nhập khẩu', availableQty: 420, transferQty: 150, unit: 'mét' },
    ],
    timeline: [
      { time: '04/07 10:00', event: 'Tạo lệnh' },
      { time: '04/07 12:00', event: 'Xuất kho Hà Nội' },
      { time: '05/07 08:30', event: 'Đến kho HCM' },
    ],
  },
  {
    id: 'TRF-2406-0042', sourceWarehouse: 'Kho HCM', destWarehouse: 'Kho Hà Nội',
    requestedBy: 'Phạm Thị Hương', createdDate: '03/07/2026 09:00', priority: 'Thường',
    status: 'completed', vehicle: 'Xe tải 51B-11223', driver: 'Trần Minh Đức',
    dispatchTime: '03/07 11:00', arrivalTime: '04/07 07:00', packageCount: 3, notes: '',
    items: [],
    timeline: [],
  },
];

function Badge({ status }: { status: string }) {
  const c = STATUS_TRANSFER[status] || { label: status, bg: NEUTRAL };
  return <span className="text-[10px] font-semibold text-white px-2 py-0.5 inline-block whitespace-nowrap" style={{ backgroundColor: c.bg, borderRadius: 4 }}>{c.label}</span>;
}

function CreateForm({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<TransferItem[]>([
    { sku: '', product: '', availableQty: 0, transferQty: 0, unit: 'cái' },
  ]);
  const [formData, setFormData] = useState({ sourceWarehouseId: '', targetWarehouseId: '', reason: '' });
  
  const handleCreate = async () => {
    try {
      const payload = {
        sourceWarehouseId: formData.sourceWarehouseId, // from state
        targetWarehouseId: formData.targetWarehouseId,
        reason: formData.reason,
        items: items.map(i => ({ productId: i.sku, transferQuantity: i.transferQty }))
      };
      const { createStockTransfer } = await import('../../services/warehouseService.js');
      await createStockTransfer(payload);
      alert('Tạo lệnh thành công!');
      onClose();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-gray-500">Kho nguồn *</label>
          <Input className="w-full h-7 text-xs border border-gray-200 rounded px-2 bg-white" placeholder="ID kho nguồn" value={formData.sourceWarehouseId} onChange={e => setFormData({...formData, sourceWarehouseId: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <label className="text-gray-500">Kho đích *</label>
          <Input className="w-full h-7 text-xs border border-gray-200 rounded px-2 bg-white" placeholder="ID kho đích" value={formData.targetWarehouseId} onChange={e => setFormData({...formData, targetWarehouseId: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <label className="text-gray-500">Lý do chuyển</label>
          <Input className="h-7 text-xs" placeholder="Bổ sung tồn kho chi nhánh..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <label className="text-gray-500">Ưu tiên</label>
          <select className="w-full h-7 text-xs border border-gray-200 rounded px-2 bg-white"><option>Thường</option><option>Cao</option><option>Khẩn cấp</option></select>
        </div>
        <div className="space-y-1.5">
          <label className="text-gray-500">Ngày dự kiến đến</label>
          <Input type="date" className="h-7 text-xs" />
        </div>
        <div className="space-y-1.5">
          <label className="text-gray-500">Ghi chú</label>
          <Input className="h-7 text-xs" placeholder="Ghi chú thêm..." />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-gray-600 text-[10px] uppercase tracking-wide">Danh sách hàng chuyển</p>
          <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={() => setItems(p => [...p, { sku: '', product: '', availableQty: 0, transferQty: 0, unit: 'cái' }])}>
            <Plus className="w-3 h-3" /> Thêm dòng
          </Button>
        </div>
        <table className="w-full border border-gray-200 rounded overflow-hidden">
          <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="text-left px-3 py-2 text-gray-700 font-semibold">Product ID</th><th className="text-left px-3 py-2 text-gray-700 font-semibold">Sản phẩm</th><th className="text-center px-3 py-2 text-gray-700 font-semibold">Tồn kho</th><th className="text-center px-3 py-2 text-gray-700 font-semibold">SL chuyển</th><th className="text-center px-3 py-2 text-gray-700 font-semibold">ĐVT</th><th className="w-8" /></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-2 py-1.5"><Input className="h-6 text-xs" value={item.sku} onChange={e => setItems(p => p.map((i, x) => x === idx ? { ...i, sku: e.target.value } : i))} placeholder="ID Product" /></td>
                <td className="px-2 py-1.5"><Input className="h-6 text-xs" value={item.product} onChange={e => setItems(p => p.map((i, x) => x === idx ? { ...i, product: e.target.value } : i))} placeholder="Tên sản phẩm" /></td>
                <td className="px-2 py-1.5 text-center"><Input type="number" className="h-6 text-xs text-center w-16 mx-auto" value={item.availableQty} onChange={e => setItems(p => p.map((i, x) => x === idx ? { ...i, availableQty: +e.target.value } : i))} /></td>
                <td className="px-2 py-1.5 text-center"><Input type="number" className="h-6 text-xs text-center w-16 mx-auto" value={item.transferQty} onChange={e => setItems(p => p.map((i, x) => x === idx ? { ...i, transferQty: +e.target.value } : i))} /></td>
                <td className="px-2 py-1.5 text-center"><Input className="h-6 text-xs text-center w-16 mx-auto" value={item.unit} onChange={e => setItems(p => p.map((i, x) => x === idx ? { ...i, unit: e.target.value } : i))} /></td>
                <td className="px-2 py-1.5 text-center"><button className="text-gray-400 hover:text-red-500" onClick={() => setItems(p => p.filter((_, x) => x !== idx))}><X className="w-3.5 h-3.5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <Button variant="outline" size="sm" className="h-7 text-xs">Lưu nháp</Button>
        <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: PRIMARY }} onClick={handleCreate}><CheckCircle className="w-3.5 h-3.5" /> Gửi yêu cầu</Button>
        <Button variant="outline" size="sm" className="h-7 text-xs ml-auto" onClick={onClose}>Hủy</Button>
      </div>
    </div>
  );
}

export default function WarehouseStockTransfer() {
  const [tab, setTab] = useState<Tab>('create');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Transfer | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [transfers, setTransfers] = useState(TRANSFERS);

  const tabFilters: Record<Tab, (t: Transfer) => boolean> = {
    create:   t => ['draft', 'submitted'].includes(t.status),
    dispatch: t => ['submitted', 'dispatched'].includes(t.status),
    receive:  t => ['dispatched', 'arrived'].includes(t.status),
  };

  const filtered = transfers.filter(t => {
    const q = search.toLowerCase();
    const ms = !q || t.id.toLowerCase().includes(q) || t.sourceWarehouse.toLowerCase().includes(q) || t.destWarehouse.toLowerCase().includes(q);
    return ms && tabFilters[tab](t) && (statusFilter === 'all' || t.status === statusFilter);
  });

  const dispatch = async (id: string) => {
    try {
      const { dispatchStockTransfer } = await import('../../services/warehouseService.js');
      await dispatchStockTransfer(id);
      alert('Xuất kho thành công!');
      setTransfers(p => p.map(t => t.id === id ? { ...t, status: 'dispatched', dispatchTime: new Date().toLocaleString('vi-VN') } : t));
      setDetail(prev => prev?.id === id ? { ...prev, status: 'dispatched', dispatchTime: new Date().toLocaleString('vi-VN') } : prev);
    } catch (err: any) { alert(err.message); }
  };

  const receive = async (id: string) => {
    try {
      const { receiveStockTransfer } = await import('../../services/warehouseService.js');
      await receiveStockTransfer(id);
      alert('Xác nhận nhận hàng thành công!');
      setTransfers(p => p.map(t => t.id === id ? { ...t, status: 'completed', arrivalTime: new Date().toLocaleString('vi-VN') } : t));
      setDetail(prev => prev?.id === id ? { ...prev, status: 'completed', arrivalTime: new Date().toLocaleString('vi-VN') } : prev);
    } catch (err: any) { alert(err.message); }
  };

  const toggleSelect = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(t => t.id));

  const TABS: { id: Tab; label: string }[] = [
    { id: 'create',   label: 'Tạo lệnh chuyển kho' },
    { id: 'dispatch', label: 'Xuất kho chuyển' },
    { id: 'receive',  label: 'Nhận hàng chuyển' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] mb-0.5">
          <span className="text-gray-400">Kho hàng</span><span className="text-gray-400">/</span><span className="text-gray-400">Chuyển kho (Transfer)</span><span className="text-gray-400">/</span><span className="text-gray-800 font-semibold">Lệnh chuyển kho</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Chuyển kho nội bộ (Stock Transfer)</h2>
            <p className="text-xs text-gray-500 mt-0.5">{transfers.length} lệnh · {transfers.filter(t => t.status === 'dispatched').length} đang vận chuyển</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: PRIMARY }} onClick={() => setShowCreate(true)}>
              <Plus className="w-3 h-3" /> Tạo lệnh chuyển
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><RefreshCw className="w-3 h-3" /> Làm mới</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><Download className="w-3 h-3" /> Xuất Excel</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-gray-200 -mb-3">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${tab === t.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-5 py-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input className="pl-8 h-7 text-xs bg-gray-50" placeholder="Mã lệnh, kho nguồn, kho đích..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_TRANSFER).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input type="date" className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <input type="date" className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          <select className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)}>
            <option value="all">Tất cả kho</option>
            <option value="Kho Hà Nội">Kho Hà Nội</option>
            <option value="Kho HCM">Kho HCM</option>
            <option value="Kho Đà Nẵng">Kho Đà Nẵng</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        {selected.length > 0 && (
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded px-3 py-2 mb-2 flex items-center gap-2 text-xs text-blue-700">
            <span className="font-medium">{selected.length} lệnh được chọn</span>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100 whitespace-nowrap">Xuất kho hàng loạt</button>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100 whitespace-nowrap">Xuất Excel</button>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100 whitespace-nowrap" onClick={() => setSelected([])}>Hủy chọn</button>
          </div>
        )}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={filtered.length > 0 && selected.length === filtered.length} onChange={toggleAll} className="w-3.5 h-3.5" /></th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Mã lệnh</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Kho nguồn</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold"><ArrowRight className="w-3 h-3 mx-auto" /></th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Kho đích</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Người tạo</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Ngày tạo</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">{tab === 'dispatch' ? 'Phương tiện' : tab === 'receive' ? 'Thời gian đến' : 'Ưu tiên'}</th>
                {tab !== 'create' && <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Kiện hàng</th>}
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Trạng thái</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={12} className="py-12 text-center"><div className="flex flex-col items-center gap-2"><div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><span className="text-gray-400 text-xl">📋</span></div><p className="text-sm font-medium text-gray-500">Không có dữ liệu</p><p className="text-xs text-gray-400">Thay đổi bộ lọc để xem kết quả khác</p></div></td></tr>
              )}
              {filtered.map((t, i) => (
                <tr key={t.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''} ${selected.includes(t.id) ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-3 py-2.5"><input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggleSelect(t.id)} className="w-3.5 h-3.5" /></td>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: PRIMARY }}>{t.id}</td>
                  <td className="px-3 py-2.5 text-gray-700">{t.sourceWarehouse}</td>
                  <td className="px-3 py-2.5 text-center text-gray-400"><ArrowRight className="w-3 h-3 mx-auto" /></td>
                  <td className="px-3 py-2.5 text-gray-700">{t.destWarehouse}</td>
                  <td className="px-3 py-2.5 text-gray-700">{t.requestedBy}</td>
                  <td className="px-3 py-2.5 text-gray-500">{t.createdDate}</td>
                  <td className="px-3 py-2.5 text-gray-600">{tab === 'dispatch' ? t.vehicle : tab === 'receive' ? t.arrivalTime : t.priority}</td>
                  {tab !== 'create' && <td className="px-3 py-2.5 text-center font-semibold">{t.packageCount}</td>}
                  <td className="px-3 py-2.5 text-center"><Badge status={t.status} /></td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" onClick={() => setDetail(t)}><Eye className="w-3.5 h-3.5" /></button>
                      {tab === 'dispatch' && t.status === 'submitted' && (
                        <button className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" onClick={() => dispatch(t.id)} title="Xuất kho"><Truck className="w-3.5 h-3.5" /></button>
                      )}
                      {tab === 'receive' && t.status === 'arrived' && (
                        <button className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" onClick={() => receive(t.id)} title="Xác nhận nhận hàng"><CheckCircle className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-xs text-gray-500">Hiển thị {filtered.length} bản ghi</span>
            <button className="w-6 h-6 text-xs rounded font-medium text-white flex items-center justify-center" style={{ backgroundColor: PRIMARY }}>1</button>
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Chi tiết chuyển kho — {detail?.id}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Thông tin lệnh</p>
                  <div className="flex justify-between"><span className="text-gray-500">Mã lệnh:</span><span className="font-semibold" style={{ color: PRIMARY }}>{detail.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Kho nguồn:</span><span className="font-medium">{detail.sourceWarehouse}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Kho đích:</span><span className="font-medium">{detail.destWarehouse}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Người tạo:</span><span>{detail.requestedBy}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Ngày tạo:</span><span>{detail.createdDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Trạng thái:</span><Badge status={detail.status} /></div>
                </div>
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Vận chuyển</p>
                  <div className="flex justify-between"><span className="text-gray-500">Phương tiện:</span><span>{detail.vehicle || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tài xế:</span><span>{detail.driver || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Giờ xuất kho:</span><span>{detail.dispatchTime}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Giờ đến nơi:</span><span>{detail.arrivalTime}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Số kiện:</span><span className="font-semibold">{detail.packageCount || '—'}</span></div>
                </div>
              </div>

              {detail.items.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-600 text-[10px] uppercase tracking-wide mb-2">Danh sách hàng chuyển</p>
                  <table className="w-full border border-gray-200 rounded overflow-hidden">
                    <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="text-left px-3 py-2 text-gray-700 font-semibold">SKU</th><th className="text-left px-3 py-2 text-gray-700 font-semibold">Sản phẩm</th><th className="text-center px-3 py-2 text-gray-700 font-semibold">Tồn kho</th><th className="text-center px-3 py-2 text-gray-700 font-semibold">SL chuyển</th><th className="text-center px-3 py-2 text-gray-700 font-semibold">ĐVT</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {detail.items.map(item => (
                        <tr key={item.sku} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-mono text-gray-500">{item.sku}</td>
                          <td className="px-3 py-2 text-gray-800">{item.product}</td>
                          <td className="px-3 py-2 text-center">{item.availableQty}</td>
                          <td className="px-3 py-2 text-center font-semibold" style={{ color: PRIMARY }}>{item.transferQty}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {detail.timeline.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-600 text-[10px] uppercase tracking-wide mb-2">Lịch sử</p>
                  <div className="space-y-2">
                    {detail.timeline.map((t, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: PRIMARY }} />
                        <div><span className="text-gray-500">{t.time}</span><span className="mx-1.5 text-gray-400">·</span><span className="font-medium text-gray-800">{t.event}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {detail.status === 'submitted' && <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: PRIMARY }} onClick={() => dispatch(detail.id)}><Truck className="w-3.5 h-3.5" /> Xuất kho</Button>}
                {detail.status === 'arrived' && <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: SUCCESS }} onClick={() => receive(detail.id)}><CheckCircle className="w-3.5 h-3.5" /> Xác nhận nhận hàng</Button>}
                <Button variant="outline" size="sm" className="h-7 text-xs ml-auto" onClick={() => setDetail(null)}>Đóng</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Tạo lệnh chuyển kho mới</DialogTitle>
          </DialogHeader>
          <CreateForm onClose={() => setShowCreate(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
