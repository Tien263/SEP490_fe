import { useEffect, useState } from 'react';
import { getQuotations, ceoReview } from '../../services/quotationService.js';
import { Input } from '../../components/sales-ui/input';

export default function CEOPriceNegotiation() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewItem, setReviewItem] = useState<{ id: string, isApprove: boolean } | null>(null);
  const [note, setNote] = useState('');

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await getQuotations();
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleOpenReview = (id: string, isApprove: boolean) => {
    setReviewItem({ id, isApprove });
    setNote('');
  };

  const executeReview = async () => {
    if (!reviewItem) return;
    const { id, isApprove } = reviewItem;
    
    try {
      await ceoReview(id, { isApproved: isApprove, ceoNote: note });
      alert(isApprove ? 'Đã duyệt báo giá thành công!' : 'Đã từ chối báo giá!');
      setReviewItem(null);
      fetchQuotations();
    } catch (error: any) {
      alert(error.message || 'Lỗi khi xử lý');
    }
  };

  return (
    <div className="flex flex-col gap-[20px] p-[24px]">
      <h1 className="font-semibold text-[20px] text-[#1f3b64]">Phê duyệt Báo giá đặc biệt</h1>
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f5f7fa] border-b border-[#e5e7eb]">
              {['Mã đơn', 'Khách hàng', 'NV Bán hàng', 'Version', 'Giá niêm yết', 'Giá đề xuất', 'Thao tác'].map((h) => (
                <th key={h} className="text-left px-[16px] py-[12px] text-[11px] font-medium text-[#64748b] uppercase whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-sm text-gray-500">Đang tải dữ liệu...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-sm text-gray-500">Không có báo giá nào chờ duyệt</td>
              </tr>
            ) : (
              rows.map((row) => {
                const pendingVersion = row.versions?.[0]; // Lấy version mới nhất
                if (!pendingVersion) return null;

                return (
                  <tr key={row.id} className="border-b border-[#f5f7fa] hover:bg-[#f5f7fa] transition-colors">
                    <td className="px-[16px] py-[12px] text-[12px] font-medium text-[#1f3b64]">{row.id}</td>
                    <td className="px-[16px] py-[12px] text-[12px] text-[#1f3b64]">{row.customerName}</td>
                    <td className="px-[16px] py-[12px] text-[12px] text-[#64748b]">{row.salesStaffName || 'Chưa có'}</td>
                    <td className="px-[16px] py-[12px] text-[12px] text-[#1f3b64] text-center">v{pendingVersion.versionNumber}</td>
                    <td className="px-[16px] py-[12px] text-[12px] font-medium text-[#1f3b64] text-right">
                      {row.originalTotal?.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-[16px] py-[12px] text-[12px] font-medium text-[#f97316] text-right">
                      {pendingVersion.proposedTotal?.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-[16px] py-[12px] text-center whitespace-nowrap">
                      <button 
                        onClick={() => handleOpenReview(row.id, true)}
                        className="bg-[#16a34a] text-white px-[12px] py-[4px] rounded-[4px] text-[11px] font-medium hover:bg-[#15803d] transition-colors mr-[8px]"
                      >
                        Duyệt
                      </button>
                      <button 
                        onClick={() => handleOpenReview(row.id, false)}
                        className="bg-white border border-[#dc2626] text-[#dc2626] px-[12px] py-[4px] rounded-[4px] text-[11px] font-medium hover:bg-[#dc2626] hover:text-white transition-colors"
                      >
                        Từ chối
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {reviewItem && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setReviewItem(null)} />
          <div className="bg-white rounded-2xl p-6 shadow-xl relative z-10 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {reviewItem.isApprove ? 'Xác nhận duyệt báo giá' : 'Từ chối báo giá'}
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Vui lòng nhập ghi chú của bạn cho hành động này:
            </p>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú..."
              className="mb-4"
            />
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setReviewItem(null)}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={executeReview}
                className={`px-5 py-2.5 rounded-full text-sm font-medium text-white transition-colors ${
                  reviewItem.isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {reviewItem.isApprove ? 'Xác nhận Duyệt' : 'Xác nhận Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
