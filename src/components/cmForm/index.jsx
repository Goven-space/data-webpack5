import Editor from '@/components/wangEditor';
import { UploadOutlined } from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Row,
  Col,
  InputNumber,
  Radio,
  Select,
  Slider,
  Space,
  TimePicker,
  Transfer,
  TreeSelect,
  Upload,
  Switch
} from 'antd';
import _ from 'lodash';
import '../css/index.less';

//绑定在form表单里的，要给默认值，不要用通过参数defaultValue去设置，绑定不到form里面的，用form的initialValues去设置
const getElement = item => {
  const {
    input,
    textarea,
    search,
    password,
    number,
    button,
    checkbox,
    checkboxGroup,
    radio,
    radioGroup,
    datepicker,
    dateRangePicker,
    select,
    autoComplete,
    slider,
    transfer,
    treeSelect,
    timepicker,
    timeRangePicker,
    file,
    editor,
    children,
    switchBtn,
  } = item;
  if (input) {
    return (
      <Input {...input} rules={item.required ? [{ required: true, message: `请输入${item.label}` }] : []} />
    );
  } else if (textarea) {
    return <Input.TextArea {...textarea} />;
  } else if (search) {
    return <Input.Search {...search} />;
  } else if (password) {
    return <Input.Password {...password} />;
  } else if (number) {
    return <InputNumber {...number} />;
  } else if (checkbox) {
    return <Checkbox {...checkbox} />;
  } else if (checkboxGroup) {
    return <Checkbox.Group {...checkboxGroup} />;
  } else if (radio) {
    return <Radio {...radio} />;
  } else if (radioGroup) {
    return <Radio.Group {...radioGroup} />;
  } else if (datepicker) {
    return <DatePicker {...datepicker} allowClear />;
  } else if (dateRangePicker) {
    return <DatePicker.RangePicker {...dateRangePicker} allowClear />;
  } else if (switchBtn) {
    return <Switch {...switchBtn} />;
  } else if (select) {
    return (
      <Select
        {...select}
        showSearch
        filterOption={(value, option) => {
          return option.label.match(value) !== null;
        }}
        allowClear
      />
    );
  } else if (autoComplete) {
    return (
      <AutoComplete
        {...autoComplete}
        showSearch
        filterOption={(value, option) => {
          return option.label.match(value) !== null;
        }}
        allowClear
      >
        {autoComplete.children ? autoComplete.children : null}
      </AutoComplete>
    );
  } else if (slider) {
    return <Slider {...slider} />;
  } else if (transfer) {
    return <Transfer {...transfer} />;
  } else if (treeSelect) {
    return (
      <TreeSelect
        {...treeSelect}
        allowClear
        showSearch
        filterTreeNode={(value, treeNode) => {
          return treeNode.title.match(value) !== null;
        }}
      />
    );
  } else if (timepicker) {
    return <TimePicker {...timepicker} />;
  } else if (timeRangePicker) {
    return <TimePicker.RangePicker {...timeRangePicker} />;
  } else if (button) {
    return (
      <Space>
        {button.map(item => (
          <Button key={_.uniqueId('CMForm-btn-')} {...item.opts}>
            {item.title}
          </Button>
        ))}
      </Space>
    );
  } else if (file) {
    return (
      <Upload {...file}>
        <Button icon={<UploadOutlined />}>点击上传文件</Button>
      </Upload>
    );
  } else if (editor) {
    return <Editor {...editor}></Editor>;
  } else if (children) {
    return children;
  }
};

//获取校验
const rulesData = item => {
  const { input, textarea, number, radioGroup, select, editor, autoComplete, treeSelect } = item;
  if (input) {
    item.type = 'input';
  } else if (select) {
    item.type = 'select';
  } else if (number) {
    item.type = 'number';
  } else if (radioGroup) {
    item.type = 'radioGroup';
  } else if (editor) {
    item.type = 'editor';
  } else if (textarea) {
    item.type = 'textarea';
  } else if (autoComplete) {
    item.type = 'autoComplete';
  } else if (treeSelect) {
    item.type = 'treeSelect';
  }
  let rules = [];
  if (item.opts.required) {
    let message = item.opts.message || `${mesPreix[item.type]}${item.opts.label}`;
    rules.push({ required: true, message });
  }
  if (item.opts.validator) {
    rules.push(item.opts.validator);
  }
  return rules;
};

const mesPreix = {
  input: '请输入',
  radioGroup: '请选择',
  select: '请选择',
  upload: '请上传',
  datepicker: '请选择',
  textarea: '请填写',
  number: '请填写',
  editor: '请填写',
  autoComplete: '请填写',
  treeSelect: '请选择',
};

const CMForm = ({ formOpts, data, footer }) => {
  return (
    <Form {...formOpts}>
      <Row gutter={24}>
        {data.map(item => {
          const rules = rulesData(item);
          const { label, labelDom, ...opts } = item.opts;
          return (
            <Col
              span={item.button ? 24 : item.columns === 'none' ? 0 : item.columns || formOpts.columns || 24}
              key={_.uniqueId('CMForm-')}
            >
              <Form.Item {...opts} label={labelDom || label} rules={rules || []}>
                {getElement(item)}
              </Form.Item>
            </Col>
          );
        })}
      </Row>

      {footer
        ? footer.map(item => {
            return (
              <Row key={_.uniqueId('CMForm-')}>
                <Col span={24}>
                  <Form.Item {...item.opts}>
                    <Space>
                      {item.button?.map(BtnItem => (
                        <Button {...BtnItem.opts}>{BtnItem.title}</Button>
                      ))}
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            );
          })
        : null}
    </Form>
  );
};

export default CMForm;
