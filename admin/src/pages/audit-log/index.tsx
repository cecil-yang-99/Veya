import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Tag, Typography } from 'antd';
import { listAuditLogs } from '../../api/endpoints';
import type { AuditLogRecord } from '../../types';

const STATUS_COLOR = (statusCode: number | null) => {
  if (!statusCode) return 'default';
  if (statusCode < 300) return 'success';
  if (statusCode < 500) return 'warning';
  return 'error';
};

/**
 * Admin console: read-only audit trail. This page — and its sidebar entry —
 * are intentionally never feature-gated so administrators always retain
 * access to the audit log.
 */
export default function AuditLogPage() {
  const columns: ProColumns<AuditLogRecord>[] = [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 170,
    },
    { title: 'Actor', dataIndex: 'actorName', width: 160 },
    {
      title: 'Action keyword',
      dataIndex: 'action',
      render: (_, record) => <Typography.Text copyable>{record.action}</Typography.Text>,
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      hideInSearch: true,
      width: 150,
    },
    {
      title: 'Resource ID',
      dataIndex: 'resourceId',
      hideInSearch: true,
      width: 140,
      render: (_, record) =>
        record.resourceId ? (
          <Typography.Text copyable={{ text: record.resourceId }}>
            {record.resourceId.slice(0, 8)}
          </Typography.Text>
        ) : (
          '-'
        ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      hideInSearch: true,
      width: 90,
    },
    {
      title: 'Status',
      dataIndex: 'statusCode',
      hideInSearch: true,
      width: 90,
      render: (_, record) => (
        <Tag color={STATUS_COLOR(record.statusCode)}>{record.statusCode ?? '-'}</Tag>
      ),
    },
    { title: 'IP', dataIndex: 'ip', hideInSearch: true, width: 130 },
    {
      title: 'Path',
      dataIndex: 'path',
      hideInSearch: true,
      ellipsis: true,
    },
  ];

  return (
    <ProTable<AuditLogRecord>
      headerTitle="Audit Log"
      rowKey="id"
      columns={columns}
      pagination={{ pageSize: 20 }}
      search={false}
      // The audit table is append-only and read-only in the console.
      toolBarRender={false}
      request={async (params) => {
        const data = await listAuditLogs({
          page: params.current,
          pageSize: params.pageSize,
          action: params.action as string | undefined,
        });
        return { data: data.items, total: data.total, success: true };
      }}
      expandable={{
        expandedRowRender: (record) => (
          <div style={{ padding: '8px 16px' }}>
            <div>
              <strong>Path:</strong> {record.path}
            </div>
            <div>
              <strong>User agent:</strong> {record.userAgent ?? '-'}
            </div>
            <div>
              <strong>Metadata:</strong>{' '}
              <Typography.Text code>
                {record.metadata ? JSON.stringify(record.metadata, null, 2) : '-'}
              </Typography.Text>
            </div>
          </div>
        ),
        rowExpandable: (record) => Boolean(record.metadata || record.userAgent),
      }}
    />
  );
}
