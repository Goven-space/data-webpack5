import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Space, Input, Button, Table, Menu, Dropdown } from 'antd';
import Icon from '@components/icon';
import { kernelModule } from '@api/dataAccessApi';
import { json2Excel, paginationConfig } from '@tool';
import { exportIcon } from '@/constant/icon.js';

const { Search } = Input;

const { getList, dynamicQueryTableField, dynamicExportData } = kernelModule.dataQuery;

function TableDataQuery({ dataSourceId, tableName }) {
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [tableWidth, setTableWidth] = useState(1350);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const sorterValue = useRef({ sort: '', order: '' });
  const searchFilters = useRef('');
  const excelKeyToName = useRef({});

  useEffect(() => {
    loadColumns();
    loadList();
  }, []);

  const loadColumns = () => {
    dynamicQueryTableField({ dataSourceId, tableName }).then(res => {
      const { data, state } = res.data;
      if (state) {
        data && data.length > 6 && setTableWidth(tableWidth + (data.length - 6) * 150);
        const columns = data.map(item => {
          const title = `${item.fieldName} [${item.fieldComment}]`;
          excelKeyToName.current[item.fieldName] = title;
          return {
            title,
            dataIndex: item.fieldName,
            key: item.fieldName,
            sorter: true,
            align: 'center',
            ellipsis: true,
            width: 150
          };
        });
        setColumns(columns);
      }
    });
  };

  const loadList = (pagination = { current, pageSize }) => {
    const { current, pageSize } = pagination;
    const params = {
      dataSourceId,
      tableName,
      pageNo: current,
      pageSize,
      selectFields: '*',
      sqlWhere: searchFilters.current,
      ...sorterValue.current,
    };
    
    getList(params).then(res => {
      const { state, rows, total, pageNo, pageSize } = res.data;
      if (state) {
        setDataSource(rows);
        setCurrent(pageNo);
        setPageSize(pageSize);
        setTotal(total);
      }
    });
  };

  const onSearch = value => {
    searchFilters.current = value.trim();
    loadList({ current: 1, pageSize });
  };

  const onPageChange = ({ current, pageSize }, filter, sorter) => {
    sorterValue.current = sorter.order
      ? {
          sort: sorter.field,
          order: sorter.order === 'ascend' ? 'ASC' : 'DESC',
        }
      : { sort: '', order: '' };
    loadList({ current, pageSize });
  };

  const handleRefresh = () => {
    searchFilters.current = '';
    setSelectedRows([]);
    loadList({ current: 1, pageSize: 10 });
  };

  const handleExport = ({ key }) => {
    if (key === 'exportAllExcel') {
      dynamicExportData({ dataSourceId, tableName });
    } else if (key === 'exportExcel') {
      const jsonData = selectedRows;
      json2Excel(jsonData, 'sheet1', tableName + '.xlsx', excelKeyToName.current);
    }
  };

  const handleRowSelected = (selectedRowKeys, selectedRows) => {
    setSelectedRows(selectedRows);
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: '5px' }}>
        <Col>
          <Space>
            <Button onClick={handleRefresh}>刷新</Button>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu
                  onClick={handleExport}
                  items={[
                    {
                      label: '导出Excel',
                      key: 'exportExcel',
                      disabled: !selectedRows.length,
                    },
                    { label: '导出全量Excel', key: 'exportAllExcel' },
                  ]}
                />
              }
              placement="bottomLeft"
            >
              <Button icon={<Icon type={exportIcon} />}>导出</Button>
            </Dropdown>
          </Space>
        </Col>
        <Col>
          <Space>
            <span>按SQL条件搜索：</span>
            <Search
              placeholder="userid='admin' or userid='test"
              onSearch={onSearch}
              style={{
                width: 400,
              }}
            />
          </Space>
        </Col>
      </Row>
      <Table
        rowKey={record => record.id || record.key}
        size="small"
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: tableWidth }}
        pagination={paginationConfig(current, total, pageSize)}
        onChange={onPageChange}
        rowSelection={{
          onChange: handleRowSelected,
        }}
      />
    </div>
  );
}

export default TableDataQuery;
