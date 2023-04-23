import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import {
  Row,
  Col,
  Space,
  Button,
  Input,
  Card,
  Pagination,
  Modal,
  Checkbox,
  List,
  Radio,
  Table,
  Drawer,
} from 'antd';
import _ from 'lodash';
import Icon from '@components/icon';
import { refreshIcon } from '@/constant/icon.js';
import TextToolTip from '@components/textToolTip';
import {
  ChromeOutlined,
  CheckCircleOutlined,
  TableOutlined,
  FormOutlined,
  ExclamationCircleOutlined,
  BorderlessTableOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  BarsOutlined,
} from '@ant-design/icons';
import { standardManage } from '@api/dataAccessApi';
import { showError, paginationConfig, showInfo } from '@tool';
import ResultPage from './ResultPage';
import CreateTableVerifyProgress from './CreateTableVerifyProgress';
import SyncTableFieldProgress from './SyncTableFieldProgress';
import TableDataQuery from '@components/tableDataQuery';
import FieldUpdateViewPage from './FieldUpdateViewPage';

const {
  getDetailInfo,
  createTableSql,
  verifyModel,
  systemCreateTable,
  systemVerifyTableExist,
  deleteTable,
  createBatchTable,
  allSyncTableField,
  batchSyncTableField,
  updateTableName,
  batchUpdateTableName,
} = standardManage.systemModelingApi;

const { Search, TextArea } = Input;
const { confirm } = Modal;
const { Meta } = Card;
const { Group } = Checkbox;

const TableContent = (props, ref) => {
  const { time, classifyId, tabKey, dataSourceId, getInfoData, count, listMode, setListMode } = props;
  let searchData = {};

  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [dataModelId, setDataModelId] = useState('');
  const [contentFlag, setContentFlag] = useState('result');
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [targetTableName, setTargetTableName] = useState('');
  const [toggleBtnText, setToggleBtnText] = useState('全选');
  

  const dialogList = {
    table: {
      title: '建表脚本',
      width: 500,
    },
    result: {
      title: '建模日志',
      width: 1500,
    },
    verify: {
      title: '核验表',
      width: 800,
    },
    sync: {
      title: '同步表',
      width: 800,
    },
    dataQuery: {
      title: '数据查询',
      width: 1500,
    },
    updateResult: {
      title: '表名修改日志',
      width: 1500,
    },
    syncFieldResult: {
      title: '字段核验结果',
      width: 1700,
    },
  };

  useImperativeHandle(ref, () => ({
    getData: (pagination, tabKeyValue, timeValue) => {
      clearData();
      getDetailInfoData(pagination, tabKeyValue, timeValue);
    },
  }));

  useEffect(() => {
    clearData();
    dataSourceId && classifyId && getDetailInfoData({ pageNo: 1, pageSize: 10 });
  }, [dataSourceId, classifyId]);

  const getDetailInfoData = (pagination = { pageNo, pageSize }, tabKeyValue, timeValue) => {
    getDetailInfo({
      ...pagination,
      filters: {
        classifyId,
      },
      queryModelVerifyType: tabKeyValue || tabKey,
      searchFilters: { ...searchData },
    }).then(res => {
      const { state, rows, pageNo, pageSize, total } = res.data;
      if (state) {
        setData([...rows]);
        setPageSize(pageSize);
        setPageNo(pageNo);
        setTotal(total);
      }
    });
  };

  const clearData = () => {
    setData([]);
  };

  const onSearch = value => {
    searchData = {
      tableName: value,
      modelName: value,
    };
    getDetailInfoData({ pageNo: 1, pageSize: 10 });
  };

  const creatJavascript = value => {
    setCode('');
    if (!value) {
      showError('无法建表！');
      return false;
    }
    setDataModelId(value);
    setVisible(true);
    setContentFlag('table');
    createTableSql({ dataSourceId, classifyId, dataModelId: value }).then(res => {
      const { state, data } = res.data;
      if (state) {
        setCode(data);
      }
    });
  };

  const reviewResult = (value, type) => {
    if (!value) {
      showError('无法查看结果！');
      return false;
    }
    setDataModelId(value);
    setContentFlag(type);
    setOpen(true)
  };

  const verifyTable = (value, flag) => {
    if (!value) {
      showError(`无法${flag === 'verify' ? '核验' : '建表'}！`);
      return false;
    }
    const url = flag === 'verify' ? verifyModel : createBatchTable;
    let params = {
      dataModelIds: value,
      dataSourceId,
      classifyId,
    };
    url({
      ...params,
    }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
        getInfoData(() => {
          getDetailInfoData({ pageNo: 1, pageSize: 10 });
        });
      }
    });
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleCreateTable = () => {
    // setTitle('创建表');
    // setContentFlag('create');
    systemCreateTable({ dataSourceId, classifyId }).then(res => {
      const { state, data, msg } = res.data;
      if (state) {
        showInfo(msg);
        getInfoData(() => {
          getDetailInfoData({ pageNo: 1, pageSize: 10 });
        });
      }
    });
  };

  const showConfirm = msg => {
    confirm({
      title: '提示：',
      icon: <ExclamationCircleOutlined />,
      content: msg || '校验表存在问题，是否继续创建表?',
      onOk() {
        /* handleCancel(); */
        handleCreateTable();
      },
      onCancel() {
        handleCancel();
      },
    });
  };

  const createTableVerify = () => {
    setVisible(true);
    setContentFlag('verify');
    //建表前先核验
    systemVerifyTableExist({
      classifyId,
      dataSourceId,
    }).then(res => {
      const { data, state } = res.data;
      if (!state) {
        showConfirm();
      } else {
        handleCreateTable();
      }
    });
  };

  const refresh = () => {
    getDetailInfoData({ pageNo: 1, pageSize: 10 });
  };

  const handleTableSelected = values => {
    setSelectedKeys(values);
    if (values.length === data.length) {
      setToggleBtnText('取消全选');
    } else {
      setToggleBtnText('全选');
    }
  };

  const createTableBySeleceed = () => {
    const ids = selectedKeys.join(',');
    createBatchTable({ dataModelIds: ids, classifyId, dataSourceId }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        getInfoData(() => {
          getDetailInfoData({ pageNo: 1, pageSize: 10 });
        });
        showInfo(msg);
      }
    });
  };

  const handleDeleteTable = () => {
    const ids = selectedKeys.join(',');
    confirm({
      title: '确认删除',
      content: '数据库中的数据表会同步删除，请确认是否删除?',
      onOk() {
        deleteTable({ ids, dataSourceId }).then(res => {
          const { state, msg } = res.data;
          if (state) {
            getInfoData(() => {
              getDetailInfoData({ pageNo: 1, pageSize: 10 });
            });
            showInfo(msg);
            setSelectedKeys([]);
          }
        });
      },
      onCancel() {},
    });
  };

  const handleDataQuery = tableName => {
    setTargetTableName(tableName);
    setContentFlag('dataQuery');
    setOpen(true);
  };

  const handleToggleChecked = () => {
    if (selectedKeys.length === data.length) {
      setSelectedKeys([]);
      setToggleBtnText('全选');
    } else {
      const keys = data.map(item => item.dataModelId);
      setSelectedKeys(keys);
      setToggleBtnText('取消全选');
    }
  };

  const handleChangeMode = e => {
    setListMode(e.target.value);
    setSelectedKeys([]);
  };

  const handleRowSelect = selectedRowKeys => {
    setSelectedKeys(selectedRowKeys);
  };

  const handleSync = id => {
    let ids = id ? id : selectedKeys.join(',');
    batchSyncTableField({ dataModelIds: ids, dataSourceId }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
      }
      getInfoData(() => getDetailInfoData({ pageNo: 1, pageSize: 10 }));
    });
  };

  const handleAllSync = () => {
    setVisible(true);
    setContentFlag('sync');
    allSyncTableField({ classifyId, dataSourceId }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
      }
      getInfoData(() => getDetailInfoData({ pageNo: 1, pageSize: 10 }));
    });
  };

  const handleUpdateTableName = record => {
    updateTableName({ tableName: record.tableName, dataModelId: record.dataModelId, dataSourceId }).then(
      res => {
        const { state, msg } = res.data;
        if (state) {
          showInfo(msg);
        }
        getInfoData(() => getDetailInfoData({ pageNo: 1, pageSize: 10 }));
      }
    );
  };

  const handleAllUpdate = () => {
    batchUpdateTableName({ classifyId, dataSourceId }).then(res => {
      const { state, msg } = res.data;
      if (state) {
        showInfo(msg);
      }
      getInfoData(() => getDetailInfoData({ pageNo: 1, pageSize: 10 }));
    });
  };

  const extraColumns =
    tabKey === 'syncFiledTable'
      ? [
          {
            title: '模型创建时间',
            key: 'modelCreateTime',
            dataIndex: 'modelCreateTime',
            align: 'center',
            width: '15%',
          },
        ]
      : [];

  const columns = [
    {
      title: '模型编号',
      dataIndex: 'modelNum',
      width: '8%',
    },
    {
      title: '数据库表名',
      dataIndex: 'tableName',
      width: '20%',
    },
    {
      title: '中文备注',
      dataIndex: 'modelName',
      width: '20%',
    },
    {
      title: tabKey === 'syncFiledTable' ? '核验时间' : '采集时间',
      dataIndex: 'scanTime',
      width: tabKey === 'syncFiledTable' ? '15%' : '30%',
    },
    ...extraColumns,
    {
      title: '状态',
      dataIndex: 'notice',
      width: '10%',
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: '14%',
      render: (text, record) =>
        tabKey === 'createTable' ? (
          <Space size="small">
            {/* <Button type="link" onClick={() => handleDataQuery(record.tableName)}>
              数据查询
            </Button> */}
            <Button type="link" onClick={() => reviewResult(record.dataModelId, 'result')}>
              建模日志
            </Button>
          </Space>
        ) : tabKey === 'notCreateTable' ? (
          <Space size="small">
            <Button type="link" onClick={() => creatJavascript(record.dataModelId)}>
              建表SQL
            </Button>
            <Button type="link" onClick={() => verifyTable(record.dataModelId, 'create')} disabled={record.dispose}>
              建表
            </Button>
            <Button type="link" onClick={() => reviewResult(record.dataModelId, 'result')}>
              建模日志
            </Button>
          </Space>
        ) : tabKey === 'syncFiledTable' ? (
          <Space>
            <Button type="link" onClick={() => handleSync(record.dataModelId)}>
              同步
            </Button>
            <Button type="link" onClick={() => reviewResult(record.dataModelId, 'syncFieldResult')}>
              待同步字段
            </Button>
          </Space>
        ) : (
          <Space>
            <Button type="link" onClick={() => handleUpdateTableName(record)}>
              修改表名
            </Button>
            <Button type="link" onClick={() => reviewResult(record.dataModelId, 'updateResult')}>
              表名修改日志
            </Button>
          </Space>
        ),
    },
  ];

  return (
    <div>
      <Modal
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={dialogList[contentFlag].width}
        destroyOnClose
        title={dialogList[contentFlag].title}
      >
        {contentFlag === 'verify' || contentFlag === 'create' ? (
          <CreateTableVerifyProgress handleCancel={handleCancel} contentFlag={contentFlag} />
        ) : contentFlag === 'sync' ? (
          <SyncTableFieldProgress handleCancel={handleCancel} />
        ) : (
          <TextArea rows={20} value={code} maxLength={100} />
        )}
      </Modal>
      <Drawer
        visible={open}
        width={dialogList[contentFlag].width}
        title={dialogList[contentFlag].title}
        onClose={handleDrawerClose}
      >
        {['syncFieldResult', 'result', 'updateResult'].includes(contentFlag) ? (
          <ResultPage
            classifyId={classifyId}
            dataModelId={dataModelId}
            scanTime={time}
            contentFlag={contentFlag}
          />
        ) :  contentFlag === 'dataQuery' ? (
          <TableDataQuery dataSourceId={dataSourceId} tableName={targetTableName} />
        ) :null}
      </Drawer>
      <Row gutter={15}>
        <Col span={15}>
          <Space>
            {tabKey === 'notVerifyTable' ? (
              <>
                <Button icon={<CheckCircleOutlined />}>全部核验</Button>
                <Button icon={<TableOutlined />} type="primary">
                  批量核验
                </Button>
              </>
            ) : tabKey === 'notCreateTable' ? (
              <>
                <Button
                  icon={<BorderlessTableOutlined />}
                  disabled={!selectedKeys.length}
                  onClick={createTableBySeleceed}
                >
                  批量建表
                </Button>
                <Button
                  icon={<TableOutlined />}
                  type="primary"
                  onClick={createTableVerify}
                  disabled={count <= 0 ? true : false}
                >
                  全部建表
                </Button>
              </>
            ) : tabKey === 'notMatchTable' ? (
              <Button icon={<TableOutlined />} type="primary">
                全部同步
              </Button>
            ) : tabKey === 'syncFiledTable' ? (
              <>
                <Button disabled={!selectedKeys.length} onClick={() => handleSync()}>
                  批量同步
                </Button>
                <Button type="primary" disabled={!data.length} onClick={handleAllSync}>
                  全部同步
                </Button>
              </>
            ) : tabKey === 'updateTable' ? (
              <Button type="primary" disabled={!data.length} onClick={handleAllUpdate}>
                全部修改表名
              </Button>
            ) : (
              <Button icon={<DeleteOutlined />} disabled={!selectedKeys.length} onClick={handleDeleteTable}>
                批量删除
              </Button>
            )}
            <Button type="primary" icon={<Icon type={refreshIcon} />} onClick={refresh}>
              刷新
            </Button>
            {tabKey !== 'updateTable' && tabKey !== 'notCreateTable' && listMode === 'Card' && (
              <Button onClick={handleToggleChecked} disabled={!data.length}>
                {toggleBtnText}
              </Button>
            )}
          </Space>
        </Col>
        <Col span={9} style={{ textAlign: 'right' }}>
          <Space>
            <Radio.Group onChange={handleChangeMode} value={listMode} optionType="button" buttonStyle="solid">
              <Radio.Button value="List">
                <BarsOutlined />
              </Radio.Button>
              <Radio.Button value="Card">
                <AppstoreOutlined />
              </Radio.Button>
            </Radio.Group>
            <Search placeholder="表名/名称" allowClear onSearch={onSearch} style={{ width: 250 }} />
          </Space>
        </Col>
      </Row>
      {listMode === 'Card' ? (
        <div>
          <Group
            style={{ width: '100%', paddingRight: 10 }}
            onChange={handleTableSelected}
            value={selectedKeys}
          >
            <List
              grid={{
                gutter: 20,
              }}
              style={{ marginBottom: 20 }}
              className="model-table"
              dataSource={data}
              renderItem={(item, index) => {
                const btn =
                  tabKey === 'notCreateTable'
                    ? [
                        <Button type="link" onClick={() => creatJavascript(item.dataModelId)}>
                          建表SQL
                        </Button>,
                        <Button
                          type="link"
                          onClick={() => verifyTable(item.dataModelId, 'create')}
                          disabled={item.dispose}
                        >
                          建表
                        </Button>,
                        <Button type="link" onClick={() => reviewResult(item.dataModelId, 'result')}>
                          建模日志
                        </Button>,
                      ]
                    : tabKey === 'createTable'
                    ? [
                        // <Button type="link" onClick={() => handleDataQuery(item.tableName)}>
                        //   数据查询
                        // </Button>,
                        <Button type="link" onClick={() => reviewResult(item.dataModelId, 'result')}>
                          建模日志
                        </Button>,
                      ]
                    : tabKey === 'syncFiledTable'
                    ? [
                        <Button type="link" onClick={() => handleSync(item.dataModelId)}>
                          同步
                        </Button>,
                        <Button type="link" onClick={() => reviewResult(item.dataModelId, 'syncFieldResult')}>
                          待同步字段
                        </Button>,
                      ]
                    : [
                        <Button type="link" onClick={() => handleUpdateTableName(item)}>
                          修改表名
                        </Button>,
                        <Button type="link" onClick={() => reviewResult(item.dataModelId, 'updateResult')}>
                          表名修改日志
                        </Button>,
                      ];
                return (
                  <List.Item key={item.id}>
                    <Card
                      hoverable
                      style={{
                        width: 260,
                      }}
                      actions={btn}
                    >
                      {tabKey !== 'updateTable' && (
                        <Row justify="end">
                          <Col>
                            <Checkbox value={item.dataModelId} />
                          </Col>
                        </Row>
                      )}
                      <Meta
                        title={<div style={{ height: 20 }}>{item.modelNum || ''}</div>}
                        description={
                          <div className="detailDescription">
                            <h6 level={5}>
                              <TextToolTip text={item.tableName ? `表名:${item.tableName}` : '暂无数据'} />
                            </h6>
                            <h6 level={5}>
                              <TextToolTip text={item.modelName ? `名称 : ${item.modelName}` : '暂无数据'} />
                            </h6>
                            <h6 level={5}>
                              {item.modelCreateTime ? `采集时间 : ${item.modelCreateTime}` : '暂无数据'}
                            </h6>
                            <h6 level={5}>{`状态 : ${item.notice ? item.notice : '暂无'}`}</h6>
                          </div>
                        }
                      />
                    </Card>
                  </List.Item>
                );
              }}
            />
          </Group>
          <Row justify="end">
            <Col style={{ marginTop: 10 }}>
              <Pagination
                current={pageNo}
                pageSize={pageSize}
                total={total}
                size="small"
                pageSizeOptions={[10, 20, 50, 100, 500]}
                showTotal={total => `共${total}条`}
                onChange={(pageNo, pageSize) => {
                  getDetailInfoData({ pageNo: pageNo, pageSize: pageSize });
                }}
                showSizeChanger
              />
            </Col>
          </Row>
        </div>
      ) : (
        <div className="content-table-content">
          <Table
            rowKey={record => record.id}
            size="small"
            columns={columns}
            dataSource={data}
            rowSelection={
              tabKey !== 'updateTable'
                ? { selectedRowKeys: selectedKeys, onChange: handleRowSelect }
                : undefined
            }
            pagination={paginationConfig(pageNo, total, pageSize, (pageNo, pageSize) => {
              getDetailInfoData({ pageNo, pageSize });
            })}
          />
        </div>
      )}
    </div>
  );
};

export default forwardRef(TableContent);
