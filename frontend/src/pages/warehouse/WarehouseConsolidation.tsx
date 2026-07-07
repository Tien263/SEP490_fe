import { useState } from 'react';
import { Button } from '../../components/sales-ui/button';
import { Input } from '../../components/sales-ui/input';
import { Search, Eye, RefreshCw, Download, ArrowRight, RotateCcw, Clock, Package2, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/sales-ui/dialog';

const PRIMARY = '#1F3B64';
const SUCCESS = '#16A34A';
const WARNING = '#D97706';
const ERROR   = '#DC2626';
const INFO    = '#2563EB';
const NEUTRAL = '#64748B';

const STATUS_CFG: Record<string, { label: string; bg: string }> = {
  waiting:   { label: 'Chờ tập kết',  bg: NEUTRAL },
  ready:     { label: 'Sẵn sàng',     bg: SUCCESS },
  delayed:   { label: 'Trễ hạn',      bg: ERROR   },
  completed: { label: 'Đã bàn giao',  bg: INFO    },
};

interface ConsolidationItem {
  id: string; fulfillmentId: string; warehouse: string;
  packages: number; boxes: number; weight: string;
  preparedBy: string; preparedTime: string;
  waitingDuration: string;
  status: 'waiting' | 'ready' | 'delayed' | 'completed';
  packageList: { boxNo: string; weight: string; items: string; label: string }[];
  remarks: string;
  timeline: { time: string; event: string; user: string }[];
}

const DATA: ConsolidationItem[] = [
  {
    id: 'CON-2406-0041', fulfillmentId: 'FO-2406-0132', warehouse: 'Kho HCM',
    packages: 3, boxes: 3, weight: '24.5 kg',
    preparedBy: 'Phạm Thị Hương', preparedTime: '05/07 17:00',
    waitingDuration: '15 giờ', status: 'ready',
    packageList: [
      { boxNo: 'BOX-001', weight: '8.2 kg', items: 'VT-AK-009 x15', label: 'LBL-2406-001' },
      { boxNo: 'BOX-002', weight: '9.1 kg', items: 'VT-DM-005 x40', label: 'LBL-2406-002' },
      { boxNo: 'BOX-003', weight: '7.2 kg', items: 'VT-DM-005 x40', label: 'LBL-2406-003' },
    ],
    remarks: 'Hàng fragile, xếp ngửa',
    timeline: [
      { time: '05/07 17:00', event: 'Hoàn tất packing, chuyển consolidation', user: 'Phạm Thị Hương' },
      { time: '05/07 17:15', event: 'Dán nhãn thùng hoàn tất', user: 'Phạm Thị Hương' },
      { time: '06/07 08:00', event: 'Kiểm tra lại trước bàn giao', user: 'Trần Văn Bình' },
    ],
  },
  {
    id: 'CON-2406-0040', fulfillmentId: 'FO-2406-0130', warehouse: 'Kho Hà Nội',
    packages: 5, boxes: 5, weight: '42.0 kg',
    preparedBy: 'Lê Văn Dũng', preparedTime: '04/07 16:30',
    waitingDuration: '38 giờ', status: 'completed',
    packageList: [],
    remarks: '',
    timeline: [
      { time: '04/07 16:30', event: 'Chuyển khu consolidation', user: 'Lê Văn Dũng' },
      { time: '05/07 09:00', event: 'Bàn giao cho Sales', user: 'Trần Văn Bình' },
    ],
  },
  {
    id: 'CON-2406-0039', fulfillmentId: 'FO-2406-0129', warehouse: 'Kho HCM',
    packages: 2, boxes: 2, weight: '18.5 kg',
    preparedBy: 'Nguyễn Văn Thành', preparedTime: '04/07 10:00',
    waitingDuration: '44 giờ', status: 'delayed',
    packageList: [],
    remarks: 'Chờ Sales xác nhận lịch',
    timeline: [
      { time: '04/07 10:00', event: 'Chuyển khu consolidation', user: 'Nguyễn Văn Thành' },
    ],
  },
  {
    id: 'CON-2406-0038', fulfillmentId: 'FO-2406-0128', warehouse: 'Kho Hà Nội',
    packages: 1, boxes: 1, weight: '6.0 kg',
    preparedBy: 'Lê Văn Dũng', preparedTime: '06/07 09:30',
    waitingDuration: '30 phút', status: 'waiting',
    packageList: [
      { boxNo: 'BOX-001', weight: '6.0 kg', items: 'VT-LN-003 x100', label: 'LBL-2406-004' },
    ],
    remarks: '',
    timeline: [
      { time: '06/07 09:30', event: 'Chuyển khu consolidation', user: 'Lê Văn Dũng' },
    ],
  },
];

const STATS = [
  { label: 'Chờ tập kết', value: DATA.filter(d => d.status === 'waiting').length, icon: <Clock className="w-4 h-4" />, color: NEUTRAL },
  { label: 'Sẵn sàng',    value: DATA.filter(d => d.status === 'ready').length,   icon: <CheckCircle className="w-4 h-4" />, color: SUCCESS },
  { label: 'Trễ hạn',     value: DATA.filter(d => d.status === 'delayed').length, icon: <AlertTriangle className="w-4 h-4" />, color: ERROR },
  { label: 'Đã bàn giao', value: DATA.filter(d => d.status === 'completed').length, icon: <Package2 className="w-4 h-4" />, color: INFO },
];

function Badge({ status }: { status: string }) {
  const c = STATUS_CFG[status] || { label: status, bg: NEUTRAL };
  return <span className="text-[10px] font-semibold text-white px-2 py-0.5 inline-block whitespace-nowrap" style={{ backgroundColor: c.bg, borderRadius: 4 }}>{c.label}</span>;
}

export default function WarehouseConsolidation() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<ConsolidationItem | null>(null);

  const filtered = DATA.filter(d => {
    const q = search.toLowerCase();
    const ms = !q || d.id.toLowerCase().includes(q) || d.fulfillmentId.toLowerCase().includes(q) || d.preparedBy.toLowerCase().includes(q);
    const mst = statusFilter === 'all' || d.status === statusFilter;
    const mw = warehouseFilter === 'all' || d.warehouse === warehouseFilter;
    return ms && mst && mw;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] mb-0.5">
          <span className="text-gray-400">Kho hàng</span> <span className="text-gray-300">/</span> <span className="text-gray-400">Xuất kho (Outbound)</span> <span className="text-gray-300">/</span> <span className="text-gray-800 font-semibold">Khu tập kết hàng</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Khu tập kết hàng (Consolidation Area)</h2>
            <p className="text-xs text-gray-500 mt-0.5">{DATA.length} lô hàng đang quản lý</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><RefreshCw className="w-3 h-3" /> Làm mới</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><Download className="w-3 h-3" /> Xuất Excel</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {STATS.map(s => (
            <div key={s.label} className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2 border border-gray-200">
              <span style={{ color: s.color }}>{s.icon}</span>
              <div>
                <p className="text-[11px] text-gray-500">{s.label}</p>
                <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input className="pl-8 h-7 text-xs bg-gray-50" placeholder="Mã consolidation, lệnh xuất..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)}>
            <option value="all">Tất cả kho</option>
            <option value="Kho Hà Nội">Kho Hà Nội</option>
            <option value="Kho HCM">Kho HCM</option>
            <option value="Kho Đà Nẵng">Kho Đà Nẵng</option>
          </select>
          <span className="text-xs text-gray-500">Từ ngày</span>
          <input type="date" className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span className="text-xs text-gray-500">Đến ngày</span>
          <input type="date" className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        {selected.length > 0 && (
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded px-3 py-2 mb-2 flex items-center gap-2 text-xs text-blue-700">
            Đã chọn {selected.length} lô · <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100">Chuyển bàn giao</button> <button className="h-6 px-2.5 text-[10px] font-medium rounded border border-blue-300 text-blue-700 hover:bg-blue-100">Xuất Excel</button> <button className="ml-auto text-gray-400 hover:text-gray-600" onClick={() => setSelected([])}><X className="w-3.5 h-3.5" /></button>
          </div>
        )}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2.5"><input type="checkbox" className="w-3.5 h-3.5" checked={selected.length === filtered.length && filtered.length > 0} onChange={e => setSelected(e.target.checked ? filtered.map(d => d.id) : [])} /></th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Mã tập kết</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Mã lệnh xuất</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Kho</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Kiện hàng</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Thùng</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Khối lượng</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Người chuẩn bị</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Thời gian chờ</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Trạng thái</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={11} className="py-12 text-center"><div className="flex flex-col items-center gap-2"><div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><Package2 className="w-5 h-5 text-gray-400" /></div><p className="text-sm font-medium text-gray-500">Không có dữ liệu tập kết</p><p className="text-xs text-gray-400">Thay đổi bộ lọc để xem kết quả khác</p></div></td></tr>
              ) : filtered.map((d, i) => (
                <tr key={d.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-3 py-2.5"><input type="checkbox" className="w-3.5 h-3.5" checked={selected.includes(d.id)} onChange={e => setSelected(prev => e.target.checked ? [...prev, d.id] : prev.filter(x => x !== d.id))} /></td>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: PRIMARY }}>{d.id}</td>
                  <td className="px-3 py-2.5 text-gray-600">{d.fulfillmentId}</td>
                  <td className="px-3 py-2.5 text-gray-700">{d.warehouse}</td>
                  <td className="px-3 py-2.5 text-center font-semibold text-gray-800">{d.packages}</td>
                  <td className="px-3 py-2.5 text-center font-semibold text-gray-800">{d.boxes}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700">{d.weight}</td>
                  <td className="px-3 py-2.5 text-gray-700">{d.preparedBy}</td>
                  <td className="px-3 py-2.5 text-gray-500" style={{ color: d.status === 'delayed' ? ERROR : 'inherit' }}>{d.waitingDuration}</td>
                  <td className="px-3 py-2.5 text-center"><Badge status={d.status} /></td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" onClick={() => setDetail(d)}><Eye className="w-3.5 h-3.5" /></button>
                      {(d.status === 'waiting' || d.status === 'ready') && (
                        <button className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" title="Chuyển bàn giao"><ArrowRight className="w-3.5 h-3.5" /></button>
                      )}
                      {d.status === 'ready' && (
                        <button className="p-1 rounded hover:bg-orange-50 text-gray-400 hover:text-orange-600" title="Mở lại"><RotateCcw className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-xs text-gray-500">Hiển thị {filtered.length} / {DATA.length} bản ghi</span>
            <button className="w-6 h-6 text-xs rounded font-medium text-white flex items-center justify-center" style={{ backgroundColor: PRIMARY }}>1</button>
          </div>
        </div>
      </div>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Chi tiết tập kết — {detail?.id}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Thông tin lô hàng</p>
                  <div className="flex justify-between"><span className="text-gray-500">Mã tập kết:</span><span className="font-semibold" style={{ color: PRIMARY }}>{detail.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Mã lệnh xuất:</span><span className="font-medium">{detail.fulfillmentId}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Kho:</span><span>{detail.warehouse}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Người chuẩn bị:</span><span className="font-medium">{detail.preparedBy}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Thời gian chuẩn bị:</span><span>{detail.preparedTime}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Thời gian chờ:</span><span style={{ color: detail.status === 'delayed' ? ERROR : 'inherit' }}>{detail.waitingDuration}</span></div>
                </div>
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Thống kê kiện hàng</p>
                  <div className="flex justify-between"><span className="text-gray-500">Số kiện:</span><span className="font-semibold text-lg" style={{ color: PRIMARY }}>{detail.packages}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Số thùng:</span><span className="font-semibold">{detail.boxes}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tổng khối lượng:</span><span className="font-semibold">{detail.weight}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Trạng thái:</span><Badge status={detail.status} /></div>
                  {detail.remarks && <div className="pt-1 border-t border-gray-200"><span className="text-gray-500">Ghi chú: </span><span className="text-gray-700">{detail.remarks}</span></div>}
                </div>
              </div>

              {detail.packageList.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-600 text-[10px] uppercase tracking-wide mb-2">Danh sách thùng</p>
                  <table className="w-full border border-gray-200 rounded overflow-hidden">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-3 py-2 text-gray-700 font-semibold">Thùng số</th>
                        <th className="text-center px-3 py-2 text-gray-700 font-semibold">Khối lượng</th>
                        <th className="text-left px-3 py-2 text-gray-700 font-semibold">Nội dung</th>
                        <th className="text-left px-3 py-2 text-gray-700 font-semibold">Nhãn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detail.packageList.map(p => (
                        <tr key={p.boxNo} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-semibold" style={{ color: PRIMARY }}>{p.boxNo}</td>
                          <td className="px-3 py-2 text-center">{p.weight}</td>
                          <td className="px-3 py-2 text-gray-700">{p.items}</td>
                          <td className="px-3 py-2 font-mono text-gray-500 text-[10px]">{p.label}</td>
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
                        <div><span className="text-gray-500">{t.time}</span><span className="mx-1.5 text-gray-400">·</span><span className="font-medium text-gray-800">{t.event}</span><span className="mx-1.5 text-gray-400">·</span><span className="text-gray-500">{t.user}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {(detail.status === 'waiting' || detail.status === 'ready') && (
                  <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: PRIMARY }}>
                    <ArrowRight className="w-3.5 h-3.5" /> Chuyển bàn giao Sales
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
