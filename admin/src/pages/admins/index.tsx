import { useRef, useState } from 'react';
import {
  type ActionType,
  ModalForm,
  type ProColumns,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  createAdmin,
  listAdmins,
  resetAdminPassword,
  setAdminStatus,
  updateAdmin,
} from '../../api/endpoints';
import type { AdminUserRecord } from '../../types';
import { useAuthStore } from '../../store/auth';

const ROLE_COLOR: Record<AdminUserRecord['role'], string> = {
  super_admin: 'red',
  admin: 'blue',
  compliance: 'green',
};

/**
 * Admin console: administrator account management (super admin only).
 * Supports creating accounts, changing roles/emails, enabling/disabling
 * accounts, and resetting passwords.
 */
export default function AdminsPage() {
  const actionRef = useRef<ActionType>(null);
  const currentAdmin = useAuthStore((state) => state.admin);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUserRecord | null>(null);

  const handleSetStatus = async (record: AdminUserRecord) => {
    const next = record.status === 'active' ? 'disabled' : 'active';
    await setAdminStatus(record.id, next);
    message.success(`Administrator ${next}`);
    actionRef.current?.reload();
  };

  const handleResetPassword = async (record: AdminUserRecord) => {
    // Simple prompt flow; the endpoint requires an 8+ character password.
    const newPassword = window.prompt(
      `Enter a new password for "${record.username}" (min 8 characters)`,
    );
    if (!newPassword) return;
    if (newPassword.length < 8) {
      message.error('Password must be at least 8 characters');
      return;
    }
    await resetAdminPassword(record.id, newPassword);
    message.success('Password reset');
  };

  const columns: ProColumns<AdminUserRecord>[] = [
    { title: 'Username', dataIndex: 'username', copyable: true, width: 160 },
    {
      title: 'Keyword',
      dataIndex: 'search',
      hideInTable: true,
      fieldProps: { placeholder: 'Username / email' },
    },
    { title: 'Email', dataIndex: 'email', hideInSearch: true, width: 220 },
    {
      title: 'Role',
      dataIndex: 'role',
      hideInSearch: true,
      width: 140,
      render: (_, record) => (
        <Tag color={ROLE_COLOR[record.role]}>{record.role}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      hideInSearch: true,
      render: (_, record) => (
        <Tag color={record.status === 'active' ? 'success' : 'default'}>
          {record.status}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 170,
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 260,
      render: (_, record) => {
        const isSelf = record.id === currentAdmin?.id;
        return [
          <a key="edit" onClick={() => setEditTarget(record)}>
            Edit
          </a>,
          <Popconfirm
            key="status"
            title={record.status === 'active' ? 'Disable this administrator?' : 'Enable this administrator?'}
            onConfirm={() => void handleSetStatus(record)}
            disabled={isSelf}
          >
            <a style={isSelf ? { color: '#bbb' } : undefined}>
              {record.status === 'active' ? 'Disable' : 'Enable'}
            </a>
          </Popconfirm>,
          <a key="reset" onClick={() => void handleResetPassword(record)}>
            Reset password
          </a>,
        ];
      },
    },
  ];

  return (
    <>
      <ProTable<AdminUserRecord>
        headerTitle="Administrators"
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        pagination={{ pageSize: 20 }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            New Administrator
          </Button>,
        ]}
        request={async (params) => {
          const data = await listAdmins({
            page: params.current,
            pageSize: params.pageSize,
            search: params.search as string | undefined,
          });
          return { data: data.items, total: data.total, success: true };
        }}
      />

      <ModalForm
        title="New Administrator"
        open={createOpen}
        onOpenChange={setCreateOpen}
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          await createAdmin({
            username: values.username,
            email: values.email || undefined,
            password: values.password,
            role: values.role,
          });
          message.success('Administrator created');
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText
          name="username"
          label="Username"
          rules={[{ required: true, min: 3, max: 64 }]}
        />
        <ProFormText name="email" label="Email" rules={[{ type: 'email' }]} />
        <ProFormText.Password
          name="password"
          label="Password"
          rules={[{ required: true, min: 8, max: 128 }]}
        />
        <ProFormSelect
          name="role"
          label="Role"
          initialValue="admin"
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'compliance', label: 'Compliance' },
            { value: 'super_admin', label: 'Super Admin' },
          ]}
          rules={[{ required: true }]}
        />
      </ModalForm>

      <ModalForm
        title={`Edit Administrator — ${editTarget?.username ?? ''}`}
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        modalProps={{ destroyOnClose: true }}
        initialValues={{
          email: editTarget?.email ?? undefined,
          role: editTarget?.role,
        }}
        onFinish={async (values) => {
          if (!editTarget) return true;
          await updateAdmin(editTarget.id, {
            email: values.email || null,
            role: values.role,
          });
          message.success('Administrator updated');
          setEditTarget(null);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name="email" label="Email" rules={[{ type: 'email' }]} />
        <ProFormSelect
          name="role"
          label="Role"
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'compliance', label: 'Compliance' },
            { value: 'super_admin', label: 'Super Admin' },
          ]}
          rules={[{ required: true }]}
        />
      </ModalForm>
    </>
  );
}
