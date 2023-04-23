import React, { useState, useEffect, useRef } from 'react';
import { Image, Card } from 'antd';
import { statisticalAnalysis } from '@api/dataAccessApi';
import { isObject } from "lodash";
import masterDataSystem from '@img/icon/masterDataSystem.png';
import logicModel from '@img/icon/logicModel.png';
import physicsModel from '@img/icon/physicsModel.png';
import dataElement from '@img/icon/dataElement.png';
import metaDataSystem from '@img/icon/metaDataSystem.png';
import qualifyRuleImg from '@img/icon/summaryTable.png';
import verifyModelImg from '@img/icon/verifyModelCount.png';
import verifyFieldImg from '@img/icon/verifyRuleCount.png';
import baseCodeImg from '@img/icon/businessModelLogo.png';
import baseCodeSubImg from '@img/icon/metaDataSource.png';
import DataVolumeLineChart from './DataVolumeLineChart'
import DBStatusOverview from './dbStatusOverview/DBStatusOverview';
import './index.less';

const { getHomeTopStat } = statisticalAnalysis;

export default function Index({ menuKey }) {
    const [statisticalData, setStatisticalData] = useState({});
    
    const statisticalList = [
      {
        title: '主数据系统数',
        img: masterDataSystem,
        key: 'systemCount',
      },
      {
        title: '主数据逻辑模型数',
        img: logicModel,
        key: 'logicModelCount',
      },
      {
        title: '主数据物理模型数',
        img: physicsModel,
        key: 'physicsModelCount',
      },
      {
        title: '数据元字段总数',
        img: dataElement,
        key: 'dataElementCount',
      },
      {
        title: '元数据系统数',
        img: metaDataSystem,
        key: 'metaDataSystemCount',
      },
      {
        title: '质量规则总数',
        img: qualifyRuleImg,
        key: 'qualityRuleCount',
      },
      {
        title: '需核验数据模型总数',
        img: verifyModelImg,
        key: 'verifyDataModelCount',
      },
      {
        title: '需核验数据模型字段总数',
        img: verifyFieldImg,
        key: 'verifyDataModelFieldCount',
      },
      {
        title: '基础代码总数',
        img: baseCodeImg,
        key: 'baseCodeCount',
      },
      {
        title: '基础代码子项总数',
        img: baseCodeSubImg,
        key: 'baseCodeItemCount',
      },
    ];

  useEffect(() => {
    loadHomeTopStat();
  }, []);

  const loadHomeTopStat = () => {
    getHomeTopStat().then(res => {
        const { data } = res;
        if ( isObject(data)) {
          setStatisticalData(data);
        }
    });
  };

  return (
    <div className="home-content">
      <div className="content-top-list">
        {statisticalList.map(item => (
          <div className="top-list-item" key={item.key}>
            <div>
              <div className="top-list-title">{item.title}</div>
              <div className="top-list-value">
                <span>{statisticalData[item.key]}</span>
              </div>
            </div>
            <div>
              <Image src={item.img} width={38} preview={false} />
            </div>
          </div>
        ))}
      </div>
      <DataVolumeLineChart />
      <DBStatusOverview />
    </div>
  );
}
