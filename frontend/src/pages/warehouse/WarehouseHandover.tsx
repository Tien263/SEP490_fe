import { useState } from 'react';
import { Button } from '../../components/sales-ui/button';
import { Input } from '../../components/sales-ui/input';
import { Search, Eye, RefreshCw, Download, Printer, CheckCircle, Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/sales-ui/dialog';

const PRIMARY = '#1F3B64';
const SUCCESS = '#16A34A';
const WARNING = '#D97706';
const ERROR   = '#DC2626';
const INFO    = '#2563EB';
const NEUTRAL = '#64748B';

const STATUS_CFG: Record<string, { label: string; bg: string }> = {
  waiting_warehouse: { label: 'Chờ kho xác nhận', bg: WARNING },
  waiting_sales:     { label: 'Chờ sales xác nhận', bg: INFO   },
  completed:         { label: 'Hoàn tất',           bg: SUCCESS },
  cancelled:         { label: 'Đã hủy',             bg: ERROR   },
};

interface Handover {
  id: string; fulfillmentId: string; warehouseStaff: string; salesStaff: string;
  vehicle: string; packageCount: number;
  warehouseConfirmed: boolean; salesConfirmed: boolean;
  handoverTime: string;
  status: 'waiting_warehouse' | 'waiting_sales' | 'completed' | 'cancelled';
  packages: { boxNo: string; weight: string; items: string }[];
  notes: string;
  timeline: { time: string; event: string; user: string }[];
}

const DATA: Handover[] = [
  {
    id: 'HO-2406-0018', fulfillmentId: 'FO-2406-0132', warehouseStaff: 'Trần Văn Bình',
    salesStaff: 'Nguyễn Văn Hùng', vehicle: 'Xe tải 29B-12345',
    packageCount: 3, warehouseConfirmed: true, salesConfirmed: false,
    handoverTime: '06/07/2026 09:00', status: 'waiting_sales',
    packages: [
      { boxNo: 'BOX-001', weight: '8.2 kg', items: 'VT-AK-009 x15' },
      { boxNo: 'BOX-002', weight: '9.1 kg', items: 'VT-DM-005 x40' },
      { boxNo: 'BOX-003', weight: '7.2 kg', items: 'VT-DM-005 x40' },
    ],
    notes: 'Hàng đã kiểm tra đầy đủ. Khách Tân Phú nhận trực tiếp.',
    timeline: [
      { time: '06/07 08:30', event: 'Tạo lệnh bàn giao', user: 'Hệ thống' },
      { time: '06/07 09:00', event: 'Kho xác nhận bàn giao', user: 'Trần Văn Bình' },
    ],
  },
  {
    id: 'HO-2406-0017', fulfillmentId: 'FO-2406-0130', warehouseStaff: 'Trần Văn Bình',
    salesStaff: 'Lê Thị Mai', vehicle: 'Xe tải 29C-67890',
    packageCount: 5, warehouseConfirmed: true, salesConfirmed: true,
    handoverTime: '05/07/2026 09:00', status: 'completed',
    packages: [],
    notes: '',
    timeline: [
      { time: '05/07 08:00', event: 'Tạo lệnh bàn giao', user: 'Hệ thống' },
      { time: '05/07 08:30', event: 'Kho xác nhận', user: 'Trần Văn Bình' },
      { time: '05/07 09:00', event: 'Sales xác nhận nhận hàng', user: 'Lê Thị Mai' },
      { time: '05/07 09:00', event: 'Bàn giao hoàn tất, chuyển Delivery', user: 'Hệ thống' },
    ],
  },
  {
    id: 'HO-2406-0016', fulfillmentId: 'FO-2406-0129', warehouseStaff: 'Nguyễn Văn Thành',
    salesStaff: 'Phạm Văn Nam', vehicle: 'Xe tải 51A-23456',
    packageCount: 2, warehouseConfirmed: false, salesConfirmed: false,
    handoverTime: '06/07/2026 14:00', status: 'waiting_warehouse',
    packages: [],
    notes: 'Hẹn bàn giao 14:00 chiều',
    timeline: [
      { time: '06/07 07:00', event: 'Tạo lệnh bàn giao', user: 'Hệ thống' },
    ],
  },
];

function Badge({ status }: { status: string }) {
  const c = STATUS_CFG[status] || { label: status, bg: NEUTRAL };
  return <span className="text-[10px] font-semibold text-white px-2 py-0.5 inline-block whitespace-nowrap" style={{ backgroundColor: c.bg, borderRadius: 4 }}>{c.label}</span>;
}

function ConfirmDot({ confirmed }: { confirmed: boolean }) {
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 inline-block whitespace-nowrap" style={{ backgroundColor: confirmed ? SUCCESS : NEUTRAL, color: 'white', borderRadius: 4 }}>
      {confirmed ? 'Đã xác nhận' : 'Chờ xác nhận'}
    </span>
  );
}

export default function WarehouseHandover() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Handover | null>(null);
  const [data, setData] = useState(DATA);

  const filtered = data.filter(d => {
    const q = search.toLowerCase();
    const ms = !q || d.id.toLowerCase().includes(q) || d.fulfillmentId.toLowerCase().includes(q) || d.salesStaff.toLowerCase().includes(q);
    const mst = statusFilter === 'all' || d.status === statusFilter;
    return ms && mst;
  });

  const confirmWarehouse = (id: string) => {
    setData(p => p.map(d => d.id === id ? { ...d, warehouseConfirmed: true, status: 'waiting_sales' as const } : d));
    setDetail(prev => prev?.id === id ? { ...prev, warehouseConfirmed: true, status: 'waiting_sales' } : prev);
  };

  const confirmSales = (id: string) => {
    setData(p => p.map(d => d.id === id ? { ...d, salesConfirmed: true, status: 'completed' as const } : d));
    setDetail(prev => prev?.id === id ? { ...prev, salesConfirmed: true, status: 'completed' } : prev);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] mb-0.5">
          <span className="text-gray-400">Kho hàng</span> <span className="text-gray-300">/</span> <span className="text-gray-400">Xuất kho (Outbound)</span> <span className="text-gray-300">/</span> <span className="text-gray-800 font-semibold">Bàn giao Sales</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Bàn giao cho Sales</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {data.length} lệnh · {data.filter(d => d.status !== 'completed').length} chờ xác nhận
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><RefreshCw className="w-3 h-3" /> Làm mới</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><Download className="w-3 h-3" /> Xuất Excel</Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input className="pl-8 h-7 text-xs bg-gray-50" placeholder="Mã bàn giao, mã lệnh..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="h-7 text-xs border border-gray-200 rounded px-2 bg-white text-gray-600" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Mã bàn giao</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Mã lệnh xuất</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">NV Kho</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">NV Sales</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Phương tiện</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Số kiện</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Kho xác nhận</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Sales xác nhận</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Thời gian</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Trạng thái</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((d, i) => (
                <tr key={d.id} className={`hover:bg-blue-50/30 transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: PRIMARY }}>{d.id}</td>
                  <td className="px-3 py-2.5 text-gray-600">{d.fulfillmentId}</td>
                  <td className="px-3 py-2.5 text-gray-700">{d.warehouseStaff}</td>
                  <td className="px-3 py-2.5 text-gray-700">{d.salesStaff}</td>
                  <td className="px-3 py-2.5 text-gray-600">{d.vehicle}</td>
                  <td className="px-3 py-2.5 text-center font-semibold">{d.packageCount}</td>
                  <td className="px-3 py-2.5 text-center"><ConfirmDot confirmed={d.warehouseConfirmed} /></td>
                  <td className="px-3 py-2.5 text-center"><ConfirmDot confirmed={d.salesConfirmed} /></td>
                  <td className="px-3 py-2.5 text-gray-500">{d.handoverTime}</td>
                  <td className="px-3 py-2.5 text-center"><Badge status={d.status} /></td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" onClick={() => setDetail(d)}><Eye className="w-3.5 h-3.5" /></button>
                      {!d.warehouseConfirmed && <button className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" onClick={() => confirmWarehouse(d.id)} title="Kho xác nhận"><CheckCircle className="w-3.5 h-3.5" /></button>}
                      {d.warehouseConfirmed && !d.salesConfirmed && <button className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" onClick={() => confirmSales(d.id)} title="Sales xác nhận"><Truck className="w-3.5 h-3.5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-xs text-gray-500">Hiển thị {filtered.length} / {data.length} bản ghi</span>
            <button className="w-6 h-6 text-xs rounded font-medium text-white flex items-center justify-center" style={{ backgroundColor: PRIMARY }}>1</button>
          </div>
        </div>
      </div>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Chi tiết bàn giao — {detail?.id}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Thông tin bàn giao</p>
                  <div className="flex justify-between"><span className="text-gray-500">Mã:</span><span className="font-semibold" style={{ color: PRIMARY }}>{detail.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Lệnh xuất:</span><span>{detail.fulfillmentId}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">NV Kho:</span><span className="font-medium">{detail.warehouseStaff}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">NV Sales:</span><span className="font-medium">{detail.salesStaff}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Phương tiện:</span><span>{detail.vehicle}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Thời gian:</span><span>{detail.handoverTime}</span></div>
                </div>
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Trạng thái xác nhận</p>
                  <div className="flex justify-between"><span className="text-gray-500">Kho xác nhận:</span><ConfirmDot confirmed={detail.warehouseConfirmed} /></div>
                  <div className="flex justify-between"><span className="text-gray-500">Sales xác nhận:</span><ConfirmDot confirmed={detail.salesConfirmed} /></div>
                  <div className="flex justify-between"><span className="text-gray-500">Số kiện:</span><span className="font-semibold text-base" style={{ color: PRIMARY }}>{detail.packageCount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Trạng thái:</span><Badge status={detail.status} /></div>
                  {detail.notes && <div className="pt-1 border-t border-gray-200"><p className="text-gray-500 mb-0.5">Ghi chú:</p><p className="text-gray-700">{detail.notes}</p></div>}
                </div>
              </div>

              {detail.packages.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-600 text-[10px] uppercase tracking-wide mb-2">Danh sách kiện hàng</p>
                  <table className="w-full border border-gray-200 rounded overflow-hidden">
                    <thead><tr className="bg-gray-50 border-b border-gray-200"><th className="text-left px-3 py-2 text-gray-700 font-semibold">Thùng</th><th className="text-center px-3 py-2 text-gray-700 font-semibold">Khối lượng</th><th className="text-left px-3 py-2 text-gray-700 font-semibold">Nội dung</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {detail.packages.map(p => <tr key={p.boxNo} className="hover:bg-gray-50"><td className="px-3 py-2 font-semibold" style={{ color: PRIMARY }}>{p.boxNo}</td><td className="px-3 py-2 text-center">{p.weight}</td><td className="px-3 py-2 text-gray-700">{p.items}</td></tr>)}
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
                {!detail.warehouseConfirmed && (
                  <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: PRIMARY }} onClick={() => confirmWarehouse(detail.id)}>
                    <CheckCircle className="w-3.5 h-3.5" /> Kho xác nhận bàn giao
                  </Button>
                )}
                {detail.warehouseConfirmed && !detail.salesConfirmed && (
                  <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: SUCCESS }} onClick={() => confirmSales(detail.id)}>
                    <Truck className="w-3.5 h-3.5" /> Sales xác nhận nhận hàng
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><Printer className="w-3.5 h-3.5" /> In phiếu bàn giao</Button>
                <Button variant="outline" size="sm" className="h-7 text-xs ml-auto" onClick={() => setDetail(null)}>Đóng</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
