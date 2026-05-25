// ============================================
// CẤU HÌNH BACKEND URL
// ============================================
// Nếu bạn deploy backend lên Render/Railway, 
// thay URL bên dưới bằng URL thực tế của bạn.
// Ví dụ: 'https://airdrop-manager-api.onrender.com/api'
//
// Nếu chạy local, giữ nguyên 'http://localhost:3001/api'
// ============================================

export const API_BASE = import.meta.env.VITE_API_URL 
  || 'https://airdrop-manager-api.onrender.com/api'
