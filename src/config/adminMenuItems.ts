import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Trophy, 
  Calendar, 
  DollarSign, 
  Wallet, 
  History, 
  UserCog,
  ToggleRight,
  Percent,
  ClipboardList,
  Ban,
  Calculator,
  CreditCard
} from 'lucide-react';

export const adminMenuItems = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    path: '/dashboard/admin' 
  },
  { 
    icon: Trophy, 
    label: 'Paris',
    submenu: [
      { 
        icon: Trophy, 
        label: 'Liste des lottos', 
        path: '/dashboard/admin/lottos' 
      },
      { 
        icon: Calendar, 
        label: 'Créer un lotto', 
        path: '/dashboard/admin/setup-lotto' 
      },
      { 
        icon: Trophy, 
        label: 'Tirages', 
        path: '/dashboard/admin/lotto-draws' 
      },
      { 
        icon: ClipboardList, 
        label: 'Historique Approbations', 
        path: '/dashboard/admin/approval-history' 
      },
      { 
        icon: Ban, 
        label: 'Frais d\'annulation', 
        path: '/dashboard/admin/cancellation-fee' 
      }
    ]
  },
  { 
    icon: DollarSign, 
    label: 'Finances',
    submenu: [
      { 
        icon: Wallet, 
        label: 'Portefeuilles Agents', 
        path: '/dashboard/admin/agent-wallets' 
      },
      { 
        icon: Wallet, 
        label: 'Portefeuilles Staff', 
        path: '/dashboard/admin/staff-wallets' 
      },
      { 
        icon: History, 
        label: 'Historique Crédits', 
        path: '/dashboard/admin/wallet-history' 
      },
      { 
        icon: CreditCard, 
        label: 'Limites de paiement', 
        path: '/dashboard/admin/payment-limits' 
      },
      { 
        icon: Percent, 
        label: 'Commissions', 
        path: '/dashboard/admin/commission-config' 
      },
      { 
        icon: Percent, 
        label: 'Conversions Staff', 
        path: '/dashboard/admin/staff-commission-config' 
      }
    ]
  },
  { 
    icon: UserCog, 
    label: 'Utilisateurs',
    submenu: [
      {
        icon: Users,
        label: 'Gestion Utilisateurs',
        path: '/dashboard/admin/users'
      },
      {
        icon: ToggleRight,
        label: 'Accès Tirages',
        path: '/dashboard/admin/manager-draw-access'
      },
      {
        icon: ToggleRight,
        label: 'Accès Approbations',
        path: '/dashboard/admin/manager-approval-access'
      },
      {
        icon: ToggleRight,
        label: 'Création Staff',
        path: '/dashboard/admin/manager-staff-creation-access'
      },
      {
        icon: DollarSign,
        label: 'Paiement Staff',
        path: '/dashboard/admin/staff-payment-permission'
      }
    ]
  }
];