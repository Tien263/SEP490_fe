import { useMemo, useState } from 'react'
import { Grid3x3, List, SlidersHorizontal } from 'lucide-react'
import { motion } from 'motion/react'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import Pagination from '../components/Pagination.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductListCard from '../components/ProductListCard.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Checkbox } from '../components/ui/Checkbox.jsx'
import { Label } from '../components/ui/Label.jsx'
import { categories, products } from '../data/products.js'

const MAX_PRICE = 500000

export default function Products() {
  const [selectedCategories, setSelectedCategories] = useState([])
  const [priceLimit, setPriceLimit] = useState(MAX_PRICE)
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState('list')
  const [showFilters, setShowFilters] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  function toggleCategory(category) {
    setSelectedCategories((previous) =>
      previous.includes(category) ? previous.filter((item) => item !== category) : [...previous, category],
    )
    setCurrentPage(1)
  }

  function resetFilters() {
    setSelectedCategories([])
    setPriceLimit(MAX_PRICE)
    setCurrentPage(1)
  }

  function updatePriceLimit(nextPrice) {
    setPriceLimit(nextPrice)
    setCurrentPage(1)
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)
      const matchesPrice = product.price <= priceLimit
      return matchesCategory && matchesPrice
    })
  }, [priceLimit, selectedCategories])

  const sortedProducts = useMemo(() => {
    const nextProducts = [...filteredProducts]

    nextProducts.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          if (a.isBestSeller && !b.isBestSeller) return -1
          if (!a.isBestSeller && b.isBestSeller) return 1
          return 0
      }
    })

    return nextProducts
  }, [filteredProducts, sortBy])

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage))
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="bg-white pt-20">
        <div className="border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Trang chủ</span>
              <span className="text-gray-400">/</span>
              <span className="font-medium text-gray-900">Sản phẩm</span>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="mb-2 text-4xl font-bold text-gray-900">Tất Cả Sản Phẩm</h1>
                <p className="text-gray-600">
                  Hiển thị {sortedProducts.length} trên {products.length} sản phẩm
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`rounded p-2 ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`rounded p-2 ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                >
                  <option value="featured">Nổi bật</option>
                  <option value="price-low">Giá: Thấp đến Cao</option>
                  <option value="price-high">Giá: Cao đến Thấp</option>
                  <option value="name">Tên: A đến Z</option>
                </select>

                <Button variant="outline" onClick={() => setShowFilters((value) => !value)} className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Bộ lọc
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:w-64 lg:flex-shrink-0"
              >
                <div className="space-y-8 lg:sticky lg:top-24">
                  <div>
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">Danh Mục</h3>
                    <div className="space-y-3">
                      {categories
                        .filter((category) => category !== 'Tất Cả Sản Phẩm')
                        .map((category) => (
                          <div key={category} className="flex items-center">
                            <Checkbox
                              id={category}
                              checked={selectedCategories.includes(category)}
                              onChange={() => toggleCategory(category)}
                            />
                            <Label htmlFor={category} className="ml-3 cursor-pointer text-sm text-gray-700">
                              {category}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">Khoảng Giá</h3>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <input
                          type="range"
                          min="0"
                          max={MAX_PRICE}
                          step="10000"
                          value={priceLimit}
                          onChange={(event) => updatePriceLimit(Number(event.target.value))}
                          className="price-slider w-full"
                        />
                        <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                          Lọc đến mức giá tối đa {priceLimit.toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>0 đ</span>
                        <span>{priceLimit.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">Tình Trạng</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Checkbox id="in-stock" defaultChecked />
                        <Label htmlFor="in-stock" className="ml-3 cursor-pointer text-sm text-gray-700">
                          Còn hàng
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox id="out-of-stock" />
                        <Label htmlFor="out-of-stock" className="ml-3 cursor-pointer text-sm text-gray-700">
                          Hết hàng
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" onClick={resetFilters} className="w-full">
                    Xóa Tất Cả Bộ Lọc
                  </Button>
                </div>
              </motion.aside>
            )}

            <div className="flex-1">
              {sortedProducts.length > 0 ? (
                <>
                  <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}>
                    {paginatedProducts.map((product) =>
                      viewMode === 'grid' ? (
                        <ProductCard key={product.id} product={product} />
                      ) : (
                        <ProductListCard key={product.id} product={product} />
                      ),
                    )}
                  </div>

                  {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  )}
                </>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-lg text-gray-500">Không tìm thấy sản phẩm phù hợp với bộ lọc.</p>
                  <Button variant="outline" onClick={resetFilters} className="mt-4">
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
