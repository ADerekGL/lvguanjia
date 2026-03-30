import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, type ReactElement } from 'react';
import { PlanProvider, usePlan } from './store/planContext';
import AppLayout from './Layout';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Services from './pages/Services';
import Products from './pages/Products';
import CheckIn from './pages/CheckIn';
import Login from './pages/Login';
import NoSubscription from './pages/NoSubscription';

function RequireAuth({ children }: { children: ReactElement }) {
  const token = localStorage.getItem('hotel_admin_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function PlanGate({ children }: { children: ReactElement }) {
  const { effectivePlan, planLoaded, loadPlan } = usePlan();
  const location = useLocation();

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  if (!planLoaded) return null;

  if (effectivePlan === 'none') {
    if (location.pathname !== '/no-subscription') {
      return <Navigate to="/no-subscription" replace />;
    }
    return children;
  }

  if (location.pathname === '/no-subscription') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <PlanProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/no-subscription" element={
            <RequireAuth>
              <PlanGate>
                <NoSubscription />
              </PlanGate>
            </RequireAuth>
          } />
          <Route
            path="/"
            element={
              <RequireAuth>
                <PlanGate>
                  <AppLayout />
                </PlanGate>
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
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PlanProvider>
    </BrowserRouter>
  );
}
