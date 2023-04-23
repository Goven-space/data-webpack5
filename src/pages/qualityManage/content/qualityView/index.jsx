import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Input, Button, Table } from 'antd';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import { standardManage } from '@api/dataAccessApi';
import TextToolTip from '@components/textToolTip';
import ModelVirtualList from './ModelVirtualList';
import SysTemDataPage from './sysTemDataPage/SysTemDataPage';
import ModelDataPage from './modelDataPage/ModelDataPage';
import './index.less';

const { getRootClassify } = standardManage.systemModelingApi;

const Index = ({ menuKey }) => {
  const [treeKey, setTreeKey] = useState(menuKey);
  const [expandKey, setExpandKey] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [currentNode, setCurrentNode] = useState({
    type: 'classify',
  });
  const [theirTopBatchTime, setTheirTopBatchTime] = useState({});

  useEffect(() => {
    getInitData(true);
  }, [menuKey]);

  const getInitData = (init = false) => {
    //获取侧边栏数据
    getRootClassify().then(res => {
      const { state, data } = res.data;
      if (state) {
        setDataSource(data);
        if (init) {
          setExpandKey([menuKey]);
          if (data[0]) {
            setCurrentNode(data[0]);
            setTreeKey(data[0].id || menuKey);
          }
          
        }
      }
    });
  };

  const dealChild = (arr = []) => {
    return arr.map(item => {
      return getFormatData(item);
    });
  };

  const getFormatData = item => {
    return {
      title: (
        <div className="info-menu">
          <TextToolTip text={item.modelName}>
            <div className="menu-text">{item.modelName}</div>
          </TextToolTip>
        </div>
      ),
      name: item.modelName,
      key: item.id,
      isLeaf: item.leaf,
      type: item.type,
      children: item.children && item.children.length ? dealChild(item.children) : undefined,
    };
  };


  const onExpand = (expanded, record) => {
    let keys = [];
    if (expanded) {
      keys = [record.id];
    } else {
      keys = [];
    }
    setExpandKey(keys);
  };

  const onClassifyClick = record => {
    setCurrentNode(record);
    setTreeKey(record.id)
  };

  const columns = [
    {
      dataIndex: 'modelName',
      render: (text, record) => (
        <Button
          className={treeKey === record.id ? 'classify-item-selected' : ''}
          type="text"
          onClick={() => onClassifyClick(record)}
        >
          {text}
        </Button>
      ),
    },
  ];

  return (
    <div className="quality-content quality-view-wrapper">
      <Row gutter={16} justify="start" wrap={false}>
        <Col flex="220px" className="content-menu info-content">
          <Table
            className="quality-table-menu"
            rowKey={record => record.id}
            size="small"
            dataSource={dataSource}
            columns={columns}
            showHeader={false}
            pagination={false}
            expandable={{
              expandedRowKeys: expandKey,
              expandedRowRender: (record, index, indent, expanded) =>
                expanded && (
                  <ModelVirtualList
                    theirTopClassifyId={record.id}
                    onClassifyClick={onClassifyClick}
                    treeKey={treeKey}
                  />
                ),
              expandIcon: ({ expanded, onExpand, record }) =>
                expanded ? (
                  <CaretDownOutlined onClick={e => onExpand(record, e)} />
                ) : (
                  <CaretRightOutlined onClick={e => onExpand(record, e)} />
                ),
              onExpand,
            }}
          />
        </Col>
        <Col flex="8px" className="cutting-line" />
        <Col flex="auto" className="content-table">
          {currentNode.type === 'classify' ? (
            <SysTemDataPage currentNode={currentNode} setBatchTime={setTheirTopBatchTime} />
          ) : currentNode.type === 'dataModel' ? (
            <ModelDataPage currentNode={currentNode} theirTopBatchTime={theirTopBatchTime} />
          ) : null}
        </Col>
      </Row>
    </div>
  );
};
export default Index;
