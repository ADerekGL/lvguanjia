import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './Layout';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Services from './pages/Services';
import Products from './pages/Products';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
          <Route path="services" element={<Services />} />
          <Route path="products" element={<Products />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
