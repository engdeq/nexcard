import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateQR from './pages/CreateQR';
import MyQRCodes from './pages/MyQRCodes';
import BusinessCard from './pages/BusinessCard';
import PublicProfile from './pages/PublicProfile';
import Settings from './pages/Settings';
import WebsiteAds from './pages/WebsiteAds';
import Templates from './pages/Templates';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/p/:slug" element={<PublicProfile />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="create" element={<CreateQR />} />
                <Route path="qr-codes" element={<MyQRCodes />} />
                <Route path="business-card" element={<BusinessCard />} />
                <Route path="templates" element={<Templates />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="website-ads" element={<WebsiteAds />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
