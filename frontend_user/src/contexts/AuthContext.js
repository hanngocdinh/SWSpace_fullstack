import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

// Backend API base URL (unified backend now runs on 5000 by default)
const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;
// Admin app base URL for role-based redirection (Vite default port 5174)
const ADMIN_APP_URL = process.env.REACT_APP_ADMIN_URL || 'http://localhost:5174';

// Tạo context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // State để lưu thông tin người dùng đăng nhập
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUserRef = useRef(null);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  // Hàm khởi tạo/đồng bộ auth (dùng lại được khi quay lại từ BFCache)
  const initAuth = useCallback(async (skipDevForce = false) => {
    try {
      // DEV-only: khi khởi động app lần đầu trong tab này, luôn đảm bảo trạng thái đăng xuất
      if (!skipDevForce && process.env.NODE_ENV !== 'production' && !sessionStorage.getItem('sw_force_logout_done')) {
        try {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        } catch {}
        sessionStorage.setItem('sw_force_logout_done', '1');
      }

      const rawUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      // Không có token thì coi như chưa đăng nhập (tránh hiển thị tên cũ)
      if (!token) {
        localStorage.removeItem('user');
        setCurrentUser(null);
        return;
      }

      if (rawUser) {
        // Nếu có user lưu trước đó, kiểm tra hợp lệ qua backend
        let parsed;
        try {
          parsed = JSON.parse(rawUser);
        } catch (e) {
          console.warn('Parse stored user error, clearing', e);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setCurrentUser(null);
          return;
        }

        // Nếu vô tình lưu role admin cho user app -> xoá để không auto đăng nhập
        if (parsed?.role === 'admin') {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setCurrentUser(null);
          return;
        }

        // Gọi API xác thực token; nếu 401 thì xoá cache
        try {
          const resp = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data?.success && data?.user) {
              // Đồng bộ lại thông tin mới nhất
              const synced = { ...parsed, ...data.user };
              setCurrentUser(synced);
              localStorage.setItem('user', JSON.stringify(synced));
            } else {
              // token không hợp lệ
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              setCurrentUser(null);
            }
          } else {
            // ví dụ 401/403 -> xoá để không hiển thị tên cũ
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setCurrentUser(null);
          }
        } catch (e) {
          console.warn('Validate token failed, clearing session', e);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
      } else {
        // Có token nhưng không có user -> yêu cầu lấy profile để đồng bộ hoặc xoá
        try {
          const resp = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data?.success && data?.user && data.user.role !== 'admin') {
              const userWithToken = { ...data.user, token };
              setCurrentUser(userWithToken);
              localStorage.setItem('user', JSON.stringify(userWithToken));
            } else {
              localStorage.removeItem('token');
              setCurrentUser(null);
            }
          } else {
            localStorage.removeItem('token');
            setCurrentUser(null);
          }
        } catch (e) {
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Khởi tạo trạng thái đăng nhập khi load trang
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Sửa lỗi "Back" từ admin làm hiển thị user cũ do BFCache: re-sync khi pageshow back/forward
  useEffect(() => {
    const handler = (e) => {
      // Luôn đồng bộ lại khi pageshow (bao gồm back/forward và BFCache restore)
      const token = localStorage.getItem('token');
      if (!token) {
        // Không có token mà state vẫn còn user -> xoá ngay lập tức để không hiển thị tên cũ
        if (currentUserRef.current) {
          try { localStorage.removeItem('user'); } catch {}
          setCurrentUser(null);
        }
        return; // Không cần gọi initAuth vì đã clear
      }
      // Có token thì re-sync nhẹ (skip force dev logout để không mất phiên hợp lệ)
      initAuth(true);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('pageshow', handler);
      return () => window.removeEventListener('pageshow', handler);
    }
  }, [initAuth]);

  // Hàm đăng nhập
  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        const userWithToken = { ...data.user, token: data.token };
        if (userWithToken.role === 'admin') {
          // Giữ nguyên phiên user hiện có (nếu có) để reload trang chủ không bị đăng xuất.
          // Không lưu thông tin admin vào user app; chỉ chuyển hướng sang admin.
          window.location.href = `${ADMIN_APP_URL}/#token=${encodeURIComponent(data.token)}`;
          return { success: true, user: userWithToken, redirected: true };
        }
        setCurrentUser(userWithToken);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        localStorage.setItem('token', data.token);
        return { success: true, user: userWithToken };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please check if backend is running.' };
    }
  };

  // Hàm đăng xuất
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  // Hàm đăng ký
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        const userWithToken = { ...data.user, token: data.token };
        if (userWithToken.role === 'admin') {
          window.location.href = `${ADMIN_APP_URL}/#token=${encodeURIComponent(data.token)}`;
          return { success: true, user: userWithToken, redirected: true };
        }
        setCurrentUser(userWithToken);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        localStorage.setItem('token', data.token);
        return { success: true, user: userWithToken };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error. Please check if backend is running.' };
    }
  };

  // Hàm kiểm tra trạng thái đăng nhập
  const isAuthenticated = () => {
    // Chỉ coi là đăng nhập hợp lệ khi là user thường
    return !!currentUser && currentUser.role === 'user';
  };

  // Giá trị cung cấp cho context
  const value = {
    currentUser,
    login,
    logout,
    register,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
