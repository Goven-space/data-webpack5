import React, { useState, useEffect, useRef } from 'react';
import { Tabs, Form, Space, Button, Select, Input, Typography, Radio, InputNumber } from 'antd';
import { qualityManageApi, standardManage } from '@api/dataAccessApi';
import { showInfo } from '@tool/';
import FieldRulesVerify from './FieldRulesVerify';
import ModelRulesVerify from './ModelRulesVerify';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

const { saveRuleConfig, detectionField, getWarningConfig } = qualityManageApi.ruleConfig;
const { getModelKeysField } = standardManage.systemModelingApi;

const jsonStr =
  '{\n"msgtype": "text",\n"text": {\n"content": "\n数据质量检测规则:${ruleName}\n数据源:${dataSourceId}\n数据库表:${tableName}\n数据检测结果:${remark}\n数据检测时间:${currentDateTime}\n"}}';

function RuleConfigForm(props) {
  const { appId, applicationId, closeDialog, id } = props;

  const [fieldRules, setFieldRules] = useState([])
  const [modelRules, setModelRules] = useState([])
  const [keysFieldOptions, setKeysFieldOptions] = useState([]);
  const [showKeyIds, setShowKeyIds] = useState(false);

  const [form] = Form.useForm();

  const fieldDataRef = useRef();
  const modelDataRef = useRef();

  const formLayout = { labelCol: { span: 4 }, wrapperCol: { span: 16 } };

  useEffect(() => {
    if (id) {
      loadData();
      loadWarningConfig();
      loadModelKeysField();
    }
  }, [id]);

  const loadData = () => {
    detectionField({ dataModelId: id }).then(res => {
      const { state, data } = res.data;
      if (state) {
        setFieldRules(data || []);
      }
    });
  };

  const loadWarningConfig = () => {
    getWarningConfig({ dataModelId: id }).then(res => {
      const { state, data } = res.data;
      if (state && data) {
        const { modelRuleConfigList, ...extra } = data
        setModelRules(modelRuleConfigList || [] )
        extra.fieldKeyIds && (data.fieldKeyIds = data.fieldKeyIds.split(','));
        extra.fieldErrorDataWay === 2 && setShowKeyIds(true);
        form.setFieldsValue({ ...extra });
      }
    });
  };

  const loadModelKeysField = () => {
    getModelKeysField({ dataModelId: id }).then(res => {
      const { state, data = [] } = res.data;
      if (state) {
        const list = data.map(item => ({
          value: item.fieldName,
          label: `${item.fieldName} - ${item.fieldComment}`,
        }));
        setKeysFieldOptions(list);
      }
    });
  };

  const onSubmit = values => {
    let postData = {};
    Object.keys(values).forEach(function (key) {
      if (values[key] !== undefined) {
        postData[key] = values[key];
      }
    });
    postData.dataModelId = id;
    try {
      postData.fieldData = JSON.stringify(fieldDataRef.current?.getTableColumns() || fieldRules);
      postData.modelData = JSON.stringify(modelDataRef.current?.getTableColumns() || modelRules);;
    } catch (e) {}
    values.fieldKeyIds && (postData.fieldKeyIds = values.fieldKeyIds.join(','));
    saveRuleConfig(postData).then(res => {
      const { state } = res.data;
      if (state !== false) {
        closeDialog(undefined, true);
        showInfo('修改成功');
      }
    });
  };

  const handleAddDefault = () => {
    form.setFieldsValue({ sendMessageBody: jsonStr });
  };

  const onErrorDataWayChange = e => {
    setShowKeyIds(e.target.value === 2 ? true : false) 
  };

  return (
    <div style={{ marginTop: '-24px' }}>
      <Form form={form} {...formLayout} onFinish={onSubmit}>
        <Tabs size="large">
          <TabPane tab="模型检测" key="model" forceRender>
            <ModelRulesVerify
              form={form}
              ref={modelDataRef}
              data={modelRules}
              applicationId={applicationId}
            />
          </TabPane>
          <TabPane tab="字段检测" key="field">
            <FieldRulesVerify
              form={form}
              ref={fieldDataRef}
              data={fieldRules}
              applicationId={applicationId}
            />
          </TabPane>
          <TabPane tab="数据读取配置" key="readConfig" forceRender>
            <FormItem
              label="是否分页读取"
              name="page"
              help="如果表数据量较大，请开启分页读取，防止因读取大量数据导致系统内存泄露"
              initialValue={false}
            >
              <Radio.Group>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </FormItem>
            <FormItem
              label="一次分页读取的数据量"
              name="pageSize"
              help="每次分页读取的数据量，可以根据服务器配置适当调整"
              initialValue={1000}
            >
              <InputNumber />
            </FormItem>
          </TabPane>
          <TabPane tab="告警配置" key="acl" forceRender>
            <FormItem
              label="核验异常数据存储表名"
              name="errorDataSaveName"
              help={<div>指定唯一的MongoDB表名用来存储错误数据(表不存在时系统会自动创建),空表示不记录错误数据<br/>字段核验异常错误数据存储方式</div>}
            >
              <Input />
            </FormItem>
            <FormItem
              label="字段核验异常错误数据存储方式"
              name="fieldErrorDataWay"
              help="关键字段存储只会根据配置的字段信息进行存储，不会存储整条数据"
              initialValue={1}
            >
              <Radio.Group onChange={onErrorDataWayChange}>
                <Radio value={1}>整条数据存储</Radio>
                <Radio value={2}>关键字段储存</Radio>
              </Radio.Group>
            </FormItem>
            {showKeyIds && (
              <FormItem
                label="关键字段"
                name="fieldKeyIds"
                help="关键字段，数据核验异常后，需要存储哪些关键字段进行记录"
              >
                <Select options={keysFieldOptions} mode="multiple" allowClear />
              </FormItem>
            )}
            <FormItem
              label="API URL"
              name="sendApiUrl"
              help="指定一个接收消息的API地址,系统将以POST application/json;chartset=utf-8的方式调用可以发送邮件，钉钉消息等"
            >
              <Input />
            </FormItem>
            <FormItem
              label="内容"
              name="sendMessageBody"
              help="使用${变量}可以获取变量值"
              rules={[{ required: false }]}
            >
              <Input.TextArea autoSize style={{ minHeight: '160px' }} />
            </FormItem>
            <Button type="link" onClick={handleAddDefault} style={{ margin: '-10px 0 10px 210px' }}>
              添加默认内容
            </Button>
          </TabPane>
        </Tabs>
        <FormItem wrapperCol={{ offset: 9 }}>
          <Space>
            <Button type="primary" htmlType="submit" style={{ width: 150 }}>
              提交
            </Button>
            <Button onClick={closeDialog} style={{ width: 150 }}>
              取消
            </Button>
          </Space>
        </FormItem>
      </Form>
    </div>
  );
}

export default RuleConfigForm;
