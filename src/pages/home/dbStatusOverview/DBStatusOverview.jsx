import React, { useState, useRef, useEffect } from 'react';
import { Card, Space, Image } from 'antd';
import { statisticalAnalysis } from '@api/dataAccessApi';
import { isObject } from 'lodash';
import DBStatusBarChart from './DBStatusBarChart';
import totalIcon from '@img/icon/totalTable.png';

const { getSystemStatus } = statisticalAnalysis;

function DBStatusOverview(props) {
  const [data, setData] = useState({});
  
  const gradeClassify = [
    { text: '优', color: '#0570E9' },
    { text: '良', color: '#13e375' },
    { text: '中', color: '#13c2c2' },
    { text: '及', color: '#EF7C16' },
    { text: '差', color: '#ff4d4f' },
    { text: '无', color: '#ccc' }
  ]

  useEffect(() => {
    loadStatusData();
  }, []);

  const loadStatusData = () => {
    getSystemStatus().then(res => {
      const { state, data } = res.data;
      if (state && isObject(data)) {
        setData(data);
      }
    });
  };

  return (
    <Card
      size="small"
      title={<span className="title-text">系统核验状态展示</span>}
      bodyStyle={{ padding: 0 }}
    >
      <div className="db-status-content">
        <div className="db-data-statistics">
          <div className="statistics-title">
            <Space>
              <Image className="title-icon" src={totalIcon} width={14} preview={false} />
              总计
            </Space>
            <span>截至：{data.by || ''}</span>
          </div>
          <div className="statistics-info">
            <Space direction="vertical">
              <div className="info-value">{data.systemTotal || ''}</div>
              <span>总系统</span>
            </Space>
            <Space direction="vertical">
              <div className="info-value">{data.qualityVerifyScore || ''}</div>
              <span>系统总质量分数</span>
            </Space>
            <Space direction="vertical">
              <div className="info-value">{data.dataModelTotal || ''}</div>
              <span>系统总计数据模型</span>
            </Space>
          </div>
          <div className="statistics-detail">
            <div className="detail-item"></div>
            <div className="detail-item"></div>
            <div className="detail-item"></div>
          </div>
        </div>
        <div className="status-chart">
          <div className="chart-top-classify">
            {gradeClassify.map(item => (
              <div className="classify-item">
                <span className="classify-item-color" style={{ backgroundColor: item.color }}></span>
                <span className="classify-item-text">{item.text}</span>
              </div>
            ))}
          </div>
          <DBStatusBarChart barData={data.dataList || []} />
        </div>
      </div>
    </Card>
  );
}

export default DBStatusOverview;
