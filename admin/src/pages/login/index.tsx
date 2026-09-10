import { Button, Card, Form, Input, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { login } from '../../api/endpoints';
import { useAuthStore } from '../../store/auth';
import VeyaLogo from '../../components/VeyaLogo';
import { VEYA_PALETTE } from '../../theme';

interface LoginFormValues {
  username: string;
  password: string;
}

/**
 * Administrator login page. On success the JWT and profile are persisted in
 * the auth store and the user is redirected to the dashboard.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);

  // Already authenticated: skip the login screen.
  if (token) {
    return <Navigate to="/" replace />;
  }

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const result = await login(values.username, values.password);
      setAuth(result.accessToken, result.admin);
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        // Soft brand-tinted backdrop derived from the logo gradient.
        background: `radial-gradient(1200px 600px at 20% 0%, rgba(106, 92, 255, 0.12), transparent 60%),
          radial-gradient(1000px 600px at 85% 100%, rgba(0, 200, 255, 0.10), transparent 60%),
          ${VEYA_PALETTE.bgLayout}`,
      }}
    >
      <Card style={{ width: 380 }} bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <VeyaLogo size={56} />
          <Typography.Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
            Veya Admin
          </Typography.Title>
          <Typography.Text type="secondary">Platform management console</Typography.Text>
        </div>
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Username is required' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Administrator username" autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Log in
          </Button>
        </Form>
      </Card>
    </div>
  );
}
