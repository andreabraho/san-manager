import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProviderLogin from './pages/provider/Login';
import ProviderRegister from './pages/provider/ProviderRegister';

// Public
import ProviderHome from './pages/public/ProviderHome';
import BookingPage from './pages/public/BookingPage';
import MyBookings from './pages/public/MyBookings';

// Provider
import ProviderDashboard from './pages/provider/Dashboard';
import HomeEditor from './pages/provider/HomeEditor';
import BookingManager from './pages/provider/BookingManager';
import LocationManager from './pages/provider/LocationManager';
import ServiceManager from './pages/provider/ServiceManager';
import AvailabilityManager from './pages/provider/AvailabilityManager';

// Client
import ClientDashboard from './pages/client/Dashboard';
import BookingHistory from './pages/client/BookingHistory';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminWidgetTypes from './pages/admin/WidgetTypes';

// Shared
import ProfilePage from './pages/shared/ProfilePage';

const ProtectedLayout = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

const ProviderLayout = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/provider/login" replace />;
  if (user.role !== 'provider' && user.role !== 'superadmin') return <Navigate to="/provider/login" replace />;
  if (role === 'superadmin' && user.role !== 'superadmin') return <Navigate to="/provider/login" replace />;
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Provider auth */}
        <Route path="/provider/login" element={<ProviderLogin />} />
        <Route path="/provider/register" element={<ProviderRegister />} />

        {/* Provider */}
        <Route path="/provider/dashboard" element={<ProviderLayout role="provider"><ProviderDashboard /></ProviderLayout>} />
        <Route path="/provider/home-editor" element={<ProviderLayout role="provider"><HomeEditor /></ProviderLayout>} />
        <Route path="/provider/bookings" element={<ProviderLayout role="provider"><BookingManager /></ProviderLayout>} />
        <Route path="/provider/locations" element={<ProviderLayout role="provider"><LocationManager /></ProviderLayout>} />
        <Route path="/provider/services" element={<ProviderLayout role="provider"><ServiceManager /></ProviderLayout>} />
        <Route path="/provider/availability" element={<ProviderLayout role="provider"><AvailabilityManager /></ProviderLayout>} />
        <Route path="/provider/profile" element={<ProviderLayout role="provider"><ProfilePage /></ProviderLayout>} />

        {/* Super Admin */}
        <Route path="/admin/dashboard" element={<ProviderLayout role="superadmin"><AdminDashboard /></ProviderLayout>} />
        <Route path="/admin/users" element={<ProviderLayout role="superadmin"><AdminUsers /></ProviderLayout>} />
        <Route path="/admin/widgets" element={<ProviderLayout role="superadmin"><AdminWidgetTypes /></ProviderLayout>} />

        {/* Client auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public */}
        <Route path="/my-bookings" element={<MyBookings />} />

        {/* Client */}
        <Route path="/client/dashboard" element={<ProtectedLayout role="client"><ClientDashboard /></ProtectedLayout>} />
        <Route path="/client/bookings" element={<ProtectedLayout role="client"><BookingHistory /></ProtectedLayout>} />

        {/* Client profile */}
        <Route path="/profile" element={<ProtectedLayout role="client"><ProfilePage /></ProtectedLayout>} />

        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public provider pages — wildcard last */}
        <Route path="/:username" element={<ProviderHome />} />
        <Route path="/:username/book" element={<BookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
