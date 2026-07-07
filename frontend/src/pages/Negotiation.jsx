import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  MessageSquare,
  Check,
  X,
  AlertCircle,
  TrendingDown,
  Calendar,
  User,
} from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { formatPrice } from "../services/productService.js";
import ChatInterface from "../components/ChatInterface.jsx";
import { getQuotationById, acceptQuotation, rejectQuotation } from "../services/quotationService.js";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";

const mockQuotation = {
  id: "QT-2026-001",
  requestDate: "2026-06-01",
  originalTotal: 115000000,
  salesProposedTotal: 103500000,
  finalTotal: undefined,
  status: "sales_responded",
  salesStaffName: "Trần Minh Tuấn",
  salesStaffEmail: "tuan.tran@viettien.com",
  validUntil: "2026-06-15",
  products: [
    {
      productId: "1",
      productName: "Băng Keo Trong Cao Cấp",
      quantity: 2000,
      originalPrice: 45000,
      salesProposedPrice: 40000,
      finalPrice: 40000,
    },
    {
      productId: "2",
      productName: "Dập Ghim Chuyên Nghiệp",
      quantity: 100,
      originalPrice: 125000,
      salesProposedPrice: 115000,
      finalPrice: 115000,
    },
  ],
  generalNote: "Yêu cầu báo giá cho đơn hàng lớn",
  salesResponse: "Chúng tôi đã xem xét đơn hàng của bạn và đề xuất mức giá đặc biệt cho khách hàng lớn. Đây là mức giá ưu đãi tốt nhất cho số lượng này.",
};

export default function Negotiation() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [quotation, setQuotation] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const isDemoMode = id === "demo";

  useEffect(() => {
    if (id) {
      if (isDemoMode) {
        setQuotation(mockQuotation);
        setIsLoading(false);
        setShowChat(searchParams.get("chat") === "1");
        return;
      }

      getQuotationById(id)
        .then(data => {
          setQuotation(data);
          setIsLoading(false);
          const status = (data.status || "").toLowerCase().replace(/_/g, "");
          if (searchParams.get("chat") === "1" || status === "negotiating") {
            setShowChat(true);
          } else {
            setShowChat(false);
          }
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [id, isDemoMode, searchParams]);

  const updateQuotation = (updates) => {
    setQuotation((prev) => ({ ...prev, ...updates }));
  };

  const handleAccept = async () => {
    if (!quotation) return;
    if (isDemoMode) {
      updateQuotation({
        status: "WaitingForAdminApproval",
        finalTotal: quotation.salesProposedTotal || quotation.originalTotal,
      });
      alert("Demo: đã chấp nhận bảng giá và chuyển sang trạng thái chờ Admin duyệt.");
      return;
    }
    try {
      await acceptQuotation(quotation.id);
      updateQuotation({
        status: "WaitingForAdminApproval",
        finalTotal: quotation.salesProposedTotal || quotation.originalTotal,
      });
      alert("Bảng giá đã được chấp nhận. Đang chờ Admin duyệt.");
    } catch (error) {
      alert("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleRejectClick = () => {
    if (!quotation) return;
    setShowRejectConfirm(true);
  };

  const executeReject = async () => {
    setShowRejectConfirm(false);
    if (!quotation) return;
    if (isDemoMode) {
      updateQuotation({ status: "Rejected" });
      alert("Demo: đã từ chối báo giá.");
      return;
    }
    try {
      await rejectQuotation(quotation.id);
      updateQuotation({ status: "Rejected" });
      alert("Đã từ chối đàm phán.");
    } catch (error) {
      alert("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleNegotiate = () => {
    if (!quotation) return;
    updateQuotation({ status: "negotiating" });
    setSearchParams({ chat: "1" });
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSearchParams({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-20 min-h-[60vh] flex items-center justify-center">
          <p>Đang tải dữ liệu...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-20 min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Không tìm thấy yêu cầu báo giá
            </h2>
            <Link to="/profile?tab=quotations">
              <Button className="bg-gray-900 hover:bg-gray-800 rounded-full text-white">
                Quay lại
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const normalizedStatus = (quotation.status || "").toLowerCase().replace(/_/g, "");

  const statusBadge = {
    pending: "bg-yellow-100 text-yellow-700",
    salesresponded: "bg-blue-100 text-blue-700",
    negotiating: "bg-purple-100 text-purple-700",
    waitingforadminapproval: "bg-orange-100 text-orange-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const statusLabel = {
    pending: "Đang chờ Sales phản hồi",
    salesresponded: "Sales đã gửi bảng giá",
    negotiating: "Đang trao đổi",
    waitingforadminapproval: "Chờ Admin duyệt",
    accepted: "Đã chấp nhận",
    rejected: "Đã hủy",
  };

  const totalSavings = quotation.salesProposedTotal
    ? quotation.originalTotal - quotation.salesProposedTotal
    : 0;

  const savingsPercent = quotation.salesProposedTotal
    ? ((totalSavings / quotation.originalTotal) * 100).toFixed(1)
    : 0;

  if (showChat) {
    return (
      <ChatInterface
        quotation={quotation}
        onClose={handleCloseChat}
        onAccept={handleAccept}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20">
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Trang Chủ
              </Link>
              <span className="text-gray-400">/</span>
              <Link
                to="/profile?tab=quotations"
                className="text-gray-600 hover:text-gray-900"
              >
                Báo giá đặc biệt
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{quotation.id}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <Link
              to="/profile?tab=quotations"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách báo giá
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Yêu cầu báo giá {quotation.id}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Ngày gửi: {quotation.requestDate}</span>
                  </div>
                  {quotation.salesStaffName && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>Sales: {quotation.salesStaffName}</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge
                className={`${statusBadge[normalizedStatus] || "bg-gray-100 text-gray-700"} hover:opacity-90`}
              >
                {statusLabel[normalizedStatus] || quotation.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <p className="text-sm text-gray-500 mb-2">Tổng giá ban đầu</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(quotation.originalTotal)}
              </p>
            </motion.div>

            {quotation.salesProposedTotal && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl border border-gray-100 p-6"
                >
                  <p className="text-sm text-gray-500 mb-2">Tổng giá mới (Sales)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(quotation.salesProposedTotal)}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6"
                >
                  <p className="text-sm text-green-700 mb-2 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    Số tiền tiết kiệm
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatPrice(totalSavings)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Giảm {savingsPercent}%
                  </p>
                </motion.div>
              </>
            )}
          </div>

          {quotation.salesResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 rounded-2xl border border-blue-200 p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Phản hồi từ Sales
              </h3>
              <p className="text-gray-700">{quotation.salesResponse}</p>
              {quotation.validUntil && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Hiệu lực đến:</strong> {quotation.validUntil}
                </p>
              )}
            </motion.div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Chi tiết sản phẩm
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {[
                      "Sản phẩm",
                      "Số lượng",
                      "Giá gốc (đơn vị)",
                      quotation.salesProposedTotal && "Giá mới (đơn vị)",
                      quotation.salesProposedTotal && "Tiết kiệm/sp",
                      "Tổng tiền",
                    ]
                      .filter(Boolean)
                      .map((header) => (
                        <th
                          key={header}
                          className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-4"
                        >
                          {header}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(quotation.items || quotation.products || []).map((product, index) => {
                    const originalPrice = product.originalUnitPrice ?? product.originalPrice;
                    const salesProposedPrice = product.salesProposedUnitPrice ?? product.salesProposedPrice;
                    const finalPrice = salesProposedPrice || originalPrice;
                    const totalPrice = finalPrice * product.quantity;
                    const savingsPerUnit = salesProposedPrice
                      ? originalPrice - salesProposedPrice
                      : 0;
                    const totalSavings = savingsPerUnit * product.quantity;

                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {product.productName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Mã: {String(product.productId).padStart(6, "0")}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {product.quantity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <p className={`text-sm font-medium ${salesProposedPrice ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {formatPrice(originalPrice)}
                          </p>
                        </td>
                        {quotation.salesProposedTotal && (
                          <>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-green-600">
                                {salesProposedPrice
                                  ? formatPrice(salesProposedPrice)
                                  : formatPrice(originalPrice)}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              {savingsPerUnit > 0 && (
                                <p className="text-sm font-semibold text-green-600">
                                  - {formatPrice(savingsPerUnit)}
                                </p>
                              )}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {formatPrice(totalPrice)}
                            </p>
                            {totalSavings > 0 && (
                              <p className="text-xs text-green-600">
                                Tiết kiệm {formatPrice(totalSavings)}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {quotation.generalNote && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Ghi chú của bạn
              </h3>
              <p className="text-gray-700">{quotation.generalNote}</p>
            </div>
          )}

          {(normalizedStatus === "salesresponded" || normalizedStatus === "negotiating") && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Quyết định của bạn
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chấp nhận bảng giá để áp dụng vào giỏ hàng, hoặc chat với Sales để thương lượng giá sản phẩm nào chưa hài lòng
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <Button
                    onClick={handleNegotiate}
                    variant="outline"
                    className="rounded-full gap-2 bg-white text-gray-900"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chưa hài lòng - Chat
                  </Button>
                  <Button
                    onClick={handleRejectClick}
                    variant="outline"
                    className="rounded-full gap-2 text-red-600 border-red-200 hover:bg-red-50 bg-white"
                  >
                    <X className="w-4 h-4" />
                    Không chấp nhận
                  </Button>
                  <Button
                    onClick={handleAccept}
                    className="rounded-full gap-2 bg-gray-900 text-white hover:bg-gray-800"
                  >
                    <Check className="w-4 h-4" />
                    Chấp nhận bảng giá
                  </Button>
                </div>
              </div>
            </div>
          )}

          {normalizedStatus === "pending" && (
            <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    Đang chờ Sales phản hồi
                  </p>
                  <p className="text-sm text-yellow-700">
                    Chúng tôi sẽ phản hồi yêu cầu của bạn trong vòng 24 giờ
                  </p>
                </div>
              </div>
            </div>
          )}

          {normalizedStatus === "accepted" && (
            <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    Đã chấp nhận bảng giá
                  </p>
                  <p className="text-sm text-green-700">
                    Giá đã được áp dụng vào giỏ hàng của bạn
                  </p>
                </div>
              </div>
            </div>
          )}

          {normalizedStatus === "rejected" && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
              <div className="flex items-center gap-3">
                <X className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Đã hủy</p>
                  <p className="text-sm text-red-700">
                    Yêu cầu báo giá này đã bị hủy
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <ConfirmModal
        isOpen={showRejectConfirm}
        title="Xác nhận từ chối"
        message="Bạn có chắc muốn từ chối bảng giá này?"
        onConfirm={executeReject}
        onCancel={() => setShowRejectConfirm(false)}
      />
    </div>
  );
}
