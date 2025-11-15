
  import { createRoot } from "react-dom/client";
  import App from "./App";
  import "./index.css";
  import axios from 'axios';

  // Guard: Render admin if we have a token (URL hash or stored). Ensure dev first-load shows logged out, but preserve login on reloads.
  async function init() {
    const userLogin = (import.meta.env.VITE_USER_LOGIN_URL as string) || 'http://localhost:3000/login';
    try {
      // DEV-only first-load cleanup: đảm bảo lần đầu mở tab sẽ là trạng thái đăng xuất.
      if (import.meta.env.MODE !== 'production') {
        try {
          if (!sessionStorage.getItem('sw_admin_first_load_done')) {
            sessionStorage.setItem('sw_admin_first_load_done', '1');
            localStorage.removeItem('sw_token');
            localStorage.removeItem('sw_user_role');
          }
        } catch {}
      }

      // 1) Token trên URL hash (e.g. #token=...): ưu tiên sử dụng rồi xóa hash khỏi URL
      if (typeof window !== 'undefined' && window.location) {
        const rawHash = window.location.hash || '';
        if (rawHash) {
          const hash = rawHash.substring(1);
          let tokenFromHash: string | null = null;
          try {
            const params = new URLSearchParams(hash);
            tokenFromHash = params.get('token');
          } catch {
            tokenFromHash = null;
          }
          if (!tokenFromHash && hash) tokenFromHash = decodeURIComponent(hash);
          if (tokenFromHash) {
            try {
              localStorage.setItem('sw_token', tokenFromHash);
              localStorage.setItem('sw_user_role', 'admin');
              try { history.replaceState({}, document.title, window.location.pathname + window.location.search); } catch {}
              createRoot(document.getElementById('root')!).render(<App />);
              return;
            } catch (renderErr) {
              console.error('Failed to render admin app with token from URL', renderErr);
              const el = document.getElementById('root');
              if (el) el.innerHTML = '<div style="padding:40px;font-family:sans-serif;color:#333">Failed to load admin app. <a href="' + (userLogin) + '">Go back to login</a></div>';
              return;
            }
          }
        }
      }

      // 2) Nếu không có hash, nhưng có sẵn token trong localStorage -> render luôn (giữ đăng nhập khi reload)
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('sw_token') : null;
      if (savedToken) {
        createRoot(document.getElementById('root')!).render(<App />);
        return;
      }

      // 3) Không có token -> quay về trang login của user app để đăng nhập admin
      window.location.href = userLogin;
      return;
    } catch (err) {
      console.error('Auth validation failed', err);
      window.location.href = userLogin;
    }
  }

  if (typeof window !== 'undefined') init();
  