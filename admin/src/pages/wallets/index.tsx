import { useRef, useState } from 'react';
import {
  type ActionType,
  type ProColumns,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import type { ProDescriptionsItemProps } from '@ant-design/pro-components';
import { Button, Drawer, Popconfirm, Tag, Typography, message } from 'antd';
import { listWallets, unbindWallet } from '../../api/endpoints';
import type { WalletRecord } from '../../types';

/**
 * Admin console: connected wallet list with detail drawer and unbind action.
 */
export default function WalletsPage() {
  const actionRef = useRef<ActionType>(null);
  const [detail, setDetail] = useState<WalletRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDetail = (record: WalletRecord) => {
    setDetail(record);
    setDrawerOpen(true);
  };

  const handleUnbind = async (id: string) => {
    await unbindWallet(id);
    message.success('Wallet unbound');
    setDrawerOpen(false);
    actionRef.current?.reload();
  };

  const columns: ProColumns<WalletRecord>[] = [
    {
      title: 'Address',
      dataIndex: 'address',
      copyable: true,
      width: 260,
      render: (_, record) => (
        <Typography.Text copyable={{ text: record.address }}>
          {record.address.slice(0, 8)}…{record.address.slice(-6)}
        </Typography.Text>
      ),
    },
    {
      title: 'Owner',
      dataIndex: ['user', 'userCode'],
      hideInSearch: true,
      render: (_, record) => record.user?.userCode ?? record.userId.slice(0, 8),
      width: 160,
    },
    {
      title: 'Address keyword',
      dataIndex: 'addressQuery',
      hideInTable: true,
      fieldProps: { placeholder: 'Search by wallet address' },
    },
    {
      title: 'Chain',
      dataIndex: 'chainType',
      hideInSearch: true,
      width: 100,
      render: (_, record) => record.chainType.toUpperCase(),
    },
    {
      title: 'Primary',
      dataIndex: 'isPrimary',
      hideInSearch: true,
      width: 100,
      render: (_, record) =>
        record.isPrimary ? <Tag color="blue">Primary</Tag> : <Tag>Secondary</Tag>,
    },
    {
      title: 'Last Connected',
      dataIndex: 'lastConnectedAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 170,
    },
    {
      title: 'Connected Since',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 170,
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 140,
      render: (_, record) => [
        <a key="view" onClick={() => openDetail(record)}>
          View
        </a>,
        <Popconfirm
          key="unbind"
          title="Unbind this wallet?"
          description="The user will need to reconnect it to regain access."
          onConfirm={() => void handleUnbind(record.id)}
        >
          <a style={{ color: '#cf1322' }}>Unbind</a>
        </Popconfirm>,
      ],
    },
  ];

  const detailColumns: ProDescriptionsItemProps<WalletRecord>[] = [
    { title: 'Address', dataIndex: 'address', copyable: true },
    { title: 'Chain', dataIndex: 'chainType' },
    { title: 'Chain ID', dataIndex: 'chainId' },
    { title: 'Primary', dataIndex: 'isPrimary' },
    { title: 'Label', dataIndex: 'label' },
    { title: 'Last Connected', dataIndex: 'lastConnectedAt', valueType: 'dateTime' },
    { title: 'Created', dataIndex: 'createdAt', valueType: 'dateTime' },
  ];

  return (
    <>
      <ProTable<WalletRecord>
        headerTitle="Connected Wallets"
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        pagination={{ pageSize: 20 }}
        request={async (params) => {
          const data = await listWallets({
            page: params.current,
            pageSize: params.pageSize,
            // Backend filter key is `address`; the search field is namespaced
            // to avoid being rendered as a column value.
            address: params.addressQuery as string | undefined,
          });
          return { data: data.items, total: data.total, success: true };
        }}
      />

      <Drawer
        title="Wallet Detail"
        width={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          detail ? (
            <Popconfirm
              title="Unbind this wallet?"
              onConfirm={() => void handleUnbind(detail.id)}
            >
              <Button danger>Unbind Wallet</Button>
            </Popconfirm>
          ) : null
        }
      >
        {detail && (
          <ProDescriptions<WalletRecord>
            column={1}
            dataSource={detail}
            columns={detailColumns}
          />
        )}
      </Drawer>
    </>
  );
}
