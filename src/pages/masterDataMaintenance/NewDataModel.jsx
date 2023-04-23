import React, { useState, useEffect, useRef } from 'react';
import CmForm from '@components/cmForm';
import { Form } from 'antd';
import TextToolTip from '@components/textToolTip';
import { showInfo } from '@tool';
import { kernelModule } from '@api/dataAccessApi';
import moment from 'moment';

const { saveModelData } = kernelModule.dynamicDataModel;

const dateFormat = 'YYYY-MM-DD';
const monthFormat = 'YYYY-MM';
const yearFormat = 'YYYY';
const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
const timeFormat = 'HH:mm:ss';

const types = {
  oneText: {
    calender: {
      type: 'datepicker',
      picker: 'date',
      format: dateFormat,
    },
    calender_month: {
      type: 'datepicker',
      picker: 'month',
      format: monthFormat,
    },
    calender_year: {
      type: 'datepicker',
      picker: 'year',
      format: yearFormat,
    },
    datetime: {
      type: 'datepicker',
      picker: 'date',
      showTime: true,
      format: dateTimeFormat,
      showTime: {
        format: timeFormat,
      },
    },
    time: {
      type: 'timepicker',
      format: timeFormat,
    },
    float: {
      type: 'number',
      controls: false,
    },
    int: {
      type: 'number',
      formatter: value => Number(value)?.toFixed(0),
    },
    string: {
      type: 'input',
    },
  },
  moreText: {
    type: 'textarea',
    autoSize: { minRows: 3, maxRows: 5 },
  },
  richTextBox: { type: 'richTextBox'},
};

function NewDataModel(props) {
  const {
    handleCancel,
    dataSourceId,
    dataModelId,
    tableName,
    formAddItems,
    formEditItems,
    rowData,
    dialogType,
  } = props;

  const [formItems, setFormItems] = useState([]);

  const [form] = Form.useForm();

  const pickerTypeList = useRef({}); //动态字段的日期时间格式

  const labelCol = { span: 8 };
  const wrapperCol = { span: 16 };
  const formItemWidth = 340

  useEffect(() => {
    dialogType === 'new' && formAddItems.length && loadFormItems(formAddItems);
    dialogType === 'edit' && formEditItems.length && loadFormItems(formEditItems);
  }, [dialogType, formAddItems, formEditItems]);

  useEffect(() => {
    if (Object.keys(rowData).length) {
      let data = { ...rowData };
      for (let key in data) {
        let pickerFormat = pickerTypeList.current[key];
        if (pickerFormat) {
          data[key] = moment(data[key], pickerFormat);
        }
      }
      form.setFieldsValue({ ...data });
    }
  }, [rowData]);

  const loadFormItems = (tableFields = []) => {
    const items = tableFields.map(item => {
      let formItem = {
        opts: {
          name: item.fieldName,
          label: `${item.fieldName} [${item.fieldComment}]`,
          labelDom: <TextToolTip placement="top" text={`${item.fieldName} [${item.fieldComment}]`} />,
          required: !item.fieldNull,
        },
        columns: 11,
      };
      let itemType = types[item.editFieldType];
      
      if (item.editFieldType !== 'oneText') {
        const { type, ...options } = itemType;
        formItem[itemType.type] = { ...options, style: { width: formItemWidth } };
      } else {
        const { type, ...options } = itemType[item.editFieldFormat];
        // 保存字段的时间格式
        ['datepicker', 'timepicker'].includes(type) &&
          (pickerTypeList.current[item.fieldName] = options.format);
        formItem[type] = {
          ...options,
          style: { width: formItemWidth }
        };
      }
      return formItem;
    });
    setFormItems(items);
  };

  const submitForm = values => {
    let params = {
      dataSourceId,
      dataModelId,
      dataModelName: tableName,
      dataModelOperateType: dialogType === 'new' ? 'insert' : 'update',
    };
    for (let key in values) {
      let pickerFormat = pickerTypeList.current[key];
      if (pickerFormat) {
        values[key] && (params[key] = values[key].format(pickerFormat));
      } else {
        params[key] = values[key];
      }
    }
    saveModelData(params).then(res => {
      const { state, msg } = res.data;
      if (state) {
        if (state) {
          showInfo(msg);
        }
        closeDialog(true);
      }
    });
  };

  const closeDialog = flag => {
    form.resetFields();
    handleCancel(flag);
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
              onClick: closeDialog,
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
