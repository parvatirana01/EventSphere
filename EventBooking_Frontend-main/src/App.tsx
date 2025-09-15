import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Container from './components/layout/Container';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UserDashboard } from './pages/UserDashboard';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { CreateEventPage } from './pages/CreateEventPage';
import { UpdateEventPage } from './pages/UpdateEventPage';
import { OrganizerRequestPage } from './pages/OrganizerRequestPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminManageUsersPage from './pages/AdminManageUsersPage';
import AdminManageEventsPage from './pages/AdminManageEventsPage';
import AdminOrganizerRequestsPage from './pages/AdminOrganizerRequestsPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import NearbyEventsPage from './pages/NearbyEventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { AuthProvider } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import UnauthorizedPage from './pages/unauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import SocketWrapper from './components/auth/SocketConnector';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketWrapper>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-primary-100">
            <Header />
            <Container className="flex-1 py-8">
              <Routes>


                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />
                <Route path="/nearby-events" element={<NearbyEventsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />


                <Route path="/dashboard" element={
                  <ProtectedRoute >
                    <UserDashboard />
                  </ProtectedRoute>
                } />

                {}

                {}
                <Route path="/organizer-request" element={
                  <ProtectedRoute requiredRole="USER">
                    <OrganizerRequestPage />
                  </ProtectedRoute>
                } />

                {}
                <Route path="/booking/:id" element={
                  <ProtectedRoute >
                    <BookingDetailsPage />
                  </ProtectedRoute>
                } />

                {}
                <Route path="/organizer/dashboard" element={
                  <ProtectedRoute requiredRole={["ORGANIZER", "ADMIN"]}>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/create-event" element={
                  <ProtectedRoute requiredRole={["ORGANIZER", "ADMIN"]}>
                    <CreateEventPage />
                  </ProtectedRoute>
                } />

                <Route path="/update-event/:id" element={
                  <ProtectedRoute requiredRole={["ORGANIZER", "ADMIN"]}>
                    <UpdateEventPage />
                  </ProtectedRoute>
                } />

                {}
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } />

                <Route path="/admin/users" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminManageUsersPage />
                  </ProtectedRoute>
                } />

                <Route path="/admin/events" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminManageEventsPage />
                  </ProtectedRoute>
                } />

                {}
                <Route path="/admin/organizer-requests" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminOrganizerRequestsPage />
                  </ProtectedRoute>
                } />

                {}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Container>
            <Footer />
          </div>
        </SocketWrapper>
      </AuthProvider>
    </Router>
  );
}

export default App;