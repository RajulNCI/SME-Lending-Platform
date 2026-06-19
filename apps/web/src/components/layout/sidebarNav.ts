export type NavItem = {
  icon: string;
  text: string;
  to: string;
  badge?: boolean;
  end?: boolean;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const NAV: Record<string, NavSection[]> = {
  CREDIT_OFFICER: [
    {
      label: 'Platform',
      items: [
        { icon: '↑', text: 'Intake Pipeline', to: '/intake' },
        { icon: '☰', text: 'Queue', to: '/queue', badge: true },
        { icon: '◧', text: 'Audit Trail', to: '/audit' },
      ],
    },
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
  SENIOR_CREDIT_OFFICER: [
    {
      label: 'Platform',
      items: [
        { icon: '↑', text: 'Intake Pipeline', to: '/intake' },
        { icon: '☰', text: 'Queue', to: '/queue', badge: true },
        { icon: '◧', text: 'Audit Trail', to: '/audit' },
      ],
    },
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
  RISK_ANALYST: [
    {
      label: 'Platform',
      items: [
        { icon: '▦', text: 'Dashboard', to: '/dashboard' },
        { icon: '◉', text: 'Model monitoring', to: '/risk/models' },
        { icon: '∿', text: 'Stress testing', to: '/risk/stress' },
      ],
    },
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
  COMPLIANCE_OFFICER: [
    {
      label: 'Platform',
      items: [
        { icon: '◧', text: 'Audit Trail', to: '/audit' },
        { icon: '⊕', text: 'CCR / AnaCredit', to: '/ccr' },
      ],
    },
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
  BRANCH_MANAGER: [
    {
      label: 'Operations',
      items: [
        { icon: '▦', text: 'Dashboard', to: '/dashboard' },
        { icon: '⇄', text: 'SEPA payments', to: '/payments' },
      ],
    },
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
  ADMIN: [
    {
      label: 'Administration',
      items: [
        { icon: '⊛', text: 'User management', to: '/admin/users' },
        { icon: '⊗', text: 'DORA resilience', to: '/admin/dora' },
        { icon: '☰', text: 'Queue', to: '/queue', badge: true },
        { icon: '◧', text: 'Audit Trail', to: '/audit' },
      ],
    },
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
  AUDITOR: [
    {
      label: 'Platform',
      items: [{ icon: '◧', text: 'Audit Trail', to: '/audit' }],
    },
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
  BORROWER: [
    {
      label: 'My Applications',
      items: [
        { icon: '+', text: 'New application', to: '/borrower/apply' },
        { icon: '☰', text: 'My applications', to: '/borrower', end: true },
        { icon: '✉', text: 'Messages', to: '/borrower/messages' },
      ],
    },
    { label: 'My Account', items: [{ icon: '⚙', text: 'Settings', to: '/settings' }] },
  ],
};
