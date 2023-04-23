import React, { useState, useEffect } from 'react';
import CmForm from '@components/cmForm';
import { Form } from 'antd';
import { showInfo } from '@tool';
import { kernelModule } from '@api/dataAccessApi';

const { getModelConfig, saveModelConfig } = kernelModule.dynamicDataModel;
const { dynamicQueryTableField } = kernelModule.dataQuery;

function MaintenanceConfigPage({ dataModelId, handleCancel, tableName, dataSourceId }) {
  const [saveKeyIdsList, setSaveKeyIdsList] = useState([]);
  const [form] = Form.useForm();

  const labelCol = { span: 6 };
  const wrapperCol = { span: 18 };

  useEffect(() => {
    loadFieldList();
  }, []);

  useEffect(() => {
    dataModelId && loadModelConfigList();
  }, [dataModelId]);

  const loadFieldList = () => {
    dynamicQueryTableField({ dataSourceId, tableName }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const list = data.map(item => ({
          label: `${item.fieldName}-${item.fieldComment}`,
          value: item.fieldName,
        }));
        setSaveKeyIdsList(list);
      }
    });
  };

  const loadModelConfigList = () => {
    getModelConfig({ dataModelId }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const { saveKeyIds = '', id = '' } = data;
        form.setFieldsValue({ saveKeyIds, id });
      }
    });
  };

  const submitForm = values => {
    saveModelConfig({ dataModelId, ...values }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
      }
      handleCancel();
    });
  };

  const cmFormConfig = {
    formOpts: {
      form,
      wrapperCol,
      labelCol,
      onFinish: submitForm,
    },
    data: [
      {
        opts: {
          name: 'id',
          label: 'id',
          hidden: true,
        },
        input: {},
      },
      {
        opts: {
          name: 'saveKeyIds',
          label: '数据维护关键字段',
          required: true,
        },
        select: {
          options: saveKeyIdsList,
        },
      },
      {
        opts: {
          wrapperCol: { span: 8, offset: 8 },
        },
        button: [
          {
            opts: {
              type: 'primary',
              htmlType: 'submit',
            },
            title: '确认',
          },
          {
            opts: {
              onClick: handleCancel,
            },
            title: '取消',
          },
        ],
      },
    ],
  };

  return <CmForm {...cmFormConfig} />;
}

export default MaintenanceConfigPage;
