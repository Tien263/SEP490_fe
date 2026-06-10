import { useState } from 'react'
import { ArrowLeft, Lock, Mail } from 'lucide-react'
import { motion } from 'motion/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Checkbox } from '../components/ui/Checkbox.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Label } from '../components/ui/Label.jsx'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextUser = login(email)
    console.log('Đăng nhập mock:', { email, password, rememberMe, user: nextUser })
    navigate('/home')
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden overflow-hidden lg:block lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 opacity-90" />
        <img
          src="https://images.unsplash.com/photo-1497215842964-222b430dc094?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjBtaW5pbWFsfGVufDF8fHx8MTc3OTg2Mzg4NHww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Không gian làm việc hiện đại"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center text-white"
          >
            <h1 className="mb-4 text-5xl font-bold">Chào mừng quay lại</h1>
            <p className="text-xl text-gray-200">Đăng nhập để tiếp tục khám phá văn phòng phẩm cao cấp.</p>
          </motion.div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-8 inline-flex items-center text-gray-600 transition hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại trang chủ
          </Link>

          <div className="mb-8">
            <h2 className="mb-2 text-3xl font-bold text-gray-900">Đăng nhập</h2>
            <p className="text-gray-600">Nhập thông tin tài khoản để tiếp tục.</p>
          </div>

          {location.state?.verified && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Tài khoản đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Địa chỉ email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 pl-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 pl-11"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="remember" className="flex cursor-pointer items-center gap-2 text-sm font-normal">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Ghi nhớ đăng nhập
              </Label>
              <Link to="/forgot-password" className="text-sm text-gray-700 transition hover:text-gray-900 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <Button type="submit" className="h-12 w-full">
              Đăng nhập
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">Hoặc tiếp tục với</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="h-12 w-full border-gray-300">
              Tiếp tục với Google
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-gray-900 hover:underline">
              Đăng ký
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
