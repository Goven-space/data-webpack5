import React, { useState, useEffect } from 'react';
import { Form } from 'antd';
import { standardManage } from '@api/dataAccessApi';
import { getTreeSelectData, showInfo } from '@tool/';
import { Select, TreeSelect, Radio, Space, Button } from 'antd';

const FormItem = Form.Item;

const { getAppList, getDataSourceLink } = standardManage.publice;
const { getListField, editList, syncModelLowCode } = standardManage.informationManageApi;

function LowCodeConfigPage(props) {
  const { handleCancel, id, targetData } = props;

  const [appList, setAppList] = useState([]);
  const [dataSourceLink, setDataSourceLink] = useState([]);
  const [fieldList, setFieldList] = useState([]);

  const [form] = Form.useForm();
  const formLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
  };

  useEffect(() => {
    loadAppList();
    loadDataSourceLink();
    loadFieldList();
  }, []);

  useEffect(() => {
    const {relevanceConfig = {}, modelRelevanceConfig = false} = targetData
    form.setFieldsValue({ ...modelRelevanceConfig, relevanceConfig });
  }, [targetData]);

  const loadFieldList = () => {
    getListField({
      dataModelId: id,
    }).then(res => {
      const { state, data } = res.data;
      if (state && data instanceof Array) {
        const list = data.map(item => ({
          value: item.fieldCode,
          label: item.fieldName,
        }));
        setFieldList(list);
      }
    });
  };

  const loadAppList = () => {
    getAppList().then(res => {
      const { data } = res;
      if (data.state !== false && data instanceof Array) {
        const list = data.map(item => ({
          value: item.appId,
          label: `${item.appId} | ${item.appName}`,
        }));
        setAppList(list);
      }
    });
  };

  const loadDataSourceLink = () => {
    getDataSourceLink({ configType: 'RDB,Driver', appId: 'core', module: 'lowCode' }).then(res => {
      const { data } = res;
      if (data.state !== false && data instanceof Array) {
        const list = getTreeSelectData(data, 'label', 'value', true);
        setDataSourceLink(list);
      }
    });
  };

  const onClose = e => {
    handleCancel(e, false);
    form.resetFields();
  };

  const onSubmit = values => {
    const {relevanceConfig, ...extra} = values
    const params = { ...targetData, relevanceConfig, modelRelevanceConfig: JSON.stringify(extra) };
    editList(params).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
      }
      handleCancel(null, true);
    });
  };

  const handleSync = () => {
    syncModelLowCode({ id }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
      }
    });
  };

  return (
    <Form form={form} onFinish={onSubmit} {...formLayout}>
      <FormItem
        name="appId"
        label="低代码应用ID"
        help="应用唯一id"
        rules={[
          {
            required: true,
            message: '请输入低代码应用ID！',
          },
        ]}
      >
        <Select showSearch options={appList} />
      </FormItem>
      <FormItem
        name="dataSourceId"
        label="数据源ID"
        help="本数据模型所在的数据源"
        rules={[
          {
            required: true,
            message: '请输入数据源ID！',
          },
        ]}
      >
        <TreeSelect showSearch allowClear treeNodeFilterProp="label" treeData={dataSourceLink} />
      </FormItem>
      <FormItem
        name="primaryId"
        label="主键ID"
        help="第一个字段为主键多个后继字段为联合主键"
        rules={[
          {
            required: true,
            message: '请输入主键ID！',
          },
        ]}
      >
        <Select options={fieldList} />
      </FormItem>
      <FormItem
        name="alias"
        label="生成别名"
        help="字段Id下划线自动转为驼峰结构的别名Id"
        initialValue={false}
      >
        <Radio.Group>
          <Radio value={true}>是</Radio>
          <Radio value={false}>否</Radio>
        </Radio.Group>
      </FormItem>
      <FormItem
        name="relevanceConfig"
        label="自动同步"
        initialValue={false}
        help="数据模型变更是否立即同步到低代码平台中"
      >
        <Radio.Group>
          <Radio value={true}>是</Radio>
          <Radio value={false}>否</Radio>
        </Radio.Group>
      </FormItem>
      <FormItem wrapperCol={{ span: 8, offset: 8 }}>
        <Space>
          <Button onClick={handleSync}>立即同步</Button>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
          <Button onClick={onClose}>关闭</Button>
        </Space>
      </FormItem>
    </Form>
  );
}

export default LowCodeConfigPage;
