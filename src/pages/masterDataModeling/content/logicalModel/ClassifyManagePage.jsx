import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Row, Space, Button, Col, Input, Table, Modal, Form } from 'antd';
import Icon from '@components/icon';
import { addIcon, refreshIcon } from '@/constant/icon.js';
import CMForm from '@/components/cmForm';
import { standardManage } from '@api/dataAccessApi';
import { paginationConfig, showInfo } from '@tool';
import DeleteBtn from '@components/button';

const { getIdOpt } = standardManage.classifyManagePageApi;
const { getList, addList, deleteList, editList } =
  standardManage.informationManageApi;
const { Search } = Input;

const MetaDataClassifyManagePage = ({ menuKeyId, getInitData }, ref) => {
  const [selectKey, setSelectKey] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [idDis, setIdDis] = useState(false);
  const [modalType, setModalType] = useState('add');

  const [form] = Form.useForm();

  const creator = sessionStorage.getItem('userId');
  let searchData = {};
  const formItemWidth = 300;
  const width = 150;
  const labelCol = { span: 6 };

  const modalList = {
    add: {
      title: '新增',
      width: 550,
      action: addList,
    },
    edit: {
      title: '编辑',
      width: 550,
      action: editList,
    },
  };

  const columns = [
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
            <Button type="link" onClick={() => handleEdit(record)} size="small">
              编辑
            </Button>
            {record.leaf && <Button type="link" size="small" onClick={() => createSub(record)}>新增子项</Button>}
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
    searchData = {};
  }, [menuKeyId]);

  //分页显示返回状态码
  const getTableData = (pagination = { pageNo, pageSize }) => {
    getList({
      ...pagination,
      filters: JSON.stringify({ type: 'classify', node: 'root' }),
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
    postData = { ...value, type: 'classify', creator };
    menuKeyId === 'information' && (postData.theirTopClassifyId = postData.id);
    modalList[modalType].action({ ...postData }).then(res => {
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
      id: value,
      modelName: value,
    };
    getTableData({ pageNo: 1, pageSize: 10 });
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const handleAdd = () => {
    /* dealDataSourceId(); */
    setVisible(true);
    setIdDis(false);
    setModalType('add');
    form.setFieldsValue({
      node: 'root',
    });
    getId();
  };

  const handleEdit = record => {
    /* dealDataSourceId(); */
    setVisible(true);
    setModalType('edit');
    setIdDis(true);
    form.setFieldsValue({
      ...record,
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
    if (selectKey.includes('ASSET_CATEGORY_NOT_CLASSIFIED')) {
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
        getInitData(false, true);
        showInfo(msg);
      }
    });
  };

  const refresh = () => {
    getTableData();
  };

  const createSub = (record) => {
    setVisible(true);
    setIdDis(false);
    setModalType('add');
    form.setFieldsValue({
      node: record.id,
    });
    getId();
  }

  const onPageChange = (page, size) => {
    getTableData({ pageNo: page, pageSize: size });
  };

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
    <div className="metadataManage-content">
      <Modal
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={modalList[modalType].width}
        destroyOnClose
        title={modalList[modalType].title}
      >
        <CMForm {...cmformConfig} />
      </Modal>
      <div className="content-table-top">
        <Row>
          <Col span={17}>
            <Space>
              <Button type="primary" icon={<Icon type={addIcon} />} onClick={handleAdd}>
                新增分类
              </Button>
              <DeleteBtn disabled={selectKey.length ? false : true} onClick={handelDelete} />
              <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
                刷新
              </Button>
            </Space>
          </Col>
          <Col span={7} style={{ textAlign: 'right' }}>
            <Space>
              <Search
                placeholder="分类ID/分类名称"
                allowClear
                onSearch={onSearch}
                style={{ width: 250 }}
                /* value={searchValue} 
                onChange={handleSearchChange}*/
              />
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
    </div>
  );
};
export default forwardRef(MetaDataClassifyManagePage);
