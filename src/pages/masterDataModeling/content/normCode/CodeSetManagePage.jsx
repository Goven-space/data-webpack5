import React, { useEffect, useState, useRef } from 'react';
import { Row, Space, Button, Col, Input, Table, Modal, Form, Dropdown, Menu, Drawer, Tag } from 'antd';
import Icon from '@components/icon';
import { addIcon, refreshIcon, exportIcon, dropdownIcon } from '@/constant/icon.js';
import CMForm from '@/components/cmForm';
import { showInfo, showError } from '@tool';
import { standardManage, kernelModule } from '@api/dataAccessApi';
import { paginationConfig } from '@tool';
import DeleteBtn from '@components/button';
import FieldLogPage from './FieldDataPage';
import Import from '@components/import';
import FilePreview from '@components/filePreview';

const { getList, addList, deleteList, editList, importExcelUrl, exportExcelList, exportStandardList } =
  standardManage.codeSetManageApi;

const { upLoadFileUrl, fileDownload, businessFileDelete } = kernelModule.fileServer;

const { Search } = Input;

export default function CodeSetManagePage({ menuKeyId, getMenuData, getInitTreeData }, ref) {
  const [selectKey, setSelectKey] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('新增');
  const [id, setId] = useState(undefined);
  const [dialogWidth, setDialogWidth] = useState(500);
  const [modalContentFlag, setModalContentFlag] = useState('form');
  const [module, setModule] = useState('');
  const [fileId, setFileId] = useState('');

  const [form] = Form.useForm();
  const importTypeRef = useRef('excel');

  let searchData = {};
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
      width: width - 20,
    },
    {
      title: '代码名称',
      key: 'remark',
      dataIndex: 'remark',
      ellipsis: true,
      width,
    },
    {
      title: '子节点数量',
      key: 'child_node',
      dataIndex: 'child_node',
      ellipsis: true,
      width: width - 90,
      render: text => <Tag color="purple">{text}</Tag>,
    },
    // {
    //   title: '上传文件名称',
    //   key: 'file_name',
    //   dataIndex: 'file_name',
    //   ellipsis: true,
    //   width,
    //   render: (text, record) => (
    //     <Button type="link" onClick={() => handleShowField(record)}>
    //       {text}
    //     </Button>
    //   ),
    // },
    {
      title: '创建人',
      key: 'creatorName',
      dataIndex: 'creatorName',
      ellipsis: true,
      width: width - 100,
    },
    {
      title: '最后修改时间',
      key: 'editTime',
      dataIndex: 'editTime',
      ellipsis: true,
      width: width - 30,
    },
    {
      title: '排序',
      key: 'sort',
      dataIndex: 'sort',
      ellipsis: true,
      width: width - 90,
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      width: width - 80,
      fixed: 'right',
      render: (text, record) => {
        return (
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu
                onClick={({ key }) => handleMenuClick(key, record)}
                items={[
                  { label: '编辑', key: 'edit' },
                  { label: '数据项', key: 'fieldData' },
                  // { label: '文件上传', key: 'upload' },
                  // { label: '文件下载', key: 'download', disabled: !record.file_id },
                  // { label: '文件删除', key: 'delFile', disabled: !record.file_id },
                ]}
              />
            }
            placement="bottomLeft"
          >
            <Button type="link" icon={<Icon type={dropdownIcon} />}>
              操作
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  useEffect(() => {
    const pathname = window.location.pathname.split('/');
    const module = pathname[pathname.length - 1];
    setModule(module);
  }, []);

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
      sort: 'sort',
      order: 'asc',
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

  const handleFieldData = (record, key) => {
    setModalContentFlag(key);
    setId(record.id);
    setTitle(`${record.name}-数据项`);
    setDialogWidth(1200);
    setOpen(true);
  };

  const handleEdit = (record, key) => {
    setModalContentFlag(key);
    setId(record.id);
    setVisible(true);
    setTitle('编辑');
    setDialogWidth(500);
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
    value = value ? value.trim() : '';
    searchData = value
      ? {
          num: value,
          name: value,
          remark: value,
        }
      : {};
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
    setModalContentFlag('form');
    setVisible(true);
    setTitle('新增');
    setId(undefined);
    setDialogWidth(500);
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
    exportExcelList({ classifyId: menuKeyId });
  };

  const importProps = {
    accept: '.bson,.xlsx',
    maxCount: 1,
    multiple: false,
  };

  const importCallBack = () => {
    setVisible(false);
    getInitTreeData();
    getTableData();
  };

  const handleImport = flag => {
    setModalContentFlag('import');
    setDialogWidth(800);
    setVisible(true);
    setTitle(`上传${flag === 'bson' ? 'bson' : 'excel'}文件`);
    importTypeRef.current = flag;
  };

  const handleMenuClick = (key, record) => {
    if (key === 'edit') {
      handleEdit(record, key);
    } else if (key === 'fieldData') {
      handleFieldData(record, key);
    } else if (key === 'upload') {
      handleUpload(record, key);
    } else if (key === 'download') {
      handleDownload(record);
    } else if (key === 'delFile') {
      handleDelFile(record);
    }
  };

  const handleUpload = (record, key) => {
    setModalContentFlag(key);
    setId(record.id);
    setVisible(true);
    setTitle(`${record.name}-文件上传`);
    setDialogWidth(800);
  };

  const uploadProps = {
    maxCount: 1,
    multiple: false,
  };

  const handleShowField = record => {
    setModalContentFlag('preview');
    setId(record.id);
    setFileId(record.file_id);
    setDialogWidth(1200);
    setVisible(true);
    setTitle(`${record.name}-文件预览`);
  };

  const handleDownload = record => {
    fileDownload({ fileId: record.file_id });
  };

  const handleDelFile = record => {
    businessFileDelete({ module, businessId: record.id, fileId: record.file_id }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
      }
      getInitTreeData();
      getTableData();
    });
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className="metadataManage-content">
      <Modal visible={visible} footer={null} onCancel={handleCancel} width={dialogWidth} title={title}>
        {modalContentFlag === 'import' ? (
          <Import
            uploadCallBack={importCallBack}
            uploadProps={importProps}
            postData={{ classifyId: menuKeyId }}
            url={importExcelUrl}
          />
        ) : modalContentFlag === 'upload' ? (
          <Import
            uploadCallBack={importCallBack}
            uploadProps={uploadProps}
            postData={{ relevanceId: id, module }}
            url={upLoadFileUrl}
          />
        ) : modalContentFlag === 'preview' ? (
          <FilePreview fileId={fileId} closeModal={handleCancel} />
        ) : (
          <CMForm {...cmformConfig} />
        )}
      </Modal>
      <Drawer visible={open} width={dialogWidth} title={title} onClose={handleDrawerClose}>
        <FieldLogPage id={id} />
      </Drawer>
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
                    <Menu.Item key="fieldLog_import">
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
                    {/*<Menu.Item key="edit">
                       <Button type="link" onClick={() => handleExport("bson")}>
                        导出Bson
                      </Button> 
                    </Menu.Item>*/}
                    <Menu.Item key="fieldLog_export">
                      <Button type="link" onClick={() => handleExport('excel')}>
                        导出Excel模板
                      </Button>
                    </Menu.Item>
                    <Menu.Item key="standard_export">
                      <Button type="link" onClick={() => handleExport('standard')}>
                        导出教育标准代码Excel模板
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
                placeholder="代码编号/代码值/代码名称"
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
