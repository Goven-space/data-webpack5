import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Row, Space, Button, Col, Input, Table, Modal, Form, Tag, Drawer, Dropdown, Menu } from 'antd';
import Icon from '@components/icon';
import { addIcon, refreshIcon } from '@/constant/icon.js';
import { DownOutlined } from '@ant-design/icons';
import CMForm from '@/components/cmForm';
import { showInfo, paginationConfig } from '@tool';
import { standardManage } from '@api/dataAccessApi';
import DeleteBtn from '@components/button';
import FieldPage from './fieldDataPage/FieldDataPage';
import FieldConfigPag from './FieldConfigPag';
import NewDataModel from './NewDataModel';
import LowCodeConfigPage from './LowCodeConfigPage';

const { addList, getList, deleteList, editList } = standardManage.informationManageApi;
const { getIdOpt } = standardManage.classifyManagePageApi;
const { Search } = Input;

// 弹窗配置
const dialogConfig = {
  dataModelEdit: {
    title: '',
    width: 800,
  },
  addClassify: {
    title: '新增分类',
    width: 600,
    action: addList,
  },
  editClassify: {
    title: '编辑分类',
    width: 600,
    action: editList,
  },
  data: {
    title: '数据项',
    width: 1500,
  },
  lowcode: {
    title: '低代码同步配置',
    width: 800,
  },
  add: {
    title: '',
    width: 800,
  },
};

const formItemWidth = 300;
const width = 150;
const labelCol = { span: 6 };

const InformationManagePage = ({ menuKeyId, getInitData, menuParentId, currentItem }, ref) => {
  const [selectKey, setSelectKey] = useState([]);
  const [selectRow, setSelectRow] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(undefined);
  const [contentFlag, setContentFlag] = useState('add');
  const [targetData, setTargetData] = useState({});
  const [classifyName, setClassifyName] = useState('');
  const [config, setConfig] = useState(dialogConfig.add);
  const [idDis, setIdDis] = useState(false);

  const [form] = Form.useForm();

  let searchData = {};
  const creator = sessionStorage.getItem('userId');

  const modelColumns = [
    {
      title: '模型名称',
      key: 'tableName',
      dataIndex: 'tableName',
      ellipsis: true,
      width,
    },
    {
      title: '模型注释',
      key: 'modelName',
      dataIndex: 'modelName',
      ellipsis: true,
      width,
    },
    {
      title: '字段数量',
      key: 'childNodeCount',
      dataIndex: 'childNodeCount',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '是否已建模',
      key: 'buildModel',
      dataIndex: 'buildModel',
      ellipsis: true,
      width: width - 70,
      render: text => (text ? <Tag color="green">是</Tag> : <Tag color="orange">否</Tag>),
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      ellipsis: true,
      width: width - 70,
      render: text => (text === 1 ? <Tag color="green">启用</Tag> : <Tag color="orange">停用</Tag>),
    },
    {
      title: '排序',
      key: 'sort',
      dataIndex: 'sort',
      ellipsis: true,
      width: width - 70,
    },
    {
      title: '创建人',
      key: 'creatorName',
      dataIndex: 'creatorName',
      ellipsis: true,
      width: width - 70,
    },
    {
      title: '最后修改时间',
      key: 'editTime',
      dataIndex: 'editTime',
      ellipsis: true,
      width: width,
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      width: width - 50,
      fixed: 'right',
      render: (text, record) => {
        return (
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu
                onClick={({ key }) => onMenuClick(key, record)}
                items={[
                  {
                    key: 'edit',
                    label: (
                      <Button type="text" size="small">
                        编辑
                      </Button>
                    ),
                  },
                  {
                    key: 'data',
                    label: (
                      <Button type="text" size="small">
                        数据项
                      </Button>
                    ),
                  },
                  {
                    key: 'lowcode',
                    label: (
                      <Button type="text" size="small">
                        低代码同步配置
                      </Button>
                    ),
                  },
                ]}
              />
            }
          >
            <Button type="link" size="small">
              <Space>
                操作
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  const classifyColumns = [
    {
      title: '分类编码',
      dataIndex: 'num',
      ellipsis: true,
      width,
    },
    {
      title: '分类名称',
      dataIndex: 'modelName',
      width,
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '最后修改时间',
      dataIndex: 'editTime',
      ellipsis: true,
      width,
    },
    {
      title: '操作',
      key: 'action',
      width: width - 50,
      fixed: 'right',
      render: (text, record) => {
        return (
          <Space>
            <Button type="link" onClick={() => handleEdit("editClassify", record)} size="small">
              编辑
            </Button>
          </Space>
        );
      },
    },
  ];

  useImperativeHandle(ref, () => ({
    getTableData,
  }));

  useEffect(() => {
    getTableData();
  }, [menuKeyId]);

  //分页显示返回状态码
  const getTableData = (pagination = { pageNo, pageSize }) => {
    if (!menuKeyId) {
      return;
    }
    if (menuKeyId === 'information') {
      menuKeyId = 'root';
    }
    getList({
      ...pagination,
      filters: {
        classifyId: menuKeyId,
      },
      searchFilters: {
        ...searchData,
      },
      sort: 'sort',
      order: 'asc',
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

   const getId = () => {
     //获取字段初始ID
     getIdOpt({
       appId: 'ASSET',
       type: 'CATEGORY',
     }).then(res => {
       for (const key in res.data) {
         form.setFieldsValue({
           id: res.data[key],
         });
       }
     });
   };


  const handleConfig = (key, record) => {
    setId(record.id);
    setContentFlag(key);
    setTargetData(record);
    setConfig({ ...dialogConfig[key], title: `${record.modelName}-数据项` });
    setClassifyName(record.modelName);
    setOpen(true);
  };

  const handleEdit = (key, record) => {
    const isClassify = record.type === "classify"
    if (!isClassify) {
      key = 'dataModelEdit';
      setContentFlag(key);
      setConfig({ ...dialogConfig[key] });
      setTargetData(record);
    } else {
      key = 'editClassify';
      setContentFlag('editClassify');
      const { action, ...config } = dialogConfig.editClassify;
      setConfig({ ...config });
      form.setFieldsValue({ ...record });
      setIdDis(true);
      setId(record.id);
    }
    setVisible(true);
  };

  const handleLowCodeConfig = (key, record) => {
    setId(record.id);
    setContentFlag(key);
    setConfig({ ...dialogConfig[key] });
    setTargetData(record);
    setVisible(true);
  };

  const submitForm = value => {
     let postData = {};
    postData = { ...value, type: 'classify', creator, theirTopClassifyId: menuParentId };
    contentFlag === 'addClassify' && (postData.creator = creator)
     dialogConfig[contentFlag].action({ ...postData }).then(res => {
       const { state, msg } = res.data;
       if (state) {
         showInfo(msg);
         handleCancel();
         getTableData();
         form.resetFields();
         getInitData(false, true);
       }
     });
  };

  const onSearch = value => {
    searchData = {
      num: value,
      modelName: value,
      tableName: value,
    };
    getTableData({ pageNo: 1, pageSize: 10 });
  };

  const handleCancel = (e, flag) => {
     form.resetFields();
    setVisible(false);
    if (flag) {
      getTableData();
      getInitData(false, flag);
    }
  };

  const handleAdd = () => {
    const classifyType = currentItem.classifyType;
    if (classifyType) {
      setContentFlag('addClassify');
      const {action, ...config } = dialogConfig.addClassify
      setConfig({ ...config });
      form.setFieldsValue({
        node: currentItem.key,
        nodeMark: currentItem.key,
      });
      setIdDis(false);
      getId()
    } else {
       setContentFlag('add');
       setConfig({ ...dialogConfig.add });
       setId(undefined);
    }
    setVisible(true);
  };


  const handelDelete = () => {
    deleteList({
      ids: selectKey.join(),
    }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        setSelectKey([]);
        getTableData();
        getInitData(false, true);
        showInfo(msg);
      }
    });
  };

  const refresh = () => {
    getTableData();
  };

  const onPageChange = (page, size) => {
    getTableData({ pageNo: page, pageSize: size });
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const onMenuClick = (key, record) => {
    const btnList = { edit: handleEdit, data: handleConfig, lowcode: handleLowCodeConfig };
    btnList[key](key, record);
  };

  const formConfigData = [
    {
      opts: {
        name: 'id',
        label: '分类ID',
        required: true,
        hidden: true,
        labelCol,
      },
      input: {
        style: {
          width: formItemWidth,
        },
        disabled: idDis,
      },
    },
    {
      opts: {
        name: 'node',
        label: '上级分类',
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
        name: 'nodeMark',
        label: '上级分类',
        required: true,
        hidden: true,
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
        name: 'num',
        label: '分类编码',
        labelCol,
        help: '任意有意义的编号即可',
      },
      input: {
        style: {
          width: formItemWidth,
        },
      },
    },
    {
      opts: {
        name: 'modelName',
        label: '分类名称',
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
        min: 0,
      },
    },
  ];

  const cmFormConfig = {
    formOpts: {
      form,
      onFinish: submitForm,
      initialValues: {
        // isSync: true,
        // isVerify: false,
      },
    },
    data: [...formConfigData],
    footer: [
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

  const saveModalContent = <NewDataModel handleCancel={handleCancel} modalType={contentFlag} targetData={targetData} classifyId={menuKeyId} menuParentId={menuParentId} currentItem={currentItem} />;

  const classifyContent = <CMForm {...cmFormConfig} />;
  // 弹窗列表
  const modalList = {
    data: <FieldConfigPag id={id} handleCancel={handleCancel} />,
    add: saveModalContent,
    dataModelEdit: saveModalContent,
    addClassify: classifyContent,
    editClassify: classifyContent,
    lowcode: <LowCodeConfigPage id={id} targetData={targetData} handleCancel={handleCancel} />,
  };

  return (
    <div className="metadataManage-content">
      <Modal visible={visible} footer={null} onCancel={handleCancel} width={config.width} destroyOnClose title={config.title}>
        {modalList[contentFlag] || null}
      </Modal>
      <Drawer visible={open} width={config.width} title={config.title} destroyOnClose onClose={handleDrawerClose}>
        <FieldPage pid={id} menuKeyId={menuKeyId} classifyName={classifyName} targetData={targetData} isModal />
      </Drawer>
      <div className="content-table-top">
        <Row>
          <Col span={17}>
            <Space>
              <Button type="primary" icon={<Icon type={addIcon} />} onClick={handleAdd}>
                {currentItem.classifyType ? '新增分类' : '新增数据模型'}
              </Button>
              <DeleteBtn disabled={selectKey.length ? false : true} onClick={handelDelete} />
              <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
                刷新
              </Button>
            </Space>
          </Col>
          <Col span={7} style={{ textAlign: 'right' }}>
            <Space>
              <Search placeholder="编号/表名/名称" allowClear onSearch={onSearch} style={{ width: 250 }} />
            </Space>
          </Col>
        </Row>
      </div>
      <div style={{ marginTop: 20 }}>
        <Table
          size="small"
          columns={currentItem.classifyType ? classifyColumns : modelColumns}
          dataSource={dataSource}
          rowSelection={{
            selectedRowKeys: selectKey,
            onChange: (key, selectRow) => {
              setSelectKey(key);
              setSelectRow(selectRow);
            },
          }}
          scroll={{ x: 'max-content' }}
          rowKey={row => row.id}
          pagination={paginationConfig(pageNo, total, pageSize, onPageChange)}
        />
      </div>
    </div>
  );
};

export default forwardRef(InformationManagePage);
