export default function AdminPriceNegotiation() {
  const rows = [
    { id: 'BG-00234', customer: 'Siêu thị Vinmart+', staff: 'Trần Thị B', value: '145.000.000₫', discount: '-12%', reason: 'Đơn hàng lớn, khách VIP' },
    { id: 'BG-00235', customer: 'Chuỗi Bách Hóa Xanh', staff: 'Nguyễn Văn E', value: '280.000.000₫', discount: '-15%', reason: 'Hợp đồng 1 năm, thanh toán trước' },
    { id: 'BG-00236', customer: 'Siêu thị Co.opMart', staff: 'Lê Thị F', value: '120.000.000₫', discount: '-10%', reason: 'Khách hàng tiềm năng mở rộng' },
  ];

  return (
    <div className="flex flex-col gap-[20px] p-[24px]">
      <h1 className="font-semibold text-[20px] text-[#1f3b64]">Báo giá đàm phán — Chờ duyệt</h1>
      <div className="bg-white border border-[#e5e7eb] rounded-[8px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f5f7fa] border-b border-[#e5e7eb]">
              {['Mã đơn', 'Khách hàng', 'NV Bán hàng', 'Giá trị đơn', 'Chiết khấu đề xuất', 'Lý do', 'Thao tác'].map((h) => (
                <th key={h} className="text-left px-[16px] py-[12px] text-[11px] font-medium text-[#64748b] uppercase whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-[#f5f7fa] hover:bg-[#f5f7fa] transition-colors">
                <td className="px-[16px] py-[12px] text-[12px] font-medium text-[#1f3b64]">{row.id}</td>
                <td className="px-[16px] py-[12px] text-[12px] text-[#1f3b64]">{row.customer}</td>
                <td className="px-[16px] py-[12px] text-[12px] text-[#64748b]">{row.staff}</td>
                <td className="px-[16px] py-[12px] text-[12px] font-medium text-[#1f3b64] text-right">{row.value}</td>
                <td className="px-[16px] py-[12px] text-[12px] font-medium text-[#f97316] text-right">{row.discount}</td>
                <td className="px-[16px] py-[12px] text-[12px] text-[#64748b]">{row.reason}</td>
                <td className="px-[16px] py-[12px] text-center whitespace-nowrap">
                  <button className="bg-[#16a34a] text-white px-[12px] py-[4px] rounded-[4px] text-[11px] font-medium hover:bg-[#15803d] transition-colors mr-[8px]">
                    Duyệt
                  </button>
                  <button className="bg-white border border-[#dc2626] text-[#dc2626] px-[12px] py-[4px] rounded-[4px] text-[11px] font-medium hover:bg-[#dc2626] hover:text-white transition-colors">
                    Từ chối
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
