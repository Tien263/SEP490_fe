import { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/sales-ui/button';
import { Input } from '../../components/sales-ui/input';
import {
  Send, Paperclip, Image, FileText, CheckCheck, Check,
  DollarSign, AlertCircle, Plus, Eye,
} from 'lucide-react';

interface QuoteRequest {
  id: string; customer: string; company: string; value: number;
  status: 'pending' | 'negotiating' | 'admin_review' | 'accepted' | 'rejected';
  items: number; lastMsg: string; time: string; unread: number;
}

interface Message {
  id: string; sender: 'me' | 'customer' | 'admin'; text: string;
  time: string; seen: boolean; type: 'text' | 'file' | 'quote';
  fileName?: string;
}

interface QuoteItem {
  name: string; sku: string; qty: number; listPrice: number;
  customerPrice: number; currentPrice: number;
}

const QUOTES: QuoteRequest[] = [
  { id: 'BG-2406-019', customer: 'Nguyễn Trọng Phú', company: 'Siêu thị Vinmart+', value: 145000000, status: 'negotiating', items: 6, lastMsg: 'Anh có thể giảm thêm không?', time: '09:41', unread: 2 },
  { id: 'BG-2406-018', customer: 'Trần Thị Hoa', company: 'Chuỗi Bách Hóa Xanh', value: 112000000, status: 'admin_review', items: 4, lastMsg: 'Đã gửi Admin duyệt', time: '08:22', unread: 0 },
  { id: 'BG-2406-017', customer: 'Lê Văn Minh', company: 'Nhà hàng Nam Phúc', value: 238000000, status: 'accepted', items: 9, lastMsg: 'Chấp nhận báo giá', time: 'Hôm qua', unread: 0 },
  { id: 'BG-2406-016', customer: 'Phạm Quang Dũng', company: 'Khách sạn Rex Sài Gòn', value: 167000000, status: 'pending', items: 5, lastMsg: 'Yêu cầu báo giá gửi lúc 7:30', time: '07:30', unread: 1 },
  { id: 'BG-2406-015', customer: 'Hoàng Thị Nga', company: 'Co.opmart Nguyễn Đình Chiểu', value: 104000000, status: 'rejected', items: 3, lastMsg: 'Không đồng ý với mức giá', time: 'Hôm qua', unread: 0 },
];

const QUOTE_ITEMS: QuoteItem[] = [
  { name: 'Giấy vệ sinh Việt Tiến 10 cuộn', sku: 'VT-GV-001', qty: 500, listPrice: 85000, customerPrice: 72000, currentPrice: 80000 },
  { name: 'Khăn giấy ăn 450g', sku: 'VT-KG-012', qty: 200, listPrice: 45000, customerPrice: 38000, currentPrice: 42000 },
  { name: 'Giấy cuộn Jumbo 200m', sku: 'VT-JB-007', qty: 150, listPrice: 120000, customerPrice: 100000, currentPrice: 112000 },
  { name: 'Khăn ướt 80 tờ/hộp', sku: 'VT-KU-021', qty: 80, listPrice: 35000, customerPrice: 29000, currentPrice: 32000 },
  { name: 'Giấy rút hộp 250 tờ', sku: 'VT-GR-009', qty: 60, listPrice: 28000, customerPrice: 23000, currentPrice: 26000 },
  { name: 'Khăn tay mini 100 tờ', sku: 'VT-KT-003', qty: 300, listPrice: 18000, customerPrice: 15000, currentPrice: 17000 },
];

const MESSAGES: Message[] = [
  { id: '1', sender: 'customer', text: 'Chào anh, bên em muốn đặt hàng số lượng lớn giấy vệ sinh và khăn giấy. Xin anh báo giá chi tiết ạ.', time: '08:30', seen: true, type: 'text' },
  { id: '2', sender: 'me', text: 'Chào anh Phú! Em đã nhận yêu cầu. Đây là báo giá chi tiết cho đơn hàng của anh.', time: '08:35', seen: true, type: 'text' },
  { id: '3', sender: 'me', text: 'Báo giá VT-BG-2406-019.pdf', time: '08:35', seen: true, type: 'file', fileName: 'Báo giá VT-BG-2406-019.pdf' },
  { id: '4', sender: 'customer', text: 'Cảm ơn em. Bên anh thấy giá hơi cao. Anh có thể giảm thêm khoảng 5-8% không? Bên anh cam kết đặt hàng đều đặn hàng quý.', time: '09:10', seen: true, type: 'text' },
  { id: '5', sender: 'me', text: 'Dạ anh, em hiểu yêu cầu của anh. Em cần xin phê duyệt từ quản lý cho mức giảm giá này. Anh chờ em khoảng 30 phút nhé.', time: '09:15', seen: true, type: 'text' },
  { id: '6', sender: 'admin', text: '[Admin] Đã duyệt giảm giá 5% cho đơn hàng này. Tổng chiết khấu: 7.250.000₫', time: '09:32', seen: true, type: 'text' },
  { id: '7', sender: 'customer', text: 'Anh có thể giảm thêm không? Bên anh đặt thường xuyên lắm đó.', time: '09:41', seen: false, type: 'text' },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string }> = {
  pending:      { label: 'Chờ xử lý',       bg: '#64748B' },
  negotiating:  { label: 'Đàm phán',         bg: '#2563EB' },
  admin_review: { label: 'Chờ Admin duyệt',  bg: '#F97316' },
  accepted:     { label: 'Đã chấp nhận',     bg: '#16A34A' },
  rejected:     { label: 'Từ chối',           bg: '#DC2626' },
};

export default function SalesNegotiationPage() {
  const [active, setActive] = useState(QUOTES[0]);
  const [messages, setMessages] = useState(MESSAGES);
  const [input, setInput] = useState('');
  const [proposePrice, setProposePrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMsg = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(), sender: 'me', text: input.trim(),
      time: new Date().toTimeString().slice(0, 5), seen: false, type: 'text',
    }]);
    setInput('');
  };

  const totalCurrentValue = QUOTE_ITEMS.reduce((s, i) => s + i.currentPrice * i.qty, 0);
  const totalListValue = QUOTE_ITEMS.reduce((s, i) => s + i.listPrice * i.qty, 0);
  const totalCustomerRequest = QUOTE_ITEMS.reduce((s, i) => s + i.customerPrice * i.qty, 0);
  const profit = totalCurrentValue - totalCustomerRequest;

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
          {QUOTES.map(q => (
            <button
              key={q.id}
              onClick={() => setActive(q)}
              className={`w-full text-left px-3 py-2.5 border-b border-[#F3F4F6] transition-colors ${active.id === q.id ? 'bg-[#EEF2F8]' : 'hover:bg-gray-50'}`}
              style={active.id === q.id ? { borderLeft: '3px solid #1F3B64' } : { borderLeft: '3px solid transparent' }}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-900 truncate">{q.customer}</p>
                  <p className="text-[10px] text-gray-500 truncate">{q.company}</p>
                  <p className="text-[10px] font-semibold text-[#374151] mt-0.5 tabular-nums">{(q.value / 1e6).toFixed(0)}tr ₫</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[9px] text-gray-400">{q.time}</span>
                  {q.unread > 0 && (
                    <span className="w-4 h-4 rounded bg-[#DC2626] text-white text-[9px] flex items-center justify-center font-bold">{q.unread}</span>
                  )}
                </div>
              </div>
              <span
                className="inline-block mt-1 px-1.5 text-[10px] font-medium text-white"
                style={{ backgroundColor: STATUS_CONFIG[q.status]?.bg, borderRadius: 3, lineHeight: '18px', height: 18 }}
              >
                {STATUS_CONFIG[q.status]?.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Col 2: Quote Detail */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200 bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{active.id} — {active.company}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{active.items} sản phẩm · {active.customer}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-[#D1D5DB] text-[#374151] hover:bg-gray-50"
                onClick={() => setProposePrice(!proposePrice)}>
                <DollarSign className="w-3.5 h-3.5" /> Đề xuất giá
              </Button>
              <Button size="sm" className="h-7 text-xs gap-1" style={{ backgroundColor: '#F97316' }}>
                <AlertCircle className="w-3.5 h-3.5" /> Gửi Admin duyệt
              </Button>
            </div>
          </div>
        </div>

        {/* Propose Price Banner */}
        {proposePrice && (
          <div className="border-b border-[#E5E7EB] px-4 py-3 bg-white">
            <p className="text-[11px] font-semibold text-[#374151] mb-2">Đề xuất mức giảm giá mới</p>
            <div className="flex items-center gap-2">
              <Input className="h-7 w-32 text-xs text-right" placeholder="% giảm giá" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
              <Button size="sm" className="h-7 text-xs" style={{ backgroundColor: '#1F3B64' }}>Áp dụng</Button>
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
                  <th className="text-right px-3 py-2 text-gray-500 font-medium w-24">Giá niêm yết</th>
                  <th className="text-right px-3 py-2 text-gray-500 font-medium w-24">Khách đề xuất</th>
                  <th className="text-right px-3 py-2 text-gray-500 font-medium w-24">Giá hiện tại</th>
                  <th className="text-right px-3 py-2 text-gray-500 font-medium w-28">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {QUOTE_ITEMS.map((item, i) => {
                  const disc = ((item.listPrice - item.currentPrice) / item.listPrice * 100).toFixed(1);
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <p className="font-medium text-gray-800 truncate max-w-[180px]">{item.name}</p>
                        <p className="text-[10px] text-gray-400">{item.sku}</p>
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-gray-700">{item.qty}</td>
                      <td className="px-3 py-2 text-right text-gray-500">{item.listPrice.toLocaleString('vi-VN')}₫</td>
                      <td className="px-3 py-2 text-right text-red-500">{item.customerPrice.toLocaleString('vi-VN')}₫</td>
                      <td className="px-3 py-2 text-right">
                        <span className="font-semibold text-gray-900">{item.currentPrice.toLocaleString('vi-VN')}₫</span>
                        <p className="text-[9px] text-green-600">-{disc}%</p>
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-gray-900">{(item.currentPrice * item.qty).toLocaleString('vi-VN')}₫</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 grid grid-cols-3 gap-3 text-center text-xs">
            <div>
              <p className="text-gray-500">Giá niêm yết</p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{(totalListValue / 1e6).toFixed(1)}tr</p>
            </div>
            <div className="border-x border-gray-100">
              <p className="text-gray-500">Giá hiện tại</p>
              <p className="font-bold text-[#1F3B64] text-sm mt-0.5 tabular-nums">{(totalCurrentValue / 1e6).toFixed(1)}tr</p>
            </div>
            <div>
              <p className="text-gray-500">Lợi nhuận dự kiến</p>
              <p className={`font-bold text-sm mt-0.5 ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profit > 0 ? '+' : ''}{(profit / 1e6).toFixed(1)}tr
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <Button size="sm" className="h-7 text-xs gap-1 flex-1 border border-[#D1D5DB] bg-white text-[#374151] hover:bg-gray-50" variant="outline">
              <Eye className="w-3.5 h-3.5" /> Xem báo giá online
            </Button>
          </div>
        </div>
      </div>

      {/* Col 3: Chat */}
      <div className="w-80 flex-shrink-0 bg-white flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#1F3B64' }}>
              {active.customer.split(' ').pop()?.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">{active.customer}</p>
              <p className="text-[10px] text-green-500 flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-gray-50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : msg.sender === 'admin' ? 'justify-center' : 'justify-start'}`}>
              {msg.sender === 'admin' ? (
                <div className="max-w-[90%] border border-[#E5E7EB] rounded px-3 py-2 text-[11px] text-[#374151] bg-[#F9FAFB]">
                  {msg.text}
                </div>
              ) : (
                <div className={`max-w-[80%] rounded px-3 py-2 text-xs ${
                  msg.sender === 'me' ? 'text-white' : 'bg-white text-[#374151] border border-[#E5E7EB]'
                }`} style={msg.sender === 'me' ? { backgroundColor: '#1F3B64' } : {}}>
                  {msg.type === 'file' ? (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 opacity-80 flex-shrink-0" />
                      <span className="underline cursor-pointer">{msg.fileName}</span>
                    </div>
                  ) : msg.text}
                  <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-[9px] ${msg.sender === 'me' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</span>
                    {msg.sender === 'me' && (
                      msg.seen
                        ? <CheckCheck className="w-3 h-3 text-blue-200" />
                        : <Check className="w-3 h-3 text-blue-300" />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded px-3 py-2 shadow-sm">
              <div className="flex gap-0.5 items-center h-4">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
            <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
              <Image className="w-4 h-4" />
            </button>
            <input
              className="flex-1 text-xs bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()}
            />
            <button
              onClick={sendMsg}
              disabled={!input.trim()}
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors bg-[#1F3B64] hover:bg-[#162D4E] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
