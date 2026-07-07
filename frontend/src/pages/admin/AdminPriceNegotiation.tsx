import { useEffect, useState } from 'react';
import { getQuotations, adminApproveQuotation, adminRejectQuotation } from '../../services/quotationService.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';

export default function AdminPriceNegotiation() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await getQuotations();
      setRows(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await adminApproveQuotation(id);
      alert('Đã duyệt báo giá thành công!');
      fetchQuotations();
    } catch (error: any) {
      alert(error.message || 'Lỗi khi duyệt');
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectId(id);
  };

  const executeReject = async () => {
    if (!rejectId) return;
    const id = rejectId;
    setRejectId(null);
    try {
      await adminRejectQuotation(id);
      alert('Đã từ chối báo giá!');
      fetchQuotations();
    } catch (error: any) {
      alert(error.message || 'Lỗi khi từ chối');
    }
  };

  return (
    <div className="flex flex-col gap-[20px] p-[24px]">
      <h1 className="font-semibold text-[20px] text-[#1f3b64]">Báo giá đàm phán — Chờ duyệt</h1>
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f5f7fa] border-b border-[#e5e7eb]">
              {['Mã đơn', 'Khách hàng', 'NV Bán hàng', 'Giá niêm yết', 'Đề xuất mới', 'Thao tác'].map((h) => (
                <th key={h} className="text-left px-[16px] py-[12px] text-[11px] font-medium text-[#64748b] uppercase whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-sm text-gray-500">Đang tải dữ liệu...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-sm text-gray-500">Không có báo giá nào chờ duyệt</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-[#f5f7fa] hover:bg-[#f5f7fa] transition-colors">
                  <td className="px-[16px] py-[12px] text-[12px] font-medium text-[#1f3b64]">{row.id}</td>
                  <td className="px-[16px] py-[12px] text-[12px] text-[#1f3b64]">{row.customerName}</td>
                  <td className="px-[16px] py-[12px] text-[12px] text-[#64748b]">{row.salesStaffName || 'Chưa có'}</td>
                  <td className="px-[16px] py-[12px] text-[12px] font-medium text-[#1f3b64] text-right">
                    {row.originalTotal?.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-[16px] py-[12px] text-[12px] font-medium text-[#f97316] text-right">
                    {row.salesProposedTotal?.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-[16px] py-[12px] text-center whitespace-nowrap">
                    <button 
                      onClick={() => handleApprove(row.id)}
                      className="bg-[#16a34a] text-white px-[12px] py-[4px] rounded-[4px] text-[11px] font-medium hover:bg-[#15803d] transition-colors mr-[8px]"
                    >
                      Duyệt
                    </button>
                    <button 
                      onClick={() => handleRejectClick(row.id)}
                      className="bg-white border border-[#dc2626] text-[#dc2626] px-[12px] py-[4px] rounded-[4px] text-[11px] font-medium hover:bg-[#dc2626] hover:text-white transition-colors"
                    >
                      Từ chối
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!rejectId}
        title="Xác nhận từ chối"
        message="Bạn có chắc chắn muốn từ chối báo giá này?"
        onConfirm={executeReject}
        onCancel={() => setRejectId(null)}
      />
    </div>
  );
}
