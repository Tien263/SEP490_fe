import { CheckCircle, Clock, MessageSquare, Package, RefreshCw, Truck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type WarehouseOrder = {
  id: string;
  customer: string;
  items: number;
  weight: string;
  packer: string;
  started: string;
  completed: string;
  status: 'waiting' | 'packing' | 'done';
  address: string;
};

const INITIAL_ORDERS: WarehouseOrder[] = [
  {
    id: 'DH-2406-092',
    customer: 'Cong ty Thoi Trang Minh Anh',
    items: 2,
    weight: '12.5kg',
    packer: 'Tran Van A',
    started: '09:45',
    completed: '',
    status: 'packing',
    address: '45 Le Loi, Quan 1, TP.HCM',
  },
  {
    id: 'DH-2406-090',
    customer: 'May Mac Tan Phu',
    items: 3,
    weight: '8.2kg',
    packer: 'Nguyen Thi B',
    started: '09:30',
    completed: '',
    status: 'packing',
    address: '78 Hoa Binh, Tan Phu',
  },
  {
    id: 'DH-2406-087',
    customer: 'Cong ty Thoi Trang Ha Noi',
    items: 2,
    weight: '15.0kg',
    packer: '',
    started: '',
    completed: '',
    status: 'waiting',
    address: '90 Kim Ma, Ba Dinh, Ha Noi',
  },
  {
    id: 'DH-2406-085',
    customer: 'Dai ly Vai Thang Loi',
    items: 4,
    weight: '22.3kg',
    packer: '',
    started: '',
    completed: '',
    status: 'waiting',
    address: '34 Dinh Tien Hoang, Quan 1',
  },
  {
    id: 'DH-2406-082',
    customer: 'Hong Phuc Fashion',
    items: 5,
    weight: '18.7kg',
    packer: 'Le Van C',
    started: '08:50',
    completed: '09:25',
    status: 'done',
    address: '67 Nguyen Trai, Quan 5',
  },
];

const STATUS_CONFIG = {
  waiting: {
    label: 'Chờ xác nhận',
    className: 'bg-[#64748B] text-white',
    icon: <Clock className="h-3 w-3" />,
  },
  packing: {
    label: 'Đang đóng gói',
    className: 'bg-[#2563EB] text-white',
    icon: <Package className="h-3 w-3" />,
  },
  done: {
    label: 'Hoàn tất',
    className: 'bg-[#16A34A] text-white',
    icon: <CheckCircle className="h-3 w-3" />,
  },
} as const;

export default function SalesWarehouseCoordPage() {
  const navigate = useNavigate();
  const waitingCount = INITIAL_ORDERS.filter((order) => order.status === 'waiting').length;
  const packingCount = INITIAL_ORDERS.filter((order) => order.status === 'packing').length;
  const doneCount = INITIAL_ORDERS.filter((order) => order.status === 'done').length;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Phối hợp kho</h2>
            <p className="mt-0.5 text-xs text-gray-500">Theo dõi tiến độ đóng gói và sẵn sàng chuyển đơn sang vận chuyển.</p>
          </div>
          <button className="flex h-8 items-center gap-1.5 rounded border border-[#D1D5DB] bg-white px-3 text-xs text-[#374151] transition-colors hover:bg-gray-50">
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 rounded border border-[#E5E7EB] bg-white px-3 py-1">
            <span className="h-2 w-2 rounded-sm bg-[#64748B]" />
            <span className="text-[11px] text-[#6B7280]">
              Chờ xác nhận: <strong className="text-[#374151]">{waitingCount}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded border border-[#E5E7EB] bg-white px-3 py-1">
            <span className="h-2 w-2 rounded-sm bg-[#2563EB]" />
            <span className="text-[11px] text-[#6B7280]">
              Đang đóng gói: <strong className="text-[#374151]">{packingCount}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded border border-[#E5E7EB] bg-white px-3 py-1">
            <span className="h-2 w-2 rounded-sm bg-[#16A34A]" />
            <span className="text-[11px] text-[#6B7280]">
              Hoàn tất: <strong className="text-[#374151]">{doneCount}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Mã đơn</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Khách hàng</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Sản phẩm</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Trọng lượng</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Người đóng gói</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Bắt đầu</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Hoàn thành</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {INITIAL_ORDERS.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-[#1F3B64]">{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{order.customer}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400">{order.address}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-700">{order.items} sp</td>
                  <td className="px-4 py-3 text-center text-gray-600">{order.weight}</td>
                  <td className="px-4 py-3">
                    {order.packer ? (
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-700">{order.packer}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{order.started || '--'}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{order.completed || '--'}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex w-[104px] items-center justify-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_CONFIG[order.status].className}`}
                    >
                      {STATUS_CONFIG[order.status].icon}
                      {STATUS_CONFIG[order.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        title="Nhắn tin kho"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>
                      {order.status === 'done' && (
                        <button
                          onClick={() => navigate('/sales/delivery/arrangement')}
                          className="flex h-6 items-center gap-1 rounded bg-[#1F3B64] px-2 text-[10px] text-white transition-colors hover:bg-[#162D4E]"
                        >
                          <Truck className="h-3 w-3" />
                          sắp xếp vận chuyển
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
