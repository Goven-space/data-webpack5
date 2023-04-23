import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { Row, Col, Button, Input, Card, Pagination, Modal, List } from 'antd';
import _ from 'lodash';
import Icon from '@components/icon';
import { refreshIcon } from '@/constant/icon.js';
import TextToolTip from '@components/textToolTip';
import { standardManage, kernelModule } from '@api/dataAccessApi';
import { showInfo } from '@tool';
import MaintenanceManagePage from './maintenanceManagePage/MaintenanceManagePage';
import MaintenanceConfigPage from './MaintenanceConfigPage';
import { showConfirm } from '@components/confirm';

const { getDetailInfo } = standardManage.systemModelingApi;

const { clearDataModel } = kernelModule.dynamicDataModel;

const { Search } = Input;
const { Meta } = Card;

const TableContent = (props, ref) => {
  const { classifyId, tabKey, dataSourceId, getInfoData } = props;
  let searchData = {};

  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetTableName, setTargetTableName] = useState('');
  const [modalType, setModalType] = useState('config');
  const [targetDataModelId, setTargetDataModelId] = useState('');

  const modalList = {
    maintenance: {
      title: '数据维护',
      modalWidth: 1500,
    },
    config: {
      title: '模型配置',
      modalWidth: 600,
    },
  };

  useImperativeHandle(ref, () => ({
    getData: (pagination, tabKeyValue, timeValue) => {
      clearData();
      getDetailInfoData(pagination, tabKeyValue, timeValue);
    },
  }));

  useEffect(() => {
    clearData();
    dataSourceId && classifyId && getDetailInfoData({ pageNo: 1, pageSize: 10 });
  }, [dataSourceId]);

  const getDetailInfoData = (pagination = { pageNo, pageSize }, tabKeyValue, timeValue) => {
    getDetailInfo({
      ...pagination,
      filters: {
        classifyId,
      },
      queryModelVerifyType: tabKeyValue || tabKey,
      searchFilters: { ...searchData },
    }).then(res => {
      const { state, rows, pageNo, pageSize, total } = res.data;

      if (state) {
        setData([...rows]);
        setPageSize(pageSize);
        setPageNo(pageNo);
        setTotal(total);
      }
    });
  };

  const clearData = () => {
    setData([]);
  };

  const onSearch = value => {
    searchData = {
      tableName: value,
      modelName: value,
    };
    getDetailInfoData({ pageNo: 1, pageSize: 10 });
  };

  const handleCancel = () => {
    setVisible(false);
    setTargetDataModelId('');
    setTargetTableName('');
  };

  const refresh = () => {
    getDetailInfoData({ pageNo: 1, pageSize: 10 });
  };

  const handleDataMaintenance = item => {
    setModalType('maintenance');
    setTargetDataModelId(item.dataModelId);
    setTargetTableName(item.tableName);
    setVisible(true);
  };

  const handleDataConfig = item => {
    setModalType('config');
    setTargetDataModelId(item.dataModelId);
    setTargetTableName(item.tableName);
    setVisible(true);
  };

  const handleClearDataModel = item => {
    showConfirm('', '确定后会清空当前模型中的所有数据', () => {
      clearDataModel({ dataSourceId, dataModelName: item.tableName }).then(res => {
        const { state, msg } = res.data;
        if (state) {
          showInfo(msg);
        }
        getInfoData(() => {
          getDetailInfoData({ pageNo: 1, pageSize: 10 });
        });
      });
    });
  };

  return (
    <div>
      <Modal
        visible={visible}
        footer={null}
        onCancel={handleCancel}
        width={modalList[modalType].modalWidth}
        destroyOnClose
        title={modalList[modalType].title}
      >
        {modalType === 'config' ? (
          <MaintenanceConfigPage
            dataSourceId={dataSourceId}
            dataModelId={targetDataModelId}
            tableName={targetTableName}
            handleCancel={handleCancel}
          />
        ) : (
          <MaintenanceManagePage
            dataSourceId={dataSourceId}
            tableName={targetTableName}
            dataModelId={targetDataModelId}
          />
        )}
      </Modal>
      <Row className="table-header-btns" justify="space-between">
        <Col>
          <Button type="primary" icon={<Icon type={refreshIcon} />} onClick={refresh}>
            刷新
          </Button>
        </Col>
        <Col>
          <Search placeholder="表名/名称" allowClear onSearch={onSearch} style={{ width: 250 }} />
        </Col>
      </Row>
      <div>
        <List
          grid={{
            gutter: 20,
          }}
          style={{ marginBottom: 20 }}
          className="model-table"
          dataSource={data}
          renderItem={item => {
            const btn = [
              <Button type="link" onClick={() => handleDataMaintenance(item)}>
                数据维护
              </Button>,
              <Button type="link" onClick={() => handleDataConfig(item)}>
                维护配置
              </Button>,
              <Button type="link" onClick={() => handleClearDataModel(item)}>
                清空数据
              </Button>,
            ];
            return (
              <List.Item key={item.id}>
                <Card
                  key={item.id}
                  hoverable
                  style={{
                    width: 300,
                  }}
                  actions={btn}
                >
                  <Meta
                    title={item.modelNum}
                    description={
                      <div className="detailDescription">
                        <h6 level={5}>
                          <TextToolTip text={item.tableName ? `表名:${item.tableName}` : '暂无数据'} />
                        </h6>
                        <h6 level={5}>
                          <TextToolTip text={item.modelName ? `名称 : ${item.modelName}` : '暂无数据'} />
                        </h6>
                        <h6 level={5}>
                          {item.modelCreateTime ? `采集时间 : ${item.modelCreateTime}` : '暂无数据'}
                        </h6>
                        <h6 level={5}>{`状态 : ${item.notice ? item.notice : '暂无'}`}</h6>
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
              current={pageNo}
              pageSize={pageSize}
              total={total}
              size="small"
              pageSizeOptions={[10, 20, 50, 100, 500]}
              showTotal={total => `共${total}条`}
              onChange={(page, pageSize) => {
                getDetailInfoData({ pageNo: page, pageSize });
              }}
              showSizeChanger
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default forwardRef(TableContent);
