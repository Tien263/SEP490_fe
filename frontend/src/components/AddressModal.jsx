import { motion } from 'motion/react'
import { Button } from './ui/Button.jsx'
import { Input } from './ui/Input.jsx'

export function buildFullAddress({ addressLine, ward, district, city }) {
  return [addressLine, ward, district, city].filter(Boolean).join(', ')
}

export const emptyAddressForm = {
  id: '',
  name: '',
  phone: '',
  city: '',
  district: '',
  ward: '',
  addressLine: '',
  type: 'Nhà riêng',
  isDefault: false,
}

export default function AddressModal({
  title,
  form,
  onChange,
  onClose,
  onSubmit,
  submitLabel,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h3 className="mb-5 text-lg font-bold text-gray-900">{title}</h3>

        <form onSubmit={onSubmit} className="space-y-3">
          {[
            { key: 'name', label: 'Họ tên người nhận', placeholder: 'Nguyễn Văn A' },
            { key: 'phone', label: 'Số điện thoại', placeholder: '0901 234 567' },
            { key: 'city', label: 'Tỉnh/Thành phố', placeholder: 'TP. Hồ Chí Minh' },
            { key: 'district', label: 'Quận/Huyện', placeholder: 'Quận 1' },
            { key: 'ward', label: 'Phường/Xã', placeholder: 'Phường Bến Nghé' },
            { key: 'addressLine', label: 'Địa chỉ chi tiết', placeholder: '123 Đường ABC' },
          ].map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-xs text-gray-500">{field.label}</label>
              <Input
                placeholder={field.placeholder}
                className="rounded-xl text-sm"
                value={form[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
                required
              />
            </div>
          ))}

          <label className="flex cursor-pointer items-center gap-2 pt-1">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) => onChange('isDefault', event.target.checked)}
              className="h-4 w-4 accent-gray-900"
            />
            <span className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
          </label>

          <div className="mt-5 flex gap-3">
            <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="flex-1 rounded-full bg-gray-900 text-white hover:bg-gray-800">
              {submitLabel}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
