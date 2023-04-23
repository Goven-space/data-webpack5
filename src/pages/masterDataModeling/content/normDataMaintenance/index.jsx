import React, { useEffect, useState, useRef } from 'react';
import { Typography, Space, TreeSelect, Button } from 'antd';
import { standardManage } from '@api/dataAccessApi';
import DataCollectionContent from './dataMaintenanceContent/DataMaintenanceContent';
import { showInfo } from '@tool';
import './index.less'

const { getRootClassify, getInfo, getAssetsDataSource, updateMoodelVerifyData } =
  standardManage.systemModelingApi;
const { Title } = Typography;

export default function DataCollection(props) {
  const tabContentRef = useRef();
  const [dataSourceTree, setDataSourceTree] = useState([]);
  const [dataSourceId, setDataSourceId] = useState('');
  const [classifyId, setClassifyId] = useState('');
  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    getInitData();
    loadTreeData();
  }, []);

  useEffect(() => {
    classifyId && getInfoData();
  }, [classifyId]);

  const getInitData = (init = false) => {
    //上报信息集分类数据
    getRootClassify().then(res => {
      const { state, data } = res.data;
      if (state) {
        const newData = data.map((item, index) => {
          return getFormatData(item, item.id);
        });
        setTreeData([...newData]);
      }
    });
  };

  const getFormatData = (item, parentId) => {
    return {
      value: item.id,
      title: item.modelName,
      parentId: parentId,
      id: item.id,
      isLeaf: item.leaf,
      type: item.type,
      children:
        item.children && item.children.length
          ? item.children.map(i => getFormatData(i, parentId))
          : undefined,
    };
  };

  const loadTreeData = () => {
    getAssetsDataSource().then(res => {
      const { data, state } = res.data;
      if (state) {
        let treeData = treeDataTransform(data);
        treeData = treeData.length ? treeData : [];
        setDataSourceTree(treeDataTransform(data));
      }
    });
  };

  const treeDataTransform = data => {
    const arr = data.map(item => {
      return {
        value: item.id,
        title: item.children ? item.text : `${item.text}-${item.label}`,
        id: item.id,
        isLeaf: !item.children,
        selectable: !item.children,
        children: item.children && treeDataTransform(item.children),
      };
    });
    return arr;
  };

  const getInfoData = callback => {
    getInfo({ classifyId }).then(res => {
      const { state, data } = res.data;
      if (state && data) {
        setDataSourceId(data.dataSourceId);
      }
      callback && callback();
    });
  };

  const handleClassifyChange = value => {
    setClassifyId(value);
    setDataSourceId('');
  };

  const handleDataSourceChange = value => {
    setDataSourceId(value);
  };

  const handleSetSourceData = () => {
    updateMoodelVerifyData({ classifyId, dataSourceId: dataSourceId }).then(res => {
      const { msg, state } = res.data;
      if (state) {
        showInfo(msg);
      }
      getInfoData(() => {
        tabContentRef.current.getData();
      });
    });
  };

  return (
    <div className="data-report-content">
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <Space align="baseline" style={{ marginLeft: 20 }}>
          <Title level={5}>上报信息集分类:</Title>
          <TreeSelect
            style={{ width: 600 }}
            treeData={treeData}
            placeholder=""
            onChange={handleClassifyChange}
            value={classifyId || undefined}
            showSearch
            filterTreeNode={(inputValue, treeNode) =>
              treeNode.title.toLowerCase().includes(inputValue.toLowerCase())
            }
          />
        </Space>
        <Space align="baseline" style={{ marginLeft: 20 }}>
          <Title level={5}>上报数据数据源:</Title>
          <TreeSelect
            disabled={!classifyId}
            style={{ width: 600 }}
            treeData={dataSourceTree}
            placeholder="暂未配置数据源"
            onChange={handleDataSourceChange}
            value={dataSourceId || undefined}
            showSearch
            filterTreeNode={(inputValue, treeNode) =>
              treeNode.title.toLowerCase().includes(inputValue.toLowerCase())
            }
          />
          <Button disabled={!classifyId} type="primary" onClick={handleSetSourceData}>
            配置数据源
          </Button>
        </Space>
        <DataCollectionContent
          dataSourceId={dataSourceId}
          classifyId={classifyId}
          tabKey={'createTable'}
          ref={tabContentRef}
          getInfoData={getInfoData}
        />
      </Space>
    </div>
  );
}
