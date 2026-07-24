import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getMaterials } from '../../services/materialService';
import { createGoodsIssue } from '../../services/warehouseService';
import { getWarehouses } from '../../services/warehouseService';

export default function WarehouseProductionIssueFormModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [warehouseId, setWarehouseId] = useState('');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [factory, setFactory] = useState('Xưởng may A');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMaterials().then(res => setMaterials(res || [])).catch(console.error);
    getWarehouses().then(res => {
      const whList = Array.isArray(res) ? res : (res?.items || []);
      setWarehouses(whList);
      if (whList.length > 0 && !warehouseId) {
        setWarehouseId(whList[0].id);
      }
    }).catch(console.error);
  }, []);

  const handleAddItem = () => {
    if (materials.length === 0) return;
    setItems([...items, { id: Date.now().toString(), materialId: materials[0].id, quantity: 1, note: '' }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleItemChange = (id: string, field: string, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSubmit = async () => {
    if (items.length === 0) return alert('Vui lòng thêm ít nhất 1 mặt hàng');
    try {
      setLoading(true);
      const payload = {
        type: 'ProductionMaterial',
        warehouseId,
        note: `Xuất cho: ${factory}`,
        items: items.map(i => ({
          materialId: i.materialId,
          quantity: parseInt(i.quantity, 10),
          note: i.note
        }))
      };
      await createGoodsIssue(payload);
      alert('Tạo phiếu xuất kho sản xuất thành công!');
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200">
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 rounded-t-xl">
          <h2 className="text-lg font-bold text-[#1f3b64]">Tạo Phiếu Xuất Kho Sản Xuất</h2>
          <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 bg-gray-50/50 text-sm">
          <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-0.5">
                Kho xuất <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm" value={warehouseId} onChange={e => setWarehouseId(e.target.value)}>
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-0.5">
                Xưởng/Nhà máy nhận <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm" value={factory} onChange={e => setFactory(e.target.value)} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wide">Danh sách Nguyên Liệu</h3>
              <button className="px-3.5 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors" onClick={handleAddItem}>+ Thêm nguyên liệu</button>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="py-2.5 px-3 font-semibold text-gray-700 w-1/2">Sản phẩm</th>
                  <th className="py-2.5 px-3 font-semibold text-gray-700 w-28">Số lượng</th>
                  <th className="py-2.5 px-3 font-semibold text-gray-700">Ghi chú</th>
                  <th className="py-2.5 px-3 font-semibold text-gray-700 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="py-2 px-3">
                      <select className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-xs" value={item.materialId} onChange={e => handleItemChange(item.id, 'materialId', e.target.value)}>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input type="number" min="1" className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} />
                    </td>
                    <td className="py-2 px-3">
                      <input type="text" className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs" value={item.note} onChange={e => handleItemChange(item.id, 'note', e.target.value)} placeholder="Ghi chú thêm" />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors" onClick={() => handleRemoveItem(item.id)}><X className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-gray-500 font-medium">Chưa có sản phẩm nào. Nhấn "Thêm nguyên liệu".</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-end px-6 gap-3 rounded-b-xl flex-shrink-0">
          <button className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 shadow-sm transition-all" onClick={onClose}>Hủy</button>
          <button className="px-5 py-2 bg-[#1f3b64] text-white rounded-lg text-sm font-semibold hover:bg-[#162a47] disabled:opacity-50 shadow-md transition-all" onClick={handleSubmit} disabled={loading}>{loading ? 'Đang tạo...' : 'Tạo Phiếu Xuất'}</button>
        </div>
      </div>
    </div>
  );
}
