import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Card, Table, Collapse } from 'antd';
import { isArray } from 'lodash';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import { showError } from '@tool/';
import { qualityManageApi, standardManage } from '@api/dataAccessApi';
import ModelDataPage from './ModelDataPage';
import VerifyingResult from './verifyingResult/VerifyingResult';
import './index.less';

const { getHomeData } = qualityManageApi.qualityVerification;
const { getListByTopClassify } = standardManage.informationManageApi;


function Index(props) {
  const [data, setData] = useState({});
  const [dataSource, setDataSource] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows ,setSelectedRows] = useState([])
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadHomeData()
  }, []);

  const loadHomeData = () => {
    getHomeData().then(res => {
      const { state, data } = res.data;
      if (state) {
        setData({ qualityVerifyScore: data.qualityVerifyScore, verifyTime: data.verifyTime });
        if (data.systemListData && isArray(data.systemListData)) {
          const list = data.systemListData.map((item, index) => {
            item.title = (
              <Row style={{ width: 1000, fontSize: 16, fontWeight: 500, textAlign: 'center' }}>
                <Col span={3}>{item.value}</Col>
                <Col>-</Col>
                <Col span={3}>{item.dataModelMessage}</Col>
                <Col>-</Col>
                <Col span={7}>{item.systemVerifyMessage}</Col>
                <Col>-</Col>
                <Col span={4}>{item.systemVerifyScore}</Col>
                <Col>-</Col>
                <Col span={5}>{item.systemVerifyDataModelMessage}</Col>
              </Row>
            );
            item.index = index;
            return item;
          });
          setDataSource(list);
        }
      }
    });
  }

  const onKeysSelect = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows)
  };

  const onVerify = () => {
    if(!selectedRowKeys.length){
      showError('请先选择核验对象')
      return 
    }
    setVerifying(true)
  }

  const backToHome = () => {
    setVerifying(false)
    setSelectedRowKeys([])
    loadHomeData();
  }

  const columns = [
    {
      title: '名称',
      dataIndex: 'title',
    },
  ];

  const expandedRowRender = (record, index, indent, expanded) => (
    <ModelDataPage record={record} expanded={expanded} />
  );

  return (
    <div className="quality-verification-content">
      {!verifying ? (
        <>
          <div className="header-wrapper">
            <div className="header-content">
              <div className="top-logo">
                <span className="score-value">{data.qualityVerifyScore}</span>
                <span className="score-unit">分</span>
              </div>
              <div className="top-title">
                <span className="title-count">{data.verifyTime}</span>
                <span className="title-tip">赶紧选择下方核验对象，进行核验吧！</span>
              </div>
            </div>
            <div className="header-btns">
              <Button className="verify-btn" type="primary" onClick={onVerify}>
                开始核验
              </Button>
            </div>
          </div>
          <Card>
            <Table
              rowKey={record => record.key}
              columns={columns}
              dataSource={dataSource}
              showHeader={false}
              rowSelection={{
                selectedRowKeys,
                onChange: onKeysSelect,
              }}
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
      ) : (
        <VerifyingResult selectedKeys={selectedRowKeys} backToHome={backToHome} selectedRows={selectedRows} />
      )}
    </div>
  );
}

export default Index;
