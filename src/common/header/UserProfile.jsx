import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Switch } from 'antd';
import { getUserInfo, updateUserInfo } from '@api/dataAccessApi/home';
import { showError, showInfo } from '@tool';

const FormItem = Form.Item;

function UserProfile({closeModal}) {
  const [formData, setFormData] = useState({ editPassword: false });

  const [form] = Form.useForm();

  const labelCol = { span: 4 };
  const wrapperCol = { span: 16 };

  useEffect(() => {
    getUserInfo().then(res => {
      const { data } = res;
      if (data) {
        setFormData(data);
        form.setFieldsValue(data);
      }
    });
  }, []);

  const submitForm = values => {
    let postData = {};
    Object.keys(values).forEach( key => {
      if (values[key] !== undefined) {
        let value = values[key];
        if (value instanceof Array) {
          postData[key] = value.join(','); //数组要转换为字符串提交
        } else {
          postData[key] = value;
        }
      }
    });
    postData = Object.assign({}, this.state.formData, postData);
    updateUserInfo(postData).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
      }
      closeModal()
    });
  };

  const onSwitchChange = checked => {
    setFormData({ ...formData, editPassword: checked });
  };

  return (
    <Form labelCol={labelCol} wrapperCol={wrapperCol} form={form} onFinish={submitForm}>
      <FormItem label="帐号Id" help="帐号Id不允许修改">
        {formData.userId || ''}
      </FormItem>
      <FormItem label="密钥(appkey)" help="使用appkey用API时的key,请保管好密钥,如果发现丢失请及时更新密钥">
        {formData.appKey || ''}
      </FormItem>
      <FormItem label="帐号名" name="userName" help="用户中文名称" rules={[{ required: true }]}>
        <Input placeholder="用户中文名称" />
      </FormItem>
      <FormItem
        label="邮件地址"
        name="mail"
        rules={[{ type: 'email', message: 'The input is not valid E-mail!' }]}
      >
        <Input />
      </FormItem>
      <FormItem label="手机号" name="mobilePhone">
        <Input />
      </FormItem>
      <FormItem label="可用积分">{formData.points || ''}</FormItem>
      <FormItem label="最大QPS" help="0表示不限制">
        {formData.qps || ''}
      </FormItem>
      <FormItem label="每日最大调用次数" help="0表示不限制">
        {formData.maxreq || ''}
      </FormItem>
      <FormItem label="修改密码" name="editPassword">
        <Switch defaultChecked={false} onChange={onSwitchChange} />
      </FormItem>
      <FormItem
        style={{ display: formData.editPassword ? '' : 'none' }}
        label="旧密码"
        help="请填写旧的密码"
        name="oldPassword"
      >
        <Input type="password" />
      </FormItem>
      <FormItem
        style={{ display: formData.editPassword ? '' : 'none' }}
        label="新密码"
        name="newPassword"
        help="请填写新的密码,密码由数字和字母组成!"
      >
        <Input type="password" />
      </FormItem>
      <FormItem
        style={{ display: formData.editPassword ? '' : 'none' }}
        label="确认新密码"
        name="newPassword2"
        help="再次确认新的密码"
      >
        <Input type="password" />
      </FormItem>
      <FormItem label="更换密钥" name="changeAppKey" help="选择是则会重新生成一个新的密钥appkey">
        <Switch defaultChecked={false} />
      </FormItem>
      <FormItem wrapperCol={{ span: 8, offset: 4 }}>
        <Button type="primary" htmlType='submit'>保存修改</Button>
      </FormItem>
    </Form>
  );
}

export default UserProfile;
