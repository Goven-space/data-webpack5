import React, { useEffect, useState } from 'react';
import { Form, TreeSelect, Select, Space, Button } from 'antd';
import { isArray } from 'lodash';
import { showInfo } from '@/tool';
import { standardManage, } from '@api/dataAccessApi';

const { batchSyncMetaData } = standardManage.metaDataManageApi;
const { getClassifyOpt } = standardManage.publice;

function SyncConfigPage({ handleCancel, targetItem }) {
  const [dataElementClassifyList, setDataElementClassifyList] = useState([]);
  const [labelClassifyList, setLabelClassifyList] = useState([]);

  const [form] = Form.useForm();
  const formLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };

  useEffect(() => {
    getClassifyOpt({ classifyType: 'normDataElement' }).then(res => {
      const { state, data } = res.data;
      if (state && isArray(data)) {
        const list = loop(data);
        setDataElementClassifyList(list);
      }
      getClassifyOpt({ classifyType: 'metadataLabelSet' }).then(res => {
        const { state, data } = res.data;
        if (state && isArray(data)) {
          const list = loop(data);
          setLabelClassifyList(list);
        }
      });
    });
  }, []);

  useEffect(() => {
    const { key } = targetItem;
    key && form.setFieldsValue({ dataElementClassifyId: key});
  }, [targetItem]);

  const loop = data => {
    return data.map(i => {
      const list = {
        title: i.classifyName,
        value: i.id,
        disabled: !i.isLeaf,
      };
      i.children && (list.children = loop(i.children));
      return list;
    });
  };

  const onSubmit = values => {
    batchSyncMetaData({ ...values }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
      }
      handleCancel(true);
    });
  };

  return (
    <Form form={form} onFinish={onSubmit} {...formLayout}>
      <Form.Item
        label="主数据字段管理分类"
        name="dataElementClassifyId"
        rules={[
          {
            required: true,
            message: '请选择主数据数据元分类!',
          },
        ]}
      >
        <TreeSelect treeData={dataElementClassifyList} />
      </Form.Item>
      <Form.Item
        label="元数据管理分类"
        name="labelClassifyId"
        rules={[
          {
            required: true,
            message: '请选择元数据标签分类!',
          },
        ]}
      >
        <TreeSelect treeData={labelClassifyList} />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 6 }}>
        <Space>
          <Button type="primary" htmlType="submit">
            确认
          </Button>
          <Button onClick={handleCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default SyncConfigPage;
