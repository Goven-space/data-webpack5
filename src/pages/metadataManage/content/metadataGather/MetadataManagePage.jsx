import React, { useEffect, useState, useRef } from 'react';
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
  Tag,
  Checkbox,
} from 'antd';
import Icon from '@components/icon';
import { refreshIcon, exportIcon } from '@/constant/icon.js';
import CMForm from '@/components/cmForm';
import { showConfirm } from '@components/confirm';
import { standardManage, metadataManage } from '@api/dataAccessApi';
import { paginationConfig, showInfo, showError } from '@tool';
import FieldLogPage from './FieldLogPage';
import CreateProgress from './CreateProgress';

const CheckboxGroup = Checkbox.Group;

const { addList, deleteList, editList, exportList } = standardManage.metaDataManageApi;

const { getList, saveList } = metadataManage.metadataGather;
const { Search } = Input;

export default function MetadataManagePage({ menuKeyId }) {
  const plainOptions = [
    { label: '表', value: 'table' },
    { label: '视图', value: 'view' },
  ];
  const defaultCheckedList = ['table', 'view'];
  const [selectKey, setSelectKey] = useState([]);
  const [selectRow, setSelectRow] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('采集');
  const [fieldTypeOpt, setFieldTypeOpt] = useState([]);
  const [referenceTypeOpt, setReferenceTypeOpt] = useState([]);
  const [id, setId] = useState(undefined);
  const [modalContentFlag, setModalContentFlag] = useState('form');
  const [modalWidth, setModalWidth] = useState(600);
  const [checkedList, setCheckedList] = useState(defaultCheckedList);
  const [indeterminate, setIndeterminate] = useState(true);
  const [checkAll, setCheckAll] = useState(false);

  const [form] = Form.useForm();
  const progressRef = useRef(null);

  let searchData = {};
  const formItemWidth = 300;
  const width = 150;
  const labelCol = { span: 6 };
  const columns = [
    {
      title: '数据源名称',
      dataIndex: 'dataSourceName',
      width,
      ellipsis: true,
    },
    {
      title: '采集表数量',
      dataIndex: 'gatherTableNumber',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '采集视图数量',
      dataIndex: 'gatherViewNumber',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '上一次采集时间',
      dataIndex: 'gatherTime',
      ellipsis: true,
      width,
    },
    {
      title: '采集状态',
      dataIndex: 'state',
      ellipsis: true,
      width,
      render: text => (text === '1' ? <Tag color="green">已采集</Tag> : <Tag color="orange">未采集</Tag>),
    },
  ];

  useEffect(() => {
    getTableData();
    getInitData();
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

  const handleFieldLog = record => {
    setModalContentFlag('log');
    setId(record.id);
    setVisible(true);
    setTitle('字段日志');
    setModalWidth(1300);
  };

  const handleEdit = record => {
    setModalContentFlag('form');
    setId(record.id);
    setVisible(true);
    setTitle('编辑');
    setModalWidth(600);

    form.setFieldsValue({ ...record /* , referenceType, referenceCodeId */ });
  };

  const submitForm = value => {
    let handleUrl = title === '新增' ? addList : editList;
    const submit = () => {
      handleUrl({ ...value, classifyId: menuKeyId }).then(res => {
        const { state, msg } = res.data;
        if (state) {
          showInfo(msg);
          handleCancel();
          getTableData();
          form.resetFields();
        }
      });
    };
    if (value.dataModelIds) {
      showConfirm('', '检测到该字段已被数据模型引用，是否确定修改？', submit);
    } else {
      submit();
    }
  };

  const onSearch = value => {
    searchData = {
      dataSourceName: value,
    };
    getTableData({ pageNo: 1, pageSize: 10 });
  };

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
  };

  const handleAdd = flag => {
    if (!selectKey.length) {
      showError('请选择要采集的系统！');
      return;
    }
    setModalContentFlag('progress');
    setVisible(true);
    setModalWidth(800);
    saveList({
      ids: selectKey.join(),
      /* gatherType: checkedList.join(), */
      gatherType: flag,
      classifyId: menuKeyId,
    }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
        getTableData();
      } else {
        if (progressRef.current) {
          progressRef.current.clear();
        }
      }
    });
  };

  const handleCollect = flag => {
    /* setVisible(true);
    setModalWidth(400);
    setModalContentFlag("collect");
    setTitle("选择采集类型"); */
    switch (flag) {
      case 'table':
        handleAdd('table');
        break;
      case 'view':
        handleAdd('view');
        break;
      case 'all':
        handleAdd('view,table');
        break;
    }
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

  const cmformConfig = {
    formOpts: {
      form,
      onFinish: submitForm,
      initialValues: {
        fieldNull: true,
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
          name: 'dataModelIds',
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
          name: 'fieldCode',
          label: '编号',
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
          name: 'fieldName',
          label: '字段名称',
          required: true,
          labelCol,
          help: '不能为中文',
          validator: ({ getFieldValue }) => ({
            validator(_, value) {
              if (value && /^[^\u4e00-\u9fa5]{0,}$/.test(value)) {
                return Promise.resolve();
              }

              return Promise.reject(new Error('不能为中文'));
            },
          }),
        },
        input: {
          style: {
            width: formItemWidth,
          },
        },
      },
      {
        opts: {
          name: 'fieldComment',
          label: '字段注释',
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
          name: 'fieldType',
          label: '字段类型',
          required: true,
          labelCol,
        },
        select: {
          options: fieldTypeOpt,
          style: {
            width: formItemWidth,
          },
        },
      },
      {
        opts: {
          name: 'fieldLength',
          label: '字段长度',
          labelCol,
        },
        number: {
          style: {
            width: formItemWidth,
          },
        },
      },
      {
        opts: {
          name: 'fieldRadixPoint',
          label: '字段小数点',
          labelCol,
        },
        number: {
          min: 0,
          style: {
            width: formItemWidth,
          },
        },
      },
      {
        opts: {
          name: 'referenceCodeId',
          label: '引用标准代码',
          labelCol,
        },
        treeSelect: {
          style: {
            width: formItemWidth,
          },
          treeData: referenceTypeOpt,
        },
      },
      /* {
        opts: {
          name: "referenceCodeId",
          label: "引用标准代码",
          labelCol,
        },
        select: {
          style: {
            width: formItemWidth,
          },
          options: referenceCodeOpt,
        },
      }, */
      {
        opts: {
          name: 'sort',
          label: '排序',
          labelCol,
          required: true,
          initialValue: 10000,
        },
        number: {
          style: {
            width: formItemWidth,
          },
        },
      },
      {
        opts: {
          name: 'fieldNull',
          label: '是否为空',
          required: true,
          labelCol,
        },
        radioGroup: {
          style: {
            width: formItemWidth,
          },
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
        },
      },
      {
        opts: {
          name: 'defaultValue',
          label: '字段默认值',
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

  const onCollectChange = list => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < plainOptions.length);
    setCheckAll(list.length === plainOptions.length);
  };

  const onCheckAllChange = e => {
    setCheckedList(e.target.checked ? plainOptions : []);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  return (
    <div className="metadataManage-content">
      <Modal
        style={{
          top: 10,
        }}
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={modalWidth}
        destroyOnClose
        title={title}
      >
        {modalContentFlag === 'log' ? (
          <FieldLogPage id={id} />
        ) : modalContentFlag === 'progress' ? (
          <CreateProgress selectKey={selectKey} setSelectRow={setSelectRow} ref={progressRef} />
        ) : modalContentFlag === 'collect' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 20 }}>
              <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                全选
              </Checkbox>
            </div>
            <CheckboxGroup options={plainOptions} value={checkedList} onChange={onCollectChange} />
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Button type="primary" size="small" onClick={handleAdd}>
                确认
              </Button>
            </div>
          </div>
        ) : (
          <CMForm {...cmformConfig} />
        )}
      </Modal>
      <div className="content-table-top">
        <Row justify="space-between">
          <Col>
            <Space>
              {/* <Popover
                placement="rightBottom"
                title=""
              ></Popover> */}
              {/* <Button
                icon={<Icon type={exportIcon} />}
                disabled={selectKey.length ? false : true}
                onClick={handleCollect}
              >
                采集
              </Button> */}
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    <Menu.Item key="table">
                      <Button
                        onClick={() => handleCollect('table')}
                        type="link"
                        disabled={selectKey.length ? false : true}
                      >
                        采集表
                      </Button>
                    </Menu.Item>
                    <Menu.Item key="view">
                      <Button
                        onClick={() => handleCollect('view')}
                        type="link"
                        disabled={selectKey.length ? false : true}
                      >
                        采集视图
                      </Button>
                    </Menu.Item>
                    <Menu.Item key="all">
                      <Button
                        onClick={() => handleCollect('all')}
                        type="link"
                        disabled={selectKey.length ? false : true}
                      >
                        全部采集
                      </Button>
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button icon={<Icon type={exportIcon} />} type="primary">
                  采集
                </Button>
              </Dropdown>
              <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
                刷新
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Search placeholder="数据源名称" allowClear onSearch={onSearch} style={{ width: 250 }} />
            </Space>
          </Col>
        </Row>
      </div>
      <div style={{ marginTop: 20 }}>
        <Table
          bordered
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
