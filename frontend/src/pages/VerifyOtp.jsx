import { ArrowLeft, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthCardLayout from '../components/AuthCardLayout.jsx'
import { Button } from '../components/ui/Button.jsx'

function normalizeOtp(value) {
  return value.replace(/\D/g, '').slice(0, 6)
}

export default function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email ?? 'you@example.com'
  const [otp, setOtp] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/login', { state: { email, verified: true } })
  }

  return (
    <AuthCardLayout>
      <div className="flex flex-col items-start gap-8">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-lg text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Quay lại đăng ký
        </Link>

        <div className="flex h-18 w-18 items-center justify-center rounded-3xl bg-slate-900 text-white">
          <MailCheck className="h-8 w-8" />
        </div>
      </div>

      <div className="mt-10">
        <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Nhập mã OTP</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
          Chúng tôi đã gửi mã xác thực gồm 6 số đến <span className="font-semibold text-slate-950">{email}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <label className="block">
          <span className="mb-4 block text-base font-medium text-slate-950">Mã xác thực</span>
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-center text-xl font-semibold text-slate-950 shadow-sm"
              >
                {otp[index] ?? ''}
              </div>
            ))}
          </div>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(event) => setOtp(normalizeOtp(event.target.value))}
            placeholder="Nhập 6 số OTP"
            className="mt-4 h-14 w-full rounded-2xl border border-slate-200 px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            required
          />
        </label>

        <Button type="submit" className="h-14 w-full rounded-2xl text-base" disabled={otp.length !== 6}>
          Xác nhận và quay lại đăng nhập
        </Button>

        <button
          type="button"
          className="w-full text-center text-base text-slate-600 transition hover:text-slate-950"
          onClick={() => navigate('/verify-otp', { state: { email }, replace: true })}
        >
          Gửi lại mã OTP
        </button>
      </form>
    </AuthCardLayout>
  )
}
