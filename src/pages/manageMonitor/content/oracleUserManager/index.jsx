import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Space, Input, Button, Table, Typography, Select, Modal, Form } from 'antd';
import { kernelModule } from '@api/dataAccessApi';
import CMForm from '@/components/cmForm';
import { showConfirm } from '@components/confirm';
import { showInfo } from '@tool';

const { getAllUser, createUser, updateUserPassword, dropUser } = kernelModule.oracleUserManager;
const { getAssignAssetsDataSource, getAllTableSpaceName } = kernelModule.oracleTableSpace;
const { Title } = Typography;
const { Search } = Input;
const handleType = { new: createUser, edit: updateUserPassword };

export default function OracleUserManager(props) {
  const [total, setTotal] = useState(0);
  const [dataSourceOptions, setDataSourceOptions] = useState([]);
  const [dataSourceId, setDataSourceId] = useState('');
  const [tableData, setTableData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增');
  const [formType, setFormType] = useState('new');
  const [tableSpaceNameOption, setTableSpaceNameOption] = useState([]);

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
      title: '用户ID',
      dataIndex: 'USER_ID',
      key: 'USER_ID',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '用户名字',
      dataIndex: 'USERNAME',
      key: 'USERNAME',
      ellipsis: true,
      width,
    },

    {
      title: '账号状态',
      dataIndex: 'ACCOUNT_STATUS',
      key: 'ACCOUNT_STATUS',
      ellipsis: true,
      width,
    },
    {
      title: '账号被锁时间',
      dataIndex: 'LOCK_DATE',
      key: 'LOCK_DATE',
      ellipsis: true,
      width: width + 50,
      render: text => text?.substring(0, 19),
    },
    {
      title: '账号过期时间',
      dataIndex: 'EXPIRY_DATE',
      key: 'EXPIRY_DATE',
      ellipsis: true,
      width: width + 50,
      render: text => text?.substring(0, 19),
    },
    {
      title: '默认表空间',
      dataIndex: 'DEFAULT_TABLESPACE',
      key: 'DEFAULT_TABLESPACE',
      ellipsis: true,
      width,
    },
    {
      title: '默认临时表空间',
      dataIndex: 'TEMPORARY_TABLESPACE',
      key: 'TEMPORARY_TABLESPACE',
      ellipsis: true,
      width,
    },
    {
      title: '创建时间',
      dataIndex: 'CREATED',
      key: 'CREATED',
      ellipsis: true,
      width: width + 50,
      render: text => text?.substring(0, 19),
    },
    {
      title: '资源配置文件',
      dataIndex: 'PROFILE',
      key: 'PROFILE',
      ellipsis: true,
      width,
    },
    {
      title: '用户初始资源消耗组',
      dataIndex: 'INITIAL_RSRC_CONSUMER_GROUP',
      key: 'INITIAL_RSRC_CONSUMER_GROUP',
      ellipsis: true,
      width: width + 100,
    },
    {
      title: '用户外部名字',
      dataIndex: 'EXTERNAL_NAME',
      key: 'EXTERNAL_NAME',
      ellipsis: true,
      width: width,
    },
    {
      title: '密码哈希值使用版本',
      dataIndex: 'PASSWORD_VERSIONS',
      key: 'PASSWORD_VERSIONS',
      ellipsis: true,
      width,
    },
    {
      title: '用户版本',
      dataIndex: 'EDITIONS_ENABLED',
      key: 'EDITIONS_ENABLED',
      ellipsis: true,
      width,
    },
    {
      title: '用户认证机制',
      dataIndex: 'AUTHENTICATION_TYPE',
      key: 'AUTHENTICATION_TYPE',
      ellipsis: true,
      width,
    },
    {
      title: '连接方式',
      dataIndex: 'PROXY_ONLY_CONNECT',
      key: 'PROXY_ONLY_CONNECT',
      ellipsis: true,
      width,
    },
    {
      title: '用户是否是通用',
      dataIndex: 'COMMON',
      key: 'COMMON',
      ellipsis: true,
      width,
    },
    {
      title: '最后一次登录',
      dataIndex: 'LAST_LOGIN',
      key: 'LAST_LOGIN',
      ellipsis: true,
      width,
    },
    {
      title: '用户创建方式',
      dataIndex: 'ORACLE_MAINTAINED',
      key: 'ORACLE_MAINTAINED',
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
    getAllUser({ dataSourceId }).then(res => {
      const { state, data } = res.data;
      if (state) {
        setTableData(data);
        allTableData.current = data;
        setTotal(data?.length);
      }
    });
  };

  const loadTableSpaceList = dataSourceId => {
    getAllTableSpaceName({ dataSourceId }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const list = data.map(item => ({
          value: item.TABLESPACE_NAME,
          label: item.TABLESPACE_NAME,
        }));
        setTableSpaceNameOption(list);
      }
    });
  };

  const onSearch = value => {
    const searchFilters = value?.trim().toLowerCase();
    const list = searchFilters
      ? allTableData.current?.filter(
          item =>
            item.DEFAULT_TABLESPACE.toLowerCase().includes(searchFilters) ||
            item.USERNAME.toLowerCase().includes(searchFilters)
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
    loadTableSpaceList(value);
  };

  const handleCreate = () => {
    setFormType('new');
    setModalTitle('新增');
    setVisible('true');
  };

  const handleDelete = record => {
    showConfirm('', '确定删除该数据吗？', () => {
      dropUser({ dataSourceId, userName: record.USERNAME }).then(res => {
        const { state, msg, data } = res.data;
        if (state) {
            showInfo(msg || data);
        }
        loadTableList(dataSourceId);
      });
    });
  };

  const handleEdit = record => {
    setFormType('edit');
    setModalTitle('编辑');
    setVisible('true');
    form.setFieldsValue({ userName: record.USERNAME });
  };

  const submitForm = values => {
    let handle = handleType[formType];
    let formData = { ...values };
    handle(formData).then(res => {
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
      {
        opts: {
          name: 'userName',
          label: '用户名称',
          required: true,
          labelCol,
        },
        input: {
          style: {
            width: formItemWidth,
          },
          disabled: formType !== 'new',
        },
      },
      {
        opts: {
          name: 'password',
          label: '用户密码',
          required: true,
          labelCol,
        },
        password: {
          style: {
            width: formItemWidth,
          },
        },
      },
      ...(formType === 'new'
        ? [
            {
              opts: {
                name: 'tableSpaceName',
                label: '表空间名称',
                required: true,
                labelCol,
              },
              select: {
                options: tableSpaceNameOption,
                style: {
                  width: formItemWidth,
                },
              },
            },
          ]
        : []),
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
        <CMForm key={Math.random()} {...cmformConfig} />
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
          <Search placeholder="用户名字 / 默认表空间" allowClear onSearch={onSearch} style={{ width: 250 }} />
        </Col>
      </Row>
      <Table
        rowKey={record => record.USER_ID}
        size="small"
        columns={columns}
        dataSource={tableData}
        scroll={{ x: '100%' }}
        pagination={{
          total: total,
          showSizeChanger: true,
          showTotal: total => `共 ${total} 条`,
        }}
      />
    </div>
  );
}
