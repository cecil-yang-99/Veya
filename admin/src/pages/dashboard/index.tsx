import { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, Statistic } from 'antd';
import {
  AppstoreOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { fetchDashboardSummary } from '../../api/endpoints';
import type { DashboardSummary } from '../../types';

/**
 * Dashboard overview: high-level platform counters loaded from the
 * `/admin/dashboard/summary` endpoint.
 */
export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    void fetchDashboardSummary().then(setSummary);
  }, []);

  if (!summary) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: 320 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Total Users"
            value={summary.users.total}
            prefix={<TeamOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Active Users"
            value={summary.users.active}
            valueStyle={{ color: '#3f8600' }}
            prefix={<TeamOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Pending KYC"
            value={summary.pendingKyc}
            valueStyle={{ color: summary.pendingKyc > 0 ? '#cf1322' : undefined }}
            prefix={<SafetyCertificateOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Connected Wallets"
            value={summary.totalWallets}
            prefix={<WalletOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Enabled Modules"
            value={summary.featureModules.enabled}
            suffix={`/ ${summary.featureModules.total}`}
            prefix={<AppstoreOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic title="Suspended Users" value={summary.users.suspended} />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic title="Banned Users" value={summary.users.banned} />
        </Card>
      </Col>
    </Row>
  );
}
