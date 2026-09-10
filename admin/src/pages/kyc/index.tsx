import { useRef, useState } from 'react';
import {
  type ActionType,
  type ProColumns,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import {
  Alert,
  Badge,
  Button,
  Drawer,
  Form,
  Input,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  approveKyc,
  getKycSubmission,
  listKycSubmissions,
  rejectKyc,
} from '../../api/endpoints';
import type { KycSubmissionRecord } from '../../types';

const STATUS_BADGE: Record<KycSubmissionRecord['status'], 'processing' | 'success' | 'error'> = {
  pending: 'processing',
  approved: 'success',
  rejected: 'error',
};

/**
 * Admin console: KYC review queue. Pending submissions can be approved or
 * rejected (rejection requires a reason). Uploaded documents are opened via
 * the /uploads static route.
 */
export default function KycPage() {
  const actionRef = useRef<ActionType>(null);
  const [current, setCurrent] = useState<KycSubmissionRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectForm] = Form.useForm<{ reason: string }>();

  const openReview = async (id: string) => {
    const data = await getKycSubmission(id);
    setCurrent(data);
    setRejecting(false);
    rejectForm.resetFields();
    setDrawerOpen(true);
  };

  const handleApprove = async (id: string) => {
    await approveKyc(id);
    message.success('KYC submission approved');
    setDrawerOpen(false);
    actionRef.current?.reload();
  };

  const handleReject = async (id: string) => {
    const values = await rejectForm.validateFields();
    await rejectKyc(id, values.reason);
    message.success('KYC submission rejected');
    setDrawerOpen(false);
    actionRef.current?.reload();
  };

  const columns: ProColumns<KycSubmissionRecord>[] = [
    {
      title: 'User',
      dataIndex: ['user', 'userCode'],
      hideInSearch: true,
      render: (_, record) => record.user?.userCode ?? record.userId.slice(0, 8),
      width: 160,
    },
    {
      title: 'Keyword',
      dataIndex: 'search',
      hideInTable: true,
      fieldProps: { placeholder: 'User code / full name' },
    },
    { title: 'Full Name', dataIndex: 'fullName', hideInSearch: true },
    {
      title: 'Level',
      dataIndex: 'level',
      hideInSearch: true,
      width: 90,
      render: (_, record) => <Tag color="purple">Lv.{record.level}</Tag>,
    },
    {
      title: 'Document',
      dataIndex: 'documentType',
      hideInSearch: true,
      width: 130,
    },
    { title: 'Country', dataIndex: 'country', hideInSearch: true, width: 100 },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 130,
      initialValue: 'pending',
      valueType: 'select',
      valueEnum: {
        pending: { text: 'Pending' },
        approved: { text: 'Approved' },
        rejected: { text: 'Rejected' },
      },
      render: (_, record) => (
        <Badge status={STATUS_BADGE[record.status]} text={record.status} />
      ),
    },
    {
      title: 'Submitted',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 170,
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <a key="review" onClick={() => void openReview(record.id)}>
          Review
        </a>,
      ],
    },
  ];

  return (
    <>
      <ProTable<KycSubmissionRecord>
        headerTitle="KYC Submissions"
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        pagination={{ pageSize: 20 }}
        request={async (params) => {
          const data = await listKycSubmissions({
            page: params.current,
            pageSize: params.pageSize,
            status: params.status as string | undefined,
            search: params.search as string | undefined,
          });
          return { data: data.items, total: data.total, success: true };
        }}
      />

      <Drawer
        title="KYC Review"
        width={620}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          current?.status === 'pending' ? (
            <Space>
              <Button onClick={() => setRejecting(true)} danger>
                Reject
              </Button>
              <Button type="primary" onClick={() => void handleApprove(current.id)}>
                Approve
              </Button>
            </Space>
          ) : null
        }
      >
        {current && (
          <>
            <ProDescriptions column={2} dataSource={current} bordered>
              <ProDescriptions.Item label="User">
                {current.user?.userCode ?? current.userId}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="Status">
                <Badge status={STATUS_BADGE[current.status]} text={current.status} />
              </ProDescriptions.Item>
              <ProDescriptions.Item label="Level">Lv.{current.level}</ProDescriptions.Item>
              <ProDescriptions.Item label="Document Type">
                {current.documentType}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="Full Name">
                {current.fullName}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="Country">
                {current.country}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="Date of Birth">
                {current.dateOfBirth}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="Document Number">
                {current.documentNumber}
              </ProDescriptions.Item>
              {current.rejectReason && (
                <ProDescriptions.Item label="Reject Reason" span={2}>
                  <Alert type="error" showIcon message={current.rejectReason} />
                </ProDescriptions.Item>
              )}
            </ProDescriptions>

            <Typography.Title level={5} style={{ marginTop: 24 }}>
              Supporting Documents
            </Typography.Title>
            <Space wrap>
              {current.documentFiles.length === 0 && (
                <Typography.Text type="secondary">No files attached</Typography.Text>
              )}
              {current.documentFiles.map((file) => (
                <a key={file} href={file} target="_blank" rel="noreferrer">
                  {file.split('/').pop()}
                </a>
              ))}
            </Space>

            {rejecting && (
              <Form form={rejectForm} layout="vertical" style={{ marginTop: 24 }}>
                <Form.Item
                  name="reason"
                  label="Rejection reason"
                  rules={[
                    { required: true, min: 5, message: 'A reason of at least 5 characters is required' },
                  ]}
                >
                  <Input.TextArea rows={4} placeholder="Explain why this submission is rejected" />
                </Form.Item>
                <Button danger type="primary" onClick={() => void handleReject(current.id)}>
                  Confirm rejection
                </Button>
              </Form>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}
