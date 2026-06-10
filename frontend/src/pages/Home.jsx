import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { motion } from 'motion/react'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { categories, products } from '../data/products.js'

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Tất Cả Sản Phẩm')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Tất Cả Sản Phẩm' || product.category === selectedCategory
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [searchQuery, selectedCategory])

  const newArrivals = products.filter((product) => product.isNew)
  const bestSellers = products.filter((product) => product.isBestSeller)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative mt-20 flex h-[70vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800">
          <img
            src="https://images.unsplash.com/photo-1722929025573-3d461531ac4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwZGVzayUyMHN0YXRpb25lcnklMjB3aGl0ZXxlbnwxfHx8fDE3ODAwNTY2NTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Bàn làm việc tối giản"
            className="h-full w-full object-cover opacity-30"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl lg:text-7xl">
              Khám Phá Văn Phòng Phẩm
              <br />
              Cao Cấp
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-200 md:text-xl">
              Bộ sưu tập văn phòng phẩm tinh gọn, chất lượng cao dành cho doanh nghiệp và đội ngũ hiện đại.
            </p>

            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="rounded-full border-0 bg-white/95 py-6 pl-14 pr-6 text-base backdrop-blur-sm"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Danh mục</h2>
            <Button variant="ghost" size="sm" className="gap-2 rounded-full">
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc
            </Button>
          </div>
          <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Badge
                key={category}
                as="button"
                type="button"
                variant={selectedCategory === category ? 'default' : 'outline'}
                className={
                  selectedCategory === category
                    ? 'cursor-pointer whitespace-nowrap rounded-full px-6 py-2 hover:bg-gray-800'
                    : 'cursor-pointer whitespace-nowrap rounded-full px-6 py-2 text-gray-700 hover:border-gray-900'
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10">
            <p className="mb-2 text-sm uppercase tracking-[0.4em] text-gray-500">Mới nhất</p>
            <h2 className="text-4xl font-bold text-gray-900">Hàng mới về</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-900 to-blue-800 py-20 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">Ưu đãi đặc biệt</h2>
            <p className="mb-6 text-xl text-blue-100">
              Giảm 20% cho đơn hàng số lượng lớn từ 1.000.000 VNĐ trở lên.
            </p>
            <Button size="lg" className="rounded-full bg-white px-8 !text-blue-900 hover:bg-gray-100">
              Mua ngay
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-80 overflow-hidden rounded-[1.75rem]"
          >
            <img
              src="https://images.unsplash.com/photo-1692521248559-c3434d0baa81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwc3RhdGlvbmVyeSUyMGJyYW5kaW5nJTIwbWluaW1hbHxlbnwxfHx8fDE3ODAwNTY2NTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Bộ nhận diện văn phòng phẩm cao cấp"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10">
            <p className="mb-2 text-sm uppercase tracking-[0.4em] text-gray-500">Bán chạy</p>
            <h2 className="text-4xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section id="catalog" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="mb-2 text-4xl font-bold text-gray-900">
              {selectedCategory === 'Tất Cả Sản Phẩm' ? 'Tất Cả Sản Phẩm' : selectedCategory}
            </h2>
            <p className="text-gray-600">Hiển thị {filteredProducts.length} sản phẩm</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-lg text-gray-500">Không tìm thấy sản phẩm phù hợp.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
