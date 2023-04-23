import React, { useEffect, useState } from 'react';
import { Row, Space, Button, Col, Input, Table, Modal, Form, Dropdown, Menu } from 'antd';
import Icon from '@components/icon';
import { addIcon, refreshIcon, showIcon, exportIcon } from '@/constant/icon.js';
import CMForm from '@/components/cmForm';
import { showInfo, showError } from '@tool';
import { standardManage } from '@api/dataAccessApi';
import { paginationConfig } from '@tool';
import DeleteBtn from '@components/button';
import FieldLogPage from './FieldDataPage';
import Import from '@components/import';

const { getList, addList, deleteList, editList, importExcelUrl, exportExcelList } =
  standardManage.codeSetManageApi;
const { Search } = Input;

export default function CodeSetManagePage({ menuKeyId, getMenuData }, ref) {
  const [selectKey, setSelectKey] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('新增');
  const [id, setId] = useState(undefined);
  const [modalWidth, setModalWidth] = useState(500);
  const [modalContentFlag, setModalContentFlag] = useState('form');

  const [form] = Form.useForm();

  let searchData = {};
  let importType = 'excel';
  const formItemWidth = 300;
  const width = 150;
  const labelCol = { span: 6 };

  const columns = [
    {
      title: '代码编号',
      key: 'num',
      dataIndex: 'num',
      width: width - 20,
      ellipsis: true,
    },
    {
      title: '代码值',
      key: 'name',
      dataIndex: 'name',
      ellipsis: true,
      width: width,
    },
    {
      title: '代码名称',
      key: 'remark',
      dataIndex: 'remark',
      ellipsis: true,
      width: width,
    },
    {
      title: '子节点数量',
      key: 'child_node',
      dataIndex: 'child_node',
      ellipsis: true,
      width: width,
    },
    {
      title: '创建人',
      key: 'creatorName',
      dataIndex: 'creatorName',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '最后修改时间',
      key: 'editTime',
      dataIndex: 'editTime',
      ellipsis: true,
      width: width,
    },
    {
      title: '排序',
      key: 'sort',
      dataIndex: 'sort',
      ellipsis: true,
      width: width - 30,
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      width: width,
      fixed: 'right',
      render: (text, record) => {
        return (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)} size="small">
              编辑
            </Button>
            <Button type="link" onClick={() => handleFieldLog(record)} size="small">
              数据项
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    getTableData();
  }, [menuKeyId]);

  //分页显示返回状态码
  const getTableData = (pagination = { pageNo, pageSize }) => {
    getList({
      ...pagination,
      filters: {
        classify_id: menuKeyId,
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

  const handleFieldLog = record => {
    setModalContentFlag('fieldData');
    setId(record.id);
    setVisible(true);
    setTitle(`${record.name}-数据项`);
    setModalWidth(1200);
  };

  const handleEdit = record => {
    setModalContentFlag('form');
    setId(record.id);
    setVisible(true);
    setTitle('编辑');
    setModalWidth(500);
    form.setFieldsValue({ ...record });
  };

  const submitForm = value => {
    let handleUrl = title === '新增' ? addList : editList;
    handleUrl({ ...value, classify_id: menuKeyId }).then(res => {
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
    searchData = {
      num: value,
      name: value,
      remark: value,
    };
    getTableData({ pageNo: 1, pageSize: 10 });
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleAdd = () => {
    if (!menuKeyId) {
      showError('请先在右侧创建分类后在新增代码集！');
      return;
    }
    setVisible(true);
    setTitle('新增');
    setId(undefined);
    setModalWidth(500);
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
        getMenuData();
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
      initialValues: {},
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
          name: 'num',
          label: '代码编号',
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
          name: 'name',
          label: '代码值',
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
          name: 'remark',
          label: '代码名称',
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

  const handleExport = flag => {
    if (!menuKeyId) {
      return;
    }
    if (flag === 'bson') {
    } else {
      exportExcelList({ classifyId: menuKeyId });
    }
  };

  const uploadProps = {
    accept: '.bson,.xlsx',
    maxCount: 1,
    multiple: false,
  };

  const uploadCallBack = () => {
    setVisible(false);
    getTableData();
  };

  const handleImport = flag => {
    setModalContentFlag('upload');
    setModalWidth(800);
    setVisible(true);
    setTitle(`上传${flag === 'bson' ? 'bson' : 'excel'}文件`);
    importType = flag;
  };

  return (
    <div className="metadataManage-content">
      <Modal
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={modalWidth}
        destroyOnClose={false}
        title={title}
      >
        {modalContentFlag === 'fieldData' ? (
          <FieldLogPage id={id} />
        ) : modalContentFlag === 'upload' ? (
          <Import
            uploadCallBack={uploadCallBack}
            uploadProps={uploadProps}
            postData={{ classifyId: menuKeyId }}
            url={importExcelUrl}
          />
        ) : (
          <CMForm {...cmformConfig} />
        )}
      </Modal>
      <div className="content-table-top">
        <Row>
          <Col span={17}>
            <Space>
              <Button type="primary" icon={<Icon type={addIcon} />} onClick={handleAdd}>
                新增
              </Button>
              <DeleteBtn disabled={selectKey.length ? false : true} onClick={handelDelete}></DeleteBtn>
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    <Menu.Item key="fieldLog">
                      <Button type="link" onClick={() => handleImport('excel')}>
                        导入Excel
                      </Button>
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button icon={<Icon type={exportIcon} />} type="primary">
                  导入
                </Button>
              </Dropdown>
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    <Menu.Item key="edit">
                      {/* <Button type="link" onClick={() => handleExport("bson")}>
                        导出Bson
                      </Button> */}
                    </Menu.Item>
                    <Menu.Item key="fieldLog">
                      <Button type="link" onClick={() => handleExport('excel')}>
                        导出Excel模板
                      </Button>
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button icon={<Icon type={exportIcon} />}>导出</Button>
              </Dropdown>
              <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
                刷新
              </Button>
            </Space>
          </Col>
          <Col span={7} style={{ textAlign: 'right' }}>
            <Space>
              <Search
                placeholder="编号/字段注释/字段名称"
                allowClear
                onSearch={onSearch}
                style={{ width: 250 }}
                /* value={searchValue} 
              onChange={handleSearchChange}*/
              />
              {/* <Button icon={<Icon type={resetIcon} />}>重置</Button> */}
            </Space>
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
            onChange: key => setSelectKey(key),
          }}
          rowKey={row => row.id}
          pagination={paginationConfig(pageNo, total, pageSize, onPageChange)}
        />
      </div>
    </div>
  );
}
