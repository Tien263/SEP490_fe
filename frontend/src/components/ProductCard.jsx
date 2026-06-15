import { useState } from 'react'
import { Eye, Heart, ShoppingCart } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Badge } from './ui/Badge.jsx'
import { formatPrice } from '../data/products.js'

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className="group overflow-hidden rounded-[1.75rem] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link to={`/products/${product.id}`} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>

        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
          {product.isNew && <Badge className="bg-black text-white">Mới</Badge>}
          {product.isBestSeller && (
            <Badge variant="secondary" className="bg-white text-black">
              Bán Chạy
            </Badge>
          )}
        </div>

        <div className="absolute right-4 top-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsWishlisted((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-50"
            aria-label="Toggle wishlist"
          >
            <Heart className={isWishlisted ? 'h-4 w-4 fill-red-500 text-red-500' : 'h-4 w-4 text-gray-600'} />
          </motion.button>
        </div>

        <div className="absolute bottom-4 right-4 flex flex-col gap-2 opacity-0 transition duration-300 group-hover:opacity-100">
          <Link
            to={`/products/${product.id}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition hover:bg-gray-900 hover:text-white"
            aria-label="Preview product"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition hover:bg-gray-800"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      <div className="p-6">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-gray-500">{product.category}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="text-clamp-1 mb-2 text-lg font-semibold text-gray-900 transition-colors hover:text-gray-600">
            {product.name}
          </h3>
        </Link>
        <p className="text-clamp-2 mb-4 min-h-10 text-sm leading-6 text-gray-600">{product.description}</p>
        <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
      </div>
    </motion.article>
  )
}
