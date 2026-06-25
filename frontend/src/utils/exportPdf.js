import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { formatPrice } from '../data/products.js'

export async function exportInvoiceToPdf(order, action = 'save') {
  // 1. Tạo container ẩn
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '794px' // A4 width in pixels at 96 DPI
  container.style.backgroundColor = '#ffffff'
  container.style.color = '#111827'
  container.style.padding = '40px'
  container.style.fontFamily = '"Inter", sans-serif'
  container.style.boxSizing = 'border-box'
  
  // 2. Tạo nội dung HTML
  // Lưu ý: formatPrice và formatDate được dùng để format dữ liệu
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const itemsHtml = (order.items || []).map(
    (item, index) => `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 12px 8px; text-align: center;">${index + 1}</td>
      <td style="padding: 12px 8px;">
        <div style="font-weight: 600;">${item.productName}</div>
        ${item.productSku ? `<div style="font-size: 12px; color: #6b7280;">SKU: ${item.productSku}</div>` : ''}
      </td>
      <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right;">${formatPrice(item.priceSnapshot)}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 600;">${formatPrice(item.lineTotal)}</td>
    </tr>
  `
  ).join('')

  const subtotal = order.totalAmount || 0
  const discount = order.discountAmount || 0
  const vat      = order.vatAmount || 0
  const total    = order.finalPayment || 0

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
      <div>
        <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #111827; text-transform: uppercase; letter-spacing: 2px;">VIETTIEN</h1>
        <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Giải pháp văn phòng phẩm toàn diện</p>
      </div>
      <div style="text-align: right;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 300; color: #374151;">HÓA ĐƠN BÁN HÀNG</h2>
        <p style="margin: 4px 0 0; font-size: 14px; font-weight: 600;">Mã đơn: ${order.orderCode}</p>
        <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">Ngày lập: ${formatDate(order.createdAt)}</p>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 14px;">
      <div style="width: 48%; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <h3 style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px;">Thông tin khách hàng</h3>
        <p style="margin: 0 0 4px; font-weight: 600;">${order.customerName || 'Khách hàng'}</p>
        <p style="margin: 0 0 4px;">SĐT: ${order.customerPhone || '---'}</p>
        <p style="margin: 0; line-height: 1.5;">Giao đến: ${order.shippingAddress || '---'}</p>
      </div>
      <div style="width: 48%; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
        <h3 style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px;">Chi tiết giao dịch</h3>
        <p style="margin: 0 0 4px;">Phương thức TT: <strong>${order.paymentMethod || '---'}</strong></p>
        <p style="margin: 0 0 4px;">Trạng thái TT: <strong>${order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</strong></p>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 14px;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="padding: 12px 8px; text-align: center; width: 8%; color: #4b5563; font-weight: 600;">STT</th>
          <th style="padding: 12px 8px; text-align: left; width: 42%; color: #4b5563; font-weight: 600;">Sản phẩm</th>
          <th style="padding: 12px 8px; text-align: center; width: 10%; color: #4b5563; font-weight: 600;">SL</th>
          <th style="padding: 12px 8px; text-align: right; width: 20%; color: #4b5563; font-weight: 600;">Đơn giá</th>
          <th style="padding: 12px 8px; text-align: right; width: 20%; color: #4b5563; font-weight: 600;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="display: flex; justify-content: flex-end; margin-bottom: 40px; font-size: 14px;">
      <div style="width: 350px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
          <span style="color: #6b7280;">Tạm tính</span>
          <span style="font-weight: 600;">${formatPrice(subtotal)}</span>
        </div>
        ${discount > 0 ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
          <span style="color: #6b7280;">Chiết khấu</span>
          <span style="color: #059669; font-weight: 600;">- ${formatPrice(discount)}</span>
        </div>
        ` : ''}
        ${vat > 0 ? `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
          <span style="color: #6b7280;">VAT (10%)</span>
          <span style="font-weight: 600;">${formatPrice(vat)}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; padding: 16px 0 8px; border-bottom: 2px solid #111827;">
          <span style="font-size: 16px; font-weight: bold; color: #111827;">Tổng cộng</span>
          <span style="font-size: 20px; font-weight: bold; color: #111827;">${formatPrice(total)}</span>
        </div>
      </div>
    </div>

    <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 60px;">
      <p style="margin: 0 0 4px;">Cảm ơn quý khách đã tin tưởng và mua sắm tại VIETTIEN.</p>
      <p style="margin: 0;">Đây là chứng từ điện tử, có giá trị lưu hành nội bộ.</p>
    </div>
  `

  document.body.appendChild(container)

  try {
    // 3. Render HTML sang Canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Tăng chất lượng hình ảnh
      useCORS: true,
      logging: false,
    })

    // 4. Khởi tạo jsPDF (A4, Portrait)
    // Kích thước A4 là 210 x 297 mm
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    // 5. Thêm ảnh vào PDF
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

    // 6. Lưu file hoặc xem trước
    if (action === 'view') {
      const blobUrl = pdf.output('bloburl')
      window.open(blobUrl, '_blank')
    } else {
      pdf.save(`HoaDon_${order.orderCode}.pdf`)
    }
  } catch (error) {
    console.error('Lỗi xuất PDF:', error)
    throw new Error('Không thể xuất file PDF lúc này.')
  } finally {
    // 7. Dọn dẹp DOM
    document.body.removeChild(container)
  }
}
