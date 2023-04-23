import React, { useEffect, useState, useContext } from 'react';
import { Row, Space, Button, Col, Input, Table, Modal, Form } from 'antd';
import Icon from '@components/icon';
import MainContext from '@store/';
import { addIcon, refreshIcon } from '@/constant/icon.js';
import CMForm from '@/components/cmForm';
import { standardManage } from '@api/dataAccessApi';
import _ from 'lodash';
import { paginationConfig, showInfo } from '@tool';
import DeleteBtn from '@components/button';
import TextToolTip from '@components/textToolTip';

const { getList, getIdOpt, addList, deleteList } = standardManage.classifyManagePageApi;
const { Search } = Input;

export default function MetaDataClassifyManagePage({ menuKeyId, getMenuData, rootKey, targetItem }) {
  const [selectKey, setSelectKey] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [idDis, setIdDis] = useState(false);
  const [modalContentFlag, setModalContentFlag] = useState('add');
  const [showRootFormConfig, setShowRootFormConfig] = useState(false);

  const [form] = Form.useForm();
  const { defaultDataSource } = useContext(MainContext);

  const creator = sessionStorage.getItem('userId');
  let searchData = {};
  const formItemWidth = 300;
  const labelCol = { span: 6 };

  const columns = [
    {
      title: '分类编码',
      dataIndex: 'classifyCode',
      ellipsis: true,
      width: 150,
    },
    {
      title: '分类名称',
      dataIndex: 'classifyName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      ellipsis: true,
      width: 60,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      ellipsis: true,
      width: 80,
    },
    {
      title: '最后修改时间',
      dataIndex: 'editTime',
      ellipsis: true,
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (text, record) => {
        return (
          <Space>
            {/* {record.isLeaf ? null : (
              <Button type="link" onClick={() => handleFieldSub(record)} size="small">
                新增子项
              </Button>
            )} */}
            <Button type="link" onClick={() => handleEdit(record)} size="small">
              编辑
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    if (rootKey && menuKeyId) {
      getTableData();
      searchData = {};
    }
  }, [menuKeyId, rootKey]);

  //分页显示返回状态码
  const getTableData = (pagination = { pageNo, pageSize }) => {
    getList({
      ...pagination,
      filters: JSON.stringify({
        classifyType: rootKey,
        node: rootKey === menuKeyId ? 'root' : menuKeyId,
      }),
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

  const getFormatData = data => {
    return data.map(item => ({
      title: (
        <div className="info-menu">
          <TextToolTip text={item.modelName}>
            <div className="menu-text">{item.modelName}</div>
          </TextToolTip>
        </div>
      ),
      name: item.modelName,
      key: item.id,
      value: item.id,
      isLeaf: item.leaf,
      children: item.children && item.children.length ? getFormatData(item.children) : undefined,
    }));
  };

  const dealPostData = (dataSource = [], value, obj) => {
    const data = dataSource.find(item => {
      if (item.id === value) {
        if (!item.children) {
          item.children = [];
          item.children.push({ ...obj });
        } else {
          item.children.push({ ...obj });
        }
        return true;
      } else {
        if (item.children && item.children.length) {
          return dealPostData(item.children, value, obj);
        }
      }
    });
    return data;
  };

  const submitForm = value => {
    let postData = {};
    postData = { ...value, classifyType: rootKey, creator };

    addList({ ...postData }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
        handleCancel();
        getTableData();
        form.resetFields();
        getMenuData();
      }
    });
  };

  const onSearch = value => {
    searchData = value
      ? {
          classifyCode: value.trim(),
          classifyName: value.trim(),
        }
      : {};
    getTableData({ pageNo: 1, pageSize: 10 });
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const handleAdd = () => {
    setModalContentFlag('add');
    setVisible(true);
    setShowRootFormConfig(menuKeyId === 'normDataElement');
    form.setFieldsValue({
      node: menuKeyId === rootKey ? 'root' : menuKeyId,
      nodeMark: menuKeyId === rootKey ? 'root' : targetItem.nodeMark,
    });
    getId();
  };

  const handleEdit = record => {
    setModalContentFlag('edit');
    setShowRootFormConfig(menuKeyId === 'normDataElement' && record.node === 'root');
    setVisible(true);
    setIdDis(true);
    form.setFieldsValue({
      ...record,
    });
  };

  const handleFieldSub = record => {
    setModalContentFlag('addSub');
    setShowRootFormConfig(false);
    setVisible(true);
    getId();
    setIdDis(false);
    form.setFieldsValue({
      node: record.id,
      nodeMark: record.classifyName,
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

  const handelDelete = () => {
    if (selectKey.includes('NORM_DATA_ELEMENT_NOT_CLASS')) {
      //未分类不能删除，定制化的
      showInfo('该分类不能删除!');
      return;
    }
    deleteList({
      ids: selectKey.join(),
    }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        setSelectKey([]);
        getTableData();
        getMenuData();
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
  const classifyFormItem = showRootFormConfig
    ? [
        {
          opts: {
            name: 'dataSourceId',
            label: '关联数据源',
            labelCol,
            initialValue: defaultDataSource,
            hidden: true,
            required: true,
          },
          input: {
            style: {
              width: formItemWidth,
            },
          },
        },
      ]
    : [];

  const cmformConfig = {
    formOpts: {
      form,
      onFinish: submitForm,
      initialValues: {
        node: 'root',
        nodeMark: 'root',
      },
    },
    data: [
      {
        opts: {
          name: 'id',
          label: '分类ID',
          required: true,
          labelCol,
          hidden: true,
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
          name: 'classifyCode',
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
          name: 'classifyName',
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
      ...classifyFormItem,
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

  // 新增、删除、新增子项表单
  const saveContent = <CMForm {...cmformConfig} />;

  const modalList = {
    add: {
      title: '新增',
      width: 550,
      content: saveContent,
    },
    edit: {
      title: '编辑',
      width: 550,
      content: saveContent,
    },
    addSub: {
      title: '新增子项',
      width: 550,
      content: saveContent,
    },
  };

  return (
    <>
      <Modal visible={visible} footer={null} onCancel={handleCancel} width={modalList[modalContentFlag].width} destroyOnClose={false} title={modalList[modalContentFlag].title}>
        {modalList[modalContentFlag].content || null}
      </Modal>
      <div className="content-table-top">
        <Row>
          <Col span={17}>
            <Space>
              <Button type="primary" icon={<Icon type={addIcon} />} onClick={handleAdd}>
                新增分类
              </Button>
              <DeleteBtn disabled={selectKey.length ? false : true} onClick={handelDelete}></DeleteBtn>
              <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
                刷新
              </Button>
            </Space>
          </Col>
          <Col span={7} style={{ textAlign: 'right' }}>
            <Space>
              <Search placeholder="分类编码/分类名称" allowClear onSearch={onSearch} style={{ width: 250 }} />
            </Space>
          </Col>
        </Row>
      </div>
      <div className="content-table-content">
        <Table
          size="small"
          columns={columns}
          dataSource={dataSource}
          rowSelection={{
            selectedRowKeys: selectKey,
            onChange: key => setSelectKey(key),
          }}
          rowKey={row => row.id}
          pagination={paginationConfig(pageNo, total, pageSize, onPageChange)}
        />
      </div>
    </>
  );
}
