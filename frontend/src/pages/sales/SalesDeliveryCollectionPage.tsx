import { AlertCircle, CheckCircle, DollarSign, MapPin, Phone, X } from 'lucide-react';
import { useState } from 'react';

type DeliveryItem = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  total: number;
  paid: number;
  payment: 'COD' | 'SePay';
  status: 'delivering' | 'collected' | 'debt';
};

type ModalState = {
  item: DeliveryItem;
  received: string;
} | null;

const INITIAL_DELIVERIES: DeliveryItem[] = [
  {
    id: 'DH-2406-089',
    customer: 'Cua hang Duc Thinh',
    phone: '0934 567 890',
    address: '23 Tran Phu, Quan 5, TP.HCM',
    total: 6300000,
    paid: 0,
    payment: 'COD',
    status: 'delivering',
  },
  {
    id: 'DH-2406-083',
    customer: 'Cua hang Quan Ao Hung',
    phone: '0978 012 345',
    address: '45 Le Van Sy, Quan 3, TP.HCM',
    total: 2100000,
    paid: 0,
    payment: 'COD',
    status: 'delivering',
  },
  {
    id: 'DH-2406-085',
    customer: 'Dai ly Vai Thang Loi',
    phone: '0956 789 012',
    address: '34 Dinh Tien Hoang, Quan 1',
    total: 8900000,
    paid: 0,
    payment: 'COD',
    status: 'delivering',
  },
  {
    id: 'DH-2406-088',
    customer: 'Hop tac xa Det Ha Dong',
    phone: '0978 901 234',
    address: '56 Quang Trung, Ha Dong',
    total: 27600000,
    paid: 27600000,
    payment: 'SePay',
    status: 'collected',
  },
  {
    id: 'DH-2406-091',
    customer: 'Shop Vai Lan Anh',
    phone: '0987 654 321',
    address: '12 Nguyen Hue, Hoan Kiem',
    total: 4200000,
    paid: 2000000,
    payment: 'COD',
    status: 'debt',
  },
];

function formatMoney(value: number) {
  return value.toLocaleString('vi-VN');
}

export default function SalesDeliveryCollectionPage() {
  const [items, setItems] = useState(INITIAL_DELIVERIES);
  const [modal, setModal] = useState<ModalState>(null);

  const handleOpenCOD = (item: DeliveryItem) => {
    setModal({ item, received: item.total.toString() });
  };

  const handleConfirmCollection = (forceDebt = false) => {
    if (!modal) return;

    const received = Number.parseFloat(modal.received) || 0;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== modal.item.id) return item;
        const remaining = item.total - received;
        return {
          ...item,
          paid: received,
          status: forceDebt || remaining > 0 ? 'debt' : 'collected',
        };
      })
    );

    setModal(null);
  };

  const remaining = modal ? modal.item.total - (Number.parseFloat(modal.received) || 0) : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-5 py-3">
        <h2 className="text-base font-bold text-gray-900">Giao hàng va thu tiền</h2>
        <p className="mt-0.5 text-xs text-gray-500">Cập nhật trang thái giao hàng, thu COD và ghi nhận công nợ ngay tại chỗ.</p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#F97316]" />
            COD: {items.filter((item) => item.payment === 'COD').length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#2563EB]" />
            SePay: {items.filter((item) => item.payment === 'SePay').length}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#16A34A]" />
            Đã thu: {items.filter((item) => item.status === 'collected').length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded border border-gray-200 bg-white p-4"
              style={{
                borderLeftWidth: 3,
                borderLeftColor:
                  item.status === 'debt' ? '#DC2626' : item.status === 'collected' ? '#16A34A' : '#9CA3AF',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1F3B64]">{item.id}</span>
                    {item.payment === 'SePay' ? (
                      <span className="inline-flex w-[92px] items-center justify-center rounded bg-[#16A34A] px-2 py-0.5 text-[10px] font-medium text-white">
                        Đã thanh toán
                      </span>
                    ) : item.status === 'collected' ? (
                      <span className="inline-flex w-[90px] items-center justify-center rounded bg-[#16A34A] px-2 py-0.5 text-[10px] font-medium text-white">
                        Đã thu tiền
                      </span>
                    ) : item.status === 'debt' ? (
                      <span className="inline-flex w-[60px] items-center justify-center rounded bg-[#DC2626] px-2 py-0.5 text-[10px] font-medium text-white">
                        Công nợ
                      </span>
                    ) : (
                      <span className="inline-flex w-[50px] items-center justify-center rounded bg-[#F97316] px-2 py-0.5 text-[10px] font-medium text-white">COD</span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-gray-900">{item.customer}</p>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <Phone className="h-3 w-3" />
                    {item.phone}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {item.address}
                  </div>
                </div>

                <div className="ml-4 text-right">
                  <p className="text-lg font-bold text-gray-900">{formatMoney(item.total)} VND</p>
                  {item.status === 'debt' && (
                    <p className="text-xs font-medium text-red-600">Con no: {formatMoney(item.total - item.paid)} VND</p>
                  )}

                  {item.payment === 'SePay' ? (
                    <div className="mt-2 flex items-center justify-end gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Da thanh toan SePay
                    </div>
                  ) : item.status === 'delivering' ? (
                    <button
                      onClick={() => handleOpenCOD(item)}
                      className="mt-2 flex h-7 items-center gap-1 rounded bg-[#1F3B64] px-3 text-xs text-white transition-colors hover:bg-[#162D4E]"
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                      Thu tiền
                    </button>
                  ) : item.status === 'debt' ? (
                    <button
                      onClick={() => handleOpenCOD(item)}
                      className="mt-2 flex h-7 items-center gap-1 rounded border border-orange-200 px-3 text-xs text-orange-600 transition-colors hover:bg-orange-50"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      Cập nhật
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Thu tiền COD - {modal.item.id}</h3>
                <p className="mt-0.5 text-xs text-gray-500">Cập nhật số tiền thực tế nhận từ khách hàng.</p>
              </div>
              <button onClick={() => setModal(null)} className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="space-y-1.5 rounded-lg bg-gray-50 p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Khách hàng:</span>
                  <span className="text-right font-semibold text-gray-900">{modal.item.customer}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Tổng tiền đơn:</span>
                  <span className="font-bold text-gray-900">{formatMoney(modal.item.total)} VND</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">Số tiền nhận từ khách hàng</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={modal.received}
                    onChange={(event) => setModal({ ...modal, received: event.target.value })}
                    className="h-10 w-full rounded border border-gray-300 pl-9 pr-3 text-sm font-semibold outline-none transition-colors focus:border-[#1F3B64]"
                  />
                </div>
              </div>

              <div
                className={`rounded-lg border p-3 text-sm ${
                  remaining > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                }`}
              >
                <div className="flex justify-between">
                  <span className={remaining > 0 ? 'text-red-700' : 'text-green-700'}>
                    {remaining > 0 ? 'Còn thiếu:' : 'Tiền dư trả lại:'}
                  </span>
                  <span className={`font-bold ${remaining > 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {formatMoney(Math.abs(remaining))} VND
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleConfirmCollection(false)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded bg-[#1F3B64] px-3 py-2 text-sm text-white transition-colors hover:bg-[#162D4E]"
                >
                  <CheckCircle className="h-4 w-4" />
                  Xác nhận đã thu
                </button>
                {remaining > 0 && (
                  <button
                    onClick={() => handleConfirmCollection(true)}
                    className="flex flex-1 items-center justify-center rounded border border-orange-200 px-3 py-2 text-sm text-orange-600 transition-colors hover:bg-orange-50"
                  >
                    Ghi nhận công nợ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
