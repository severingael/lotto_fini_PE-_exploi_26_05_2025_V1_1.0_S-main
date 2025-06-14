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
import PaymentLimitExceeded from './pages/lotto/PaymentLimitExceeded';

// Admin Pages
import AdminDashboard from './pages/dashboards/admin/AdminDashboard';
import LottoManagement from './pages/dashboards/admin/LottoManagement';
import SetupLotto from './pages/dashboards/admin/SetupLotto';
import LottoDraws from './pages/dashboards/admin/LottoDraws';
import AgentWalletManagement from './pages/dashboards/admin/AgentWalletManagement';
import StaffWalletManagement from './pages/dashboards/admin/StaffWalletManagement';
import WalletCreditHistory from './pages/dashboards/admin/WalletCreditHistory';
import UserManagement from './pages/dashboards/admin/UserManagement';
import AgentCommissionConfig from './pages/dashboards/admin/AgentCommissionConfig';
import StaffCommissionConfig from './pages/dashboards/admin/StaffCommissionConfig';
import ManagerDrawAccess from './pages/dashboards/admin/ManagerDrawAccess';
import ManagerApprovalAccess from './pages/dashboards/admin/ManagerApprovalAccess';
import ManagerStaffCreationAccess from './pages/dashboards/admin/ManagerStaffCreationAccess';
import PaymentLimits from './pages/dashboards/admin/PaymentLimits';
import ApprovalHistory from './pages/dashboards/admin/ApprovalHistory';
import CancellationFeeConfig from './pages/dashboards/admin/CancellationFeeConfig';
import AdminStaffPaymentPermission from './pages/dashboards/admin/StaffPaymentPermission';

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
import StaffPaidTicketSearch from './pages/dashboards/staff/PaidTicketSearch';

// Manager Pages
import ManagerDashboard from './pages/dashboards/manager/ManagerDashboard';
import ManagerUserManagement from './pages/dashboards/manager/UserManagement';
import CreateUser from './pages/dashboards/manager/CreateUser';
import CreateStaff from './pages/dashboards/manager/CreateStaff';
import PerformanceReports from './pages/dashboards/manager/PerformanceReports';
import ManagerSettings from './pages/dashboards/manager/ManagerSettings';
import ManagerLottoDraws from './pages/dashboards/manager/LottoDraws';
import LottoApprovals from './pages/dashboards/manager/LottoApprovals';
import PaidTickets from './pages/dashboards/manager/PaidTickets';
import ManagerAgentWalletManagement from './pages/dashboards/manager/AgentWalletManagement';
import ManagerStaffWalletManagement from './pages/dashboards/manager/StaffWalletManagement';
import ManagerAgentCommissionConfig from './pages/dashboards/manager/AgentCommissionConfig';
import ManagerLottoManagement from './pages/dashboards/manager/LottoManagement';
import CreditHistory from './pages/dashboards/manager/CreditHistory';
import ManagerApprovalHistory from './pages/dashboards/manager/ApprovalHistory';
import TicketAnalysis from './pages/dashboards/manager/TicketAnalysis';
import ManagerStaffPaymentPermission from './pages/dashboards/manager/StaffPaymentPermission';
import ManagerPaidTicketSearch from './pages/dashboards/manager/PaidTicketSearch';

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
              <Route path="/payment-limit-exceeded" element={<PaymentLimitExceeded />} />

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
                  <Route path="admin/payment-limits" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <PaymentLimits />
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
                  <Route path="admin/manager-draw-access" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <ManagerDrawAccess />
                    </RoleRoute>
                  } />
                  <Route path="admin/manager-approval-access" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <ManagerApprovalAccess />
                    </RoleRoute>
                  } />
                  <Route path="admin/manager-staff-creation-access" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <ManagerStaffCreationAccess />
                    </RoleRoute>
                  } />
                  <Route path="admin/staff-payment-permission" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <AdminStaffPaymentPermission />
                    </RoleRoute>
                  } />
                  <Route path="admin/approval-history" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <ApprovalHistory />
                    </RoleRoute>
                  } />
                  <Route path="admin/cancellation-fee" element={
                    <RoleRoute allowedRoles={['adminuser']}>
                      <CancellationFeeConfig />
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
                  <Route path="staff/paid-ticket-search" element={
                    <RoleRoute allowedRoles={['staffuser']}>
                      <StaffPaidTicketSearch />
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
                  <Route path="manager/users/create" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <CreateUser />
                    </RoleRoute>
                  } />
                  <Route path="manager/create-staff" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <CreateStaff />
                    </RoleRoute>
                  } />
                  <Route path="manager/staff-payment-permission" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <ManagerStaffPaymentPermission />
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
                  <Route path="manager/lotto-management" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <ManagerLottoManagement />
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
                  <Route path="manager/approval-history" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <ManagerApprovalHistory />
                    </RoleRoute>
                  } />
                  <Route path="manager/paid-tickets" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <PaidTickets />
                    </RoleRoute>
                  } />
                  <Route path="manager/paid-ticket-search" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <ManagerPaidTicketSearch />
                    </RoleRoute>
                  } />
                  <Route path="manager/ticket-analysis" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <TicketAnalysis />
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
                  <Route path="manager/agent-commission-config" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <ManagerAgentCommissionConfig />
                    </RoleRoute>
                  } />
                  <Route path="manager/credit-history" element={
                    <RoleRoute allowedRoles={['manageruser']}>
                      <CreditHistory />
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