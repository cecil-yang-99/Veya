import { useRef, useState } from 'react';
import {
  type ActionType,
  type ProColumns,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Drawer,
  Dropdown,
  message,
  Space,
  Tag,
  Typography,
} from 'antd';
import type { ProDescriptionsItemProps } from '@ant-design/pro-components';
import { listUsers, getUser, setUserStatus } from '../../api/endpoints';
import type { UserDetail, UserRecord } from '../../types';

const STATUS_COLOR: Record<UserRecord['status'], string> = {
  active: 'green',
  suspended: 'orange',
  banned: 'red',
};

const KYC_STATUS_COLOR: Record<UserRecord['kycStatus'], string> = {
  none: 'default',
  pending: 'processing',
  approved: 'success',
  rejected: 'error',
};

/**
 * Admin console: platform user list with detail drawer and account status
 * management (activate / suspend / ban).
 */
export default function UsersPage() {
  const actionRef = useRef<ActionType>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDetail = async (id: string) => {
    const data = await getUser(id);
    setDetail(data);
    setDrawerOpen(true);
  };

  const changeStatus = async (id: string, status: UserRecord['status']) => {
    await setUserStatus(id, status);
    message.success('User status updated');
    actionRef.current?.reload();
    if (detail?.id === id) {
      void openDetail(id);
    }
  };

  const columns: ProColumns<UserRecord>[] = [
    { title: 'User Code', dataIndex: 'userCode', copyable: true, width: 140 },
    { title: 'Nickname', dataIndex: 'nickname', hideInSearch: true },
    {
      title: 'Keyword',
      dataIndex: 'search',
      hideInTable: true,
      fieldProps: { placeholder: 'Code / nickname / email' },
    },
    { title: 'Email', dataIndex: 'email', hideInSearch: true, width: 220 },
    {
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        active: { text: 'Active' },
        suspended: { text: 'Suspended' },
        banned: { text: 'Banned' },
      },
      render: (_, record) => (
        <Tag color={STATUS_COLOR[record.status]}>{record.status}</Tag>
      ),
      width: 120,
    },
    {
      title: 'KYC',
      dataIndex: 'kycStatus',
      valueType: 'select',
      valueEnum: {
        none: { text: 'None' },
        pending: { text: 'Pending' },
        approved: { text: 'Approved' },
        rejected: { text: 'Rejected' },
      },
      render: (_, record) => (
        <Space>
          <Badge status={KYC_STATUS_BADGE[record.kycStatus]} text={record.kycStatus} />
          <Tag>Lv.{record.kycLevel}</Tag>
        </Space>
      ),
      width: 160,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 170,
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 180,
      render: (_, record) => [
        <a key="view" onClick={() => void openDetail(record.id)}>
          View
        </a>,
        <Dropdown
          key="status"
          menu={{
            items: [
              { key: 'active', label: 'Activate', disabled: record.status === 'active' },
              { key: 'suspended', label: 'Suspend', disabled: record.status === 'suspended' },
              { key: 'banned', label: 'Ban', disabled: record.status === 'banned' },
            ],
            onClick: ({ key }) =>
              void changeStatus(record.id, key as UserRecord['status']),
          }}
        >
          <a>Status</a>
        </Dropdown>,
      ],
    },
  ];

  const detailColumns: ProDescriptionsItemProps<UserDetail>[] = [
    { title: 'User Code', dataIndex: 'userCode' },
    { title: 'Nickname', dataIndex: 'nickname' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Status', dataIndex: 'status' },
    { title: 'KYC Level', dataIndex: 'kycLevel' },
    { title: 'KYC Status', dataIndex: 'kycStatus' },
    { title: 'Last Login', dataIndex: 'lastLoginAt', valueType: 'dateTime' },
    { title: 'Created', dataIndex: 'createdAt', valueType: 'dateTime' },
  ];

  return (
    <>
      <ProTable<UserRecord>
        headerTitle="Platform Users"
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        pagination={{ pageSize: 20 }}
        request={async (params) => {
          const data = await listUsers({
            page: params.current,
            pageSize: params.pageSize,
            status: params.status as string | undefined,
            kycStatus: params.kycStatus as string | undefined,
            search: params.search as string | undefined,
          });
          return { data: data.items, total: data.total, success: true };
        }}
      />

      <Drawer
        title="User Detail"
        width={640}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {detail && (
          <>
            <ProDescriptions<UserDetail>
              column={2}
              dataSource={detail}
              columns={detailColumns}
            />
            <Typography.Title level={5} style={{ marginTop: 24 }}>
              Wallets ({detail.wallets.length})
            </Typography.Title>
            {detail.wallets.map((wallet) => (
              <Space key={wallet.id} style={{ display: 'flex', marginBottom: 8 }}>
                <Tag color={wallet.isPrimary ? 'blue' : 'default'}>
                  {wallet.isPrimary ? 'Primary' : 'Secondary'}
                </Tag>
                <Typography.Text copyable>{wallet.address}</Typography.Text>
              </Space>
            ))}
            {detail.latestKyc && (
              <>
                <Typography.Title level={5} style={{ marginTop: 24 }}>
                  Latest KYC Submission
                </Typography.Title>
                <ProDescriptions
                  column={2}
                  dataSource={detail.latestKyc}
                  columns={[
                    { title: 'Level', dataIndex: 'level' },
                    { title: 'Status', dataIndex: 'status' },
                    { title: 'Full Name', dataIndex: 'fullName' },
                    { title: 'Country', dataIndex: 'country' },
                  ]}
                />
              </>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}

// Badge mapping kept separate so the table render block stays compact.
const KYC_STATUS_BADGE: Record<UserRecord['kycStatus'], 'default' | 'processing' | 'success' | 'error'> = {
  none: 'default',
  pending: 'processing',
  approved: 'success',
  rejected: 'error',
};
