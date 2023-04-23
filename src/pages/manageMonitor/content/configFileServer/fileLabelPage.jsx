import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { Row, Space, Button, Col, Input, Table, Modal, Form } from 'antd';
import Icon from '@components/icon';
import { refreshIcon, deleteIcon } from '@/constant/icon.js';
import {  kernelModule } from '@api/dataAccessApi';
import { paginationConfig, showInfo } from '@tool';
import Import from '@components/import';
import FilePreview from '@components/filePreview';

const { upLoadFileByClassify, getListByPage, fileDownload, fileBatchDelete } = kernelModule.fileServer;
const { Search } = Input;
const { confirm } = Modal;

const InformationManagePage = ({ menuKeyId, getInitData, getMenuData }, ref) => {
  const [selectKey, setSelectKey] = useState([]);
  const [selectRow, setSelectRow] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('新增');
  const [id, setId] = useState(undefined);
  const [modalWidth, setModalWidth] = useState(600);
  const [modalContentFlag, setModalContentFlag] = useState('form');
  const [module, setModule] = useState('');
  const [fileId, setFileId] = useState('');

  const type = useRef('dataModel');
  const sortObj = useRef({});
  const [form] = Form.useForm();

  let searchData = {};
  let importType = 'excel';
  const formItemWidth = 300;
  const width = 150;
  const labelCol = { span: 6 };
  const allowFileType = [
    'doc',
    'docx',
    'pdf',
    'txt',
    'gif',
    'jpg',
    'jpeg',
    'bmp',
    'tiff',
    'tif',
    'png',
    'svg',
  ];

  const columns = [
    {
      title: '文件名称',
      key: 'fileName',
      dataIndex: 'fileName',
      ellipsis: true,
      width: width,
    },
    {
      title: '文件类型',
      key: 'fileSuffix',
      dataIndex: 'fileSuffix',
      ellipsis: true,
      width: width - 100,
      render: text => text?.replace('.', ''),
    },
    {
      title: '文件大小',
      key: 'fileSize',
      dataIndex: 'fileSize',
      ellipsis: true,
      width: width - 100,
    },
    {
      title: '上传时间',
      key: 'createTime',
      dataIndex: 'createTime',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '上传人',
      key: 'creatorName',
      dataIndex: 'creatorName',
      ellipsis: true,
      width: width - 50,
    },

    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      width: width - 60,
      fixed: 'right',
      render: (text, record) => {
        return (
          <Space size="small">
            {allowFileType.includes(record.fileSuffix?.replace('.', '')) && (
              <Button type="link" onClick={() => handleShowField(record)}>
                预览
              </Button>
            )}
            <Button type="link" onClick={() => handleSingleDownload(record)}>
              下载
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
    const pathname = window.location.pathname.split('/');
    const module = pathname[pathname.length - 1];
    setModule(module);
  }, []);

  useEffect(() => {
    getTableData();
  }, [menuKeyId]);

  //分页显示返文件分类
  const getTableData = (pagination = { current, pageSize }) => {
    const {current, pageSize} = pagination
    if (!menuKeyId) {
      return;
    }
    getListByPage({
      pageNo: current,
      pageSize,
      filters: {
        classifyId: menuKeyId,
      },
      searchFilters: {
        ...searchData,
      },
      ...sortObj.current,
    }).then(res => {
      const { state, rows, pageNo, pageSize, total } = res.data;
      if (state) {
        setDataSource(rows);
        setCurrent(pageNo);
        setPageSize(pageSize);
        setTotal(total);
      }
    });
  };

  const getFormatData = (arr = []) => {
    return arr.map(item => {
      return {
        title: item.classifyName,
        value: item.id,
        isLeaf: item.isLeaf,
        disabled: item.isLeaf ? false : true,
        children: item.children && item.children.length ? getFormatData(item.children) : undefined,
      };
    });
  };

  const uploadCallBack = () => {
    setVisible(false);
    getTableData();
  };

  const onSearch = value => {
    searchData = {
      num: value,
      modelName: value,
      tableName: value,
    };
    getTableData({ current: 1, pageSize: 10 });
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const refresh = () => {
    getTableData();
  };

  const onPageChange = ({ pageSize, current }, filters, sorter) => {
    const sort = sorter.order ? { order: sorter.order === 'ascend' ? 'asc' : 'desc', sort: 'dataCount' } : {};
    sortObj.current = sort;
    getTableData({ current, pageSize });
  };

  const handleShowField = record => {
    setModalContentFlag('preview');
    setId(record.id);
    setFileId(record.id);
    setModalWidth(1200);
    setVisible(true);
    setTitle(`${record.name}-文件预览`);
  };

  const handleUpload = () => {
    setModalContentFlag('upload');
    setVisible(true);
    setTitle('文件上传');
    setModalWidth(800);
  };

  const handleSingleDownload = record => {
    fileDownload({ fileId: record.id });
  };

  const handleDelFile = () => {
    const ids = selectKey.join(',');
    confirm({
      title: '确认删除',
      content: '确定删除选中数据吗？',
      onOk() {
        fileBatchDelete({ fileIds: ids }).then(res => {
          const { state, msg } = res.data;
          if (state) {
            showInfo(msg);
          }
          getTableData();
          setSelectKey([]);
        });
      },
      onCancel() {},
    });
  };

  const uploadProps = {
    maxCount: 1,
    multiple: false,
  };

  return (
    <div className="metadataManage-content">
      <Modal
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={modalWidth}
        destroyOnClose
        title={title}
      >
        {
          modalContentFlag === 'upload' ? ( //上传
            <Import
              uploadCallBack={uploadCallBack}
              uploadProps={uploadProps}
              postData={{ classifyId: menuKeyId, module }}
              url={upLoadFileByClassify}
            />
          ) : (
            <FilePreview fileId={fileId} closeModal={handleCancel} />
          ) //预览
        }
      </Modal>

      <div className="metadataManage-top">
        <Row justify="space-between">
          <Col>
            <Space>
              <Button onClick={handleUpload}>上传</Button>
              <Button icon={<Icon type={deleteIcon} />} onClick={handleDelFile} disabled={!selectKey.length}>
                删除
              </Button>
              <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
                刷新
              </Button>
            </Space>
          </Col>
          <Col>
            <Search placeholder="文件名/上传人" allowClear onSearch={onSearch} style={{ width: 250 }} />
          </Col>
        </Row>
      </div>
      <div style={{ marginTop: 20 }} className="">
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
          scroll={{ x: 'max-content' }}
          rowKey={row => row.id}
          pagination={paginationConfig(current, total, pageSize)}
          onChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default forwardRef(InformationManagePage);
