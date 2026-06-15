import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, ArrowRight, Check, MessageSquare, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import { formatPrice, products } from '../data/products.js'

function getAutomaticDiscount(total) {
  if (total >= 100000000) return 0
  if (total >= 50000000) return 0.1
  if (total >= 10000000) return 0.07
  return 0
}

function getDiscountBadgeText(total) {
  if (total >= 50000000 && total < 100000000) return 'Giảm 10% cho đơn từ 50 triệu'
  if (total >= 10000000 && total < 50000000) return 'Giảm 7% cho đơn từ 10 triệu'
  return ''
}

export default function Cart() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([
    { productId: '1', quantity: 2000 },
    { productId: '2', quantity: 1000 },
    { productId: '6', quantity: 500 },
  ])
  const [showQuotationModal, setShowQuotationModal] = useState(false)
  const [quotationSent, setQuotationSent] = useState(false)

  function handleQuantityChange(productId, delta) {
    setCartItems((items) =>
      items.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
      ),
    )
  }

  function handleRemoveItem(productId) {
    setCartItems((items) => items.filter((item) => item.productId !== productId))
  }

  function goToCheckout() {
    navigate('/checkout', {
      state: {
        cartItems,
      },
    })
  }

  function openQuotationModal() {
    setQuotationSent(false)
    setShowQuotationModal(true)
  }

  function handleSubmitQuotation() {
    setShowQuotationModal(false)
    setQuotationSent(true)
  }

  const cartProducts = useMemo(
    () =>
      cartItems
        .map((item) => ({
          ...item,
          product: products.find((product) => product.id === item.productId),
        }))
        .filter((item) => item.product),
    [cartItems],
  )

  const subtotal = cartProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const automaticDiscountRate = getAutomaticDiscount(subtotal)
  const automaticDiscountAmount = subtotal * automaticDiscountRate
  const shippingFee = subtotal >= 500000 ? 0 : 30000
  const total = subtotal + shippingFee - automaticDiscountAmount

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center pt-20">
          <div className="text-center">
            <ShoppingBag className="mx-auto mb-6 h-20 w-20 text-gray-300" />
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Giỏ hàng trống</h2>
            <p className="mb-8 text-gray-600">Bắt đầu mua sắm để thêm sản phẩm vào giỏ hàng.</p>
            <Link to="/products">
              <Button size="lg" className="rounded-full bg-gray-900 hover:bg-gray-800">
                Tiếp Tục Mua Sắm
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-20">
        <div className="border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Trang chủ
              </Link>
              <span className="text-gray-400">/</span>
              <span className="font-medium text-gray-900">Giỏ Hàng</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">Giỏ Hàng</h1>
          <p className="mt-2 text-gray-600">{cartItems.length} sản phẩm trong giỏ hàng</p>
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {cartProducts.map(({ product, productId, quantity }) => (
                <motion.div
                  key={productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6 rounded-[1.5rem] border border-gray-100 bg-white p-6 transition-shadow hover:shadow-lg sm:flex-row"
                >
                  <Link
                    to={`/products/${productId}`}
                    className="h-32 w-full flex-shrink-0 overflow-hidden rounded-[1.25rem] bg-gray-100 sm:w-32"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <div>
                        <p className="mb-1 text-xs uppercase tracking-[0.3em] text-gray-500">{product.category}</p>
                        <Link to={`/products/${productId}`} className="text-lg font-semibold text-gray-900 hover:text-gray-600">
                          {product.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(productId)}
                        className="text-gray-400 transition-colors hover:text-gray-900"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <p className="mb-4 text-sm leading-6 text-gray-600">{product.description}</p>

                    <div className="mt-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center rounded-full border border-gray-300">
                        <button
                          onClick={() => handleQuantityChange(productId, -1)}
                          className="rounded-l-full p-2 transition-colors hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-14 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(productId, 1)}
                          className="rounded-r-full p-2 transition-colors hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{formatPrice(product.price * quantity)}</div>
                        <div className="text-sm text-gray-500">{formatPrice(product.price)} mỗi sản phẩm</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <Link to="/products">
                <Button variant="outline" className="w-full rounded-full">
                  Tiếp Tục Mua Sắm
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div>
              <div className="space-y-6 lg:sticky lg:top-24">
                <div className="rounded-[1.75rem] border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                    <AlertCircle className="h-5 w-5" />
                    Chính Sách Giảm Giá
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">Đơn từ 10 triệu đến dưới 50 triệu: giảm 7%</p>
                    <p className="text-gray-700">Đơn từ 50 triệu đến dưới 100 triệu: giảm 10%</p>
                    <p className="text-gray-700">Đơn từ 100 triệu trở lên: gửi yêu cầu để Sales báo giá đặc biệt</p>
                  </div>
                </div>

                {subtotal >= 100000000 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[1.75rem] border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6"
                  >
                    <h3 className="mb-2 font-bold text-gray-900">Yêu cầu báo giá đặc biệt</h3>
                    <p className="mb-4 text-sm text-gray-700">
                      Đơn hàng từ 100 triệu được hưởng ưu đãi đặc biệt. Sales sẽ xem xét số lượng và gửi bảng giá tốt
                      nhất cho bạn trong thời gian sớm nhất.
                    </p>
                    <Button
                      className="w-full rounded-full bg-gray-900 text-white hover:bg-gray-800"
                      onClick={openQuotationModal}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Gửi yêu cầu báo giá với Sales
                    </Button>
                  </motion.div>
                )}

                {quotationSent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[1.5rem] border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800"
                  >
                    Đã gửi yêu cầu về Mã đơn hàng thành công! Sales sẽ phản hồi nhanh nhất có thể
                  </motion.div>
                )}

                <div className="rounded-[1.75rem] border border-gray-100 bg-gray-50 p-8">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Tổng Đơn Hàng</h2>

                  {getDiscountBadgeText(subtotal) && (
                    <div className="mb-4">
                      <Badge className="bg-green-100 px-3 py-1 text-sm text-green-800 hover:bg-green-100">
                        {getDiscountBadgeText(subtotal)}
                      </Badge>
                    </div>
                  )}

                  <div className="mb-6 space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Tổng Ban Đầu</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    {automaticDiscountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm Tự Động ({Math.round(automaticDiscountRate * 100)}%)</span>
                        <span className="font-medium">-{formatPrice(automaticDiscountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Vận Chuyển</span>
                      <span className="font-medium">{shippingFee === 0 ? 'Miễn Phí' : formatPrice(shippingFee)}</span>
                    </div>
                    <div className="text-xs text-gray-500">Miễn phí vận chuyển cho đơn hàng trên 500.000 đ</div>
                  </div>

                  <div className="mb-6 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">Tổng Cộng</span>
                      <span className="text-2xl font-bold text-gray-900">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="mb-4 w-full rounded-full bg-gray-900 text-white hover:bg-gray-800"
                    onClick={goToCheckout}
                  >
                    Thanh Toán
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <p className="text-center text-xs text-gray-500">Thanh toán an toàn bởi Việt Tiến</p>
                </div>

                <div className="space-y-3">
                  {[
                    'Miễn phí vận chuyển cho đơn hàng trên 500.000 đ',
                    'Đổi trả dễ dàng trong 30 ngày',
                    'Thanh toán an toàn bảo mật',
                  ].map((text) => (
                    <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showQuotationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4"
            onClick={() => setShowQuotationModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="w-full max-w-[540px] rounded-[1.75rem] bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">Gửi yêu cầu báo giá?</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Bạn muốn gửi yêu cầu báo giá cho đơn hàng này? Sales sẽ xem xét và gửi bảng giá đặc biệt cho bạn
                    trong vòng 24 giờ.
                  </p>
                </div>
                <button
                  onClick={() => setShowQuotationModal(false)}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6 rounded-[1.25rem] bg-gray-50 px-5 py-4">
                <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-3 text-sm">
                  <span className="text-gray-500">Tổng đơn hàng:</span>
                  <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 pt-3 text-sm">
                  <span className="text-gray-500">Số sản phẩm:</span>
                  <span className="text-lg font-semibold text-gray-900">{cartProducts.length} loại</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 flex-1 rounded-full border-gray-200 bg-white text-base"
                  onClick={() => setShowQuotationModal(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  className="h-12 flex-1 rounded-full bg-[#0f172a] text-base text-white hover:bg-[#111c34]"
                  onClick={handleSubmitQuotation}
                >
                  Gửi yêu cầu
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
