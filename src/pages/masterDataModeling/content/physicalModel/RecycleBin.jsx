import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Space, Table, Button, Input, Card, List, Checkbox, Pagination, Radio, Tag } from 'antd';
import TextToolTip from '@components/textToolTip';
import { standardManage } from '@api/dataAccessApi';
import { paginationConfig, showInfo } from '@tool/';
import { AppstoreOutlined, BarsOutlined, ClearOutlined, UndoOutlined } from '@ant-design/icons';
import Icon from '@components/icon';
import { refreshIcon } from '@/constant/icon.js';
import { showConfirm } from '@components/confirm';

const { Search } = Input;
const { Meta } = Card;
const { Group } = Checkbox;

const { getRecycleList, recoverAllDataModel, recoverDataModel, clearDataModel, deleteDataModel } =
  standardManage.systemModelingApi;

function RecycleBin(props) {
  const { theirTopClassifyId, getInfoData, listMode, setListMode, dataSourceId } = props;

  const [dataSource, setDataSource] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const searchValue = useRef('');

  useEffect(() => {
    theirTopClassifyId && loadRecycleList();
  }, [theirTopClassifyId]);

  const columns = [
    {
      title: '模型编号',
      dataIndex: 'num',
      width: '8%',
    },
    {
      title: '数据库表名',
      dataIndex: 'tableName',
      width: '18%',
    },
    {
      title: '中文备注',
      dataIndex: 'modelName',
      width: '18%',
    },
    {
      title: '字段数量',
      dataIndex: 'childNodeCount',
      ellipsis: true,
      width: '8%',
    },
    {
      title: '是否已建模',
      dataIndex: 'buildModel',
      ellipsis: true,
      width: '8%',
      render: text => (text ? <Tag color="green">是</Tag> : <Tag color="orange">否</Tag>),
    },
    {
      title: '操作人',
      dataIndex: 'editorName',
      width: '10%',
    },
    {
      title: '入站时间',
      dataIndex: 'editTime',
      width: '20%',
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: '10%',
      render: (text, record) => (
        <Space size="small">
          <Button type="link" onClick={() => onDelete(record.id)}>
            删除
          </Button>
          <Button type="link" onClick={() => onRecover(record.id)}>
            恢复
          </Button>
        </Space>
      ),
    },
  ];

  const loadRecycleList = (pagination = { current, pageSize }) => {
    const { current, pageSize } = pagination;
    let params = {
      pageNo: current,
      pageSize,
      filters: { theirTopClassifyId },
    };
    searchValue.current &&
      (params.searchFilters = { tableName: searchValue.current, modelName: searchValue.current });
    getRecycleList(params).then(res => {
      const { state } = res.data;
      if (state) {
        const { pageNo, pageSize, total, rows } = res.data;
        setCurrent(pageNo);
        setPageSize(pageSize);
        setTotal(total);
        setDataSource(rows);
      }
    });
  };

  const handleChangeMode = e => {
    setListMode(e.target.value);
  };

  const onClear = () => {
    showConfirm('', '确认清空所有数据？', () => {
      clearDataModel({ systemId: theirTopClassifyId, dataSourceId }).then(res => {
        const { state, msg } = res.data;
        if (state) {
          showInfo(msg);
          refreshPageData();
        }
      });
    });
  };

  const onRecoverAll = () => {
    showConfirm('', '确认恢复所有数据？', () => {
      recoverAllDataModel({ systemId: theirTopClassifyId }).then(res => {
        const { state, msg } = res.data;
        if (state) {
          showInfo(msg);
          refreshPageData();
        }
      });
    });
  };

  const onDelete = id => {
    showConfirm('', '确认删除该数据？', () => {
      deleteDataModel({ dataModelId: id, dataSourceId }).then(res => {
        const { state, msg } = res.data;
        if (state) {
          showInfo(msg);
          refreshPageData();
        }
      });
    });
  };

  const onRecover = id => {
    showConfirm('', '确认恢复该数据？', () => {
      recoverDataModel({ dataModelId: id }).then(res => {
        const { state, msg } = res.data;
        if (state) {
          showInfo(msg);
          refreshPageData();
        }
      });
    });
  };

  const refresh = () => {
    loadRecycleList({ current: 1, pageSize });
  };

  const refreshPageData = () => {
    getInfoData(() => loadRecycleList({ pageNo: 1, pageSize }));
  };

  const onSearch = value => {
    searchValue.current = value ? value.trim() : '';
    loadRecycleList({ pageNo: 1, pageSize });
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 10 }}>
        <Col>
          <Space>
            <Button type="primary" onClick={onClear} disabled={!dataSource.length} icon={<ClearOutlined />}>
              清空回收站
            </Button>
            <Button onClick={onRecoverAll} disabled={!dataSource.length} icon={<UndoOutlined />}>
              恢复回收站
            </Button>
            <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
              刷新
            </Button>
          </Space>
        </Col>
        <Col>
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
          <List
            grid={{
              gutter: 20,
            }}
            style={{ marginBottom: 20 }}
            className="model-table"
            dataSource={dataSource}
            renderItem={(item, index) => {
              const btn = [
                <Button type="link" onClick={() => onDelete(item.id)}>
                  删除
                </Button>,
                <Button type="link" onClick={() => onRecover(item.id)}>
                  恢复
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
                    <Meta
                      title={<div style={{ height: 20 }}>{item.num || ''}</div>}
                      description={
                        <div className="detailDescription">
                          <h6 level={5}>
                            <TextToolTip text={item.tableName ? `表名:${item.tableName}` : '暂无数据'} />
                          </h6>
                          <h6 level={5}>
                            <TextToolTip text={item.modelName ? `名称 : ${item.modelName}` : '暂无数据'} />
                          </h6>
                          <h6 level={5}>{`是否建模 : ${item.buildModel ? '是' : '否'}`}</h6>
                          <h6 level={5}>{item.editTime ? `入站时间 : ${item.editTime}` : '暂无数据'}</h6>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              );
            }}
          />
          <Row justify="end">
            <Col style={{ marginTop: 10 }}>
              <Pagination
                current={current}
                pageSize={pageSize}
                total={total}
                size="small"
                pageSizeOptions={[10, 20, 50, 100, 500]}
                showTotal={total => `共${total}条`}
                onChange={(pageNo, pageSize) => {
                  loadRecycleList({ current: pageNo, pageSize });
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
            dataSource={dataSource}
            pagination={paginationConfig(current, total, pageSize, (pageNo, pageSize) => {
              loadRecycleList({ current: pageNo, pageSize });
            })}
          />
        </div>
      )}
    </div>
  );
}

export default RecycleBin;
