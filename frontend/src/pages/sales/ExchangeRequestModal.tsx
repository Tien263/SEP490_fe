import React, { useState } from 'react';
import { X, Search, Plus, Trash2, Upload, Loader2 } from 'lucide-react';
import { getProducts } from '../../services/productService';

interface ExchangeRequestModalProps {
  order: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

async function uploadEvidenceFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/orders/upload-evidence', {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Upload thất bại');
  }
  const data = await res.json();
  return data.url;
}

export default function ExchangeRequestModal({ order, onClose, onSubmit }: ExchangeRequestModalProps) {
  const sourceItems = order.items || order.orderItems || [];
  const [returnItems, setReturnItems] = useState(
    sourceItems.map((item: any) => ({ ...item, returnQty: 0 }))
  );
  
  const [exchangeItems, setExchangeItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [reason, setReason] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleSearchProduct = async () => {
    if (!searchQuery.trim()) return;
    try {
      const data = await getProducts({ page: 1, pageSize: 20, search: searchQuery });
      setSearchResults(data.items || (data as any).data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadEvidenceFile(file));
      const urls = await Promise.all(uploadPromises);
      setEvidenceUrls(prev => [...prev, ...urls]);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddExchangeItem = (product: any) => {
    if (exchangeItems.find((i) => i.productId === product.id)) return;
    setExchangeItems([...exchangeItems, { ...product, productId: product.id, exchangeQty: 1 }]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRemoveExchangeItem = (productId: string) => {
    setExchangeItems(exchangeItems.filter((i) => i.productId !== productId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do.');
      return;
    }

    const selectedReturns = returnItems.filter((i: any) => i.returnQty > 0);
    if (selectedReturns.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm để trả/đổi.');
      return;
    }

    const payload = {
      reason,
      evidenceUrls: JSON.stringify(evidenceUrls),
      returnItems: selectedReturns.map((i: any) => ({
        productId: i.productId,
        quantity: Number(i.returnQty)
      })),
      exchangeItems: exchangeItems.map((i: any) => ({
        productId: i.productId,
        quantity: Number(i.exchangeQty)
      }))
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Yêu cầu Đổi/Trả hàng</h2>
            <p className="text-sm text-slate-500">Đơn hàng: {order.orderCode}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-8">
          
          {/* Trả Hàng */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">1. Chọn sản phẩm trả lại</h3>
            <div className="space-y-3">
              {returnItems.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{item.productName || 'Sản phẩm'}</p>
                    <p className="text-sm text-slate-500">Mua: {item.quantity} | Giá: {item.priceSnapshot?.toLocaleString()}đ</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-700">Trả:</label>
                    <input
                      type="number"
                      min={0}
                      max={item.quantity}
                      value={item.returnQty}
                      onChange={(e) => {
                        const newItems = [...returnItems];
                        newItems[idx].returnQty = Math.min(Math.max(0, Number(e.target.value)), item.quantity);
                        setReturnItems(newItems);
                      }}
                      className="w-20 p-2 border border-slate-300 rounded-lg text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Đổi Hàng */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">2. Chọn sản phẩm muốn đổi sang (Bỏ qua nếu chỉ trả hàng)</h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Tìm sản phẩm (tên, mã SKU)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchProduct())}
                className="flex-1 border border-slate-300 rounded-xl px-4 py-2 focus:ring focus:ring-blue-200 focus:border-blue-500"
              />
              <button type="button" onClick={handleSearchProduct} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700">
                <Search className="w-4 h-4" /> Tìm
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-4 mb-4 bg-white max-h-60 overflow-y-auto">
                {searchResults.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-2 hover:bg-slate-50 border-b last:border-0">
                    <div>
                      <p className="font-medium text-slate-800">{p.name}</p>
                      <p className="text-sm text-slate-500">{p.standardListedPrice?.toLocaleString()}đ</p>
                    </div>
                    <button type="button" onClick={() => handleAddExchangeItem(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {exchangeItems.length > 0 && (
              <div className="space-y-3">
                {exchangeItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-blue-200 rounded-xl bg-blue-50/50">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-sm text-slate-500">Giá: {item.standardListedPrice?.toLocaleString()}đ</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">SL:</label>
                        <input
                          type="number"
                          min={1}
                          value={item.exchangeQty}
                          onChange={(e) => {
                            const newItems = [...exchangeItems];
                            newItems[idx].exchangeQty = Math.max(1, Number(e.target.value));
                            setExchangeItems(newItems);
                          }}
                          className="w-20 p-2 border border-slate-300 rounded-lg text-center"
                        />
                      </div>
                      <button type="button" onClick={() => handleRemoveExchangeItem(item.productId)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Lý do & Bằng chứng */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">3. Lý do & Bằng chứng</h3>
            <textarea
              className="w-full border border-slate-300 rounded-xl p-3 focus:ring focus:ring-blue-200 focus:border-blue-500"
              rows={4}
              placeholder="Nhập lý do chi tiết..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Tải ảnh minh chứng (tối đa 5 ảnh)</label>
              <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                uploading ? 'border-blue-300 bg-blue-50 text-blue-500' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600'
              }`}>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Chọn ảnh</span>
                  </>
                )}
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading || evidenceUrls.length >= 5}
                  className="hidden"
                />
              </label>

              {evidenceUrls.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {evidenceUrls.map((url, i) => (
                    <div key={i} className="relative group w-24 h-24 border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-100 shadow-sm">
                      <img src={url} className="object-cover w-full h-full" alt={`Bằng chứng ${i + 1}`} />
                      <button 
                        type="button"
                        onClick={() => setEvidenceUrls(evidenceUrls.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3 sticky bottom-0 z-10">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors">
            Hủy bỏ
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={uploading}
            className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
          >
            Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
}
