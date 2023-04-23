import React, { useState, useEffect } from 'react';
import CmForm from '@components/cmForm';
import { Form } from 'antd';
import { showInfo } from '@tool';
import { kernelModule } from '@api/dataAccessApi';

const { saveModelData } = kernelModule.dynamicDataModel;

function NewDataModel({ handleCancel, dataSourceId, dataModelId, tableName, tableFields, rowData }) {
  const [formItems, setFormItems] = useState([]);

  const [form] = Form.useForm();

  const labelCol = { span: 10 };
  const wrapperCol = { span: 14 };

  useEffect(() => {
    tableFields.length && loadFormItems(tableFields);
  }, [tableFields]);

  useEffect(() => {
    Object.keys(rowData).length && form.setFieldsValue({ ...rowData });
  }, [rowData]);

  const loadFormItems = (tableFields = []) => {
    const items = tableFields.map(item => ({
      opts: {
        name: item.fieldName,
        label: `${item.fieldName} [${item.fieldComment}]`,
      },
      input: {},
      columns: 11,
    }));
    setFormItems(items);
  };

  const submitForm = values => {
    const params = {
      dataSourceId,
      dataModelId,
      dataModelName: tableName,
      ...values,
    };
    saveModelData(params).then(res => {
      const { state, msg } = res.data;
      if (state) {
        if (state) {
          showInfo(msg);
        }
        handleCancel();
      }
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
      ...formItems,
      {
        opts: {
          wrapperCol: { span: 8, offset: 11 },
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

export default NewDataModel;
