import React, { useState, useEffect, useRef } from 'react';
import { Button, Progress, Card, Table, Row, Col } from 'antd';
import { qualityManageApi } from '@api/dataAccessApi';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import { showInfo } from '@tool/';
import { isNumber } from 'lodash';
import ModelVeryResult from './ModelVeryResult';

const { systemVerify, getSystemProgressBar } = qualityManageApi.qualityVerification;

function VerifyingResult(props) {
  const { selectedKeys, backToHome, selectedRows } = props;
  const [countDown, setCountDown] = useState('00:00:00');
  const [totalTime, setTotalTime] = useState(0);
  const [percent, setPercent] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  const [verifying, setVerifying] = useState(true);
  const [timeConsumingMsg, setTimeConsumingMsg] = useState('');
  const [scheduleMsg, setScheduleMsg] = useState('');
  const [systemVerifyList, setSystemVerifyList] = useState({});
  const [totalTimeText, setTotalTimeText] = useState('');
  const [sysTemVerityData, setSysTemVerityData] = useState({});

  const progressTimer = useRef();
  const countDownTimer = useRef();
  const overSystemCount = useRef(0);

  useEffect(() => {
    if (selectedKeys.length) {
      countDownStart();
      let list = selectedRows.map(item => {
        item.title = (
          <Row style={{ width: 1000, fontSize: 16, fontWeight: 500, textAlign: 'center' }}>
            <Col span={3}>{item.value}</Col>
          </Row>
        );
        return item;
      });
      setDataSource(list);
      const systemIds = selectedKeys.join(',');
      systemVerify({ systemIds }).then(res => {
        const { state, msg } = res.data;
        if (state) {
          setPercent(100);
          showInfo(msg);
        }
        setVerifying(false);
        clearInterval(countDownTimer.current);
        clearInterval(progressTimer.current);
      });
      // let list = [...selectedRows];
      progressTimer.current = setInterval(() => {
        getSystemProgressBar().then(res => {
          const { state, data } = res.data;
          if (state) {
            const {
              schedule,
              scheduleMessage,
              EstimatedTimeConsumingMsg,
              verifyModelCount,
              TotalTimeConsuming,
              verifySystemCount,
              systemVerify,
            } = data;
            TotalTimeConsuming && setTotalTimeText(TotalTimeConsuming);
            if (verifyModelCount) {
              let percent = (schedule / verifyModelCount).toFixed(2) * 100;
              setPercent(percent);
            }
            // let count = verifySystemCount || 1;
            !timeConsumingMsg && setTimeConsumingMsg(EstimatedTimeConsumingMsg);
            scheduleMessage && setScheduleMsg(scheduleMessage);
            if (systemVerify) {
              const {
                TotalTimeConsuming = '',
                currentSystemSchedule = '',
                dataModelCount = '',
              } = systemVerify;
              // setSysTemVerityData({ TotalTimeConsuming, currentSystemSchedule, dataModelCount });
              const newList = list.map(item => {
                let listItem = { ...item };
                if (item.key === systemVerify.systemId) {
                  listItem.dataModelDoList = systemVerify.dataModelDoList;
                  if (TotalTimeConsuming || currentSystemSchedule || dataModelCount) {
                    listItem.title = (
                      <Row style={{ width: 1000, fontSize: 16, fontWeight: 500, textAlign: 'center' }}>
                        <Col span={3}>{item.value}</Col>
                        <Col>-</Col>
                        <Col span={3}>{`数据模型数量[${dataModelCount}]`}</Col>
                        <Col>-</Col>
                        <Col span={4}>{`当前核验进度[${currentSystemSchedule}]`}</Col>
                        {TotalTimeConsuming && (
                          <>
                            <Col>-</Col>
                            <Col span={5}>{`当前系统核验总耗时[${TotalTimeConsuming}]`}</Col>
                          </>
                        )}
                      </Row>
                    );
                  }
                }
                return listItem;
              });
              list = newList
              setDataSource(newList);
            }
          }
        });
      }, 500);
    }
    return () => {
      clearInterval(progressTimer.current);
      clearInterval(countDownTimer.current);
    };
  }, [selectedKeys]);

  // 倒计时开始
  const countDownStart = () => {
    let count = 1;
    const time = countingDown(count);
    count++;
    setCountDown(time);
    countDownTimer.current = setInterval(() => {
      let time = '00:00:00';
      if (!count && countDownTimer.current) {
        clearInterval(countDownTimer.current);
      } else {
        time = countingDown(count);
      }
      setTotalTime(count++);
      setCountDown(time);
    }, 1000);
  };

  const timeTransition = (second) => {
    let timeStr = ''
    if (isNumber(second)) {
      const day = Math.floor(second / 86400);
      day && (timeStr += `${day}天`)
      second = second % 86400
      const hour = Math.floor(second / 3600);
      hour && (timeStr += `${hour}小时`)
      second = second % 3600;
      const minute = Math.floor(second / 60);
      minute && (timeStr += `${minute}分`);
      second = second % 60
      second && (timeStr += `${second}秒`);
    }
    return timeStr;
  }

  const countingDown = data => {
    let time = '';
    time += (Math.floor(data / 3600) + '').padStart(2, '0');
    time += ':';
    data = data % 3600;
    time += (Math.floor(data / 60) + '').padStart(2, '0');
    time += ':';
    data = data % 60;
    time += (data + '').padStart(2, '0');
    return time;
  };

  const expandedRowRender = (record, index, indent, expanded) => (
    <ModelVeryResult record={record} expanded={expanded} />
  );

  const columns = [
    {
      title: '名称',
      dataIndex: 'title',
    },
  ];

  return (
    <>
      <div className="verifying-wrapper">
        <div className="verifying-count-down">
          <span className="count-down-number">{countDown}</span>
          <span className="time-msg">{timeConsumingMsg ? `预计核验耗时：${timeConsumingMsg}` : ''}</span>
        </div>
        <div className="verifying-progress-bar">
          {/* <span className="progress-text">{verifying ? '正在核验' : '核验完成'}</span> */}
          <Progress
            strokeWidth={10}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            percent={percent}
          />
          <span className="progress-text">{scheduleMsg} </span>
          <span className="progress-total-text">
            {verifying ? '' : `实际核验耗时: ${timeTransition(totalTime)}`}
          </span>
        </div>
        <div className="verifying-btn">
          <Button type="primary" className="verifying-back-btn" onClick={backToHome} disabled={verifying}>
            返回
          </Button>
        </div>
      </div>
      <Card>
        <Table
          rowKey={record => record.key}
          columns={columns}
          dataSource={dataSource}
          showHeader={false}
          expandable={{
            expandedRowRender,
            expandIcon: ({ expanded, onExpand, record }) =>
              expanded ? (
                <CaretDownOutlined onClick={e => onExpand(record, e)} />
              ) : (
                <CaretRightOutlined onClick={e => onExpand(record, e)} />
              ),
          }}
          pagination={false}
        />
      </Card>
    </>
  );
}
export default VerifyingResult;
