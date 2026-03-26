import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './Layout';
import Dashboard from './pages/Dashboard';
import Hotels from './pages/Hotels';
import Users from './pages/Users';
import Rooms from './pages/Rooms';
import Orders from './pages/Orders';
import Services from './pages/Services';
import CheckIn from './pages/CheckIn';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="hotels" element={<Hotels />} />
          <Route path="users" element={<Users />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="orders" element={<Orders />} />
          <Route path="services" element={<Services />} />
          <Route path="checkin" element={<CheckIn />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
