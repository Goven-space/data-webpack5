import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { login } from '@api/dataAccessApi';
import Footer from '@common/footer';
import LOGO from '@img/logo.png';
import MainContext from '@store';
import { Button, Card, Form, Input, Layout } from 'antd';
import { useContext, useState } from 'react';
import { saveAll, setHost } from '@tool/cookies';
import { addServerHost, setCurrentServerHost } from '@tool';
import './index.less';
const { userLogin } = login;

const Login = props => {
  const { baseURL, setBaseURL } = useContext(MainContext);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async values => {
    setLoading(true);
    const hostArr = values.serverHost.split('://');
    const { serverHost } = values;
    addServerHost(serverHost);
    setCurrentServerHost(serverHost);
    if (serverHost !== baseURL) {
      setBaseURL(serverHost);
    }
    await userLogin({
      ...values,
      systemlogin: 1,
    })
      .then(res => {
        const { identitytoken, userId, userName, state, msg } = res.data;
        if (state) {
          saveAll(identitytoken, userId, userName);
          props.history.push('/masterDataView/overview');
        } else {
          if (!hostArr[0].includes('http')) {
            form.setFieldsValue({
              serverHost: window.location.origin,
            });
          }
        }
      })
      .catch(err => {
        if (!hostArr[0].includes('http')) {
          form.setFieldsValue({
            serverHost: `${window.location.origin}/restcloud`,
          });
        }
      });
  };

  return (
    <Layout className="login-wrapper">
      <Layout.Header className="login-header">
        <img src={LOGO} alt="LOGO" />
        <span>系统登录</span>
      </Layout.Header>
      <Layout.Content className="login-body">
        <Card className="login-form" title="系统登录">
          <Form form={form} name="login" labelCol={{ span: 3 }} onFinish={onFinish}>
            <Form.Item
              className="mb0"
              name="serverHost"
              label="服务器"
              initialValue={baseURL}
              rules={[{ required: true }]}
              extra="请指定要登录的后端API服务器的URL地址"
            >
              <Input />
            </Form.Item>
            <Form.Item name="userName" label="用户名" rules={[{ required: true }]}>
              <Input prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true }]}>
              <Input.Password prefix={<LockOutlined />} visibilityToggle={false} />
            </Form.Item>
            <Form.Item extra={<p className="login-tips">请使用谷歌或火狐浏览器登录本系统...</p>}>
              <Button className="login-btn" type="primary" /* loading={loading} */ htmlType="submit">
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Layout.Content>
      <Layout.Footer className="login-footer">
        <Footer />
      </Layout.Footer>
    </Layout>
  );
};

export default Login;
