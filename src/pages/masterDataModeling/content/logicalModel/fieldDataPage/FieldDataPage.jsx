import React, { useEffect, useState } from 'react';
import { Row, Space, Button, Col, Input, Table, Modal, Form, Tag, Drawer, Tabs } from 'antd';
import Icon from '@components/icon';
import { look, refreshIcon } from '@/constant/icon.js';
import { showInfo } from '@tool';
import { standardManage } from '@api/dataAccessApi';
import { paginationConfig } from '@tool';
import DetailForm from './DetailForm';
import FieldConfigPag from './FieldConfigPag';
import MaintenanceConfigPage from './MaintenanceConfigPage';
import FormInfoPage from './FormInfoPage';
import DataBarChart from './DataBarChart';
import FlowGatherPage from './FlowGatherPage';

const { getList } = standardManage.metaDataManageApi;
const { listPrimaryKey, getListField } = standardManage.informationManageApi;
const { Search } = Input;
const { TabPane } = Tabs;

export default function FieldDataPage({ getInitData, pid, menuKeyId, isModal, classifyName, targetData }) {
  const [dataSource, setDataSource] = useState([]);
  const [primaryKeyDataSource, setPrimaryKeyDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('新增');
  const [contentFlag, setContentFlag] = useState('form');
  const [dialogWidth, setDialogWidth] = useState(1100);
  const [targetRowData, setTargetRowData] = useState({});
 

  const [form] = Form.useForm();

  let searchData = {};
  const width = 150;

  const columns = [
    {
      title: '字段ID',
      dataIndex: 'fieldName',
      ellipsis: true,
      width,
    },
    {
      title: '字段注释',
      dataIndex: 'fieldComment',
      ellipsis: true,
      width,
    },
    {
      title: '字段类型',
      dataIndex: 'fieldType',
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '字段长度',
      dataIndex: 'fieldLength',
      ellipsis: true,
      width: width - 70,
    },
    {
      title: '是否为空',
      dataIndex: 'fieldNull',
      ellipsis: true,
      width: width - 70,
      render: text => (text ? <Tag color="green">是</Tag> : <Tag color="orange">否</Tag>),
    },
    {
      title: '是否主键',
      dataIndex: 'primaryKey',
      ellipsis: true,
      width: width - 70,
      render: text => (text ? <Tag color="green">是</Tag> : null),
    },
    {
      title: '字段默认值',
      dataIndex: 'defaultValue',
      ellipsis: true,
      width: width - 30,
    },
    {
      title: '字段小数点',
      dataIndex: 'fieldRadixPoint',
      ellipsis: true,
      width: width - 70,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      ellipsis: true,
      width: width - 70,
    },
    {
      title: '操作',
      key: 'action',
      width: width - 50,
      fixed: 'right',
      render: (text, record) => {
        return (
          <Space>
            <Button type="link" onClick={() => handleFieldLog(record)}>
              字段详情
            </Button>
          </Space>
        );
      },
    },
  ];

 

  useEffect(() => {
    getTableData();
    searchData = {};
  }, [pid]);

  //分页显示返回状态码
  const getTableData = (pagination = { pageNo, pageSize }) => {
    getListField({
      dataModelId: pid,
      searchFilters: {
        ...searchData,
      },
    }).then(res => {
      const { state, data, pageNo, pageSize, total } = res.data;
      if (state) {
        setDataSource(data);
        setPageNo(pageNo);
        setPageSize(pageSize);
        setTotal(total);
      }
    });
  };

  

  const primaryKeyColumns = [
    {
      title: '编号',
      key: 'fieldCode',
      dataIndex: 'fieldCode',
      width: width - 20,
      ellipsis: true,
    },
    {
      title: '字段名称',
      key: 'fieldName',
      dataIndex: 'fieldName',
      ellipsis: true,
      width: width,
    },
    {
      title: '字段注释',
      key: 'fieldComment',
      dataIndex: 'fieldComment',
      ellipsis: true,
      width: width,
    },
    {
      title: '字段类型',
      key: 'fieldType',
      dataIndex: 'fieldType',
      ellipsis: true,
      width: width,
    },
    {
      title: '字段长度',
      key: 'fieldLength',
      dataIndex: 'fieldLength',
      ellipsis: true,
      width: width,
    },
    {
      title: '字段小数点',
      key: 'fieldRadixPoint',
      dataIndex: 'fieldRadixPoint',
      ellipsis: true,
      width: width,
    },
    {
      title: '排序',
      key: 'sort',
      dataIndex: 'sort',
      ellipsis: true,
      width: width - 30,
    },
    {
      title: '是否为空',
      key: 'fieldNull',
      dataIndex: 'fieldNull',
      ellipsis: true,
      width: width,
      render: text => {
        return text ? '是' : '否';
      },
    },
    {
      title: '字段默认值',
      key: 'defaultValue',
      dataIndex: 'defaultValue',
      ellipsis: true,
      width: width,
    },
    {
      title: '引用标准代码名称',
      key: 'referenceCodeName',
      dataIndex: 'referenceCodeName',
      ellipsis: true,
      width: width,
      fixed: 'right',
    },
  ];

  const table = (
    <Table
      size="small"
      columns={primaryKeyColumns}
      dataSource={primaryKeyDataSource}
      scroll={{ x: 'max-content' }}
      rowKey={row => row.id}
      pagination={false}
    ></Table>
  );

  const getPrimaryKeyTable = () => {
    listPrimaryKey({ dataModelId: pid }).then(res => {
      const { state, data } = res.data;
      if (state) {
        setPrimaryKeyDataSource(data);
      }
    });
  };

  const handleFieldLog = record => {
    setTargetRowData(record);
    setTitle(`${record.fieldName}-字段详情页`);
    setContentFlag('form');
    setDialogWidth(1200);
    setOpen(true);
  };

  const handleFieldConfig = () => {
    setDialogWidth(1200);
    setTitle('字段配置');
    setContentFlag('fieldConfig');
    setOpen(true);
  };

  const onSearch = value => {
    searchData = {
      fieldCode: value,
      fieldName: value,
      fieldComment: value,
    };
    getTableData({ pageNo: 1, pageSize: 10 });
  };

  const dealSave = () => {
    getTableData();
    handleCancel();
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const refresh = () => {
    getTableData();
  };

  const onPageChange = (page, size) => {
    getTableData({ pageNo: page, pageSize: size });
  };

  const handleKeyConfig = () => {
    setDialogWidth(850);
    setVisible(true);
    setTitle('主数据编码配置');
    setContentFlag('keyConfig');
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className="metadataManage-content" style={{ height: '100%' }}>
      <Modal centered visible={visible} footer={null} onCancel={handleCancel} width={dialogWidth} destroyOnClose title={title}>
        <MaintenanceConfigPage tableData={dataSource} dataModelId={menuKeyId} handleCancel={handleCancel} />
      </Modal>
      <Drawer visible={open} width={dialogWidth} title={title} bodyStyle={{ display: 'flex', justifyContent: 'center' }} onClose={handleDrawerClose}>
        {contentFlag === 'fieldConfig' ? (
          <FieldConfigPag id={pid} handleCancel={handleDrawerClose} getTableData={getTableData} />
        ) : (
          contentFlag === 'form' && <DetailForm pid={pid} dealSave={dealSave} targetRowData={targetRowData} handleCancel={handleDrawerClose} />
        )}
      </Drawer>
      <Tabs size="large" className={isModal && 'new-modal-content'} style={{ height: '100%' }}>
        <TabPane tab="字段列表" key="fieldInfo">
          <Row justify="space-between" style={{ marginBottom: 5 }}>
            <Col span={17}>
              <Space>
                <Button icon={<Icon type={look} />} type="primary" onClick={handleFieldConfig}>
                  字段配置
                </Button>
                <Button onClick={handleKeyConfig}>主数据编码配置</Button>
                <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
                  刷新
                </Button>
              </Space>
            </Col>
            <Col span={7} style={{ textAlign: 'right' }}>
              <Space>
                <Search placeholder="编号/字段注释/字段名称" allowClear onSearch={onSearch} style={{ width: 250 }} />
              </Space>
            </Col>
          </Row>
          <Table
            size={isModal ? 'small' : 'middle'}
            columns={columns}
            dataSource={dataSource}
            rowKey={row => row.id}
            scroll={{ x: 'max-content' }}
            pagination={false}
            /* pagination={paginationConfig(pageNo, total, pageSize, onPageChange)} */
          />
        </TabPane>
        <TabPane tab="表单定义" key="formInfo">
          <FormInfoPage dataModelId={pid} />
        </TabPane>
        <TabPane tab="数据量统计趋势图" key="dataTrendGraph">
          <DataBarChart dataModelId={pid} classifyName={classifyName} />
        </TabPane>
        <TabPane tab="采集流程" key="gatherFlowIds">
          <FlowGatherPage isModal={isModal} flowIds={targetData.gatherFlowIds || ''} applicationId={targetData.gatherFlowApplyId || ''} />
        </TabPane>
        <TabPane tab="分发流程" key="distributeIds">
          <FlowGatherPage isModal={isModal} flowIds={targetData.distributeFlowIds || ''} applicationId={targetData.distributeFlowApplyId || ''} />
        </TabPane>
      </Tabs>
    </div>
  );
}
