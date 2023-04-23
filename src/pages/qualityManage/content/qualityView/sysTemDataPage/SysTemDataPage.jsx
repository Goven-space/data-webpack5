import React, { useEffect, useState, useRef } from 'react';
import {
  Row,
  Col,
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
import { isObject, isNumber } from 'lodash';
import tableIcon from '@img/icon/tableCount.png';
import fieldIcon from '@img/icon/fieldCount.png';
import verifyCountIcon from '@img/icon/verifyCount.png';
import questionCountIcon from '@img/icon/questionCount.png';
import totalTableIcon from '@img/icon/totalTableCount.png';
import verifyRuleIcon from '@img/icon/verifyRule.png';
import ModelQualifyBar from './ModelQualifyBar';
import VerifyDetailsPage from './verifyDetailsPage/VerifyDetailsPage';
import ProgressChart from '@components/progressChart';

const { getSystemVerifyTimePeriods, getSystemStatistics, getLastSystemVerifyTime } =
  qualityManageApi.qualityView;

const { Panel } = Collapse;

const monthFormat = 'YYYY-MM';

export default function DataCollection(props) {
  const { currentNode, setBatchTime } = props;

  const [timeList, setTimeList] = useState([]);
  const [verifyTime, setVerifyTime] = useState('');
  const [verifyDate, setVerifyDate] = useState('');
  const [systemStatistics, setSystemStatistics] = useState({ totalTimeConsuming: '' });
  const [panelKey, setPanelKey] = useState('overview');
  const [showView, setShowView] = useState(true);
  const [score, setScore] = useState(0);

  const overviewList = [
    {
      title: '总表数',
      key: 'all',
      value: systemStatistics.dataModelCount,
      icon: totalTableIcon,
    },
    {
      title: '核验表数',
      key: 'table',
      value: systemStatistics.verifyTableCount,
      icon: tableIcon,
    },
    {
      title: '核验字段数',
      key: 'field',
      value: systemStatistics.verifyFieldCount,
      icon: fieldIcon,
    },
    {
      title: '核验规则数',
      key: 'rule',
      value: systemStatistics.verifyRuleCount,
      icon: verifyRuleIcon,
    },
    {
      title: '核验记录数',
      key: 'report',
      value: systemStatistics.verifyDataCount,
      icon: verifyCountIcon,
    },
    {
      title: '问题记录数',
      key: 'question',
      value: systemStatistics.questionDataCount,
      icon: questionCountIcon,
    },
  ];

  useEffect(() => {
    currentNode?.id && loadVerifyTime();
  }, [currentNode]);

  useEffect(() => {
    currentNode?.id &&
      setBatchTime({
        id: currentNode.id,
        time: verifyTime || '',
      });
  }, [verifyTime]);

  useEffect(() => {
    if (systemStatistics.score && isNumber(systemStatistics.score)) {
      setScore(systemStatistics.score);
    } else {
      setScore(0);
    }
  }, [systemStatistics]);

  const init = () => {
    setTimeList([]);
    setVerifyTime('');
    setVerifyDate('');
    setSystemStatistics({ totalTimeConsuming: '' });
  };

  const loadVerifyTime = () => {
    getLastSystemVerifyTime({ systemId: currentNode?.id }).then(res => {
      const { state, data } = res.data;
      if (state && data !== 'DATE_NULL') {
        setVerifyTime(data);
        let lastDate = data.slice(0, 7);
        onDataChange(undefined, lastDate, true);
        setVerifyDate(lastDate);
        loadSystemStatistics(data);
      } else {
        init();
      }
    });
  };

  const loadSystemStatistics = time => {
    getSystemStatistics({ systemId: currentNode?.id, batchTime: time }).then(res => {
      const { state, data } = res.data;
      if (state && isObject(data)) {
        setSystemStatistics(data);
      }
    });
  };

  const onDataChange = (value, mode, initFlag) => {
    setVerifyDate(mode);
    mode &&
      currentNode?.id &&
      getSystemVerifyTimePeriods({ periods: mode, systemId: currentNode?.id }).then(res => {
        const { data, state } = res.data;
        if (state) {
          const list = data.map(item => ({
            value: item,
            label: item,
          }));
          setTimeList(list);
        }
        !initFlag && setVerifyTime('');
      });
  };

  const onTimeChange = value => {
    setVerifyTime(value);
    loadSystemStatistics(value);
  };

  const onPanelChange = () => {
    const flag = !showView;
    setPanelKey(flag ? 'overview' : '');
    setShowView(flag);
  };

  return (
    <div className="quality-view-content">
      <Space>
        核验日期：
        <DatePicker
          format={monthFormat}
          value={verifyDate ? moment(verifyDate, monthFormat) : ''}
          picker="month"
          onChange={onDataChange}
          allowClear={false}
        />
        <Select value={verifyTime} options={timeList} style={{ width: 180 }} onChange={onTimeChange} />
        本期核验耗时:{systemStatistics.totalTimeConsuming}
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
            <div className="verify-overview-content system-overview-item">
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
            <div className="verify-overview-content system-overview-item">
              <div className="overview-content-top">
                <span className="verify-overview-title">质量得分</span>
                <Tooltip
                  placement="top"
                  overlayInnerStyle={{ width: 260, whiteSpace: 'nowrap' }}
                  title="得分计算规则：核验表 合格率相加 / 核验表数"
                >
                  <QuestionCircleOutlined className="quality-score-tip" />
                </Tooltip>
              </div>
              <div className="quality-score-wrapper">
                <ProgressChart size={160} fontSize={16} value={score}/>
              </div>
            </div>
            <div className="verify-overview-content system-overview-item">
              <span className="verify-overview-title">数据模型合格率 TOP-5</span>
              <div className="quality-qualify-bar">
                <ModelQualifyBar barData={systemStatistics.percentOfPassList} />
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
      <VerifyDetailsPage
        batchTime={verifyTime}
        systemId={currentNode.id}
        reFreshVerifyTime={loadVerifyTime}
        showView={showView}
      />
    </div>
  );
}
