import React, { useEffect, useState, useRef } from 'react';
import {
  Row,
  Col,
  Typography,
  Card,
  Tabs,
  Button,
  Space,
  DatePicker,
  Select,
  Image,
  Divider,
  Progress,
  Collapse,
  Tooltip,
} from 'antd';
import moment from 'moment';
import { qualityManageApi } from '@api/dataAccessApi';
import { DownOutlined, UpOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { showInfo } from '@tool';
import { isObject, isNumber, isArray } from 'lodash';
import tableCountIcon from '@img/icon/tableCount.png';
import fieldCountIcon from '@img/icon/fieldCount.png';
import verifyCountIcon from '@img/icon/verifyCount.png';
import questionCountIcon from '@img/icon/questionCount.png';
import totalTableIcon from '@img/icon/totalTableCount.png';
import verifyRuleIcon from '@img/icon/verifyRule.png';
import ModelQualifyBar from './ModelQualifyBar';
import VerifyDetailsPage from './verifyDetailsPage/VerifyDetailsPage';
import ModelQualifiedPie from './ModelQualifiedPie';

const { getModelVerifyTimePeriods, getModelStatistics, getLastSystemVerifyTime } =
  qualityManageApi.qualityView;

const { Panel } = Collapse;

const monthFormat = 'YYYY-MM';

export default function ModelDataPage(props) {
  const { currentNode, theirTopBatchTime } = props;

  const [timeList, setTimeList] = useState([]);
  const [verifyTime, setVerifyTime] = useState('');
  const [verifyDate, setVerifyDate] = useState('');
  const [modelStatistics, setModelStatistics] = useState({});
  const [panelKey, setPanelKey] = useState('overview');
  const [showView, setShowView] = useState(true);
  const [score, setScore] = useState(0);

  const scoreTimer = useRef();

 const overviewList = [
   {
     title: '总字段数',
     key: 'all',
     value: modelStatistics.fieldCount,
     icon: totalTableIcon,
   },
   {
     title: '核验字段数',
      key: 'verifyField',
     value: modelStatistics.verifyFieldCount,
     icon: fieldCountIcon,
   },
   {
     title: '核验规则数',
     key: 'rule',
     value: modelStatistics.verifyRuleCount,
     icon: verifyRuleIcon,
   },
   {
     title: '核验总数据量',
     key: 'verifyData',
     value: modelStatistics.verifyDataCount,
     icon: tableCountIcon,
   },
   {
     title: '核验问题记录数',
     key: 'question',
     value: modelStatistics.questionDataCount,
     icon: questionCountIcon,
   },
   {
     title: '改进记录数',
     key: 'improvement',
     value: modelStatistics.improvementNumber,
     icon: verifyCountIcon,
   },
 ];

  useEffect(() => {
    if (currentNode?.id) {
      if (theirTopBatchTime.id === currentNode.theirTopClassifyId && theirTopBatchTime.time) {
        linkageByTime(theirTopBatchTime.time);
      } else {
        loadVerifyTime();
      }
    } 
  }, [currentNode]);

  useEffect(() => {
    if (modelStatistics.score && isNumber(modelStatistics.score)) {
      let res = 0;
      scoreTimer.current = setInterval(() => {
        res += 2;
        if (res < modelStatistics.score) {
          setScore(res);
        } else {
          setScore(modelStatistics.score);
          clearInterval(scoreTimer.current);
        }
      }, 10);
    } else {
      setScore(0);
    }
    return () => {
      clearInterval(scoreTimer.current);
    };
  }, [modelStatistics]);

  const init = () => {
    setTimeList([]);
    setVerifyTime('');
    setVerifyDate('');
    setModelStatistics({});
  };

  const loadVerifyTime = () => {
    getLastSystemVerifyTime({ systemId: currentNode?.id }).then(res => {
      const { state, data } = res.data;
      if (state && data !== 'DATE_NULL') {
        linkageByTime(data)
      } else {
        init();
      }
    });
  };

  const linkageByTime = (time = '') => {
    // setVerifyTime(time);
    let lastDate = time.slice(0, 7);
    onDateChange(undefined, lastDate, time);
    setVerifyDate(lastDate);
    loadModelStatistics(time);
  };

  const loadModelStatistics = time => {
    getModelStatistics({ dataModelId: currentNode?.id, batchTime: time }).then(res => {
      const { state, data } = res.data;
      if (state && isObject(data)) {
        setModelStatistics(data);
      }
    });
  };

  const onDateChange = (value, mode, topBatchTime = '') => {
    setVerifyDate(mode);
    mode &&
      getModelVerifyTimePeriods({ periods: mode, dataModelId: currentNode?.id }).then(res => {
        const { data, state } = res.data;
        let batchTime = '';
        if (state) {
          const list = data.map(item => ({
            value: item,
            label: item,
          }));
          setTimeList(list);
          if (topBatchTime) {
            list.some(item => {
              if (item.value === topBatchTime) {
                batchTime = topBatchTime;
                return true
              }
              return false
            })
          }
        }
        setVerifyTime(batchTime);
      });
  };

  const onTimeChange = value => {
    setVerifyTime(value);
    loadModelStatistics(value);
  };

  const onPanelChange = () => {
    const flag = !showView;
    setPanelKey(flag ? 'overview' : '');
    setShowView(flag);
  };

  const getPercent = (data) => {
    if (isArray(data) && data.length) {
      const total = data[0].value + data[1].value;
      if(!total) return '0'
      const percent =
        ((data[0].name === '正常记录数' ? data[0].value / total : data[1].value / total) * 100).toFixed(1)  + '%';
      return percent;
    }
    return '0'
  }

  return (
    <div className="quality-view-content">
      <Space>
        核验日期：
        <DatePicker
          format={monthFormat}
          value={verifyDate ? moment(verifyDate, monthFormat) : ''}
          picker="month"
          onChange={onDateChange}
          allowClear={false}
        />
        <Select value={verifyTime} options={timeList} style={{ width: 180 }} onChange={onTimeChange} />
        {`本期核验耗时：${modelStatistics.totalTimeConsuming || ''}`}
      </Space>
      <Divider style={{ margin: '10px 0' }} />
      <Collapse activeKey={panelKey} bordered={false}>
        <Panel
          className="overview-panel"
          key="overview"
          showArrow={false}
          header={null}
          style={{ backgroundColor: '#fff' }}
        >
          <div className="verify-overview-container">
            <div className="verify-overview-content model-overview-item">
              <span className="verify-overview-title">核验概览</span>
              <Row gutter={[20, 40]} className="verify-data-content">
                {overviewList.map(item => (
                  <Col span={8} className="verify-data-item" key={item.key}>
                    <div className="item-value">{item.value || 0}</div>
                    <div className="item-title">
                      <Image className="item-img" src={item.icon} preview={false} />
                      <span>{item.title}</span>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
            <div className="verify-overview-content model-overview-item">
              <div className="overview-content-top">
                <span className="verify-overview-title">总合格率</span>
              </div>
              <div className="quality-score-wrapper">
                <ModelQualifiedPie pieData={modelStatistics.percentOfPassList} />
              </div>
            </div>
            <div className="verify-overview-content model-overview-item">
              <span className="verify-overview-title">数据模型字段合格率 TOP-5</span>
              <div className="quality-qualify-bar">
                <ModelQualifyBar barData={modelStatistics.fieldPercentOfPassList} />
              </div>
            </div>
          </div>
        </Panel>
      </Collapse>
      <div className={showView ? 'overview-btn-open' : 'overview-btn-close'}>
        <Button
          size="small"
          type="text"
          icon={showView ? <UpOutlined /> : <DownOutlined />}
          onClick={onPanelChange}
        />
      </div>
      <VerifyDetailsPage batchTime={verifyTime} dataModelId={currentNode.id} showView={showView} />
    </div>
  );
}
