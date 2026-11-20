import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

// Route Guards
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { GuideRoute } from './routes/GuideRoute';
import { GuestRoute } from './routes/GuestRoute';

// Public Pages
import { HomePage } from './pages/home/HomePage';
import { ToursPage } from './pages/tours/ToursPage';
import { TourDetailPage } from './pages/tours/TourDetailPage';
import { HotelsPage } from './pages/hotels/HotelsPage';
import { HotelDetailPage } from './pages/hotels/HotelDetailPage';
import { FlightsPage } from './pages/flights/FlightsPage';
import { TrainsPage } from './pages/trains/TrainsPage';
import { BusesPage } from './pages/buses/BusesPage';
import { RoadTripsPage } from './pages/road-trips/RoadTripsPage';
import { DestinationsPage } from './pages/destinations/DestinationsPage';
import { DestinationDetailPage } from './pages/destinations/DestinationDetailPage';

// NaviBand Navigation Pages
import { NaviBandPage } from './pages/naviband/NaviBandPage';
import { NaviBandTourPage } from './pages/naviband/NaviBandTourPage';

// Dashboards
import { UserDashboardPage } from './pages/user/UserDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { GuideDashboardPage } from './pages/guide/GuideDashboardPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

const RoleDashboard: React.FC = () => {
  const { role } = useAuth();
  if (role === 'admin') return <AdminDashboardPage />;
  if (role === 'guide' || role === 'lead-guide') return <GuideDashboardPage />;
  return <UserDashboardPage />;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Scroll to top upon route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 antialiased font-sans transition-colors duration-200">
      <Navbar />

      <div className={`flex min-w-0 flex-1 flex-col ${isHomePage ? '' : 'pt-20 xl:pt-24'}`}>

        {/* Page Content */}
        <main className="flex-1">
          <ErrorBoundary>
            <Routes>
            {/* Public Exploration Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/tours" element={<ToursPage />} />
            <Route path="/tours/:id" element={<TourDetailPage />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/hotels/:id" element={<HotelDetailPage />} />
            <Route path="/flights" element={<FlightsPage />} />
            <Route path="/trains" element={<TrainsPage />} />
            <Route path="/buses" element={<BusesPage />} />
            <Route path="/road-trips" element={<RoadTripsPage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/destinations/:id" element={<DestinationDetailPage />} />

            {/* Tour Navigation & NaviBand Routes */}
            <Route path="/tours/:tourId/naviband" element={<NaviBandTourPage />} />
            <Route path="/navigation/:tourId" element={<NaviBandTourPage />} />
            <Route path="/navigation/:tourId/checkpoint/:checkpointId" element={<NaviBandTourPage />} />
            <Route path="/naviband" element={<NaviBandPage />} />

            {/* Account dashboard content is selected from the verified backend role. */}
            <Route path="/account/*" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/*" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />

            {/* Admin Portal Routes (Admin Guarded) */}
            <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/tours" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/tours/create" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/tours/:tourId/edit" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/guides" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/bookings" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/reviews" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

            {/* Guide Portal Routes (Guide Guarded) */}
            <Route path="/guide" element={<GuideRoute><GuideDashboardPage /></GuideRoute>} />
            <Route path="/guide/tours" element={<GuideRoute><GuideDashboardPage /></GuideRoute>} />
            <Route path="/guide/assignments" element={<GuideRoute><GuideDashboardPage /></GuideRoute>} />
            <Route path="/guide/checkpoints" element={<GuideRoute><GuideDashboardPage /></GuideRoute>} />

            {/* Auth Routes */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/auth/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

            {/* 404 Fallback */}
            <Route
              path="*"
              element={
                <div className="max-w-xl mx-auto px-4 py-28 text-center">
                  <h1 className="font-heading text-5xl font-black text-slate-900 dark:text-white">404</h1>
                  <p className="text-base text-slate-500 mt-2">The page you were looking for does not exist.</p>
                  <a href="/" className="mt-6 inline-block btn-primary text-xs font-bold py-2.5 px-6">
                    Return to Homepage
                  </a>
                </div>
              }
            />
          </Routes>
        </ErrorBoundary>
      </main>

        {/* Modern Global Footer */}
        <Footer />
      </div>
    </div>
  );
};

export const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
