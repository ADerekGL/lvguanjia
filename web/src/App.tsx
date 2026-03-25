import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Shop from './pages/Shop';
import Orders from './pages/Orders';
import Service from './pages/Service';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { useAuthStore } from './store/auth';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
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
    </Router>
  );
}

export default App;
