import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Space, Input, Button, Table, Typography, Select, Modal, Form } from 'antd';
import { kernelModule } from '@api/dataAccessApi';
import CMForm from '@/components/cmForm';
import { showInfo } from '@tool';
import "../css/index.less";

const {
  getAssignAssetsDataSource,
  getAllTableSpace,
  createTableSpace,
  updateTableSpaceName,
  deleteTableSpace,
} = kernelModule.oracleTableSpace;

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const handleType = { new: createTableSpace, edit: updateTableSpaceName, delete: deleteTableSpace };

export default function OracleTableSpace(props) {
  const [total, setTotal] = useState(0);
  const [dataSourceOptions, setDataSourceOptions] = useState([]);
  const [dataSourceId, setDataSourceId] = useState('');
  const [tableData, setTableData] = useState([]);
  const [fileNamelength, setFileNamelength] = useState(10);
  const [visible, setVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增');
  const [formType, setFormType] = useState('new');
  const [extraFormItem, setExtraFormItem] = useState([]);

  const allTableData = useRef([]);

  const [form] = Form.useForm();
  const formItemWidth = 300;
  const labelCol = { span: 8 };
  const width = 150;

  useEffect(() => {
    loadDataSource();
  }, []);

  const columns = [
    {
      title: '文件ID',
      dataIndex: 'FILE_ID',
      key: 'FILE_ID',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '文件名字',
      dataIndex: 'FILE_NAME',
      key: 'FILE_NAME',
      ellipsis: true,
      width: fileNamelength * 8,
      render: text => {
        if (text.length > fileNamelength) {
          setFileNamelength(text.length);
        }
        return text;
      },
    },

    {
      title: '文件所属表空间',
      dataIndex: 'TABLESPACE_NAME',
      key: 'TABLESPACE_NAME',
      ellipsis: true,
      width,
    },
    {
      title: '文件字节数量',
      dataIndex: 'BYTES',
      key: 'BYTES',
      ellipsis: true,
      width,
    },
    {
      title: '文件的块数量',
      dataIndex: 'BLOCKS',
      key: 'BLOCKS',
      ellipsis: true,
      width,
    },
    {
      title: '文件当前是否可用',
      dataIndex: 'STATUS',
      key: 'STATUS',
      ellipsis: true,
      width,
    },
    {
      title: '相对文件号',
      dataIndex: 'RELATIVE_FNO',
      key: 'RELATIVE_FNO',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '是否自动扩展',
      dataIndex: 'AUTOEXTENSIBLE',
      key: 'AUTOEXTENSIBLE',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '可扩展最大字节数',
      dataIndex: 'MAXBYTES',
      key: 'MAXBYTES',
      ellipsis: true,
      width,
    },
    {
      title: '可扩展最大数据块',
      dataIndex: 'MAXBLOCKS',
      key: 'MAXBLOCKS',
      ellipsis: true,
      width,
    },
    {
      title: '每次增加的块数量',
      dataIndex: 'INCREMENT_BY',
      key: 'INCREMENT_BY',
      ellipsis: true,
      width,
    },
    {
      title: '实际有用的字节数',
      dataIndex: 'USER_BYTES',
      key: 'USER_BYTES',
      ellipsis: true,
      width,
    },
    {
      title: '实际有用的块',
      dataIndex: 'USER_BLOCKS',
      key: 'USER_BLOCKS',
      ellipsis: true,
      width,
    },
    {
      title: '在线状态',
      dataIndex: 'ONLINE_STATUS',
      key: 'ONLINE_STATUS',
      ellipsis: true,
      width,
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      width,
      fixed: 'right',
      render: (text, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const loadDataSource = () => {
    getAssignAssetsDataSource({ type: 'oracle' }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const options = data.map(item => ({
          label: `${item.text}-${item.label}`,
          value: item.id,
        }));
        setDataSourceOptions(options);
      }
    });
  };

  const loadTableList = dataSourceId => {
    setFileNamelength(10);
    getAllTableSpace({ dataSourceId }).then(res => {
      const { state, data } = res.data;
      if (state) {
        setTableData(data);
        allTableData.current = data;
        setTotal(data?.length);
      }
    });
  };

  const onSearch = value => {
    const searchFilters = value?.trim().toLowerCase();
    const list = searchFilters
      ? allTableData.current?.filter(
          item =>
            item.FILE_NAME.toLowerCase().includes(searchFilters) ||
            item.TABLESPACE_NAME.toLowerCase().includes(searchFilters)
        )
      : [...allTableData.current];
    setTotal(list.length);
    setTableData(list);
  };

  const handleRefresh = () => {
    loadTableList(dataSourceId);
  };

  const handleDataSourceChange = value => {
    setDataSourceId(value);
    loadTableList(value);
  };

  const handleCreate = () => {
    setFormType('new');
    setExtraFormItem(createFormItem);
    setModalTitle('新增');
    setVisible('true');
  };

  const handleDelete = record => {
    setModalTitle('删除');
    setExtraFormItem(deleteFormItem);
    setFormType('delete');
    setVisible('true');
    form.setFieldsValue({ tableSpaceName: record.TABLESPACE_NAME });
  };

  const handleEdit = record => {
    setFormType('edit');
    setExtraFormItem(editFormItem);
    setModalTitle('编辑');
    setVisible('true');
    form.setFieldsValue({ oldTableSpaceName: record.TABLESPACE_NAME });
  };

  const submitForm = values => {
    let handle = handleType[formType];
    let formData = {};
    if (formType === 'new') {
      const { tableSpaceSize, next, maxSize, spaceSizeSuffix, nextSuffix, maxSizeSuffix, ...extra } = values;
      formData = { ...extra };
      formData.tableSpaceSize = tableSpaceSize + spaceSizeSuffix;
      next && (formData.next = next + nextSuffix);
      maxSize && (formData.maxSize = maxSize + maxSizeSuffix);
    } else {
      formData = { ...values };
    }
    handle({ ...formData }).then(res => {
      const { state, msg, data } = res.data;
      if (state) {
        showInfo(msg || data);
      }
      handleCancel();
      loadTableList(dataSourceId);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const suffixSelector = name => (
    <Form.Item name={name} noStyle initialValue="M">
      <Select style={{ width: 60 }}>
        <Option value="M">M</Option>
        <Option value="G">G</Option>
      </Select>
    </Form.Item>
  );

  const deleteFormItem = [
    {
      opts: {
        name: 'tableSpaceName',
        label: '表空间名称',
        required: true,
        labelCol,
        hidden: true,
      },
      input: {
        style: {
          width: formItemWidth,
        },
      },
    },
    {
      opts: {
        name: 'flag',
        label: '是否删除表空间数据文件',
        required: true,
        labelCol,
        initialValue: true,
      },
      radioGroup: {
        options: [
          {
            label: '是',
            value: true,
          },
          {
            label: '否',
            value: false,
          },
        ],
        style: {
          width: formItemWidth,
        },
      },
    },
  ];

  const createFormItem = [
    {
      opts: {
        name: 'tableSpaceName',
        label: '表空间名称',
        required: true,
        labelCol,
      },
      input: {
        style: {
          width: formItemWidth,
        },
      },
    },
    {
      opts: {
        name: 'tableSpaceFile',
        label: '表空间路径',
        required: true,
        labelCol,
      },
      input: {
        style: {
          width: formItemWidth,
        },
      },
    },
    {
      opts: {
        name: 'tableSpaceSize',
        label: '表空间大小',
        required: true,
        labelCol,
      },
      number: {
        addonAfter: suffixSelector('spaceSizeSuffix'),
        style: {
          width: formItemWidth,
        },
        min: 0,
      },
    },
    {
      opts: {
        name: 'autoextend',
        label: '是否自动扩展',
        labelCol,
        initialValue: 'OFF',
      },
      radioGroup: {
        options: [
          {
            label: 'ON',
            value: 'ON',
          },
          {
            label: 'OFF',
            value: 'OFF',
          },
        ],
        style: {
          width: formItemWidth,
        },
      },
    },
    {
      opts: {
        name: 'next',
        label: '文件满了后扩展大小',
        labelCol,
      },
      number: {
        addonAfter: suffixSelector('nextSuffix'),
        style: {
          width: formItemWidth,
        },
        min: 0,
      },
    },
    {
      opts: {
        name: 'maxSize',
        label: '文件最大大小',
        labelCol,
      },
      number: {
        addonAfter: suffixSelector('maxSizeSuffix'),
        style: {
          width: formItemWidth,
        },
        min: 0,
      },
    },
  ];

  const editFormItem = [
    {
      opts: {
        name: 'oldTableSpaceName',
        label: '原表空间名称',
        required: true,
        labelCol,
      },
      input: {
        style: {
          width: formItemWidth,
        },
        disabled: true,
      },
    },
    {
      opts: {
        name: 'newTableSpaceName',
        label: '现表空间名称',
        required: true,
        labelCol,
      },
      input: {
        style: {
          width: formItemWidth,
        },
      },
    },
  ];

  const cmformConfig = {
    formOpts: {
      form,
      onFinish: submitForm,
      initialValues: {
        dataSourceId,
      },
    },
    data: [
      {
        opts: {
          name: 'dataSourceId',
          label: '数据源唯一id',
          required: true,
          labelCol,
          hidden: true,
        },
        input: {
          style: {
            width: formItemWidth,
          },
          disabled: true,
        },
      },
      ...extraFormItem,
      {
        opts: {
          className: 'page-form-footer',
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

  return (
    <div className="monitor-content">
      <Modal
        centered
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={700}
        destroyOnClose
        title={modalTitle}
      >
        <CMForm {...cmformConfig} />
      </Modal>
      <Row justify="space-between" style={{ marginBottom: 20 }}>
        <Col>
          <Space align="baseline">
            <Title level={5}>操作数据源:</Title>
            <Select
              style={{ width: 400 }}
              options={dataSourceOptions}
              placeholder="暂未选择数据源"
              onChange={handleDataSourceChange}
              value={dataSourceId || undefined}
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            />
            <Button onClick={handleRefresh}>刷新</Button>
            <Button type="primary" onClick={handleCreate} disabled={!dataSourceId}>
              新增
            </Button>
          </Space>
        </Col>
        <Col>
          <Search
            placeholder="文件名字 / 文件所属表空间"
            allowClear
            onSearch={onSearch}
            style={{ width: 250 }}
          />
        </Col>
      </Row>
      <Table
        rowKey={record => record.FILE_ID}
        size="small"
        columns={columns}
        dataSource={tableData}
        scroll={{ x: '100%'}}
        pagination={{
          total: total,
          showSizeChanger: true,
          showTotal: total => `共 ${total} 条`,
        }}
      />
    </div>
  );
}
