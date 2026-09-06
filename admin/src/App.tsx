import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import BasicLayout from './layouts/BasicLayout';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import UsersPage from './pages/users';
import WalletsPage from './pages/wallets';
import KycPage from './pages/kyc';
import ModulesPage from './pages/modules';
import AdminsPage from './pages/admins';
import AuditLogPage from './pages/audit-log';

/** Gate for authenticated console routes. */
function RequireAuth({
  children,
  superAdminOnly = false,
}: {
  children: ReactNode;
  superAdminOnly?: boolean;
}) {
  const token = useAuthStore((state) => state.token);
  const admin = useAuthStore((state) => state.admin);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (superAdminOnly && admin?.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <BasicLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="wallets" element={<WalletsPage />} />
          <Route path="kyc" element={<KycPage />} />
          <Route path="modules" element={<ModulesPage />} />
          <Route
            path="admins"
            element={
              <RequireAuth superAdminOnly>
                <AdminsPage />
              </RequireAuth>
            }
          />
          {/* The audit log route is always registered and never feature-gated. */}
          <Route path="audit-logs" element={<AuditLogPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
