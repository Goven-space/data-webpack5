import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Row,
  Space,
  Button,
  Col,
  Input,
  Table,
  Modal,
  Form,
  Dropdown,
  Menu,
  Card,
  Typography,
  List,
  Badge,
  Drawer,
  Image,
} from 'antd';
import Icon from '@components/icon';
import { addIcon, refreshIcon, showIcon, exportIcon } from '@/constant/icon.js';
import CMForm from '@/components/cmForm';
import { standardManage, metadataManage } from '@api/dataAccessApi';
import { paginationConfig, showInfo, randomString } from '@tool';
import DeleteBtn from '@components/button';
import _ from 'lodash';
import ReferenceRelationshipPage from './ReferenceRelationshipPage';

const { exportList } = standardManage.metaDataManageApi;
const { getList, deleteList, saveList, getDatabaseType, test, copy, getId } = metadataManage.linkConfigManage;
const { Search } = Input;

const { Meta } = Card;
const { Title } = Typography;

export default function ({ menuKeyId }) {
  const host = localStorage.getItem('currentServerHost');
  const [selectKey, setSelectKey] = useState([]);
  const [selectRow, setSelectRow] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('新增');
  const [driver, setDriver] = useState({ jdbcUrl: [], driverClass: [] });
  const [modules, setModules] = useState({ relationalDatabase: [], nonRelationalDatabase: [] });
  const [id, setId] = useState(undefined);
  const [modalContentFlag, setModalContentFlag] = useState('databaseType');
  const [dialogWidth, setDialogWidth] = useState(800);

  const [form] = Form.useForm();
  const databaseType = useRef('');
  const echartsRef = useRef();

  let searchData = {};
  const formItemWidth = 600;
  const width = 150;
  const labelCol = { span: 5 };
  const columns = [
    {
      title: '数据源名称',
      dataIndex: 'configName',
      width: width - 20,
      ellipsis: true,
    },
    {
      title: '数据库类型',
      dataIndex: 'databaseType',
      width: width - 70,
      ellipsis: true,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      width: width - 20,
      ellipsis: true,
    },
    {
      title: '端口',
      dataIndex: 'port',
      width: width - 70,
      ellipsis: true,
    },
    {
      title: '实例',
      dataIndex: 'instance',
      width: width - 20,
      ellipsis: true,
    },
    {
      title: 'Schment',
      dataIndex: 'schemaUserId',
      width: width - 20,
      ellipsis: true,
    },
    {
      title: '用户名',
      dataIndex: 'userId',
      width: width - 50,
      ellipsis: true,
    },
    {
      title: '修改时间',
      dataIndex: 'editTime',
      ellipsis: true,
      width: width,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
      width: width,
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: width,
      fixed: 'right',
      render: (text, record) => {
        return (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)} size="small">
              编辑
            </Button>
            <Button type="link" onClick={() => handleTest(record)} size="small">
              测试连接
            </Button>
            <Button type="link" onClick={() => handleCopy(record)} size="small">
              复制
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    getTableData();
    getInitData();
    getType();
  }, [menuKeyId]);

  //分页显示返回状态码
  const getTableData = (pagination = { pageNo, pageSize }) => {
    if (!menuKeyId) {
      return;
    }
    getList({
      ...pagination,
      filters: {
        classifyId: menuKeyId,
      },
      searchFilters: {
        ...searchData,
      },
    }).then(res => {
      const { state, rows, pageNo, pageSize, total } = res.data;
      if (state) {
        setDataSource(rows);
        setPageNo(pageNo);
        setPageSize(pageSize);
        setTotal(total);
      }
    });
  };

  const getInitData = () => {};

  const getType = () => {
    getDatabaseType().then(res => {
      const { state, data } = res.data;
      if (state) {
        setModules(data);
      }
    });
  };

  const getIdData = () => {
    const id = randomString();
    form.setFieldsValue({ id });
    getId().then(res => {
      const { state, data } = res.data;
      if (state) {
        form.setFieldsValue({ configId: data });
      }
    });
  };

  const handleEdit = record => {
    setOpen(true);
    setTitle(`编辑-${record.configName}-${record.databaseType}`);
    databaseType.current = record.databaseType;
    const currentDrive = modules.relationalDatabase.find(item => item.title === record.databaseType);
    setDriver(currentDrive);
    setId(record.id);
    setDialogWidth(1000);
    form.setFieldsValue({ ...record });
  };

  const handleCopy = record => {
    copy({ ids: record.id }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
        getTableData();
      }
    });
  };

  const saveAndTest = () => {
    form.validateFields();
    const data = form.getFieldsValue(true);
    submitForm(data, 'test');
  };

  const submitForm = (value, testConn) => {
    saveList({
      ...value,
      classifyId: menuKeyId,
      configType: 'Driver',
      databaseType: databaseType.current,
      testConn,
    }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
        handleDrawerClose();
        getTableData();
        form.resetFields();
      }
    });
  };

  const onSearch = value => {
    searchData = {
      configName: value,
      userId: value,
      databaseType: value,
    };
    getTableData({ pageNo: 1, pageSize: 10 });
  };

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  const handleDrawerClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleAdd = () => {
    setModalContentFlag('databaseType');
    setVisible(true);
    setTitle('选择数据源');
    setId(undefined);
    setDialogWidth(1200);
    getIdData();
  };

  const handelDelete = () => {
    deleteList({
      ids: selectKey.join(),
    }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        setSelectKey([]);
        getTableData();
        showInfo(msg);
      }
    });
  };

  const refresh = () => {
    getTableData();
  };

  const handleExport = () => {
    exportList();
  };

  const onPageChange = (page, size) => {
    getTableData({ pageNo: page, pageSize: size });
  };

  const getDatabaseContent = (title, driver) => {
    databaseType.current = title;
    form.setFieldsValue({ jdbcUrl: driver.jdbcUrl[0] });
    setDriver(driver);
    setModalContentFlag('form');
    setVisible(false);
    setOpen(true);
    setVisible(false);
    setTitle(`新增连接-${title}`);
  };

  const handleTest = record => {
    test({ id: record.id }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
      }
    });
  };

  const cmFormConfig = useMemo(() => {
    return {
      formOpts: {
        form,
        onFinish: submitForm,
        labelCol,
        initialValues: {
          changePassword: false,
          state: '1',
        },
      },
      data: [
        {
          opts: {
            name: 'id',
            hidden: true,
          },
          input: {},
        },
        {
          opts: {
            name: 'configId',
            hidden: true,
          },
          input: {},
        },
        {
          opts: {
            name: 'classifyId',
            hidden: true,
          },
          input: {},
        },
        {
          opts: {
            name: 'jdbcUrl',
            label: '链接数据源URL',
            help: '指定链接数据源的jdbc Url配置(支持手动填写)',
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
            name: 'configName',
            label: '数据源名称',
            required: true,
          },
          input: {
            style: {
              width: formItemWidth,
            },
          },
        },
        {
          opts: {
            name: 'userId',
            label: '用户名',
            required: true,
          },
          input: {
            style: {
              width: formItemWidth,
            },
          },
        },
        {
          opts: {
            name: 'password',
            label: '密码',
          },
          password: {
            style: {
              width: formItemWidth,
            },
          },
        },
        {
          opts: {
            name: 'changePassword',
            label: '加密密码',
            help: '选择是表示保存时对密码进行一次加密',
          },
          radioGroup: {
            options: [
              { label: '是', value: true },
              { label: '否', value: false },
            ],
            style: {
              width: formItemWidth,
            },
          },
        },
        {
          opts: {
            name: 'driverClass',
            label: '数据库驱动Class',
            help: '指定数据源所需要的驱动类JDBC或者ODBC驱动Class(支持手动填写)',
            required: true,
          },
          autoComplete: {
            style: {
              width: formItemWidth,
            },
            options:
              driver?.driverClass?.map(item => ({
                label: item,
                value: item,
              })) || [],
          },
        },
        {
          opts: {
            name: 'ip',
            label: 'IP',
            required: true,
          },
          input: {
            style: {
              width: formItemWidth,
            },
          },
        },
        {
          opts: {
            name: 'port',
            label: '端口',
            required: true,
          },
          input: {
            style: {
              width: formItemWidth,
            },
          },
        },
        {
          opts: {
            name: 'instance',
            label: '实例',
            required: true,
          },
          input: {
            style: {
              width: formItemWidth,
            },
          },
        },
        {
          opts: {
            name: 'schemaUserId',
            label: 'Schment',
            hidden: databaseType.current === 'oracle' ? false : true,
          },
          input: {
            style: {
              width: formItemWidth,
            },
          },
        },
        {
          opts: {
            name: 'props',
            label: '其他链接属性',
            help: '指定数据库的其他链接配置属性(每行一个如:remarksReporting=true)',
          },
          textarea: {
            style: {
              width: formItemWidth,
            },
            rows: 2,
          },
        },
        {
          opts: {
            name: 'state',
            label: '状态',
          },
          radioGroup: {
            options: [
              { label: '启用', value: '1' },
              { label: '停用', value: '0' },
            ],
            style: {
              width: formItemWidth,
            },
          },
        },
        {
          opts: {
            name: 'remark',
            label: '备注',
          },
          textarea: {
            style: {
              width: formItemWidth,
            },
            rows: 2,
          },
        },
        /* {
          opts: {
            name: "sort",
            label: "排序",
            required: true,
            initialValue: 10000
          },
          number: {
            style: {
              width: formItemWidth,
            },
          },
        }, */
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
              title: '保存',
            },
            {
              opts: {
                type: 'primary',
                onClick: _.debounce(saveAndTest, 400, { leading: true }),
              },
              title: '保存并测试',
            },
            {
              opts: {
                onClick: handleDrawerClose,
              },
              title: '取消',
            },
          ],
        },
      ],
    };
  }, [driver]);

  const content = useMemo(() => {
    const content = [];
    for (const key in modules) {
      content.push(
        <div className="RelationalType" key={key}>
          <Title level={5} style={{ marginBottom: 20 }}>
            {key === 'relationalDatabase'
              ? '关系型数据库'
              : key === 'nonRelationalDatabase'
              ? '大数据型数据库'
              : '消息型数据库'}
          </Title>
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={modules[key]}
            rowKey={row => row.id}
            renderItem={item => (
              <List.Item>
                <Card
                  hoverable={true}
                  style={{ backgroundColor: item.backgroundColor || '#fff' }}
                  onClick={() =>
                    getDatabaseContent(item.title, {
                      driverClass: item.driverClass,
                      jdbcUrl: item.jdbcUrl,
                    })
                  }
                >
                  <Meta
                    avatar={
                      <Badge
                        count={item.count}
                        overflowCount={999}
                        style={{
                          backgroundColor: item.countColor || '#52c41a',
                        }}
                      >
                        <Image
                          size={64}
                          shape="square"
                          src={`${host}${item.src}`}
                          alt={item.title}
                          preview={false}
                        />
                      </Badge>
                    }
                    title={<b>{item.title}</b>}
                    description={item.description}
                  />
                </Card>
              </List.Item>
            )}
          />
        </div>
      );
    }
    return content;
  }, [modules]);

  return (
    <div className="metadataManage-content">
      <Modal
        style={{
          top: 10,
        }}
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={dialogWidth}
        destroyOnClose={false}
        title={title}
      >
        {modalContentFlag === 'reference' ? (
          <ReferenceRelationshipPage selectKey={selectKey} setSelectRow={setSelectRow} ref={echartsRef} />
        ) : (
          <div>{content}</div>
        )}
      </Modal>
      <Drawer
        visible={open}
        title={title}
        width={1200}
        bodyStyle={{ paddingBottom: 0 }}
        placement="right"
        onClose={handleDrawerClose}
      >
        <CMForm {...cmFormConfig} />
      </Drawer>
      <div className="content-table-top">
        <Row justify="space-between">
          <Col>
            <Space>
              <Button type="primary" icon={<Icon type={addIcon} />} onClick={handleAdd}>
                新增链接
              </Button>
              <DeleteBtn disabled={selectKey.length ? false : true} onClick={handelDelete}></DeleteBtn>
              <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
                刷新
              </Button>
            </Space>
          </Col>
          <Col>
            <Search
              placeholder="数据源名称/用户名/数据源类型"
              allowClear
              onSearch={onSearch}
              style={{ width: 250 }}
            />
          </Col>
        </Row>
      </div>
      <div style={{ marginTop: 20 }}>
        <Table
          size="small"
          columns={columns}
          dataSource={dataSource}
          rowSelection={{
            selectedRowKeys: selectKey,
            onChange: (key, selectRow) => {
              setSelectKey(key);
              setSelectRow(selectRow);
            },
          }}
          rowKey={row => row.id}
          scroll={{ x: 'max-content' }}
          pagination={paginationConfig(pageNo, total, pageSize, onPageChange)}
        />
      </div>
    </div>
  );
}
