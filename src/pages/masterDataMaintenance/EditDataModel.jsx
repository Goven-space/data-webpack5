import React, { useState, useEffect } from 'react';
import CmForm from '@components/cmForm';
import { Form } from 'antd';
import { showError, showInfo } from '@tool';
import { kernelModule } from '@api/dataAccessApi';

const { batchUpdateModel } = kernelModule.dynamicDataModel;

function EditDataModel({ handleCancel, dataSourceId, dataModelId, tableFields, keyId, selectedRows, cancelRowSelected, tableName }) {
  const [saveKeyIdsList, setSaveKeyIdsList] = useState([]);
  const [updateFieldName, setUpdateFieldName] = useState('');
  const [updateFieldLabel, setUpdateFieldLabel] = useState('');
  const [form] = Form.useForm();

  const labelCol = { span: 8 };
  const wrapperCol = { span: 12 };

  useEffect(() => {
    tableFields.length && tansformFieldList(tableFields);  
  }, [tableFields]);

  const tansformFieldList = (tableFields = []) => {
    const list = tableFields.map(item => ({
      label: `${item.fieldName}-${item.fieldComment}`,
      value: item.fieldName,
      updateFieldLabel: `${item.fieldName} [${item.fieldComment}]`
    }));
    setSaveKeyIdsList(list);
  };

  const submitForm = values => {
    const keyIds = selectedRows.map(item => item[keyId]).join(',')
    batchUpdateModel({
      dataModelOperateType: 'batchUpdate',
      dataSourceId,
      dataModelId,
      keyIds: keyIds,
      dataModelName: tableName,
      ...values,
    }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
      }
      handleCancel(true);
      cancelRowSelected();
    });
  };

  const handleKeyIdChange = (value, option) => {
    setUpdateFieldName(value || '')
    setUpdateFieldLabel(option?.updateFieldLabel || '');
  }

  const updateFieldItem = updateFieldName ? [{
    opts: {
      name: 'objectData',
      label: updateFieldLabel,
      required: true,
    },
    input: {
      value: updateFieldName
    },
  }] : []

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
          name: 'updateFieldName',
          label: '修改字段',
          required: true,
        },
        select: {
          options: saveKeyIdsList,
          onChange: handleKeyIdChange
        },
      },
      ...updateFieldItem,
      {
        opts: {
          wrapperCol: { span: 8, offset: 10 },
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

export default EditDataModel;
