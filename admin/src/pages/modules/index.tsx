import { useEffect, useState } from 'react';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { Badge, Space, Switch, Tag, Typography, message } from 'antd';
import {
  listFeatureModules,
  toggleFeatureModule,
} from '../../api/endpoints';
import type { FeatureModuleRecord } from '../../types';

/**
 * Admin console: platform feature-module registry. Each module can be
 * enabled or disabled; the change is audited backend-side and drives menu
 * visibility in this console (the Audit Log menu is never gated).
 */
export default function ModulesPage() {
  const [modules, setModules] = useState<FeatureModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setModules(await listFeatureModules());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleToggle = async (record: FeatureModuleRecord, isEnabled: boolean) => {
    const updated = await toggleFeatureModule(record.id, isEnabled);
    setModules((prev) =>
      prev.map((item) => (item.id === record.id ? updated : item)),
    );
    message.success(`"${record.name}" is now ${isEnabled ? 'enabled' : 'disabled'}`);
  };

  const columns: ProColumns<FeatureModuleRecord>[] = [
    {
      title: 'Module',
      dataIndex: 'name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.name}</Typography.Text>
          <Typography.Text type="secondary">{record.code}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      width: 130,
      render: (_, record) =>
        record.category ? <Tag>{record.category}</Tag> : null,
    },
    { title: 'Description', dataIndex: 'description', hideInSearch: true },
    {
      title: 'System',
      dataIndex: 'isSystem',
      width: 100,
      hideInSearch: true,
      render: (_, record) => (record.isSystem ? <Tag color="geekblue">System</Tag> : null),
    },
    {
      title: 'Status',
      dataIndex: 'isEnabled',
      width: 120,
      hideInSearch: true,
      render: (_, record) => (
        <Badge
          status={record.isEnabled ? 'success' : 'default'}
          text={record.isEnabled ? 'Enabled' : 'Disabled'}
        />
      ),
    },
    {
      title: 'Enabled',
      width: 100,
      hideInSearch: true,
      render: (_, record) => (
        <Switch
          checked={record.isEnabled}
          onChange={(checked) => void handleToggle(record, checked)}
        />
      ),
    },
  ];

  return (
    <ProTable<FeatureModuleRecord>
      headerTitle="Feature Modules"
      rowKey="id"
      loading={loading}
      columns={columns}
      dataSource={modules}
      search={false}
      pagination={false}
    />
  );
}
