import { useState } from 'react';
import { Button } from '../../components/sales-ui/button';
import { Input } from '../../components/sales-ui/input';
import { Search, Eye, RefreshCw, Download, Plus, Printer, CheckCircle, Play, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/sales-ui/dialog';

const PRIMARY = '#1F3B64';
const SUCCESS = '#16A34A';
const WARNING = '#D97706';
const ERROR   = '#DC2626';
const INFO    = '#2563EB';
const NEUTRAL = '#64748B';

const STATUS_CFG: Record<string, { label: string; bg: string }> = {
  open:      { label: 'Đang mở',       bg: INFO    },
  counting:  { label: 'Đang kiểm',     bg: WARNING },
  pending:   { label: 'Chờ duyệt',     bg: NEUTRAL },
  approved:  { label: 'Đã duyệt',      bg: SUCCESS },
  completed: { label: 'Hoàn tất',      bg: '#0891B2' },
};

interface CountLine { sku: string; product: string; location: string; systemQty: number; physicalQty: number; variance: number; diffPct: number; reason: string; remarks: string }
interface CountSession {
  id: string; warehouse: string; createdBy: string; snapshotTime: string;
  status: string; varianceCount: number; completion: number;
  countType: string; lines: CountLine[];
}

const SESSIONS: CountSession[] = [
  {
    id: 'CS-2406-0012', warehouse: 'Kho Hà Nội', createdBy: 'Trần Văn Bình',
    snapshotTime: '06/07/2026 00:00', status: 'counting', varianceCount: 2, completion: 65,
    countType: 'Kiểm kê toàn phần',
    lines: [
      { sku: 'VT-CT-001', product: 'Vải cotton khổ 1.5m', location: 'A-01-03', systemQty: 850, physicalQty: 848, variance: -2, diffPct: -0.24, reason: 'Hao hụt tự nhiên', remarks: '' },
      { sku: 'VT-SM-012', product: 'Sơ mi nam slim fit',   location: 'B-02-11', systemQty: 240, physicalQty: 238, variance: -2, diffPct: -0.83, reason: 'Chênh lệch',      remarks: 'Cần xác nhận lại' },
      { sku: 'VT-QT-007', product: 'Quần tây slim fit',    location: 'B-03-05', systemQty: 185, physicalQty: 185, variance: 0,  diffPct: 0,     reason: '',             remarks: '' },
      { sku: 'VT-LN-003', product: 'Vải linen nhập khẩu',  location: 'A-02-08', systemQty: 420, physicalQty: 420, variance: 0,  diffPct: 0,     reason: '',             remarks: '' },
      { sku: 'VT-DM-005', product: 'Vải denim cao cấp',    location: 'A-03-06', systemQty: 310, physicalQty: 0,   variance: -310, diffPct: -100, reason: '',             remarks: 'Chưa kiểm' },
    ],
  },
  {
    id: 'CS-2406-0011', warehouse: 'Kho HCM', createdBy: 'Phạm Thị Hương',
    snapshotTime: '01/07/2026 00:00', status: 'pending', varianceCount: 5, completion: 100,
    countType: 'Kiểm kê chu kỳ',
    lines: [],
  },
  {
    id: 'CS-2406-0010', warehouse: 'Kho Hà Nội', createdBy: 'Lê Văn Dũng',
    snapshotTime: '25/06/2026 00:00', status: 'approved', varianceCount: 1, completion: 100,
    countType: 'Kiểm kê chu kỳ',
    lines: [],
  },
];

const DASHBOARD = [
  { label: 'Đang mở',   value: 1, color: INFO    },
  { label: 'Đang kiểm', value: 1, color: WARNING },
  { label: 'Chờ duyệt', value: 1, color: NEUTRAL },
  { label: 'Đã duyệt',  value: 1, color: SUCCESS },
  { label: 'Tổng lệch', value: 8, color: ERROR   },
];

function Badge({ status }: { status: string }) {
  const c = STATUS_CFG[status] || { label: status, bg: NEUTRAL };
  return <span className="text-[10px] font-semibold text-white px-2 py-0.5 inline-block whitespace-nowrap" style={{ backgroundColor: c.bg, borderRadius: 4 }}>{c.label}</span>;
}

function CreateDialog({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ warehouseId: '', notes: '' });
  
  const handleCreateSession = async () => {
    try {
      const { createStockCountSession } = await import('../../services/warehouseService.js');
      await createStockCountSession({ warehouseId: formData.warehouseId, notes: formData.notes });
      alert('Mở phiên kiểm kê thành công!');
      onClose();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-gray-500">Kho *</label>
          <Input className="w-full h-7 text-xs border border-gray-200 rounded px-2 bg-white" placeholder="ID kho" value={formData.warehouseId} onChange={e => setFormData({...formData, warehouseId: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <label className="text-gray-500">Loại kiểm kê</label>
          <select className="w-full h-7 text-xs border border-gray-200 rounded px-2 bg-white"><option>Kiểm kê chu kỳ</option><option>Kiểm kê toàn phần</option></select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <label className="text-gray-500">Lý do kiểm kê</label>
          <Input className="h-7 text-xs" placeholder="Kiểm kê định kỳ tháng 7/2026..." />
        </div>
        <div className="col-span-2 space-y-1.5">
          <label className="text-gray-500">Ghi chú</label>
          <Input className="h-7 text-xs" placeholder="Ghi chú thêm..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
        </div>
      </div>
      <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px]">
        <strong>Lưu ý:</strong> Khi mở phiên kiểm kê, hệ thống sẽ chụp ảnh tồn kho tại thời điểm đó (Snapshot). Số liệu snapshot sẽ không thay đổi trong suốt quá trình kiểm kê.
      </div>
      <div className="flex gap-2 pt-2 border-t border-gray-100 justify-end">
        <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: PRIMARY }} onClick={handleCreateSession}><CheckCircle className="w-3.5 h-3.5" /> Mở phiên kiểm kê</Button>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onClose}>Hủy</Button>
      </div>
    </div>
  );
}

export default function WarehouseInventoryCount() {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<CountSession | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editLines, setEditLines] = useState<CountLine[]>([]);

  const filtered = SESSIONS.filter(s => {
    const q = search.toLowerCase();
    const mw = warehouseFilter === 'all' || s.warehouse === warehouseFilter;
    return (!q || s.id.toLowerCase().includes(q) || s.warehouse.toLowerCase().includes(q) || s.createdBy.toLowerCase().includes(q)) && mw;
  });

  const toggleSelect = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelected(p => p.length === filtered.length ? [] : filtered.map(s => s.id));

  const openDetail = (s: CountSession) => { setDetail(s); setEditLines(s.lines.map(l => ({ ...l }))); };
  const updatePhysical = (idx: number, val: number) => {
    setEditLines(p => p.map((l, i) => i === idx ? { ...l, physicalQty: val, variance: val - l.systemQty, diffPct: l.systemQty > 0 ? ((val - l.systemQty) / l.systemQty) * 100 : 0 } : l));
  };

  const handleSubmitCount = async () => {
    if (!detail) return;
    try {
      const payload = editLines.map(l => ({
        productId: l.sku,
        actualQuantity: l.physicalQty,
        reason: l.reason
      }));
      const { submitStockCount } = await import('../../services/warehouseService.js');
      await submitStockCount(detail.id, payload);
      alert('Nộp kết quả kiểm kê thành công!');
      setDetail(null);
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] mb-0.5"><span className="text-gray-400">Kho hàng</span><span className="text-gray-300">/</span><span className="text-gray-400">Quản lý tồn kho (Inventory)</span><span className="text-gray-300">/</span><span className="text-gray-800 font-semibold">Kiểm kê tồn kho</span></div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Kiểm kê tồn kho (Inventory Count)</h2>
            <p className="text-xs text-gray-500 mt-0.5">{SESSIONS.length} phiên kiểm kê</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: PRIMARY }} onClick={() => setShowCreate(true)}><Plus className="w-3 h-3" /> Mở phiên kiểm kê</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><RefreshCw className="w-3 h-3" /> Làm mới</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><Download className="w-3 h-3" /> Xuất Excel</Button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-3">
          {DASHBOARD.map(d => (
            <div key={d.label} className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2 border border-gray-200">
              <div>
                <p className="text-[10px] text-gray-500">{d.label}</p>
                <p className="text-base font-bold" style={{ color: d.color }}>{d.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input className="pl-8 h-7 text-xs bg-gray-50" placeholder="Mã phiên, kho, người tạo..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
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
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100 whitespace-nowrap">Đóng phiên</button>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100 whitespace-nowrap">Xuất Excel</button>
            <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100 whitespace-nowrap" onClick={() => setSelected([])}>Hủy chọn</button>
          </div>
        )}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2.5"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Phiên kiểm kê</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Kho</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Người tạo</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Loại kiểm kê</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Thời gian snapshot</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Số lệch</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Hoàn thành</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Trạng thái</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan={12} className="py-12 text-center"><div className="flex flex-col items-center gap-2"><div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><span className="text-gray-400 text-xl">📋</span></div><p className="text-sm font-medium text-gray-500">Không có dữ liệu</p><p className="text-xs text-gray-400">Thay đổi bộ lọc để xem kết quả khác</p></div></td></tr>
              )}
              {filtered.map((s, i) => (
                <tr key={s.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-3 py-2.5"><input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleSelect(s.id)} /></td>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: PRIMARY }}>{s.id}</td>
                  <td className="px-3 py-2.5 text-gray-700">{s.warehouse}</td>
                  <td className="px-3 py-2.5 text-gray-700">{s.createdBy}</td>
                  <td className="px-3 py-2.5 text-gray-600">{s.countType}</td>
                  <td className="px-3 py-2.5 text-gray-500">{s.snapshotTime}</td>
                  <td className="px-3 py-2.5 text-center font-semibold" style={{ color: s.varianceCount > 0 ? ERROR : SUCCESS }}>{s.varianceCount}</td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.completion}%`, backgroundColor: s.completion === 100 ? SUCCESS : INFO }} />
                      </div>
                      <span className="font-mono text-gray-600">{s.completion}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center"><Badge status={s.status} /></td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" onClick={() => openDetail(s)}><Eye className="w-3.5 h-3.5" /></button>
                      {s.status === 'counting' && <button className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" title="Tiếp tục kiểm"><Play className="w-3.5 h-3.5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-xs text-gray-500">Hiển thị {filtered.length} / {SESSIONS.length} phiên</span>
            <button className="w-6 h-6 text-xs rounded font-medium text-white flex items-center justify-center" style={{ backgroundColor: PRIMARY }}>1</button>
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Chi tiết phiên kiểm kê — {detail?.id}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Thông tin phiên</p>
                  <div className="flex justify-between"><span className="text-gray-500">Mã phiên:</span><span className="font-semibold" style={{ color: PRIMARY }}>{detail.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Kho:</span><span>{detail.warehouse}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Người tạo:</span><span>{detail.createdBy}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Loại kiểm:</span><span>{detail.countType}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Snapshot:</span><span>{detail.snapshotTime}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Trạng thái:</span><Badge status={detail.status} /></div>
                </div>
                <div className="col-span-2 bg-gray-50 rounded p-3">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Tiến độ kiểm kê</p>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${detail.completion}%`, backgroundColor: detail.completion === 100 ? SUCCESS : INFO }} />
                    </div>
                    <span className="font-mono font-semibold" style={{ color: PRIMARY }}>{detail.completion}%</span>
                  </div>
                  <div className="flex gap-4">
                    <div><p className="text-gray-500">Số dòng lệch</p><p className="text-xl font-bold" style={{ color: detail.varianceCount > 0 ? ERROR : SUCCESS }}>{detail.varianceCount}</p></div>
                    <div><p className="text-gray-500">Tổng dòng</p><p className="text-xl font-bold text-gray-700">{detail.lines.length}</p></div>
                  </div>
                </div>
              </div>

              {editLines.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-600 text-[10px] uppercase tracking-wide mb-2">Bảng kiểm kê</p>
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left px-3 py-2 text-gray-700 font-semibold">SKU</th>
                          <th className="text-left px-3 py-2 text-gray-700 font-semibold">Sản phẩm</th>
                          <th className="text-left px-3 py-2 text-gray-700 font-semibold">Vị trí</th>
                          <th className="text-center px-3 py-2 text-gray-700 font-semibold">SL hệ thống</th>
                          <th className="text-center px-3 py-2 text-gray-700 font-semibold">SL thực tế</th>
                          <th className="text-center px-3 py-2 text-gray-700 font-semibold">Lệch</th>
                          <th className="text-center px-3 py-2 text-gray-700 font-semibold">Lệch %</th>
                          <th className="text-left px-3 py-2 text-gray-700 font-semibold">Lý do</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {editLines.map((line, idx) => (
                          <tr key={line.sku} className={`hover:bg-gray-50 ${line.variance !== 0 ? 'bg-red-50/30' : ''}`}>
                            <td className="px-3 py-2 font-mono text-gray-500">{line.sku}</td>
                            <td className="px-3 py-2 text-gray-800">{line.product}</td>
                            <td className="px-3 py-2 font-mono text-gray-600">{line.location}</td>
                            <td className="px-3 py-2 text-center font-semibold text-gray-700">{line.systemQty}</td>
                            <td className="px-3 py-2 text-center">
                              {detail.status === 'counting'
                                ? <Input type="number" value={line.physicalQty || ''} className="h-6 text-xs text-center w-16 mx-auto" onChange={e => updatePhysical(idx, +e.target.value)} placeholder="..." />
                                : <span className="font-semibold">{line.physicalQty}</span>}
                            </td>
                            <td className="px-3 py-2 text-center font-semibold" style={{ color: line.variance === 0 ? SUCCESS : line.variance < 0 ? ERROR : WARNING }}>
                              {line.variance > 0 ? '+' : ''}{line.physicalQty > 0 ? line.variance : '—'}
                            </td>
                            <td className="px-3 py-2 text-center font-mono font-semibold" style={{ color: line.variance === 0 ? SUCCESS : ERROR }}>
                              {line.physicalQty > 0 ? `${line.diffPct.toFixed(1)}%` : '—'}
                            </td>
                            <td className="px-3 py-2">
                              {detail.status === 'counting'
                                ? <Input value={line.reason} className="h-6 text-xs" onChange={e => setEditLines(p => p.map((l, i) => i === idx ? { ...l, reason: e.target.value } : l))} placeholder="Lý do..." />
                                : <span className="text-gray-600">{line.reason}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {detail.status === 'counting' && (
                  <>
                    <Button size="sm" className="h-7 text-xs gap-1.5" variant="outline"><X className="w-3.5 h-3.5" /> Lưu nháp</Button>
                    <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: PRIMARY }} onClick={handleSubmitCount}><CheckCircle className="w-3.5 h-3.5" /> Nộp kết quả</Button>
                    <Button size="sm" className="h-7 text-xs gap-1.5" variant="outline"><Printer className="w-3.5 h-3.5" /> In bảng kiểm</Button>
                  </>
                )}
                <Button variant="outline" size="sm" className="h-7 text-xs ml-auto" onClick={() => setDetail(null)}>Đóng</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg" aria-describedby={undefined}>
          <DialogHeader><DialogTitle className="text-sm font-bold">Mở phiên kiểm kê mới</DialogTitle></DialogHeader>
          <CreateDialog onClose={() => setShowCreate(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
