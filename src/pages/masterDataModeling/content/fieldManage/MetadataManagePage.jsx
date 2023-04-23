import React, { useEffect, useState, useRef, useMemo, useContext } from 'react';
import { Row, Space, Button, Col, Input, Table, Modal, Form, Dropdown, Menu, Drawer, Tag } from 'antd';
import Icon from '@components/icon';
import { addIcon, refreshIcon, showIcon, exportIcon } from '@/constant/icon.js';
import CMForm from '@/components/cmForm';
import { showConfirm } from '@components/confirm';
import { standardManage, qualityManageApi } from '@api/dataAccessApi';
import { paginationConfig, getTreeSelectData, showInfo } from '@tool';
import DeleteBtn from '@components/button';
import Import from '@components/import';
import FieldLogPage from './FieldLogPage';
import ReferenceRelationshipPage from './ReferenceRelationshipPage';
import TextToolTip from '@components/textToolTip';
import SyncConfigPage from './SyncConfigPage';

const {
  getList,
  addList,
  deleteList,
  editList,
  exportExcelList,
  exportStandardList,
  exportBsonList,
  importExcelList,
  importStandard,
  listStructureTree,
  importBsonList,
} = standardManage.metaDataManageApi;
const { getQualityRuleList } = qualityManageApi.ruleConfig;
const { getFieldTypeDataElementOpt } = standardManage.publice;
const { Search } = Input;

// 弹窗配置
const dialogConfigs = {
  add: {
    title: '新增',
    width: 1000,
  },
  edit: {
    title: '编辑',
    width: 1000,
  },
  log: {
    title: '字段变更日志',
    width: 1300,
  },
  reference: {
    title: '引用关系图',
    width: 800,
  },
  upload: {
    title: '上传文件',
    width: 800,
  },
  sync: {
    title: '从元数据批量同步',
    width: 700,
  },
};

export default function MetadataManagePage({ menuKeyId, getMenuData, targetItem }) {
  const [selectKey, setSelectKey] = useState([]);
  const [selectRow, setSelectRow] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [fieldTypeOpt, setFieldTypeOpt] = useState([]);
  const [referenceTypeOpt, setReferenceTypeOpt] = useState([]);
  const [lengthFlag, setLengthFlag] = useState(false);
  const [pointFlag, setPointFlag] = useState(false);
  const [id, setId] = useState(undefined);
  const [contentFlag, setContentFlag] = useState('add');
  const [dialogState, setDialogState] = useState(dialogConfigs[contentFlag]);
  const [rulesList, setRulesList] = useState([])

  const [form] = Form.useForm();
  let searchData = {};
  const formItemWidth = 400;
  const labelCol = { span: 6 };
  const wrapperCol = { span: 18 };
  const columns = [
    {
      title: '字段ID',
      key: 'fieldName',
      dataIndex: 'fieldName',
      ellipsis: true,
      width: 100,
    },
    {
      title: '字段注释',
      key: 'fieldComment',
      dataIndex: 'fieldComment',
      ellipsis: true,
      width: 100,
    },
    {
      title: '字段类型',
      key: 'fieldType',
      dataIndex: 'fieldType',
      ellipsis: true,
      width: 70,
    },
    {
      title: '字段长度',
      key: 'fieldLength',
      dataIndex: 'fieldLength',
      ellipsis: true,
      width: 60,
    },
    {
      title: '字段小数点',
      key: 'fieldRadixPoint',
      dataIndex: 'fieldRadixPoint',
      ellipsis: true,
      width: 60,
    },
    {
      title: '排序',
      key: 'sort',
      dataIndex: 'sort',
      ellipsis: true,
      width: 60,
    },
    {
      title: '是否为空',
      key: 'fieldNull',
      dataIndex: 'fieldNull',
      ellipsis: true,
      width: 60,
      render: text => {
        return text ? <Tag color="green">是</Tag> : <Tag color="orange">否</Tag>;
      },
    },
    {
      title: '字段默认值',
      key: 'defaultValue',
      dataIndex: 'defaultValue',
      ellipsis: true,
      width: 80,
    },
    {
      title: '参考标准',
      key: 'referenceStandard',
      dataIndex: 'referenceStandard',
      ellipsis: true,
      width: 70,
    },
    {
      title: '引用标准代码名称',
      key: 'referenceCodeName',
      dataIndex: 'referenceCodeName',
      ellipsis: true,
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      width: 80,
      fixed: 'right',
      render: (text, record) => {
        return (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)} size="small">
              编辑
            </Button>
            <Button type="link" onClick={() => handleFieldLog(record)} size="small">
              字段变更日志
            </Button>
          </Space>
        );
      },
    },
  ];
  useEffect(() => {
    loadRuleList()
  }, [])

  useEffect(() => {
    getTableData();
    // getTreedata();
  }, [menuKeyId]);

  useEffect(() => {
    targetItem.dataSourceId && getInitData();
  }, [targetItem]);

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

  const getInitData = () => {
    //获取字段类型下拉
    getFieldTypeDataElementOpt({ type: targetItem.dataSourceId }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const newData = [];
        for (const key in data) {
          newData.push({
            label: key,
            value: key,
          });
        }
        setFieldTypeOpt(newData);
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

  const getReferenceTypeOpt = () => {
    //获取引用标准代码
    listStructureTree().then(res => {
      const { state, data } = res.data;
      if (state) {
        const newData = getTreeSelectData(data, 'name', 'id', true);
        setReferenceTypeOpt(newData);
      }
    });
  };

  const handleFieldLog = record => {
    setDialogState({ ...dialogConfigs.log });
    setContentFlag('log');
    setId(record.id);
    setOpen(true);
  };

  const handleEdit = record => {
    getReferenceTypeOpt();
    handleFieldTypeChange(record.fieldType);
    setDialogState({ ...dialogConfigs.edit });
    setContentFlag('edit');
    setId(record.id);
    setOpen(true);
    form.setFieldsValue({ ...record });
  };

  const submitForm = value => {
    let handleUrl = value.id ? editList : addList;
    const submit = () => {
      handleUrl({ ...value, classifyId: menuKeyId, dataSourceId: targetItem.dataSourceId }).then(res => {
        const { state, msg } = res.data;
        if (state) {
          showInfo(msg);
          getTableData();
          form.resetFields();
          getMenuData();
        }
        handleDrawerClose();
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
      fieldCode: value,
      fieldName: value,
      fieldComment: value,
    };
    getTableData({ pageNo: 1, pageSize: 10 });
  };

  const handleCancel = (flag) => {
    setVisible(false);
    flag === true && refresh() 
  };

  const handleAdd = () => {
    getReferenceTypeOpt();
    setDialogState({ ...dialogConfigs.add });
    setContentFlag('add');
    setId(undefined);
    setOpen(true);
  };

  const handelDelete = () => {
    deleteList({
      ids: selectKey.join(),
      dataSourceId: targetItem.dataSourceId,
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
    getTableData({current: 1, pageSize});
  };

  const handleExport = flag => {
    if (flag === 'bson') {
      exportBsonList({ ids: selectKey.join(',') });
    } else if (flag === 'standard') {
      exportStandardList();
    } else {
      exportExcelList({ dataSourceId: targetItem.dataSourceId });
    }
  };

  const onPageChange = (page, size) => {
    getTableData({ pageNo: page, pageSize: size });
  };

  const getReferenceEchart = () => {
    if (selectKey && selectKey.length > 1) {
      showInfo('请勾选一条数据进行查看其引用关系！');
      return;
    }
    setDialogState({ ...dialogConfigs.reference, title: `数据元(${selectRow[0].fieldName})引用关系图` });
    setContentFlag('reference');
    setVisible(true);
  };

  const handleFieldTypeChange = value => {
    if (['text', 'integer', 'date', 'time', 'timestamp'].includes(value)) {
      //不显示长度"text", "integer", "date", "time", "timestamp"
      setLengthFlag(true);
    } else {
      setLengthFlag(false);
    }
    if (['text', 'integer', 'date', 'time', 'timestamp', 'char', 'varchar'].includes(value)) {
      //不显示小数点"text", "integer", "date", "time", "timestamp",'char', 'varchar'
      setPointFlag(true);
    } else {
      setPointFlag(false);
    }
  };

  const handleDrawerClose = () => {
    setOpen(false);
    form.resetFields();
  };

  const loadRuleList = () => {
    getQualityRuleList({ categoryId: 'field' }).then(res => {
      const { state, data } = res.data;
      if (state) {
        const list = data.map(item => ({ label: item.value, value: item.key }));
        setRulesList(list);
      }
    });
  };

  const cmformConfig = useMemo(() => {
    return {
      formOpts: {
        form,
        onFinish: submitForm,
        initialValues: {
          fieldNull: true,
        },
        labelCol,
        wrapperCol,
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
            name: 'fieldName',
            label: '字段ID',
            required: true,
            validator: ({ getFieldValue }) => ({
              validator(_, value) {
                if (value && /^[^\u4e00-\u9fa5]{0,}$/.test(value)) {
                  return Promise.resolve();
                } else {
                  if (value) {
                    return Promise.reject(new Error('不能为中文'));
                  }
                }
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
          },
          select: {
            options: fieldTypeOpt,
            style: {
              width: formItemWidth,
            },
            onChange: handleFieldTypeChange,
          },
        },
        {
          opts: {
            name: 'fieldLength',
            label: '字段长度',
            required: lengthFlag ? false : true,
            hidden: lengthFlag,
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
            hidden: pointFlag,
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
          },
          treeSelect: {
            style: {
              width: formItemWidth,
            },
            treeData: referenceTypeOpt,
          },
        },
        {
          opts: {
            name: 'qualityRuleId',
            label: '引用质量规则',
          },
          select: {
            options: rulesList,
            style: {
              width: formItemWidth,
            },
          },
        },
        {
          opts: {
            name: 'sort',
            label: '排序',
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
          },
          input: {
            style: {
              width: formItemWidth,
            },
          },
        },
        {
          opts: {
            name: 'referenceStandard',
            label: '参考标准',
          },
          textarea: {
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
                onClick: handleDrawerClose,
              },
              title: '取消',
            },
          ],
        },
      ],
    };
  }, [lengthFlag, pointFlag, fieldTypeOpt, referenceTypeOpt]);

  const handleImport = flag => {
    let postData = { classifyId: menuKeyId };
    flag === 'excel' && (postData.dataSourceId = targetItem.dataSourceId || '');
    setDialogState({
      ...dialogConfigs.upload,
      title: `上传${flag}文件`,
      postData,
      url: flag === 'bson' ? importBsonList : importExcelList,
    });
    setContentFlag('upload');
    setVisible(true);
  };

  const uploadProps = {
    accept: '.bson,.xlsx',
    maxCount: 1,
    multiple: false,
  };

  const uploadCallBack = () => {
    setVisible(false);
    getMenuData();
    getTableData();
  };

  const handleBatchSync = () => {
    setContentFlag('sync');
    setDialogState({ ...dialogConfigs.sync });
    setVisible(true);
    
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
        width={dialogState.width}
        centered
        destroyOnClose
        title={dialogState.title}
      >
        {contentFlag === 'reference' ? (
          <ReferenceRelationshipPage selectKey={selectKey} setSelectRow={setSelectRow} />
        ) : contentFlag === 'upload' ? (
          <Import
            uploadCallBack={uploadCallBack}
            uploadProps={uploadProps}
            postData={dialogState.postData || {}}
            url={dialogState.url || ''}
          />
        ) : contentFlag === 'sync' ? (
          <SyncConfigPage handleCancel={handleCancel} targetItem={targetItem} />
        ) : null}
      </Modal>
      <Drawer
        visible={open}
        title={dialogState.title}
        width={dialogState.width}
        placement="right"
        destroyOnClose
        onClose={handleDrawerClose}
      >
        {contentFlag === 'log' ? (
          <FieldLogPage id={id} />
        ) : ['add', 'edit'].includes(contentFlag) ? (
          <CMForm {...cmformConfig} />
        ) : null}
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
                    <Menu.Item key="edit_import">
                      <Button type="link" onClick={() => handleImport('bson')}>
                        导入Bson
                      </Button>
                    </Menu.Item>
                    <Menu.Item key="fieldLog_import">
                      <Button type="link" onClick={() => handleImport('excel')}>
                        导入Excel模板数据
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
                    <Menu.Item key="edit_export">
                      <Button type="link" onClick={() => handleExport('bson')} disabled={!selectKey.length}>
                        导出Bson
                      </Button>
                    </Menu.Item>
                    <Menu.Item key="fieldLog_export">
                      <Button type="link" onClick={() => handleExport('excel')}>
                        导出Excel模板
                      </Button>
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button icon={<Icon type={exportIcon} />}>导出</Button>
              </Dropdown>

              <Button
                type="primary"
                icon={<Icon type={showIcon} />}
                onClick={getReferenceEchart}
                disabled={selectKey.length ? false : true}
              >
                引用关系
              </Button>
              <Button onClick={handleBatchSync}>从元数据批量同步</Button>
              <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
                刷新
              </Button>
            </Space>
          </Col>
          <Col span={7} style={{ textAlign: 'right' }}>
            <Space>
              <Search placeholder="字段ID/字段注释" allowClear onSearch={onSearch} style={{ width: 250 }} />
            </Space>
          </Col>
        </Row>
      </div>
      <Table
        size="small"
        bordered
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
  );
}
