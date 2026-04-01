import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SpinLoading } from 'antd-mobile';
import MainLayout from './layouts/MainLayout';
import { useAuthStore } from './store/auth';
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const Chat = lazy(() => import('./pages/Chat'));
const Shop = lazy(() => import('./pages/Shop'));
const Orders = lazy(() => import('./pages/Orders'));
const Service = lazy(() => import('./pages/Service'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const WechatCallback = lazy(() => import('./pages/WechatCallback'));
const Rating = lazy(() => import('./pages/Rating'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const fallback = (
  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
    <SpinLoading color="primary" />
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={fallback}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth-callback" element={<WechatCallback />} />
          <Route path="/rating" element={<Rating />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="chat" element={<Chat />} />
            <Route path="shop" element={<Shop />} />
            <Route path="orders" element={<Orders />} />
            <Route path="service" element={<Service />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
