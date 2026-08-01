# Hướng dẫn chạy Unit Test (L1) — Frontend

Áp dụng cho `SEP490_fe/frontend`, đối chiếu theo doc `Report_5_2_L1-UnitTests_VietTien_v2_2.xlsx`
(3 sheet FE: FE-Services, FE-Contexts, FE-Components — 21 case).
Hướng dẫn cho Backend nằm ở `SEP490_be/HUONG_DAN_CHAY_UNIT_TEST.md`.

---

## 1. Chuẩn bị (chỉ làm 1 lần)

### Yêu cầu
- Node.js 20+ (`node --version`)

### Cài dependency

```bash
npm --prefix D:\SEP490\SEP490_fe\frontend install
```

Bộ test dùng: **Vitest + jsdom + React Testing Library + MSW**. `msw` là devDependency,
`npm install` sẽ tự kéo về — không cần cài tay.

### ⚠ KHÔNG cần chạy backend

MSW chặn toàn bộ request ở tầng network và trả về dữ liệu giả, nên test FE chạy hoàn toàn offline.
**Không cần** `dotnet run`, không cần SQL Server, không cần `appsettings.Development.json`.

---

## 2. Chạy test

Chạy toàn bộ:

```bash
npm --prefix D:\SEP490\SEP490_fe\frontend test
```

Chế độ watch (tự chạy lại khi sửa file):

```bash
npx vitest
```

Chạy 1 file:

```bash
npx vitest run src/components/__tests__/forms.test.jsx
```

Chạy 1 case theo Test ID trong doc:

```bash
npx vitest run -t "L1-FCMP-07"
```

Mở giao diện xem kết quả:

```bash
npx vitest --ui
```

---

## 3. ⚠ KẾT QUẢ MONG ĐỢI — 10 test đỏ

```
Test Files  8 failed | 4 passed (12)
     Tests  10 failed | 20 passed (30)
```

10 test đỏ chia làm **2 nhóm khác hẳn nhau**:

### Nhóm A — 5 test đỏ CÓ CHỦ ĐÍCH (assert theo SPEC, chờ sửa code)

Có comment `🔴 SPEC GAP` ngay phía trên `it()`. Khi code được sửa cho đúng spec, test tự chuyển xanh.

| Test ID | Vấn đề |
|---|---|
| `L1-FES-02` | `fetchWithToken` **không có silent refresh** — gặp 401 là xoá session và đá về `/login` ngay, dù refresh token còn hạn (NFR-SEC02) |
| `L1-FEC-04` | `CartContext.addToCart` chỉ ném lỗi khi chưa đăng nhập, **không lưu sản phẩm khách định mua** → sau khi đăng nhập khách phải tự tìm lại (FT-01 AC-05) |
| `L1-FCMP-05` | `Cart.jsx` có hiện khối "Yêu cầu báo giá đặc biệt" khi ≥ 100 triệu nhưng **vẫn giữ nút "Đặt Hàng & Xem Hóa Đơn"** bên cạnh → khách bấm đặt hàng thẳng được (FT-02 AC-03) |
| `L1-FCMP-07` (×2 case) | `PhoneVerificationModal` chỉ kiểm tra rỗng, **không validate định dạng SĐT** (FT-01 NAC-02) |

### Nhóm B — 5 test đỏ CÓ TỪ TRƯỚC (không thuộc doc L1, cần chủ file tự sửa)

| File | Số test đỏ | Nguyên nhân |
|---|---|---|
| `src/pages/__tests__/Cart.test.jsx` | 1 | Render page mà **không bọc `CartProvider`/`AuthProvider`** → `Error: useCart must be used within a CartProvider` |
| `src/pages/__tests__/Checkout.test.jsx` | 1 | Như trên |
| `src/pages/__tests__/OrderDetail.test.jsx` | 1 | Như trên |
| `src/pages/__tests__/Profile.test.jsx` | 2 | Như trên |

> Đã xác minh 5 test này **đỏ từ trước khi thêm MSW**: stash `src/test/setup.js` về bản gốc rồi chạy
> lại vẫn đỏ y hệt. Cách sửa: bọc component trong provider, hoặc `vi.mock` context như
> `src/pages/__tests__/CartCheckout.test.jsx` đang làm.

Chi tiết đầy đủ: **`SEP490_be/VietTien.Tests/DOC_MISMATCHES_v2.2.md`**.

---

## 4. Cấu trúc thư mục test

```
src/
├── test/
│   ├── setup.js              # Đăng ký MSW + polyfill IntersectionObserver/ResizeObserver/matchMedia
│   └── msw/
│       ├── server.js         # setupServer dùng chung
│       └── handlers.js       # Handler mặc định cho /api/*
├── services/__tests__/
│   ├── authService.test.jsx        (FES-01..03)
│   └── serviceContracts.test.jsx   (FES-04..06)
├── context/__tests__/
│   ├── AuthContext.test.jsx        (FEC-01..02)
│   ├── CartContext.test.jsx        (FEC-03..04)
│   └── ToastContext.test.jsx       (FEC-05)
├── components/__tests__/
│   ├── ProtectedRoute.test.jsx     (FCMP-01..02)
│   └── forms.test.jsx              (FCMP-07..10)
└── pages/__tests__/
    └── CartCheckout.test.jsx       (FCMP-03, FCMP-05)
```

Cấu hình Vitest nằm trong `vite.config.ts` (mục `test`), không có file `vitest.config.ts` riêng.

---

## 5. Quy ước khi viết test mới

1. **Mỗi test mang Test ID của doc ngay trong tên `it()`** — script đối chiếu quét chuỗi này:
   ```jsx
   it('L1-FCMP-08 Pagination ở trang 1 vô hiệu hoá nút Prev', () => { ... })
   ```

2. **Đuôi file là `.jsx`, không phải `.tsx`** — dự án là JavaScript (doc ghi "frontend TypeScript" là sai).

3. **Giả lập API bằng MSW**, không mock `fetch` thủ công. Handler riêng cho từng test:
   ```jsx
   server.use(http.get('/api/orders', () => HttpResponse.json({ items: [] })))
   ```
   `setup.js` đặt `onUnhandledRequest: 'error'` → **request nào không có handler sẽ làm test đỏ**.
   Đây là chủ ý: buộc mọi lời gọi mạng phải được khai báo tường minh.

4. **Component dùng SignalR** (vd `NotificationBell`) phải `vi.mock('@microsoft/signalr', ...)`,
   nếu không test sẽ cố mở WebSocket thật. Xem `forms.test.jsx` làm mẫu.

5. **Component đọc `localStorage.getItem('accessToken')` mới gọi API** — nhớ set token trước khi render:
   ```jsx
   localStorage.setItem('accessToken', 'jwt-1')
   ```
   `setup.js` tự `localStorage.clear()` sau mỗi test.

6. **Đừng thay cả `window.location`** để bắt điều hướng — làm vậy sẽ mất `origin` và `localStorage`
   nhảy sang storage area khác. Xem cách stub đúng trong `authService.test.jsx` (L1-FES-03).

---

## 6. Lỗi thường gặp

| Triệu chứng | Nguyên nhân & cách xử lý |
|---|---|
| `Tests 10 failed \| 20 passed` | **Bình thường** — xem mục 3 |
| `[MSW] Error: intercepted a request without a matching request handler` | Component gọi endpoint chưa khai báo → thêm handler vào `src/test/msw/handlers.js` hoặc `server.use(...)` trong test |
| `IntersectionObserver is not defined` | Component dùng `motion/react`. Polyfill đã có trong `setup.js` — kiểm tra file test có bị bỏ qua `setupFiles` không |
| `useCart must be used within a CartProvider` | Test render page mà thiếu provider → bọc provider hoặc `vi.mock` context |
| `Not implemented: navigation to another Document` | jsdom cảnh báo khi code gán `window.location.href`. Không làm test đỏ; muốn bắt điều hướng thì stub như mục 5.6 |
| Test treo / rất chậm | Component mở WebSocket SignalR thật → thiếu `vi.mock('@microsoft/signalr', ...)` |
