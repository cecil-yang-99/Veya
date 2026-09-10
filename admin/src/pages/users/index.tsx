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
  Empty,
  Statistic,
  message,
  Space,
  Table,
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

const TRANSACTION_STATUS_COLOR = {
  pending: 'processing',
  success: 'success',
  failed: 'error',
} as const;

function formatUsd(value: string | number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatToken(value: string | number, symbol: string): string {
  return `${Number(value).toLocaleString('en-US', {
    maximumFractionDigits: 8,
  })} ${symbol}`;
}

function userAssetTotal(detail: UserDetail): number {
  return detail.assets.reduce(
    (sum, asset) => sum + Number(asset.estimatedUsdValue),
    0,
  );
}

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
        width={880}
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
            <Statistic
              title="Sandbox Portfolio Value"
              value={userAssetTotal(detail)}
              precision={2}
              prefix="$"
              style={{ marginTop: 16 }}
            />
            <Typography.Title level={5} style={{ marginTop: 24 }}>
              Wallets ({detail.wallets.length})
            </Typography.Title>
            {detail.wallets.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No wallets" />
            ) : (
              <Table
                size="small"
                rowKey="id"
                pagination={false}
                dataSource={detail.wallets}
                columns={[
                  {
                    title: 'Address',
                    dataIndex: 'address',
                    render: (address: string) => (
                      <Typography.Text copyable>{address}</Typography.Text>
                    ),
                  },
                  {
                    title: 'Label',
                    dataIndex: 'label',
                    render: (label: string | null) => label ?? '-',
                  },
                  {
                    title: 'Chain',
                    render: (_, wallet) => `${wallet.chainType} / ${wallet.chainId ?? '-'}`,
                  },
                  {
                    title: 'Type',
                    render: (_, wallet) => (
                      <Tag color={wallet.isPrimary ? 'blue' : 'default'}>
                        {wallet.isPrimary ? 'Primary' : 'Secondary'}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Last Connected',
                    dataIndex: 'lastConnectedAt',
                    render: (value: string | null) =>
                      value ? new Date(value).toLocaleString() : '-',
                  },
                ]}
              />
            )}

            <Typography.Title level={5} style={{ marginTop: 24 }}>
              Assets ({detail.assets.length})
            </Typography.Title>
            {detail.assets.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No assets" />
            ) : (
              <Table
                size="small"
                rowKey="id"
                pagination={false}
                dataSource={detail.assets}
                columns={[
                  {
                    title: 'Token',
                    render: (_, asset) => (
                      <Space>
                        <Tag>{asset.token.symbol}</Tag>
                        <span>{asset.token.name}</span>
                      </Space>
                    ),
                  },
                  {
                    title: 'Available',
                    render: (_, asset) =>
                      formatToken(asset.available, asset.token.symbol),
                  },
                  {
                    title: 'Frozen',
                    render: (_, asset) => formatToken(asset.frozen, asset.token.symbol),
                  },
                  {
                    title: 'Est. Value',
                    dataIndex: 'estimatedUsdValue',
                    render: (value: string) => formatUsd(value),
                  },
                  { title: 'Source', dataIndex: 'source' },
                ]}
              />
            )}

            <Typography.Title level={5} style={{ marginTop: 24 }}>
              KYC Submissions ({detail.kycSubmissions.length})
            </Typography.Title>
            {detail.kycSubmissions.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No KYC submissions" />
            ) : (
              <Table
                size="small"
                rowKey="id"
                pagination={false}
                dataSource={detail.kycSubmissions}
                columns={[
                  { title: 'Full Name', dataIndex: 'fullName' },
                  { title: 'Level', dataIndex: 'level', width: 80 },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    render: (status: UserRecord['kycStatus']) => (
                      <Badge status={KYC_STATUS_BADGE[status]} text={status} />
                    ),
                  },
                  { title: 'Document', dataIndex: 'documentType' },
                  { title: 'Country', dataIndex: 'country', width: 90 },
                  {
                    title: 'Submitted',
                    dataIndex: 'createdAt',
                    render: (value: string) => new Date(value).toLocaleString(),
                  },
                ]}
              />
            )}

            <Typography.Title level={5} style={{ marginTop: 24 }}>
              Recent Transactions ({detail.transactions.length})
            </Typography.Title>
            {detail.transactions.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No transactions" />
            ) : (
              <Table
                size="small"
                rowKey="id"
                pagination={{ pageSize: 10, hideOnSinglePage: true }}
                dataSource={detail.transactions}
                columns={[
                  { title: 'Type', dataIndex: 'type' },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    render: (status: keyof typeof TRANSACTION_STATUS_COLOR) => (
                      <Badge status={TRANSACTION_STATUS_COLOR[status]} text={status} />
                    ),
                  },
                  {
                    title: 'Amount',
                    render: (_, transaction) => {
                      const token = transaction.toToken ?? transaction.fromToken;
                      const amount =
                        transaction.toAmount ?? transaction.fromAmount ?? '0';
                      return token ? formatToken(amount, token.symbol) : '-';
                    },
                  },
                  {
                    title: 'USD Value',
                    dataIndex: 'usdValue',
                    render: (value: string) => formatUsd(value),
                  },
                  { title: 'Network', dataIndex: 'network' },
                  {
                    title: 'Created',
                    dataIndex: 'createdAt',
                    render: (value: string) => new Date(value).toLocaleString(),
                  },
                ]}
              />
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
