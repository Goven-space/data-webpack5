import React, { useState, useEffect } from 'react';
import { Image, Drawer, Row, Col, Space, Select, DatePicker } from 'antd';
import { qualityManageApi, standardManage } from '@api/dataAccessApi';
import { RightOutlined } from '@ant-design/icons';
import { isObject, isArray } from 'lodash';
import { numUnitConversion } from '@tool/';
import moment from 'moment';
import dataModelCountImg from '@img/icon/dataModel.png';
import dataMonitorCountImg from '@img/icon/dataMonitor.png';
import fieldMonitorCountImg from '@img/icon/fieldMonitor.png';
import reportCountImg from '@img/icon/report.png';
import systemCount from '@img/icon/system.png';
import verifyDataCountImg from '@img/icon/verifyData.png';
import WarningDetailPage from './WarningDetailPage';
import ProgressChart from '@components/progressChart';
import SystemQualifyBar from './SystemQualifyBar';
import ImproveInfoPage from './ImproveInfoPage';
import AnalysisLineChart from './AnalysisLineChart';
import './index.less';

const { RangePicker } = DatePicker;

const { getHomeTopStat, getDataCenterInfo, getTrendAnalyse } = qualityManageApi.qualityMonitor;
const { getRootClassify } = standardManage.systemModelingApi;

const monthFormat = 'YYYY-MM-DD';

export default function Index({ menuKey }) {
  const [statisticalData, setStatisticalData] = useState({});
  const [open, setOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [info, setInfo] = useState({});
  const [options, setOptions] = useState([]);
  const [dateRange, setDateRange] = useState([moment(moment().subtract(6, 'days'), monthFormat), moment()]);
  const [selectKey, setSelectKey] = useState('all');
  const [lineData, setLineData] = useState({});

  const topDataList = [
    {
      title: '今日告警数',
      img: reportCountImg,
      key: 'todayWarningCount',
      color: 'orange',
      dialogTitle: '今日告警详情',
    },
    {
      title: '系统数',
      img: systemCount,
      key: 'systemCount',
      color: 'blue',
    },
    {
      title: '数据模型总数',
      img: dataModelCountImg,
      key: 'dataModelCount',
      color: 'blue',
    },
    {
      title: '监控数据模型数',
      img: dataMonitorCountImg,
      key: 'monitorDataModelCount',
      color: 'blue',
    },
    {
      title: '监控模型字段数',
      img: fieldMonitorCountImg,
      key: 'monitorFieldCount',
      color: 'blue',
    },
    {
      title: '累计核验数据量',
      img: verifyDataCountImg,
      key: 'verifyDataCount',
      color: 'blue',
    },
  ];

  useEffect(() => {
    loadHomeTopStat();
    loadCenterInfo();
    loadClassifyOpitons();
  }, []);

  useEffect(() => {
    if (dateRange[0] && selectKey) {
      loadAnalysisData();
    }
  }, [dateRange, selectKey]);

  const loadHomeTopStat = () => {
    getHomeTopStat().then(res => {
      const { data } = res;
      if (isObject(data)) {
        setStatisticalData(data);
      }
    });
  };

  const loadCenterInfo = () => {
    getDataCenterInfo().then(res => {
      const { data } = res;
      if (isObject(data)) {
        setInfo(data);
      }
    });
  };

  const loadClassifyOpitons = () => {
    getRootClassify().then(res => {
      const { state, data } = res.data;
      if (state && isArray(data)) {
        let list = data.map(item => ({
          label: item.modelName,
          value: item.id,
        }));

        setOptions([
          {
            label: '全部',
            value: 'all',
          },
          ...list,
        ]);
      }
    });
  };

  const loadAnalysisData = () => {
    const params = {
      systemId: selectKey === 'all' ? '' : selectKey,
      startTime: moment(dateRange[0]).format(monthFormat),
      endTime: moment(dateRange[1]).format(monthFormat),
    };
    getTrendAnalyse(params).then(res => {
      const { data } = res;
      if (isObject(data)) {
        setLineData(data);
      }
    });
  };

  const showWarningDetail = key => {
    topDataList.some(item => {
      if (item.key === key) {
        setDialogTitle(item.dialogTitle);
        return true;
      }
      return false;
    });
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const onDataChange = (dates, dateStrings) => {
    setDateRange(dates);
  };

  const onClassifySelect = value => {
    setSelectKey(value);
  };

  return (
    <div className="data-monitor-content">
      <Drawer title={dialogTitle} visible={open} destroyOnClose width={1400} onClose={closeDialog}>
        <WarningDetailPage />
      </Drawer>
      <Row gutter={15} className="top-time-view">
        <Col span={4}>{`最新核验时间：${statisticalData.newVerifyDateTime || ''}`}</Col>
        <Col>{`最新核验系统：${statisticalData.newVerifySystemName || ''}`}</Col>
      </Row>
      <div className="content-top-list">
        {topDataList.map(item => (
          <div className={`top-list-item linear-gradient-${item.color}`} key={item.key}>
            <div>
              <div className="top-list-title">{item.title}</div>
              <div className="top-list-value">{numUnitConversion(statisticalData[item.key], 2)}</div>
              {['todayWarningCount'].includes(item.key) && (
                <div className={`top-list-btn btn-${item.color}`} onClick={() => showWarningDetail(item.key)}>
                  查看详情 <RightOutlined />
                </div>
              )}
            </div>
            <div className="top-list-img">{<Image src={item.img} height={60} preview={false} />}</div>
          </div>
        ))}
      </div>
      <div className="chart-content-list">
        <div className="chart-content-item">
          <div className="item-title">
            <span>数据中心质量</span>
          </div>
          <div className="chart-wrapper">
            <ProgressChart size={150} fontSize={16} value={info.qualityVerifyScore} title="总质量得分" />
          </div>
        </div>
        <div className="chart-content-item">
          <div className="item-title">
            <span>主数据系统合格率统计</span>
          </div>
          <div className="chart-wrapper">
              <SystemQualifyBar barData={info. percentOfPassList} />
          </div>
        </div>
        <div className="chart-content-item">
          <div className="item-title">
            <span>质量改进动态</span>
          </div>
          <ImproveInfoPage />
        </div>
        <div className="chart-content-item">
          <div className="item-title">
            <span>质量核验趋势分析</span>
            <Space>
              主数据系统:
              <Select options={options} value={selectKey} style={{ width: 100 }} onSelect={onClassifySelect} />
              日期范围:
              <RangePicker
                onChange={onDataChange}
                allowClear={false}
                value={dateRange}
                format={monthFormat}
                disabledDate={current => {
                  // 限制最大日期为今天
                  return current && current >= moment();
                }}
              />
            </Space>
          </div>
          <AnalysisLineChart lineData={lineData} />
        </div>
      </div>
    </div>
  );
}
