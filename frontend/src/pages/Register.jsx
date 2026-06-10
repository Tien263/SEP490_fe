import { useState } from 'react'
import { ArrowLeft, Lock, Mail, Phone, User } from 'lucide-react'
import { motion } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Label } from '../components/ui/Label.jsx'

export default function Register() {
  const navigate = useNavigate()
  const { savePendingRegistration } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    savePendingRegistration({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
    })
    console.log('Đăng ký mock:', formData)
    navigate('/verify-otp', {
      state: {
        email: formData.email,
        fullName: formData.fullName,
      },
    })
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden overflow-hidden lg:block lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700 opacity-90" />
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
          alt="Bàn làm việc tối giản"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center text-white"
          >
            <h1 className="mb-4 text-5xl font-bold">Tham gia Viet Tien</h1>
            <p className="text-xl text-slate-200">Tạo tài khoản để nhận mã OTP xác thực qua email.</p>
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
            <h2 className="mb-2 text-3xl font-bold text-gray-900">Tạo tài khoản</h2>
            <p className="text-gray-600">Điền thông tin để bắt đầu và xác thực bằng mã OTP.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={(event) => handleChange('fullName', event.target.value)}
                  className="h-12 pl-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Địa chỉ email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="h-12 pl-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+84 123 456 789"
                  value={formData.phone}
                  onChange={(event) => handleChange('phone', event.target.value)}
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
                  value={formData.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                  className="h-12 pl-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(event) => handleChange('confirmPassword', event.target.value)}
                  className="h-12 pl-11"
                  required
                />
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Bằng việc tạo tài khoản, bạn đồng ý với{' '}
              <a href="#" className="text-gray-900 hover:underline">
                Điều khoản dịch vụ
              </a>{' '}
              và{' '}
              <a href="#" className="text-gray-900 hover:underline">
                Chính sách bảo mật
              </a>
              .
            </p>

            <Button type="submit" className="h-12 w-full">
              Tạo tài khoản và nhận OTP
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">Hoặc đăng ký với</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="h-12 w-full border-gray-300">
              Tiếp tục với Google
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-gray-900 hover:underline">
              Đăng nhập
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
