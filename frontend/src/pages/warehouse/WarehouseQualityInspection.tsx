import { useState } from 'react';
import { Button } from '../../components/sales-ui/button';
import { Input } from '../../components/sales-ui/input';
import { Search, Eye, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/sales-ui/dialog';
import { getQuarantineList, dispatchQuarantine } from '../../services/warehouseService.js';
import { useEffect } from 'react';

const PRIMARY = '#1F3B64';
const SUCCESS = '#16A34A';
const WARNING = '#D97706';
const ERROR   = '#DC2626';
const INFO    = '#2563EB';
const NEUTRAL = '#64748B';

const STATUS_CFG: Record<string, { label: string; bg: string }> = {
  waiting:   { label: 'Chờ kiểm tra',    bg: NEUTRAL },
  available: { label: 'Đạt yêu cầu',     bg: SUCCESS },
  damaged:   { label: 'Không đạt (Lỗi)', bg: ERROR   },
};

interface InspectionItem {
  id: string; // quarantineId
  quarantineCode: string;
  sku: string; 
  product: string; 
  quantity: number;
  status: 'waiting' | 'available' | 'damaged';
  inspectionDate: string;
  notes: string;
}

function Badge({ status }: { status: string }) {
  const c = STATUS_CFG[status] || { label: status, bg: NEUTRAL };
  return <span className="text-[10px] font-semibold text-white px-2 py-0.5 inline-block whitespace-nowrap" style={{ backgroundColor: c.bg, borderRadius: 4 }}>{c.label}</span>;
}

export default function WarehouseQualityInspection() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detail, setDetail] = useState<InspectionItem | null>(null);
  const [items, setItems] = useState<InspectionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getQuarantineList();
      const mapped = data.map((d: any) => ({
        id: d.id,
        quarantineCode: d.quarantineCode,
        sku: d.sku || '-',
        product: d.productName || '-',
        quantity: d.quantity,
        status: d.status?.toLowerCase() === 'waiting' ? 'waiting' : d.dispatchedAction || 'waiting',
        inspectionDate: d.createdAt ? new Date(d.createdAt).toLocaleString('vi-VN') : '',
        notes: d.notes || ''
      }));
      setItems(mapped);
    } catch (err: any) {
      alert('Lỗi lấy danh sách cách ly: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = items.filter(d => {
    const q = search.toLowerCase();
    const ms = !q || d.quarantineCode.toLowerCase().includes(q) || d.sku.toLowerCase().includes(q) || d.product.toLowerCase().includes(q);
    return ms && (statusFilter === 'all' || d.status === statusFilter);
  });

  const approve = async (id: string) => {
    if (!confirm('Xác nhận hàng hóa đạt yêu cầu và đưa vào kho tồn?')) return;
    try {
      await dispatchQuarantine(id, 'available');
      alert('Đã xử lý đạt yêu cầu!');
      setDetail(null);
      loadData();
    } catch (err: any) {
      alert('Lỗi xử lý: ' + err.message);
    }
  };

  const reject = async (id: string) => {
    if (!confirm('Xác nhận hàng hóa lỗi và xuất trả NCC?')) return;
    try {
      await dispatchQuarantine(id, 'damaged');
      alert('Đã xử lý không đạt (Lỗi)!');
      setDetail(null);
      loadData();
    } catch (err: any) {
      alert('Lỗi xử lý: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] mb-0.5">
          <span className="text-gray-400">Kho hàng</span><span className="text-gray-400">/</span><span className="text-gray-400">Nhập kho (Inbound)</span><span className="text-gray-400">/</span><span className="text-gray-800 font-semibold">Kiểm tra chất lượng</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Kiểm tra chất lượng (Quality Inspection)</h2>
            <p className="text-xs text-gray-500 mt-0.5">{items.length} lệnh kiểm tra · {items.filter(i => i.status === 'waiting').length} đang xử lý</p>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={loadData} disabled={loading}><RefreshCw className="w-3 h-3" /> Làm mới</Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input className="pl-8 h-7 text-xs bg-gray-50" placeholder="Mã kiểm tra, SKU, sản phẩm..." value={search} onChange={e => setSearch(e.target.value)} />
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
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Mã cách ly (Quarantine)</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">SKU</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Sản phẩm</th>
                <th className="text-center px-3 py-2.5 text-gray-700 font-semibold">Số lượng</th>
                <th className="text-left px-3 py-2.5 text-gray-700 font-semibold">Ngày tạo phiếu</th>
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
                  <td className="px-3 py-2.5 font-semibold" style={{ color: PRIMARY }}>{d.quarantineCode}</td>
                  <td className="px-3 py-2.5 font-mono text-gray-500">{d.sku}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-800">{d.product}</td>
                  <td className="px-3 py-2.5 text-center font-semibold">{d.quantity}</td>
                  <td className="px-3 py-2.5 text-gray-500">{d.inspectionDate}</td>
                  <td className="px-3 py-2.5 text-center"><Badge status={d.status} /></td>
                  <td className="px-3 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" onClick={() => setDetail(d)}><Eye className="w-3.5 h-3.5" /></button>
                      {d.status === 'waiting' && (
                        <>
                          <button className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-600" onClick={() => approve(d.id)} title="Duyệt đạt (Về kho tồn)"><CheckCircle className="w-3.5 h-3.5" /></button>
                          <button className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600" onClick={() => reject(d.id)} title="Lỗi (Báo NCC)"><XCircle className="w-3.5 h-3.5" /></button>
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
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Chi tiết kiểm tra — {detail?.id}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Thông tin kiểm tra</p>
                  <div className="flex justify-between"><span className="text-gray-500">Mã kiểm tra:</span><span className="font-semibold" style={{ color: PRIMARY }}>{detail.quarantineCode}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">SKU:</span><span className="font-mono">{detail.sku}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Sản phẩm:</span><span className="font-medium text-gray-800">{detail.product}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Số lượng:</span><span className="font-semibold">{detail.quantity}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Ngày kiểm:</span><span>{detail.inspectionDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Trạng thái:</span><Badge status={detail.status} /></div>
                </div>
                <div className="bg-gray-50 rounded p-3 space-y-1.5">
                  <p className="font-semibold text-gray-500 text-[10px] uppercase tracking-wide mb-2">Kết quả kiểm tra</p>
                  {detail.notes && <div className="space-y-1"><span className="text-gray-500">Ghi chú:</span><p className="text-gray-700 mt-0.5">{detail.notes}</p></div>}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {detail.status === 'waiting' && (
                  <>
                    <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: SUCCESS }} onClick={() => approve(detail.id)}><CheckCircle className="w-3.5 h-3.5" /> Đạt (Chuyển sang Tồn kho)</Button>
                    <Button size="sm" className="h-7 text-xs gap-1.5" style={{ backgroundColor: ERROR }} onClick={() => reject(detail.id)}><XCircle className="w-3.5 h-3.5" /> Lỗi (Trả NCC)</Button>
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
