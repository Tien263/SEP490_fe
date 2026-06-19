import { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/sales-ui/button';
import { Input } from '../../components/sales-ui/input';
import {
  Send, Paperclip, Image, FileText, CheckCheck, Check,
  DollarSign, AlertCircle, Plus, Eye, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useChat } from '../../hooks/useChat.js';
import { getQuotations, pickUpQuotation, updateProposedPrice } from '../../services/quotationService.js';

const STATUS_CONFIG: Record<string, { label: string; bg: string }> = {
  Pending:      { label: 'Chờ xử lý',       bg: '#64748B' },
  SalesResponded:  { label: 'Đã báo giá',         bg: '#2563EB' },
  Negotiating:  { label: 'Đàm phán',         bg: '#2563EB' },
  WaitingForAdminApproval: { label: 'Chờ Admin duyệt',  bg: '#F97316' },
  Accepted:     { label: 'Đã chấp nhận',     bg: '#16A34A' },
  Rejected:     { label: 'Từ chối',           bg: '#DC2626' },
};

export default function SalesNegotiationPage() {
  const { user } = useAuth();
  const [quotationsList, setQuotationsList] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [input, setInput] = useState('');
  const [proposePrice, setProposePrice] = useState(false);
  const [newPrices, setNewPrices] = useState<Record<string, string>>({});
  const endRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isConnecting } = useChat(active?.id || null);

  const loadData = () => {
    getQuotations().then(data => {
      const all = [...(data.myQuotations || []), ...(data.pendingQuotations || [])];
      setQuotationsList(all);
      if (!active && all.length > 0) setActive(all[0]);
    }).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMsg = () => {
    if (!input.trim() || isConnecting) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handlePickUp = async () => {
    if (!active) return;
    try {
      await pickUpQuotation(active.id);
      loadData();
      alert('Đã nhận xử lý báo giá thành công!');
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleProposePriceSubmit = async () => {
    if (!active) return;
    try {
      const itemsPayload = active.items.map((it: any) => ({
        quotationItemId: it.id,
        proposedUnitPrice: newPrices[it.id] ? Number(newPrices[it.id]) : (it.salesProposedUnitPrice || it.originalUnitPrice)
      }));
      
      const newTotal = itemsPayload.reduce((sum: number, it: any) => sum + (it.proposedUnitPrice * active.items.find((x:any) => x.id === it.quotationItemId).quantity), 0);

      await updateProposedPrice(active.id, {
        proposedTotal: newTotal,
        salesResponse: 'Sales đã cập nhật giá đề xuất',
        items: itemsPayload
      });
      setProposePrice(false);
      loadData();
      alert('Đã cập nhật giá đề xuất. Đang chờ khách hàng phản hồi.');
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra');
    }
  };

  const totalCurrentValue = active?.salesProposedTotal || active?.originalTotal || 0;
  const totalListValue = active?.originalTotal || 0;
  const profit = totalListValue - totalCurrentValue; // mock profit representation

  return (
    <div className="flex h-full overflow-hidden">
      {/* Col 1: Quote List */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-3 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-900">Báo giá & Đàm phán</h3>
            <Button size="sm" className="h-6 w-6 p-0" style={{ backgroundColor: '#1F3B64' }}><Plus className="w-3 h-3" /></Button>
          </div>
          <Input className="h-7 text-xs bg-gray-50" placeholder="Tìm kiếm..." />
        </div>
        <div className="flex-1 overflow-y-auto">
          {quotationsList.map(q => (
            <button
              key={q.id}
              onClick={() => setActive(q)}
              className={`w-full text-left px-3 py-2.5 border-b border-[#F3F4F6] transition-colors ${active?.id === q.id ? 'bg-[#EEF2F8]' : 'hover:bg-gray-50'}`}
              style={active?.id === q.id ? { borderLeft: '3px solid #1F3B64' } : { borderLeft: '3px solid transparent' }}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-900 truncate">{q.customerName}</p>
                  <p className="text-[10px] text-gray-500 truncate">{q.id}</p>
                  <p className="text-[10px] font-semibold text-[#374151] mt-0.5 tabular-nums">{(q.originalTotal / 1e6).toFixed(1)}tr ₫</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[9px] text-gray-400">{new Date(q.requestDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              <span
                className="inline-block mt-1 px-1.5 text-[10px] font-medium text-white"
                style={{ backgroundColor: STATUS_CONFIG[q.status]?.bg || '#ccc', borderRadius: 3, lineHeight: '18px', height: 18 }}
              >
                {STATUS_CONFIG[q.status]?.label || q.status}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Col 2: Quote Detail */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200 bg-gray-50">
        {active ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{active.id}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{active.items?.length || 0} sản phẩm · {active.customerName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {active.status === 'Pending' ? (
                    <Button size="sm" className="h-7 text-xs gap-1" style={{ backgroundColor: '#16A34A' }} onClick={handlePickUp}>
                      <Check className="w-3.5 h-3.5" /> Nhận xử lý
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-[#D1D5DB] text-[#374151] hover:bg-gray-50"
                      onClick={() => setProposePrice(!proposePrice)}>
                      <DollarSign className="w-3.5 h-3.5" /> Đề xuất giá
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Propose Price Banner */}
            {proposePrice && (
              <div className="border-b border-[#E5E7EB] px-4 py-3 bg-white">
                <p className="text-[11px] font-semibold text-[#374151] mb-2">Đề xuất mức giá mới cho các sản phẩm</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="h-7 text-xs" style={{ backgroundColor: '#1F3B64' }} onClick={handleProposePriceSubmit}>Lưu đề xuất</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-[#D1D5DB] text-[#374151]" onClick={() => setProposePrice(false)}>Hủy</Button>
                </div>
              </div>
            )}

            {/* Quote Items */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2 text-gray-500 font-medium">Sản phẩm</th>
                      <th className="text-center px-3 py-2 text-gray-500 font-medium w-16">SL</th>
                      <th className="text-right px-3 py-2 text-gray-500 font-medium w-24">Giá gốc</th>
                      <th className="text-right px-3 py-2 text-gray-500 font-medium w-32">Giá đề xuất</th>
                      <th className="text-right px-3 py-2 text-gray-500 font-medium w-28">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {active.items?.map((item: any) => {
                      const currentPrice = item.salesProposedUnitPrice || item.originalUnitPrice;
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <p className="font-medium text-gray-800 truncate max-w-[180px]">{item.productName}</p>
                          </td>
                          <td className="px-3 py-2 text-center font-semibold text-gray-700">{item.quantity}</td>
                          <td className="px-3 py-2 text-right text-gray-500">{item.originalUnitPrice.toLocaleString('vi-VN')}₫</td>
                          <td className="px-3 py-2 text-right">
                            {proposePrice ? (
                              <Input 
                                className="h-6 text-xs text-right w-full" 
                                placeholder={currentPrice.toString()} 
                                value={newPrices[item.id] || ''} 
                                onChange={e => setNewPrices({...newPrices, [item.id]: e.target.value})} 
                              />
                            ) : (
                              <span className="font-semibold text-green-600">{currentPrice.toLocaleString('vi-VN')}₫</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-gray-900">{(currentPrice * item.quantity).toLocaleString('vi-VN')}₫</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 grid grid-cols-3 gap-3 text-center text-xs">
                <div>
                  <p className="text-gray-500">Tổng giá gốc</p>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">{(totalListValue / 1e6).toFixed(1)}tr</p>
                </div>
                <div className="border-x border-gray-100">
                  <p className="text-gray-500">Tổng đề xuất</p>
                  <p className="font-bold text-[#1F3B64] text-sm mt-0.5 tabular-nums">{(totalCurrentValue / 1e6).toFixed(1)}tr</p>
                </div>
                <div>
                  <p className="text-gray-500">Giảm giá cho khách</p>
                  <p className={`font-bold text-sm mt-0.5 ${profit > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {(profit / 1e6).toFixed(1)}tr
                  </p>
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Chọn một báo giá để xem chi tiết
          </div>
        )}
      </div>

      {/* Col 3: Chat */}
      <div className="w-80 flex-shrink-0 bg-white flex flex-col">
        {active ? (
          <>
            <div className="px-4 py-3 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#1F3B64' }}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">{active.customerName}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-gray-50">
              {messages.map(msg => {
                const isMine = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded px-3 py-2 text-xs ${
                      isMine ? 'text-white' : 'bg-white text-[#374151] border border-[#E5E7EB]'
                    }`} style={isMine ? { backgroundColor: '#1F3B64' } : {}}>
                      {msg.content}
                      <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[9px] ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-3">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                <input
                  className="flex-1 text-xs bg-transparent outline-none text-gray-800 placeholder:text-gray-400 disabled:opacity-50"
                  placeholder="Nhập tin nhắn..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMsg()}
                  disabled={isConnecting}
                />
                <button
                  onClick={sendMsg}
                  disabled={!input.trim() || isConnecting}
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors bg-[#1F3B64] hover:bg-[#162D4E] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Chọn một báo giá để trò chuyện
          </div>
        )}
      </div>
    </div>
  );
}
