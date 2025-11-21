import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// --- Auth Page ---
import LoginPage from './pages/LoginPage';

// --- Admin Pages ---
import AdminLayout from './pages/admin/AdminLayout';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import AssignActivitiesPage from './pages/admin/AssignActivitiesPage';

// --- User Pages ---
import UserLayout from './pages/user/UserLayout'; // <--- NEW IMPORT
import UserDashboard from './pages/user/UserDashboard';
import CitizenPage from './pages/user/CitizenPage';
import ViewCitizensPage from './pages/user/ViewCitizensPage';
import CitizenProfilePage from './pages/user/CitizenProfilePage';
import ExpiryReportPage from './pages/user/ExpiryReportPage';
import CitizenLedgerPage from './pages/user/CitizenLedgerPage';
import BackupPage from './pages/user/BackupPage';

function App() {
  return (
    <Router>
      <AuthProvider>
          <Routes>
            {/* 1. Public Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* 2. Admin Routes (Protected) */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    {/* Default redirect to 'users' when visiting /admin */}
                    <Route index element={<Navigate to="users" replace />} />

                    <Route path="users" element={<ManageUsersPage />} />
                    <Route path="assign-activities" element={<AssignActivitiesPage />} />
                </Route>
            </Route>

            {/* 3. User Routes (Protected) */}
            <Route element={<ProtectedRoute allowedRoles={['userlevel1']} />}>
                {/* WRAP IN LAYOUT: This adds the Navbar to all pages inside */}
                <Route element={<UserLayout />}>
                    <Route path="/user" element={<UserDashboard />} />

                    {/* Citizen & Vehicle Management */}
                    <Route path="/create-citizen" element={<CitizenPage />} />
                    <Route path="/view-citizens" element={<ViewCitizensPage />} />
                    <Route path="/citizens/:id" element={<CitizenProfilePage />} />
                    <Route path="/citizens/:id/account" element={<CitizenLedgerPage />} />

                    {/* Reports */}
                    <Route path="/expiry-report" element={<ExpiryReportPage />} />
                    <Route path="/backup" element={<BackupPage />} />
                </Route>
            </Route>

            {/* 4. Fallback for unknown routes */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
