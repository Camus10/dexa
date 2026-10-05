import { Navigate, Route, Routes } from "react-router-dom";

import EmployeeLayout from "@/layouts/EmployeeLayout";
import HrdLayout from "@/layouts/HrdLayout";
import { roleHomePath } from "@/lib/auth";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/Login";
import History from "@/pages/employee/History";
import Home from "@/pages/employee/Home";
import Profile from "@/pages/employee/Profile";
import Requests from "@/pages/employee/Requests";
import Announcements from "@/pages/hrd/Announcements";
import Approvals from "@/pages/hrd/Approvals";
import Attendances from "@/pages/hrd/Attendances";
import Dashboard from "@/pages/hrd/Dashboard";
import Employees from "@/pages/hrd/Employees";
import Holidays from "@/pages/hrd/Holidays";
import OfficeLocations from "@/pages/hrd/OfficeLocations";
import Reports from "@/pages/hrd/Reports";
import WorkShifts from "@/pages/hrd/WorkShifts";
import { useAuthStore } from "@/stores/authStore";
import ProtectedRoute from "@/routes/ProtectedRoute";

/** Arahkan "/" ke halaman awal sesuai role (atau ke login). */
function RootRedirect() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleHomePath(user.role)} replace />;
}

/**
 * Peta seluruh route aplikasi.
 *
 * Route dipisah rapi: /admin/* hanya untuk HRD, /app/* hanya untuk karyawan,
 * dan keduanya dilindungi `ProtectedRoute` (butuh login + role yang sesuai).
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* ------------------------------------------------ area HRD (/admin) */}
      <Route element={<ProtectedRoute allowedRole="HRD" />}>
        <Route path="/admin" element={<HrdLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="attendances" element={<Attendances />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="office-locations" element={<OfficeLocations />} />
          <Route path="work-shifts" element={<WorkShifts />} />
          <Route path="holidays" element={<Holidays />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Route>

      {/* ------------------------------------------- area karyawan (/app) */}
      <Route element={<ProtectedRoute allowedRole="EMPLOYEE" />}>
        <Route path="/app" element={<EmployeeLayout />}>
          <Route index element={<Navigate to="/app/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="history" element={<History />} />
          <Route path="requests" element={<Requests />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
