import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { Row, Space, Button, Col, Input, Table, Modal, Form, Dropdown, Menu, Drawer } from 'antd';
import Icon from '@components/icon';
import { refreshIcon, exportIcon, dropdownIcon } from '@/constant/icon.js';
import CMForm from '@/components/cmForm';
import { showInfo } from '@tool';
import { standardManage, metadataManage } from '@api/dataAccessApi';
import { paginationConfig } from '@tool';
import DeleteBtn from '@components/button';
import FieldPage from './FieldDataPage';
import FieldConfigPag from './FieldConfigPag';
import Import from '@components/import';
import DataBarChart from './DataBarChart';

const { deleteList } = standardManage.informationManageApi;
const { getList, saveList, getClassifyOpt, setTableClassify, importExcelUrl, exportExcelList, delList } =
  metadataManage.metadataLabel;
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
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('新增');
  const [id, setId] = useState(undefined);
  /* const [type, setType] = useState("classify"); */
  const [dialogWidth, setDialogWidth] = useState(600);
  const [modalContentFlag, setModalContentFlag] = useState('form');
  const type = useRef('dataModel');
  const sortObj = useRef({});
  const [form] = Form.useForm();
  let searchData = {};
  let importType = 'excel';
  const formItemWidth = 300;
  const width = 150;
  const labelCol = { span: 6 };

  const columns = [
    {
      title: '类型',
      dataIndex: 'modelType',
      ellipsis: true,
      width,
      render: text => (text ? (text === 'view' ? '视图' : text === 'table' ? '表' : '表和视图') : ''),
    },
    {
      title: '英文名称',
      dataIndex: 'tableName',
      ellipsis: true,
      width,
    },
    {
      title: '中文名称',
      dataIndex: 'modelName',
      ellipsis: true,
      width,
    },
    {
      title: '字段数量',
      dataIndex: 'childNodeCount',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '数据量',
      dataIndex: 'dataCount',
      ellipsis: true,
      width: width - 50,
      sorter: true,
    },
    {
      title: '采集时间',
      dataIndex: 'gatherTime',
      ellipsis: true,
      width,
    },
    {
      title: '采集人',
      dataIndex: 'creatorName',
      ellipsis: true,
      width,
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: width - 60,
      fixed: 'right',
      render: (text, record) => {
        return (
          <Dropdown
            trigger={['click']}
            overlay={
              <Menu
                onClick={({ key }) => handleConfig(record, key)}
                items={[
                  { label: '设置标签', key: 'edit' },
                  { label: '数据项', key: 'field' },
                  { label: '数据周期', key: 'chart' },
                  // record.type === "dataModel" ? { label: '配置', key: 'config'} : null,
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

  useImperativeHandle(ref, () => ({
    getTableData,
  }));

  useEffect(() => {
    getTableData();
  }, [menuKeyId]);

  //分页显示返回状态码
  const getTableData = (pagination = { current, pageSize }) => {
    const { current, pageSize } = pagination;
    if (!menuKeyId) {
      return;
    }
    getList({
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
        setSelectKey([]);
        setSelectRow([]);
      }
    });
  };

  const getClassifyOptData = () => {
    getClassifyOpt({
      classifyType: 'metadataLabelSet',
    }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const newData = data.map(item => {
          return {
            title: item.classifyName,
            value: item.id,
            isLeaf: item.isLeaf,
            disabled: item.isLeaf ? false : true,
            children: item.children && item.children.length ? getFormatData(item.children) : undefined,
          };
        });
        setTreeData(newData);
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
    setDialogWidth(800);
    setVisible(true);
    setTitle(`上传${flag === 'bson' ? 'bson' : 'excel'}文件`);
    importType = flag;
  };

  const handleExport = flag => {
    if (!menuKeyId) {
      return;
    }
    if (flag === 'bson') {
      /* exportBsonList({ ids: selectKey.join() }); */
    } else {
      const params = { classifyId: menuKeyId };
      const ids = selectKey.join(',');
      ids && (params.ids = ids);
      exportExcelList(params).then(res => {
        const { state, msg } = res.data;
        if (state) {
          showInfo(msg);
        }
      });
    }
  };

  const handleConfig = (record, flag) => {
    type.current = record.type;
    setId(record.id);
    setModalContentFlag(flag);
    if (flag === 'edit') {
      getClassifyOptData();
      setTitle(`编辑${record.tableName ? record.tableName : ''}`);
      setDialogWidth(600);
      setVisible(true);
      form.setFieldsValue({ ...record });
    } else if (flag === 'config') {
      setDialogWidth(850);
      setTitle(`配置${record.tableName}表字段`);
      setVisible(true);
    } else if (flag === 'chart') {
      setDialogWidth(1200);
      setTitle(`数据周期-${record.tableName}`);
      setVisible(true);
    } else {
      setTitle(`${record.tableName}-数据项`);
      setDialogWidth(1400);
      setOpen(true);
    }
  };

  const submitForm = value => {
    saveList({
      ...value,
    }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
        handleCancel();
        getTableData();
        getMenuData();
      }
    });
  };

  const submitClassifyForm = value => {
    if (value.modelName) {
      delete value.modelName;
    }
    if (!value.classifyId) {
      showInfo('请选择分类！');
      return;
    }
    setTableClassify({
      ...value,
      ids: selectKey.join(),
    }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
        handleCancel();
        getTableData();
        getMenuData();
      }
    });
  };

  const onSearch = value => {
    searchData = value ? {
      modelName: value.trim(),
      tableName: value.trim(),
    } : {};
    getTableData({ current: 1, pageSize: 10 });
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const handelDelete = () => {
    deleteList({
      ids: selectKey.join(),
    }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        setSelectKey([]);
        getTableData();
        getInitData();
        showInfo(msg);
      }
    });
  };

  const refresh = () => {
    getTableData();
  };

  const onPageChange = ({ pageSize, current }, filters, sorter) => {
    const sort = sorter.order ? { order: sorter.order === 'ascend' ? 'asc' : 'desc', sort: 'dataCount' } : {};
    sortObj.current = sort;
    getTableData({ current: current, pageSize: pageSize });
  };

  const cmFormConfig = useMemo(() => {
    const formConfigData = [
      {
        opts: {
          name: 'id',
          hidden: true,
        },
        input: {},
      },
      {
        opts: {
          name: 'modelName',
          label: '注释',
          labelCol,
          required: modalContentFlag === 'edit' ? true : false,
          hidden: modalContentFlag === 'edit' ? false : true,
        },
        input: {
          style: {
            width: formItemWidth,
          },
        },
      },
      {
        opts: {
          name: 'classifyId',
          label: '分类',
          labelCol,
          required: true,
        },
        treeSelect: {
          style: {
            width: formItemWidth,
          },
          treeData,
        },
      },
    ];
    return {
      formOpts: {
        form,
        onFinish: modalContentFlag === 'edit' ? submitForm : submitClassifyForm,
        initialValues: {
          isSync: true,
          isVerify: false,
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
  }, [modalContentFlag, treeData]);

  const changeClassify = () => {
    getClassifyOptData();
    setModalContentFlag('classify');
    setTitle('调整分类');
    setDialogWidth(600);
    setVisible(true);
  };

  const handleDelete = () => {
    const ids = selectKey.join(',');
    confirm({
      title: '确认删除',
      content: '确定删除选中数据吗？',
      onOk() {
        delList({ ids }).then(res => {
          const { state, msg } = res.data;
          if (state) {
            setSelectKey([]);
            getTableData();
            getMenuData();
            showInfo(msg);
          }
        });
      },
      onCancel() {},
    });
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className="metadataManage-content">
      <Modal
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={dialogWidth}
        centered={modalContentFlag === 'edit'}
        destroyOnClose
        title={title}
      >
        {modalContentFlag === 'config' ? ( //表字段配置
          <FieldConfigPag id={id} handleCancel={handleCancel} />
        ) : modalContentFlag === 'upload' ? ( //表字段配置
          <Import
            uploadCallBack={uploadCallBack}
            uploadProps={uploadProps}
            postData={{ classifyId: menuKeyId }}
            url={importExcelUrl}
          />
        ) : modalContentFlag === 'chart' ? (
          <DataBarChart id={id} />
        ) : (
          <CMForm {...cmFormConfig} />
        )}
      </Modal>
      <Drawer visible={open} title={title} width={dialogWidth} onClose={handleDrawerClose}>
        <FieldPage pid={id} menuKeyId={menuKeyId} /> {/* 数据项 */}
      </Drawer>
      <div className="content-table-top">
        <Row justify="space-between">
          <Col>
            <Space>
              <Button type="primary" onClick={changeClassify} disabled={!selectKey.length}>
                调整表分类
              </Button>
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    <Menu.Item key="fieldLog">
                      <Button type="link" onClick={() => handleImport('excel')}>
                        导入Excel数据
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
                    <Menu.Item key="edit"></Menu.Item>
                    <Menu.Item key="fieldLog">
                      <Button type="link" onClick={() => handleExport('excel')}>
                        导出Excel模板数据
                      </Button>
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button icon={<Icon type={exportIcon} />}>导出</Button>
              </Dropdown>
              <DeleteBtn disabled={!selectKey.length} onClick={handelDelete}></DeleteBtn>
              <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
                刷新
              </Button>
            </Space>
          </Col>
          <Col>
              <Search placeholder="英文名称/中文名称" allowClear onSearch={onSearch} style={{ width: 250 }} />
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
