import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login';
import Register from "./pages/Register";
import Home from "./pages/Home";
import HotelDetail from "./pages/HotelDetail";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminPanel from "./pages/admin/AdminPanel";

function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/hotel/:id" element={<HotelDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
