import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Row, Button, Col, Input, Table, Tag, Drawer } from 'antd';
import Icon from '@components/icon';
import { refreshIcon } from '@/constant/icon.js';
import { standardManage } from '@api/dataAccessApi';
import { paginationConfig } from '@tool';
import RuleConfigForm from './RuleConfigForm';

const { getList } = standardManage.informationManageApi;
const { Search } = Input;

function ModelConfigManage({ menuSelect }, ref) {
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('新增');
  const [id, setId] = useState(undefined);
  const [dialogWidth, setDialogWidth] = useState(600);
  const [classifyName, setClassifyName] = useState('');

  let searchData = {};
  const width = 150;
  const align = 'center';

  const columns = [
    {
      title: '模型编号',
      key: 'num',
      dataIndex: 'num',
      align,
      width: width - 40,
      ellipsis: true,
    },
    {
      title: '模型名称',
      key: 'tableName',
      dataIndex: 'tableName',
      align,
      ellipsis: true,
      width,
    },
    {
      title: '模型注释',
      key: 'modelName',
      dataIndex: 'modelName',
      align,
      ellipsis: true,
      width,
    },
    {
      title: '字段数量',
      key: 'childNodeCount',
      dataIndex: 'childNodeCount',
      align,
      ellipsis: true,
      width: width - 50,
    },
    {
      title: '是否已建模',
      key: 'buildModel',
      dataIndex: 'buildModel',
      align,
      ellipsis: true,
      width: width - 70,
      render: text => (text ? <Tag color="green">是</Tag> : <Tag color="orange">否</Tag>),
    },
    {
      title: '是否需要核验',
      key: 'verify',
      dataIndex: 'verify',
      align,
      ellipsis: true,
      width: width - 70,
      render: text => (text ? <Tag color="green">是</Tag> : <Tag color="orange">否</Tag>),
    },
    {
      title: '排序',
      key: 'sort',
      dataIndex: 'sort',
      align,
      ellipsis: true,
      width: width - 70,
    },
    {
      title: '创建人',
      key: 'creatorName',
      dataIndex: 'creatorName',
      align,
      ellipsis: true,
      width: width - 70,
    },
    {
      title: '最后修改时间',
      key: 'editTime',
      dataIndex: 'editTime',
      align,
      ellipsis: true,
      width: width,
    },
    {
      title: '操作',
      key: 'action',
      dataIndex: 'action',
      align,
      width: width - 50,
      fixed: 'right',
      render: (text, record) => {
        return (
          <Button type="link" onClick={() => handleConfig(record)} size="small">
            规则配置
          </Button>
        );
      },
    },
  ];

  useImperativeHandle(ref, () => ({
    getTableData,
  }));

  useEffect(() => {
    getTableData();
  }, [menuSelect]);

  //分页显示返回状态码
  const getTableData = (pagination = { pageNo, pageSize }) => {
    if (!menuSelect) {
      return;
    }
    getList({
      ...pagination,
      filters: {
        theirTopClassifyId: menuSelect,
        type: 'dataModel',
      },
      searchFilters: {
        ...searchData,
      },
      sort: 'sort',
      order: 'asc',
    }).then(res => {
      const { state, rows, pageNo, pageSize, total } = res.data;
      if (state) {
        setDataSource(rows);
        setPageNo(pageNo);
        setPageSize(pageSize);
        setTotal(total);
      }
    });
  };

  const handleConfig = record => {
    setId(record.id);
    setTitle(`${record.modelName}-规则配置`);
    setDialogWidth(1400);
    setClassifyName(record.modelName);
    setOpen(true);
  };

  const onSearch = value => {
    searchData = {
      num: value,
      modelName: value,
      tableName: value,
    };
    getTableData({ pageNo: 1, pageSize });
  };

  const refresh = () => {
    getTableData({ pageNo: 1, pageSize });
  };

  const onPageChange = (page, size) => {
    getTableData({ pageNo: page, pageSize: size });
  };

  const handleDrawerClose = (e, flag) => {
    setOpen(false);
    if (flag) {
      refresh();
    }
  };

  return (
    <div className="wrapper-content">
      <Drawer visible={open} width={dialogWidth} title={title} onClose={handleDrawerClose} destroyOnClose>
        <RuleConfigForm id={id} closeDialog={handleDrawerClose} />
      </Drawer>
      <div>
        <Row justify="space-between">
          <Col>
            <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
              刷新
            </Button>
          </Col>
          <Col>
            <Search placeholder="编号/表名/名称" allowClear onSearch={onSearch} style={{ width: 250 }} />
          </Col>
        </Row>
      </div>
      <div className="table-content">
        <Table
          size="middle"
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: 'max-content' }}
          rowKey={row => row.id}
          pagination={paginationConfig(pageNo, total, pageSize, onPageChange)}
        />
      </div>
    </div>
  );
}

export default forwardRef(ModelConfigManage);
