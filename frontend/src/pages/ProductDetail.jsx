import { useState } from 'react'
import { Heart, Minus, Package, Plus, RotateCcw, Shield, ShoppingCart, Truck } from 'lucide-react'
import { motion } from 'motion/react'
import { Link, useParams } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import { formatPrice, products } from '../data/products.js'

const tabs = [
  { id: 'description', label: 'Mô Tả' },
  { id: 'specifications', label: 'Thông Số' },
]

export default function ProductDetail() {
  const { id } = useParams()
  const product = products.find((item) => item.id === id)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h2>
          <Link to="/products" className="text-gray-600 hover:text-gray-900">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  const relatedProducts = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4)
  const productImages = [product.image, product.image, product.image, product.image]

  function handleQuantityChange(delta) {
    setQuantity((value) => Math.max(1, Math.min(99, value + delta)))
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
              <Link to="/products" className="text-gray-600 hover:text-gray-900">
                Sản phẩm
              </Link>
              <span className="text-gray-400">/</span>
              <span className="font-medium text-gray-900">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="space-y-4">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-square overflow-hidden rounded-[2rem] bg-gray-100"
              >
                <img src={productImages[selectedImage]} alt={product.name} className="h-full w-full object-cover" />
              </motion.div>

              <div className="grid grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <button
                    key={`${product.id}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-[1.25rem] border-2 bg-gray-100 transition-all ${
                      selectedImage === index ? 'border-gray-900 shadow-lg' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  {product.isNew && <Badge className="bg-black text-white">Hàng Mới</Badge>}
                  {product.isBestSeller && <Badge variant="secondary">Bán Chạy</Badge>}
                </div>
                <p className="mb-2 text-sm uppercase tracking-[0.3em] text-gray-500">{product.category}</p>
                <h1 className="mb-4 text-4xl font-bold text-gray-900">{product.name}</h1>
              </div>

              <div className="border-y border-gray-100 py-6">
                <div className="text-4xl font-bold text-gray-900">{formatPrice(product.price)}</div>
                <p className="mt-2 text-sm text-gray-600">Đã bao gồm thuế. Phí vận chuyển được tính khi thanh toán.</p>
              </div>

              <p className="leading-relaxed text-gray-600">{product.description}</p>

              <div>
                <label className="mb-3 block text-sm font-semibold uppercase tracking-wider text-gray-900">Số Lượng</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-full border border-gray-300">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="rounded-l-full p-3 transition-colors hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-16 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="rounded-r-full p-3 transition-colors hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">Còn hàng (250 sản phẩm)</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="flex-1 rounded-full bg-gray-900 text-white hover:bg-gray-800">
                  <ShoppingCart className="h-5 w-5" />
                  Thêm Vào Giỏ
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-6">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
                {[
                  {
                    icon: Truck,
                    title: 'Miễn Phí Vận Chuyển',
                    description: 'Đơn hàng trên 500.000 đ',
                  },
                  {
                    icon: RotateCcw,
                    title: 'Đổi Trả Dễ Dàng',
                    description: 'Chính sách 30 ngày',
                  },
                  {
                    icon: Package,
                    title: 'Đóng Gói Cẩn Thận',
                    description: 'Xử lý cẩn trọng',
                  },
                  {
                    icon: Shield,
                    title: 'Bảo Hành Chất Lượng',
                    description: 'Sản phẩm cao cấp',
                  },
                ].map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <feature.icon className="h-5 w-5 text-gray-900" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{feature.title}</p>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-20">
            <div className="flex flex-wrap border-b border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b-2 px-8 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-gray-900 bg-transparent text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'description' && (
              <div className="py-12">
                <p className="leading-relaxed text-gray-600">{product.description}</p>
                <p className="mt-4 leading-relaxed text-gray-600">
                  Sản phẩm văn phòng phẩm cao cấp này được thiết kế với cả tính năng và thẩm mỹ. Hoàn hảo cho không gian
                  làm việc hiện đại, kết hợp độ bền với thiết kế thanh lịch để nâng cao hiệu suất công việc hằng ngày.
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 gap-x-12 gap-y-4 py-12 md:grid-cols-2">
                {[
                  ['Thương Hiệu', 'Việt Tiến'],
                  ['Danh Mục', product.category],
                  ['Chất Liệu', 'Chất lượng cao cấp'],
                  ['Bảo Hành', '1 năm'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <div className="mb-10">
                <p className="mb-2 text-sm uppercase tracking-[0.4em] text-gray-500">Có Thể Bạn Thích</p>
                <h2 className="text-4xl font-bold text-gray-900">Sản Phẩm Liên Quan</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
