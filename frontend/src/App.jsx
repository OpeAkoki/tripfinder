import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import PackageList from './pages/PackageList';
import PackageDetail from './pages/PackageDetail';
import BookingForm from './pages/BookingForm';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import EditBooking from './pages/EditBooking';
import AdminView from './pages/AdminView';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/packages" element={<PackageList />} />
        <Route path="/packages/:id" element={<PackageDetail />} />
        <Route path="/packages/:id/book" element={<BookingForm />} />
        <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/my-bookings/:id/edit" element={<EditBooking />} />
        <Route path="/admin" element={<AdminView />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}
