# AirDrop Manager

Phần mềm quản lý dự án airdrop chuyên nghiệp. Theo dõi task hàng ngày, quản lý link truy cập, tự động thu thập thông tin từ Telegram — tất cả trong một giao diện tối ưu.

## Tính năng chính

- **Quản lý dự án dạng bảng** — Thêm, sửa, xóa, lọc dự án theo trạng thái/chain
- **Hệ thống trạng thái** — Chưa làm, Đang làm, Đã kết thúc, Đã trả air, Bỏ qua, Scam...
- **Daily Tasks** — Checklist task hàng ngày cho từng dự án, theo dõi tiến độ theo ngày
- **Access Links** — Lưu và mở nhanh link đăng ký, Discord, Twitter, Telegram
- **Telegram Integration** — Kết nối bot Telegram để tự động thu thập tin nhắn từ group
- **Keyword Filter** — Chỉ lấy tin nhắn chứa từ khóa liên quan (loại bỏ nhiễu)
- **Detail Panel** — Xem chi tiết dự án bên phải khi click
- **Tìm kiếm & Lọc** — Filter theo chain, trạng thái, từ khóa
- **Dark Theme** — Giao diện tối, tối ưu cho sử dụng lâu dài
- **Chrome Extension** — Truy cập nhanh task từ thanh toolbar

---

## Cấu trúc thư mục

```
AirDrop-Manager/
├── webapp/          # Web app (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProjectsView.jsx      # Bảng dự án + stats
│   │   │   ├── ProjectDetailPanel.jsx # Panel chi tiết bên phải
│   │   │   ├── AddProjectModal.jsx    # Form thêm dự án
│   │   │   ├── DailyChecklist.jsx     # Checklist hàng ngày
│   │   │   ├── Sidebar.jsx           # Menu trái
│   │   │   ├── TelegramFeed.jsx      # Feed tin nhắn TG
│   │   │   └── TelegramConfig.jsx    # Cấu hình bot TG
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
├── backend/         # Backend API (Express + Telegram Bot)
│   ├── server.js
│   └── package.json
├── extension/       # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── popup.html/css/js
│   └── icons/
└── README.md
```

---

## Hướng dẫn cài đặt chi tiết

### Yêu cầu hệ thống

- **Node.js** phiên bản 18 trở lên (khuyến nghị 20+)
- **npm** (đi kèm Node.js)
- **Git** (để clone repo)
- Trình duyệt Chrome/Edge (cho extension)

### Bước 1: Clone repository

```bash
git clone https://github.com/claimtb360-cell/AirDrop-Manager.git
cd AirDrop-Manager
```

### Bước 2: Cài đặt Web App

```bash
# Di chuyển vào thư mục webapp
cd webapp

# Cài đặt dependencies
npm install

# Chạy ở chế độ development (localhost:5173)
npm run dev
```

Mở trình duyệt và truy cập: **http://localhost:5173**

#### Build cho production:
```bash
npm run build
```
File build nằm trong thư mục `webapp/dist/` — có thể deploy lên bất kỳ hosting tĩnh nào.

### Bước 3: Cài đặt Backend (cho Telegram Integration)

```bash
# Mở terminal mới, quay lại thư mục gốc
cd AirDrop-Manager/backend

# Cài đặt dependencies
npm install

# Chạy server
npm start
```

Backend sẽ chạy tại: **http://localhost:3001**

> **Lưu ý:** Backend cần chạy song song với webapp để tính năng Telegram hoạt động.

### Bước 4: Cấu hình Telegram Bot

#### 4.1 Tạo Bot trên Telegram:
1. Mở Telegram, tìm **@BotFather**
2. Gửi lệnh `/newbot`
3. Đặt tên bot (ví dụ: `AirdropTracker_Bot`)
4. Copy **Bot Token** (dạng `123456789:ABCdefGHIjklMNOpqrSTUvwxYZ`)

#### 4.2 Tắt Privacy Mode (QUAN TRỌNG):
1. Gửi cho @BotFather: `/setprivacy`
2. Chọn bot của bạn
3. Chọn **Disable**

> Nếu không tắt privacy mode, bot sẽ KHÔNG đọc được tin nhắn trong group.

#### 4.3 Thêm bot vào group:
1. Vào group Telegram airdrop mà bạn theo dõi
2. Thêm bot vào group (Add member → tìm tên bot)
3. Bot sẽ tự động phát hiện group

#### 4.4 Cấu hình trong webapp:
1. Vào **TG Settings** trong sidebar
2. Dán Bot Token → nhấn **Connect**
3. Thêm **Keyword Filter** (bắt buộc):
   - Ví dụ: `airdrop`, `claim`, `snapshot`, `testnet`, `whitelist`, `token`
   - Thêm tên các dự án: `LayerZero`, `zkSync`, `Scroll`...
4. Sau đó vào tab **Telegram** để xem tin nhắn đã lọc

### Bước 5: Cài đặt Chrome Extension (tùy chọn)

1. Mở Chrome → nhập `chrome://extensions/` vào thanh địa chỉ
2. Bật **Developer mode** (góc trên bên phải)
3. Nhấn **Load unpacked**
4. Chọn thư mục `extension/` trong project
5. Icon AirDrop Manager xuất hiện trên toolbar

---

## Hướng dẫn sử dụng

### Quản lý dự án

| Thao tác | Cách làm |
|----------|----------|
| Thêm dự án | Nhấn nút "Thêm dự án" trên toolbar |
| Xem chi tiết | Click vào dòng trong bảng → panel hiện bên phải |
| Đổi trạng thái | Click vào badge trạng thái → chọn trạng thái mới |
| Xóa dự án | Click icon thùng rác trong cột Hành động |
| Xóa nhiều | Tick checkbox → nhấn nút Xóa |
| Lọc theo chain | Dùng dropdown "Tất cả chain" trên toolbar |
| Lọc theo trạng thái | Click stat trên thanh thống kê hoặc dùng dropdown |
| Tìm kiếm | Gõ vào ô tìm kiếm trên toolbar |

### Daily Tasks

1. Vào **Daily Tasks** trong sidebar
2. Xem tất cả task của các dự án cho hôm nay
3. Check off task khi hoàn thành
4. Dùng mũi tên ← → để xem ngày khác

### Telegram Feed

1. Cấu hình bot (xem Bước 4 ở trên)
2. Thêm keywords để lọc tin nhắn
3. Vào tab **Telegram** trong sidebar
4. Tin nhắn phù hợp sẽ tự động hiển thị
5. Có thể lọc theo project hoặc group

---

## Chạy đồng thời (Development)

Mở 2 terminal:

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```

**Terminal 2 — Frontend:**
```bash
cd webapp
npm run dev
```

---

## Deploy

### Deploy webapp lên GitHub Pages:
Webapp tự động deploy khi push code lên branch `main` (GitHub Actions).

Live demo: https://claimtb360-cell.github.io/AirDrop-Manager/

### Deploy backend (cho Telegram):
Backend cần server chạy 24/7. Có thể deploy lên:
- **Railway** (free tier)
- **Render** (free tier)
- **VPS** (DigitalOcean, Vultr...)
- **Localhost** (chạy trên máy cá nhân)

---

## Tech Stack

| Thành phần | Công nghệ |
|-----------|----------|
| Frontend | React 19, Vite 8, Lucide Icons |
| Backend | Express, node-telegram-bot-api |
| Extension | Vanilla JS, Chrome MV3 |
| Storage | localStorage (web), chrome.storage (ext) |
| Styling | Custom CSS, CSS Variables (dark theme) |
| Deploy | GitHub Pages + GitHub Actions |

---

## Troubleshooting

| Vấn đề | Giải pháp |
|--------|----------|
| Blank page khi mở web | Xóa cache, reload. Kiểm tra console (F12) |
| Telegram không nhận tin | Kiểm tra privacy mode đã Disable chưa |
| Bot không phát hiện group | Gửi 1 tin nhắn bất kỳ trong group sau khi thêm bot |
| Tin nhắn không hiển thị | Kiểm tra đã thêm keyword chưa (không có keyword = không lưu gì) |
| Build lỗi trên GitHub | Kiểm tra tab Actions để xem log lỗi |

## License

MIT
