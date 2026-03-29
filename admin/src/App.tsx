import { type ReactElement, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AppLayout from './Layout';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Services from './pages/Services';
import Products from './pages/Products';
import CheckIn from './pages/CheckIn';
import Login from './pages/Login';
import Subscription from './pages/Subscription';
import NoSubscription from './pages/NoSubscription';
import UpgradePage from './pages/UpgradePage';
import { PlanProvider, usePlan } from './store/planContext';

function RequireAuth({ children }: { children: ReactElement }) {
  const token = localStorage.getItem('hotel_admin_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function PlanGate({ children }: { children: ReactElement }) {
  const { effectivePlan, planLoaded, loadPlan } = usePlan();
  const navigate = useNavigate();

  useEffect(() => {
    // Always call loadPlan — it handles the no-token case and sets planLoaded=true
    loadPlan();
  }, []);

  useEffect(() => {
    if (!planLoaded) return;
    const token = localStorage.getItem('hotel_admin_token');
    if (!token) return; // unauthenticated — let RequireAuth handle redirect to /login
    const path = window.location.pathname;
    if (effectivePlan === 'none') {
      if (path !== '/no-subscription' && path !== '/login') {
        navigate('/no-subscription', { replace: true });
      }
    } else {
      if (path === '/no-subscription') {
        navigate('/', { replace: true });
      }
    }
  }, [effectivePlan, planLoaded]);

  // Hold render until plan resolved (only when authenticated)
  const token = localStorage.getItem('hotel_admin_token');
  if (!planLoaded && token) {
    return null;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <PlanProvider>
        <PlanGateWrapper />
      </PlanProvider>
    </BrowserRouter>
  );
}

function PlanGateWrapper() {
  return (
    <PlanGate>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/no-subscription" element={
          <RequireAuth>
            <NoSubscription />
          </RequireAuth>
        } />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
          <Route path="services" element={<Services />} />
          <Route path="products" element={<Products />} />
          <Route path="checkin" element={<CheckIn />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="upgrade" element={<UpgradePage />} />
        </Route>
      </Routes>
    </PlanGate>
  );
}
