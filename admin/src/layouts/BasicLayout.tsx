import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ProLayout, type MenuDataItem } from '@ant-design/pro-components';
import {
  AppstoreOutlined,
  DashboardOutlined,
  FileSearchOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Dropdown, Spin } from 'antd';
import type { ReactNode } from 'react';
import { useAuthStore } from '../store/auth';
import { listFeatureModules } from '../api/endpoints';
import VeyaLogo from '../components/VeyaLogo';
import { VEYA_PALETTE } from '../theme';

/** Sidebar definition. Feature-gated entries carry a `featureCode`. */
interface MenuEntry {
  path: string;
  name: string;
  icon: ReactNode;
  featureCode?: string;
  superAdminOnly?: boolean;
}

const MENU_ENTRIES: MenuEntry[] = [
  { path: '/', name: 'Dashboard', icon: <DashboardOutlined /> },
  { path: '/users', name: 'User Management', icon: <TeamOutlined />, featureCode: 'users' },
  { path: '/wallets', name: 'Wallets', icon: <WalletOutlined />, featureCode: 'wallets' },
  { path: '/kyc', name: 'KYC Review', icon: <SafetyCertificateOutlined />, featureCode: 'kyc' },
  { path: '/modules', name: 'Feature Modules', icon: <AppstoreOutlined /> },
  { path: '/admins', name: 'Administrators', icon: <KeyOutlined />, superAdminOnly: true },
  // The Audit Log entry is intentionally always present — never feature-gated.
  { path: '/audit-logs', name: 'Audit Log', icon: <FileSearchOutlined /> },
];

/**
 * Console shell. Renders the ProLayout sidebar and filters menu entries by
 * (1) administrator role and (2) enabled feature modules. The Audit Log
 * entry is always rendered regardless of module toggles.
 */
export default function BasicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = useAuthStore((state) => state.admin);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [disabledModules, setDisabledModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listFeatureModules()
      .then((modules) => {
        if (cancelled) return;
        setDisabledModules(
          new Set(modules.filter((m) => !m.isEnabled).map((m) => m.code)),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const menuData = useMemo<MenuDataItem[]>(() => {
    return MENU_ENTRIES
      // Role-based filtering.
      .filter((entry) => !entry.superAdminOnly || admin?.role === 'super_admin')
      // Feature-module filtering.
      .filter((entry) => !entry.featureCode || !disabledModules.has(entry.featureCode))
      .map((entry) => ({
        path: entry.path,
        name: entry.name,
        icon: entry.icon,
      }));
  }, [admin, disabledModules]);

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ProLayout
      title="Veya Admin"
      logo={<VeyaLogo size={30} />}
      layout="mix"
      fixedHeader
      location={{ pathname: location.pathname }}
      menuDataRender={() => menuData}
      menuItemRender={(item, dom) => (
        <Link to={item.path ?? '/'}>{dom}</Link>
      )}
      token={{
        header: {
          colorBgHeader: '#ffffff',
        },
        sider: {
          colorMenuBackground: VEYA_PALETTE.ink,
          colorTextMenu: 'rgba(255, 255, 255, 0.65)',
          colorTextMenuActive: '#ffffff',
          colorTextMenuSelected: '#ffffff',
          colorBgMenuItemSelected: 'rgba(106, 92, 255, 0.45)',
          colorTextMenuItemHover: '#ffffff',
        },
      }}
      avatarProps={{
        title: admin?.username ?? 'admin',
        size: 'small',
        render: (_, dom) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  label: 'Log out',
                  onClick: () => {
                    clearAuth();
                    navigate('/login', { replace: true });
                  },
                },
              ],
            }}
          >
            {dom}
          </Dropdown>
        ),
      }}
    >
      <Outlet />
    </ProLayout>
  );
}
