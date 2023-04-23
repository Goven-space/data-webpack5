import React, { useState, useEffect } from 'react';
import { Form, Space, Button, Spin, Icon, Select, AutoComplete } from 'antd';
import { addServerHost, setCurrentServerHost, getCurrentServerHost, getServerList } from '@tool';

const FormItem = Form.Item;
const Option = Select.Option;
const location = window.location;
const host = window.host
const originUrl = window.location.origin

function ChangeServer({ closeModal }) {
  const [optionsItem, setOptionsItem] = useState([]);
  const [form] = Form.useForm();

  const labelCol = { span: 4 };
  const wrapperCol = { span: 18 };
  useEffect(() => {
    //设置可选的服务器列表
    let serverList = getServerList() || '';
    let serverListArray = serverList.split(',').filter(Boolean);
    let currentServerHost =
    getCurrentServerHost() || serverListArray[serverListArray.length - 1]; //从最后一个登录成功的地址中取
    const optionsList = serverListArray.map(item => ({
      value:item,
      label: item
    }));
    setOptionsItem(optionsList);
    if (currentServerHost !== undefined && currentServerHost !== '') {
      //登录地址改为最后一次登录的服务器地址
      form.setFieldsValue({ serverHost: currentServerHost });
    } else {
      form.setFieldsValue({ serverHost: host });
    }
  }, []);

  const onSubmit = values => {
    let serverHost = values.serverHost;
    addServerHost(serverHost);
    setCurrentServerHost(serverHost);
    location.href = `${originUrl}/restcloud/admin/login`
    // location.reload(); //重新载入本页面
  };

  return (
    <Form
      style={{ marginRight: '20px' }}
      form={form}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      onFinish={onSubmit}
    >
      <FormItem
        label="服务器地址"
        name="serverHost"
        help="请选择或填写要链接的服务器的Host如:http://localhost:8080/restcloud"
        rules={[{ required: true }]}
      >
        <AutoComplete mode="combobox" size="large" options={optionsItem} />
      </FormItem>
      <FormItem wrapperCol={{ span: 8, offset: 4 }}>
        <Space>
          <Button type="primary" htmlType="submit">
            连接服务器
          </Button>
          <Button onClick={closeModal}>取消</Button>
        </Space>
      </FormItem>
    </Form>
  );
}

export default ChangeServer;
