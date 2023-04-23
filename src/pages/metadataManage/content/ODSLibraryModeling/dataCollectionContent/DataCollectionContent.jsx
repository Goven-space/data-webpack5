import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { Row, Col, Space, Button, Input, Card, Typography, Pagination, Modal, Checkbox, List } from 'antd';
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
} from '@ant-design/icons';
import { metadataManage } from '@api/dataAccessApi';
import { showError, showInfo } from '@tool';
import ResultPage from './ResultPage';
import CreateTableVerifyProgress from './CreateTableVerifyProgress';
import TableDataQuery from '@components/tableDataQuery';

const {
  getDetailInfo,
  createTableSql,
  verifyModel,
  createTable,
  systemCreateTable,
  systemVerifyTableExist,
  createBatchTable,
  deleteTable,
} = metadataManage.systemModeling;

const { Text, Title } = Typography;
const { Search, TextArea } = Input;
const { confirm } = Modal;
const { Meta } = Card;
const { Group } = Checkbox;

const TableContent = (props, ref) => {
  const { time, classifyId, tabKey, dataSourceId, getInfoData, count } = props;
  let searchData = {};

  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [code, setCode] = useState('');
  const [dataModelId, setDataModelId] = useState('');
  const [title, setTitle] = useState('建表脚本');
  const [contentFlag, setContentFlag] = useState('');
  const [modalWidth, setModalWidth] = useState(500);
  const [percent, setPercent] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [targetTableName, setTargetTableName] = useState('');
  const [toggleBtnText, setToggleBtnText] = useState('全选');

  const dataRef = useRef(data);

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
    setModalWidth(700);
    setVisible(true);
    setContentFlag('table');
    setTitle('建表脚本');
    createTableSql({ dataSourceId, dataModelId: value }).then(res => {
      const { state, data } = res.data;
      if (state) {
        setCode(data);
      }
    });
  };

  const reviewResult = value => {
    if (!value) {
      showError('无法查看结果！');
      return false;
    }
    setDataModelId(value);
    setVisible(true);
    setContentFlag('result');
    setModalWidth(1500);
    setTitle('查看结果');
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

  const handleCreateTable = () => {
    setTitle('创建表');
    setContentFlag('create');
    systemCreateTable({ dataSourceId, classifyId }).then(res => {
      const { state, data, msg } = res.data;
      if (state) {
        getInfoData(() => {
          getDetailInfoData({ pageNo: 1, pageSize: 10 });
        });
        showInfo(msg);
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
    setTitle('核验表');
    setContentFlag('verify');
    setModalWidth(800);
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
    setTitle('数据查询');
    setTargetTableName(tableName);
    setContentFlag('dataQuery');
    setVisible(true);
    setModalWidth(1500);
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

  return (
    <div>
      <Modal
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={modalWidth}
        destroyOnClose
        title={title}
      >
        {contentFlag === 'result' ? (
          <ResultPage classifyId={classifyId} dataModelId={dataModelId} scanTime={time}></ResultPage>
        ) : contentFlag === 'verify' || contentFlag === 'create' ? (
          <CreateTableVerifyProgress handleCancel={handleCancel} contentFlag={contentFlag} />
        ) : contentFlag === 'dataQuery' ? (
          <TableDataQuery dataSourceId={dataSourceId} tableName={targetTableName} />
        ) : (
          <TextArea rows={20} value={code} maxLength={100} />
        )}
      </Modal>
      <Row gutter={15}>
        <Col span={19}>
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
            ) : //  <Button icon={<BorderlessTableOutlined />}>批量建表</Button>
            tabKey === 'notMatchTable' ? (
              <Button icon={<TableOutlined />} type="primary">
                全部同步
              </Button>
            ) : (
              <Button icon={<DeleteOutlined />} disabled={!selectedKeys.length} onClick={handleDeleteTable}>
                批量删除
              </Button>
            )}
            <Button type="primary" icon={<Icon type={refreshIcon} />} onClick={refresh}>
              刷新
            </Button>
            {tabKey !== 'notCreateTable' && <Button onClick={handleToggleChecked}>{toggleBtnText}</Button>}
          </Space>
        </Col>
        <Col span={5} style={{ textAlign: 'right' }}>
          <Search placeholder="表名/名称" allowClear onSearch={onSearch} style={{ width: 250 }} />
        </Col>
      </Row>
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
                tabKey === 'notVerifyTable'
                  ? [
                      <Button
                        type="link"
                        onClick={() => verifyTable(item.dataModelId, 'verify')}
                        disabled={item.dispose}
                      >
                        核验
                      </Button>,
                    ]
                  : tabKey === 'notCreateTable'
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
                    ]
                  : tabKey === 'notMatchTable'
                  ? [
                      <Button type="link" icon={<ChromeOutlined />} disabled={item.dispose}>
                        同步
                      </Button>,
                      <Button
                        type="link"
                        icon={<FormOutlined />}
                        onClick={() => creatJavascript(item.dataModelId)}
                      >
                        同步结果
                      </Button>,
                    ]
                  : tabKey === 'createTable'
                  ? [
                      <Button type="link" onClick={() => reviewResult(item.dataModelId)}>
                        执行结果
                      </Button>,
                      <Button type="link" onClick={() => handleDataQuery(item.tableName)}>
                        数据查询
                      </Button>,
                    ]
                  : null;
              return (
                <List.Item key={item.id}>
                  <Card
                    hoverable
                    style={{
                      width: 240,
                    }}
                    actions={btn}
                  >
                    <Row justify="end">
                      <Col>
                        <Checkbox value={item.dataModelId} />
                      </Col>
                    </Row>
                    <Meta
                      title={item.modelNum || ''}
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
              onChange={(page, pageSize) => {
                getDetailInfoData({ pageNo: page, pageSize });
              }}
              showSizeChanger
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default forwardRef(TableContent);
