import React, { useEffect, useState, useRef } from "react";
import { Table, Switch, Row, Col, Space, Input, Button, Segmented } from "antd";
import Icon from "@components/icon";
import { refreshIcon } from "@/constant/icon.js";
import { showInfo } from "@tool";
import { paginationConfig } from "@tool";
import { metadataManage } from "@api/dataAccessApi";
import ResultDetailPage from "./ResultDetailPage";

const { getListResult } = metadataManage.systemModeling;
const Search = Input.Search;

export default function ResultPage(props) {
  const { classifyId, dataModelId, scanTime } = props;
  const [selectKey, setSelectKey] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasTime, setHasTime] = useState(true);

  const syncField = useRef(false)
  const primaryBuilding = useRef(false)
  const searchFilters = useRef({})
  // let searchData = {};
  const width = 150;

  const columns = [
    {
      title: "编号",
      dataIndex: "num",
      width: width - 50,
      ellipsis: true,
    },
    {
      title: "名称",
      dataIndex: "modelName",
      width: width - 30,
      ellipsis: true,
    },
    {
      title: "表名",
      dataIndex: "tableName",
      width,
      ellipsis: true,
    },
    {
      title: "耗时",
      dataIndex: "elapsedTime",
      width: width - 50,
      ellipsis: true,
    },
    {
      title: "同步字段数",
      dataIndex: "syncFieldCount",
      ellipsis: true,
      width: width - 50,
    },
    {
      title: "同步失败字段数",
      dataIndex: "syncErrorCount",
      ellipsis: true,
      width,
    },
    {
      title: "同步成功字段数",
      dataIndex: "syncSuccessCount",
      ellipsis: true,
      width,
    },
    {
      title: "是否构建主键",
      dataIndex: "buildPrimaryKey",
      ellipsis: true,
      width: width - 10,
      render: (text) => {
        return text ? "是" : "否";
      },
    },
    {
      title: "主键构建结果",
      dataIndex: "primaryKey",
      ellipsis: true,
      width,
      render: (text) => {
        return text ? "成功" : "失败";
      },
    },
    /* {
      title: "是否修改表名",
      key: "updateTableName",
      dataIndex: "updateTableName",
      align,
      ellipsis: true,
      width: width - 30,
      render: (text) => {
        return text ? "是" : "否";
      },
    },
    {
      title: "表名修改结果",
      key: "updateTableNameSuccess",
      dataIndex: "updateTableNameSuccess",
      align,
      ellipsis: true,
      width: width,
      render: (text) => {
        return text ? "成功" : "失败";
      },
    }, */
    {
      title: "建模时间",
      dataIndex: "scanTime",
      ellipsis: true
    },
  ];

  useEffect(() => {
    classifyId && getTableData();
  }, [classifyId]);

  //分页显示返回状态码
  const getTableData = (pagination = { pageNo, pageSize }) => {
    const option = { sort: "scanTime", order: "DESC" }
    const filters = { classifyId, dataModelId }
    syncField.current && (option.error = "error")
    primaryBuilding.current && (filters.primaryKey = false)

    getListResult({
      ...pagination,
      ...option,
      filters,
      searchFilters: { ...searchFilters.current}, 
    }).then((res) => {
      const { state, rows, pageNo, pageSize, total } = res.data;
      if (state) {
        setDataSource(rows);
        setPageNo(pageNo);
        setPageSize(pageSize);
        setTotal(total);
      }
    });
  };

  const onPageChange = (page, size) => {
    getTableData({ pageNo: page, pageSize: size });
  };

  const onSwitchChange = (value) => {
    setHasTime(value);
    getTableData({ pageNo: 1, pageSize: 10 });
  };

  const onSearch = (value) => {
    value = value.trim()
    searchFilters.current = value ? { num: value, modelName: value, tableName: value } : { }
    getTableData({ pageNo: 1, pageSize })
  };

  const refresh = () => {
    searchFilters.current = {}
    getTableData();
  };

  const handleSyncField = (checked) => {
    syncField.current = checked
    getTableData({ pageNo: 1, pageSize })
  }

  const handlePrimaryBuilding = (checked) => {
    primaryBuilding.current = checked
    getTableData({ pageNo: 1, pageSize })
  }

  return (
    <div className="">
      <div style={{ marginBottom: 20 }}>
        <Row>
          <Col span={17}>
            <Space>
              {"同步字段失败>0"}
              <Switch onChange={handleSyncField} />
              主键构建失败
              <Switch onChange={handlePrimaryBuilding} />
              <Button icon={<Icon type={refreshIcon} />} onClick={refresh}>
                刷新
              </Button>
            </Space>
          </Col>
          <Col span={7} style={{ textAlign: "right" }}>
            <Space>
              <Search
                placeholder="编号/名称/表名"
                allowClear
                onSearch={onSearch}
                style={{ width: 250 }}
              />
            </Space>
          </Col>
        </Row>
      </div>
      <div>
        <Table
          size="small"
          columns={columns}
          dataSource={dataSource}
          expandable={{
            expandedRowRender: (record, index, indent, expanded) => (
              <ResultDetailPage record={record}></ResultDetailPage>
            ),
          }}
          rowKey={(row) => row.id}
          scroll={{ x: 1100 }}
          pagination={paginationConfig(pageNo, total, pageSize, onPageChange)}
        />
      </div>
    </div>
  );
}
