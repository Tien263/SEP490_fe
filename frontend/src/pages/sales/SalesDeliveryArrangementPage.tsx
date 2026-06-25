import { CheckCircle, MapPin, Package, Truck, User, Weight, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type DeliveryOrder = {
  id: string;
  customer: string;
  address: string;
  weight: string;
  amount: string;
  priority: 'urgent' | 'normal';
  payment: 'COD' | 'SePay';
};

type Vehicle = {
  id: string;
  plate: string;
  driver: string;
  capacity: number;
  currentLoad: number;
  orders: DeliveryOrder[];
};

const SHIFTS = ['Ca sáng (7:00 - 12:00)', 'Ca trưa (12:00 - 17:00)', 'Ca chiều (17:00 - 21:00)'];

const AVAILABLE_ORDERS: DeliveryOrder[] = [
  {
    id: 'DH-2406-082',
    customer: 'Hong Phuc Fashion',
    address: '67 Nguyen Trai, Quan 5, TP.HCM',
    weight: '18.7kg',
    amount: '14.200.000 VND',
    priority: 'urgent',
    payment: 'COD',
  },
  {
    id: 'DH-2406-081',
    customer: 'Dai ly Vai Minh Khai',
    address: '12 Ly Thuong Kiet, Hai Ba Trung, Ha Noi',
    weight: '6.8kg',
    amount: '8.900.000 VND',
    priority: 'normal',
    payment: 'SePay',
  },
  {
    id: 'DH-2406-079',
    customer: 'Cua hang Quan Ao Dai Viet',
    address: '34 Dinh Tien Hoang, Quan 1',
    weight: '11.2kg',
    amount: '5.200.000 VND',
    priority: 'normal',
    payment: 'COD',
  },
  {
    id: 'DH-2406-076',
    customer: 'Xuong May Tan Binh',
    address: '78 Truong Chinh, Tan Binh',
    weight: '24.1kg',
    amount: '19.800.000 VND',
    priority: 'urgent',
    payment: 'SePay',
  },
];

const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'v1', plate: '51F-123.45', driver: 'Nguyen Van Duc', capacity: 500, currentLoad: 0, orders: [] },
  { id: 'v2', plate: '51G-456.78', driver: 'Tran Quang Hai', capacity: 500, currentLoad: 0, orders: [] },
  { id: 'v3', plate: '30A-789.01', driver: 'Le Minh Tuan', capacity: 800, currentLoad: 0, orders: [] },
  { id: 'v4', plate: '51H-234.56', driver: 'Pham Van Long', capacity: 300, currentLoad: 0, orders: [] },
];

function parseWeight(value: string) {
  return Number.parseFloat(value.replace('kg', ''));
}

export default function SalesDeliveryArrangementPage() {
  const navigate = useNavigate();
  const [activeShift, setActiveShift] = useState(0);
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [available, setAvailable] = useState(AVAILABLE_ORDERS);
  const [dragging, setDragging] = useState<DeliveryOrder | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const assignedCount = useMemo(
    () => vehicles.reduce((sum, vehicle) => sum + vehicle.orders.length, 0),
    [vehicles]
  );

  const handleDropOnVehicle = (vehicleId: string) => {
    if (!dragging) return;

    const orderWeight = parseWeight(dragging.weight);
    let assigned = false;

    setVehicles((prev) =>
      prev.map((vehicle) => {
        if (vehicle.id !== vehicleId) return vehicle;
        if (vehicle.currentLoad + orderWeight > vehicle.capacity) return vehicle;

        assigned = true;
        return {
          ...vehicle,
          orders: [...vehicle.orders, dragging],
          currentLoad: vehicle.currentLoad + orderWeight,
        };
      })
    );

    if (assigned) {
      setAvailable((prev) => prev.filter((order) => order.id !== dragging.id));
    }

    setDragging(null);
    setDragOver(null);
  };

  const removeFromVehicle = (vehicleId: string, orderId: string) => {
    const sourceVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);
    const order = sourceVehicle?.orders.find((entry) => entry.id === orderId);
    if (!order) return;

    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id !== vehicleId
          ? vehicle
          : {
              ...vehicle,
              orders: vehicle.orders.filter((entry) => entry.id !== orderId),
              currentLoad: vehicle.currentLoad - parseWeight(order.weight),
            }
      )
    );
    setAvailable((prev) => [...prev, order]);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Sắp xếp vận chuyển</h2>
            <p className="mt-0.5 text-xs text-gray-500">Kéo thả đơn hàng vào xe để phân công giao theo ca.</p>
          </div>
          <button
            onClick={() => navigate('/sales/delivery/collection')}
            disabled={assignedCount === 0}
            className="flex h-8 items-center gap-1.5 rounded bg-[#1F3B64] px-3 text-xs text-white transition-colors hover:bg-[#162D4E] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Xác nhận phân xe ({assignedCount})
          </button>
        </div>

        <div className="mt-3 flex gap-0 overflow-auto">
          {SHIFTS.map((shift, index) => (
            <button
              key={shift}
              onClick={() => setActiveShift(index)}
              className={`border-b-2 px-4 py-1.5 text-xs transition-colors ${
                activeShift === index
                  ? 'border-[#2563EB] font-semibold text-[#2563EB]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {shift}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-72 flex-shrink-0 flex-col border-r border-gray-200 bg-gray-50">
          <div className="border-b border-gray-200 bg-white px-4 py-3">
            <h3 className="text-xs font-semibold text-gray-700">Đơn cho phân xe</h3>
            <p className="mt-0.5 text-[10px] text-gray-400">{available.length} đơn cần phân công</p>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {available.map((order) => (
              <div
                key={order.id}
                draggable
                onDragStart={() => setDragging(order)}
                onDragEnd={() => {
                  setDragging(null);
                  setDragOver(null);
                }}
                className={`cursor-grab rounded-lg border bg-white p-3 transition-all active:cursor-grabbing ${
                  order.priority === 'urgent' ? 'border-red-200' : 'border-gray-200'
                } ${dragging?.id === order.id ? 'scale-95 opacity-50' : 'hover:border-blue-200 hover:shadow-sm'}`}
              >
                <div className="mb-1.5 flex items-start justify-between">
                  <span className="text-xs font-semibold text-[#1F3B64]">{order.id}</span>
                  {order.priority === 'urgent' && (
                    <span className="rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-medium text-red-600">
                      UU TIEN
                    </span>
                  )}
                </div>
                <p className="truncate text-xs font-medium text-gray-800">{order.customer}</p>
                <div className="mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <p className="truncate text-[10px] text-gray-500">{order.address}</p>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                    <Weight className="h-3 w-3" />
                    {order.weight}
                  </span>
                  <span
                    className={`inline-flex w-[52px] items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${
                      order.payment === 'COD' ? 'bg-[#F97316]' : 'bg-[#2563EB]'
                    }`}
                  >
                    {order.payment}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-800">{order.amount}</span>
                </div>
              </div>
            ))}

            {available.length === 0 && (
              <div className="py-8 text-center text-gray-400">
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-400" />
                <p className="text-xs">Đã phân hết đơn hàng</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
            {vehicles.map((vehicle) => {
              const loadPercent = (vehicle.currentLoad / vehicle.capacity) * 100;
              const isDragOver = dragOver === vehicle.id;

              return (
                <div
                  key={vehicle.id}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOver(vehicle.id);
                  }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={() => handleDropOnVehicle(vehicle.id)}
                  className={`rounded-lg border-2 bg-white transition-all ${
                    isDragOver ? 'border-blue-400 bg-blue-50/50 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="border-b border-gray-100 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#1E3A5F]">
                          <Truck className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{vehicle.plate}</p>
                          <p className="flex items-center gap-0.5 text-[10px] text-gray-500">
                            <User className="h-3 w-3" />
                            {vehicle.driver}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500">Tải trọng</p>
                        <p className={`text-xs font-bold ${loadPercent > 80 ? 'text-red-600' : 'text-gray-800'}`}>
                          {vehicle.currentLoad.toFixed(1)}/{vehicle.capacity}kg
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${
                          loadPercent > 80 ? 'bg-red-500' : loadPercent > 50 ? 'bg-yellow-400' : 'bg-green-400'
                        }`}
                        style={{ width: `${Math.min(loadPercent, 100)}%` }}
                      />
                    </div>
                    <div className="mt-0.5 flex justify-between">
                      <span className="text-[9px] text-gray-400">{vehicle.orders.length} đơn</span>
                      <span className="text-[9px] text-gray-400">{loadPercent.toFixed(0)}% tải</span>
                    </div>
                  </div>

                  <div className="min-h-[110px] space-y-1.5 p-2">
                    {isDragOver && dragging && (
                      <div className="rounded border-2 border-dashed border-blue-300 bg-blue-50/80 p-2 text-center text-xs text-blue-500">
                        Thả vào đây
                      </div>
                    )}

                    {vehicle.orders.map((order) => (
                      <div
                        key={order.id}
                        className={`flex items-center gap-2 rounded border p-2 text-xs ${
                          order.priority === 'urgent' ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-[#1F3B64]">{order.id}</span>
                          <span className="ml-1.5 truncate text-gray-600">{order.customer}</span>
                        </div>
                        <span
                          className={`inline-flex w-[52px] items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${
                            order.payment === 'COD' ? 'bg-[#F97316]' : 'bg-[#2563EB]'
                          }`}
                        >
                          {order.payment}
                        </span>
                        <button
                          onClick={() => removeFromVehicle(vehicle.id, order.id)}
                          className="flex-shrink-0 text-gray-300 transition-colors hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {vehicle.orders.length === 0 && !isDragOver && (
                      <div className="flex h-20 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 text-gray-300">
                        <Package className="mb-1 h-5 w-5" />
                        <p className="text-[10px]">Kéo đơn vào đây</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
