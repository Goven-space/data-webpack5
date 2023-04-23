import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Row, Space, Button, Col, Input, Table, Modal, Form, Dropdown, Menu } from 'antd';
import Icon from '@components/icon';
import { addIcon, refreshIcon } from '@/constant/icon.js';
import CMForm from '@/components/cmForm';
import { standardManage } from '@api/dataAccessApi';
import { paginationConfig, showInfo } from '@tool';
import DeleteBtn from '@components/button';

const { getList, getIdOpt, addList, deleteList } = standardManage.classifyManagePageApi;
const { Search } = Input;

function MetaDataClassifyManagePage({ menuKeyId, getMenuData, node, pMenuKey }, ref) {
  const [selectKey, setSelectKey] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [idDis, setIdDis] = useState(false);
  const [title, setTitle] = useState('新增');
  const [modalWidth, setModalWidth] = useState(550);

  const [form] = Form.useForm();

  const creator = sessionStorage.getItem('userId');
  let searchData = {};
  const formItemWidth = 300;
  const width = 150;
  const labelCol = { span: 6 };

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'classifyName',
      width: width + 50,
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      ellipsis: true,
      width: width -  60,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      ellipsis: true,
      width: width - 60,
    },
    {
      title: '修改人',
      dataIndex: 'editor',
      ellipsis: true,
      width: width - 60,
    },
    {
      title: '最后修改时间',
      dataIndex: 'editTime',
      ellipsis: true,
      width: width,
    },
    {
      title: '操作',
      key: 'action',
      width: width - 20,
      align: 'center',
      fixed: 'right',
      render: (text, record) => {
        return (
          <Space>
            {!record.isLeaf ? (
              <Button type="link" onClick={() => handleFieldSub(record)} size="small">
                新增子项
              </Button>
            ) : null}
            <Button type="link" onClick={() => handleEdit(record)} size="small">
              编辑
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    getTableData();
  }, [menuKeyId]);

  useImperativeHandle(ref, () => ({
    getTableData,
  }));

  //分页显示返回状态码
  const getTableData = (pagination = { pageNo, pageSize }) => {
    getList({
      ...pagination,
      filters: JSON.stringify({
        classifyType: pMenuKey,
        node: node ? (node === 'metadataLabelSet' ? 'root' : node) : 'root',
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


  // const dealPostData = (dataSource = [], value, obj) => {
  //   const data = dataSource.find(item => {
  //     if (item.id === value) {
  //       if (!item.children) {
  //         item.children = [];
  //         item.children.push({ ...obj });
  //       } else {
  //         item.children.push({ ...obj });
  //       }
  //       return true;
  //     } else {
  //       if (item.children && item.children.length) {
  //         return dealPostData(item.children, value, obj);
  //       }
  //     }
  //   });
  //   return data;
  // };

  const submitForm = value => {
    let postData = {};
    postData = { ...value, classifyType: pMenuKey, creator };

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
    searchData = value ? {
      classifyName: value.trim(),
    } : {};
    getTableData({ pageNo: 1, pageSize: 10 });
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const handleAdd = () => {
    setVisible(true);
    setTitle('新增');
    form.setFieldsValue({
      node: 'root',
      nodeMark: 'root',
    });
    getId();
  };

  const handleEdit = record => {
    /* dealDataSourceId(); */
    setVisible(true);
    setTitle('编辑');
    setIdDis(true);
    form.setFieldsValue({
      ...record,
    });
  };

  const handleFieldSub = record => {
    /* dealDataSourceId(); */
    setVisible(true);
    getId();
    setIdDis(false);
    form.setFieldsValue({
      node: record.id,
      nodeMark: record.classifyName,
    });
    setTitle('新增子项');
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
    <>
      <Modal
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={modalWidth}
        destroyOnClose
        title={title}
      >
        <CMForm {...cmformConfig} />
      </Modal>
      <div className="content-table-top">
        <Row justify="space-between">
          <Col >
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
          <Col>
              <Search
                placeholder="分类名称"
                allowClear
                onSearch={onSearch}
                style={{ width: 250 }}
              />
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

export default forwardRef(MetaDataClassifyManagePage); 