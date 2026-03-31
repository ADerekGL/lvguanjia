import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useEffect, type ReactElement } from 'react';
import { PlanProvider, usePlan } from './store/planContext';
import AppLayout from './Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Rooms = lazy(() => import('./pages/Rooms'));
const Users = lazy(() => import('./pages/Users'));
const Orders = lazy(() => import('./pages/Orders'));
const Services = lazy(() => import('./pages/Services'));
const Products = lazy(() => import('./pages/Products'));
const CheckIn = lazy(() => import('./pages/CheckIn'));
const Login = lazy(() => import('./pages/Login'));
const NoSubscription = lazy(() => import('./pages/NoSubscription'));

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

const fallback = (
  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
    <Spin size="large" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <PlanProvider>
        <Suspense fallback={fallback}>
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
        </Suspense>
      </PlanProvider>
    </BrowserRouter>
  );
}
