import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BetSlipProvider } from './contexts/BetSlipContext';
import { ConnectionProvider } from './contexts/ConnectionContext';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import MainLayout from './components/layout/MainLayout';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import Unauthorized from './pages/Unauthorized';
import AccountBlocked from './pages/AccountBlocked';
import MobileBetSlip from './pages/MobileBetSlip';
import Lotto from './pages/Lotto';
import LottoResults from './pages/LottoResults';
import Contact from './pages/Contact';
import PaymentSuccess from './pages/lotto/PaymentSuccess';
import CancellationSuccess from './pages/lotto/CancellationSuccess';
import UnauthorizedCancel from './pages/lotto/UnauthorizedCancel';

// Admin Pages
import AdminDashboard from './pages/dashboards/admin/AdminDashboard';
import CombinedBetsConfig from './pages/dashboards/admin/CombinedBetsConfig';
import LottoManagement from './pages/dashboards/admin/LottoManagement';
import SetupLotto from './pages/dashboards/admin/SetupLotto';
import LottoDraws from './pages/dashboards/admin/LottoDraws';
import AgentWalletManagement from './pages/dashboards/admin/AgentWalletManagement';
import StaffWalletManagement from './pages/dashboards/admin/StaffWalletManagement';
import WalletCreditHistory from './pages/dashboards/admin/WalletCreditHistory';
import OddsConfigPage from './pages/dashboards/admin/OddsConfigPage';
import SportsConfigPage from './pages/dashboards/admin/SportsConfigPage';
import UserManagement from './pages/dashboards/admin/UserManagement';
import AgentCommissionConfig from './pages/dashboards/admin/AgentCommissionConfig';
import StaffCommissionConfig from './pages/dashboards/admin/StaffCommissionConfig';

// Staff Pages
import StaffDashboard from './pages/dashboards/staff/StaffDashboard';
import LottoParticipants from './pages/dashboards/staff/LottoParticipants';
import LottoTickets from './pages/dashboards/staff/LottoTickets';
import Clients from './pages/dashboards/staff/Clients';
import Tickets from './pages/dashboards/staff/Tickets';
import StaffWallet from './pages/dashboards/staff/StaffWallet';
import Transfers from './pages/dashboards/staff/Transfers';
import StaffPrinterSettings from './pages/dashboards/staff/PrinterSettings';
import StaffAgentWalletManagement from './pages/dashboards/staff/AgentWalletManagement';

// Manager Pages
import ManagerDashboard from './pages/dashboards/manager/ManagerDashboard';
import ManagerUserManagement from './pages/dashboards/manager/UserManagement';
import PerformanceReports from './pages/dashboards/manager/PerformanceReports';
import ManagerSettings from './pages/dashboards/manager/ManagerSettings';
import ManagerLottoDraws from './pages/dashboards/manager/LottoDraws';
import LottoApprovals from './pages/dashboards/manager/LottoApprovals';
import PaidTickets from './pages/dashboards/manager/PaidTickets';
import ManagerAgentWalletManagement from './pages/dashboards/manager/AgentWalletManagement';
import ManagerStaffWalletManagement from './pages/dashboards/manager/StaffWalletManagement';

// Agent Pages
import AgentDashboard from './pages/dashboards/agent/AgentDashboard';
import AgentLottoTickets from './pages/dashboards/agent/LottoTickets';
import AgentWallet from './pages/dashboards/agent/AgentWallet';
import AgentTransfers from './pages/dashboards/agent/Transfers';
import AgentPrinterSettings from './pages/dashboards/agent/PrinterSettings';

export default function App() {
  return (
    <AuthProvider>
      <ConnectionProvider>
        <BetSlipProvider>
          <Router>
            <Routes>
              {/* Routes publiques avec AuthLayout */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/change-password" element={<ChangePassword />} />
              </Route>

              {/* Route pour compte bloqué */}
              <Route path="/account-blocked" element={<AccountBlocked />} />

              {/* Routes pour succès de paiement et annulation */}
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/cancellation-success" element={<CancellationSuccess />} />
              <Route path="/unauthorized-cancel" element={<UnauthorizedCancel />} />

              {/* Routes protégées avec DashboardLayout */}
              <Route path="/dashboard" element={<PrivateRoute />}>
                <Route element={<DashboardLayout />}>
                  {/* Routes Admin */}
                  <Route path="admin" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <AdminDashboard />
                    </RoleRoute>
                  } />
                  
                  {/* Routes Admin Paris */}
                  <Route path="admin/combined-bets" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <CombinedBetsConfig />
                    </RoleRoute>
                  } />
                  <Route path="admin/lottos" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <LottoManagement />
                    </RoleRoute>
                  } />
                  <Route path="admin/setup-lotto" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <SetupLotto />
                    </RoleRoute>
                  } />
                  <Route path="admin/setup-lotto/:id" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <SetupLotto />
                    </RoleRoute>
                  } />
                  <Route path="admin/lotto-draws" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <LottoDraws />
                    </RoleRoute>
                  } />
                  <Route path="admin/agent-wallets" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <AgentWalletManagement />
                    </RoleRoute>
                  } />
                  <Route path="admin/staff-wallets" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <StaffWalletManagement />
                    </RoleRoute>
                  } />
                  <Route path="admin/wallet-history" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <WalletCreditHistory />
                    </RoleRoute>
                  } />
                  <Route path="admin/odds-config" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <OddsConfigPage />
                    </RoleRoute>
                  } />
                  <Route path="admin/sports-config" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <SportsConfigPage />
                    </RoleRoute>
                  } />
                  <Route path="admin/users" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <UserManagement />
                    </RoleRoute>
                  } />
                  <Route path="admin/commission-config" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <AgentCommissionConfig />
                    </RoleRoute>
                  } />
                  <Route path="admin/staff-commission-config" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <StaffCommissionConfig />
                    </RoleRoute>
                  } />

                  {/* Routes Staff */}
                  <Route path="staff" element={
                    <RoleRoute allowedRoles={['staffuser']}>
                      <StaffDashboard />
                    </RoleRoute>
                  } />
                  <Route path="staff/lotto-tickets" element={
                    <RoleRoute allowedRoles={['staffuser']}>
                      <LottoTickets />
                    </RoleRoute>
                  } />
                  <Route path="staff/lotto-participants" element={
                    <RoleRoute allowedRoles={['staffuser']}>
                      <LottoParticipants />
                    </RoleRoute>
                  } />
                  <Route path="staff/clients" element={
                    <RoleRoute allowedRoles={['staffuser']}>
                      <Clients />
                    </RoleRoute>
                  } />
                  <Route path="staff/tickets" element={
                    <RoleRoute allowedRoles={['staffuser']}>
                      <Tickets />
                    </RoleRoute>
                  } />
                  <Route path="staff/wallet" element={
                    <RoleRoute allowedRoles={['staffuser']}>
                      <StaffWallet />
                    </RoleRoute>
                  } />
                  <Route path="staff/transfers" element={
                    <RoleRoute allowedRoles={['staffuser']}>
                      <Transfers />
                    </RoleRoute>
                  } />
                  <Route path="staff/printer-settings" element={
                    <RoleRoute allowedRoles={['staffuser']}>
                      <StaffPrinterSettings />
                    </RoleRoute>
                  } />
                  <Route path="staff/agent-wallets" element={
                    <RoleRoute allowedRoles={['staffuser']}>
                      <StaffAgentWalletManagement />
                    </RoleRoute>
                  } />

                  {/* Routes Manager */}
                  <Route path="manager" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <ManagerDashboard />
                    </RoleRoute>
                  } />
                  <Route path="manager/users" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <ManagerUserManagement />
                    </RoleRoute>
                  } />
                  <Route path="manager/performance" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <PerformanceReports />
                    </RoleRoute>
                  } />
                  <Route path="manager/settings" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <ManagerSettings />
                    </RoleRoute>
                  } />
                  <Route path="manager/lotto-draws" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <ManagerLottoDraws />
                    </RoleRoute>
                  } />
                  <Route path="manager/lotto-approvals" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <LottoApprovals />
                    </RoleRoute>
                  } />
                  <Route path="manager/paid-tickets" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <PaidTickets />
                    </RoleRoute>
                  } />
                  <Route path="manager/agent-wallets" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <ManagerAgentWalletManagement />
                    </RoleRoute>
                  } />
                  <Route path="manager/staff-wallets" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <ManagerStaffWalletManagement />
                    </RoleRoute>
                  } />

                  {/* Routes Agent */}
                  <Route path="agent" element={
                    <RoleRoute allowedRoles={['agentuser']}>
                      <AgentDashboard />
                    </RoleRoute>
                  } />
                  <Route path="agent/lotto-tickets" element={
                    <RoleRoute allowedRoles={['agentuser']}>
                      <AgentLottoTickets />
                    </RoleRoute>
                  } />
                  <Route path="agent/wallet" element={
                    <RoleRoute allowedRoles={['agentuser']}>
                      <AgentWallet />
                    </RoleRoute>
                  } />
                  <Route path="agent/transfers" element={
                    <RoleRoute allowedRoles={['agentuser']}>
                      <AgentTransfers />
                    </RoleRoute>
                  } />
                  <Route path="agent/printer-settings" element={
                    <RoleRoute allowedRoles={['agentuser']}>
                      <AgentPrinterSettings />
                    </RoleRoute>
                  } />
                </Route>
              </Route>

              {/* Routes publiques avec MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/lotto" element={<Lotto />} />
                <Route path="/lotto/results" element={<LottoResults />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/betslip" element={<MobileBetSlip />} />
              </Route>
            </Routes>
          </Router>
        </BetSlipProvider>
      </ConnectionProvider>
    </AuthProvider>
  );
}