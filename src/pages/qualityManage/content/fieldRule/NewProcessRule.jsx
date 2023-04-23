import React, {useState, useEffect} from 'react';
import {
  Form,
  
  Input,
  Button,
  Radio,
  Space,
} from 'antd';
import { qualityManageApi } from '@api/dataAccessApi';
import {showInfo} from '@tool/'

const RadioGroup = Radio.Group;
const FormItem = Form.Item;

const { saveRule, getNewSerialNumber } = qualityManageApi.qualityRule;

export default function NewProcessRule(props) {
    const { closeTab, record, applicationId, type } = props;
    
  
  const [form] = Form.useForm()

    const formLayout = {
        labelCol:{ span: 4 },
        wrapperCol: { span: 16 }
  }
  useEffect(() => {
    if (type === 'New') {
      getSerialNumber('ruleId', applicationId, 'RULE');
    } else {
      record && Object.keys(record).length && form.setFieldsValue({ ...record });
    }
  }, [type])
  
    const onSubmit = (values) => {
        let postData = { applicationId, categoryId: 'field', appId: 'mdm'};
        Object.keys(values).forEach(function (key) {
          if (values[key] !== undefined) {
            let value = values[key];
            if (value instanceof Array) {
              postData[key] = value.join(','); //数组要转换为字符串提交
            } else {
              postData[key] = value;
            }
          }
        });
      if (record) {
          postData = Object.assign({}, record, postData);
      }
      
        saveRule({ ...postData }).then(res => {
            const { state } = res.data
            if (state) {
                showInfo('保存成功')
                closeTab(true);
            }
        });
  };

  const  getSerialNumber = (fieldName, appId, type) => {
    getNewSerialNumber({ appId, type }).then(res => {
     const {state, serialNumber} = res.data
      if(state !== false && serialNumber){
        let fdData = {};
        fdData[fieldName] = serialNumber;
        form.setFieldsValue(fdData);
      }
    });
  }

    return (
      <Form form={form} onFinish={values => onSubmit(values, true)} {...formLayout}>
        <FormItem
          label="规则唯一Id"
          name="ruleId"
          hasFeedback
          rules={[{ required: true }]}
          help="指定一个唯一Id,如果id已被引用修改id会引起错误"
        >
          <Input />
        </FormItem>
        <FormItem
          label="规则名称"
          name="ruleName"
          rules={[{ required: true }]}
          hasFeedback
          help="指定任何有意义且能描述本规则的说明"
        >
          <Input />
        </FormItem>
        <FormItem
          label="Class Path"
          name="classPath"
          hasFeedback
          help="空表示由系统自动生成,也可直接指定一个继承了IETLBaseEvent接口的Class类"
        >
          <Input />
        </FormItem>
        <FormItem label="公开方式" name="publicType" initialValue={1}>
          <RadioGroup>
            <Radio value={0}>仅自已可见</Radio>
            <Radio value={1}>公开</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem wrapperCol={{ span: 8, offset: 4 }}>
          <Space>
            <Button type="primary" htmlType="submit">
              保存退出
            </Button>
            <Button onClick={() => closeTab(false)}>关闭</Button>
          </Space>
        </FormItem>
      </Form>
    );
}