import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { standardManage } from "@api/dataAccessApi";
import { paginationConfig } from "@tool";

const { getListFieldLog } = standardManage.metaDataManageApi;

export default function FieldLogPage(props) {
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);

  let searchData = {};
  const width = 150;

  const columns = [
    {
      title: "元数据名称",
      dataIndex: "currentFieldName",
      width: width - 20,
      ellipsis: true,
    },
    {
      title: "元数据注释",
      dataIndex: "currentFieldComment",
      ellipsis: true,
      width,
    },
    {
      title: "原值",
      dataIndex: "originalValue",
      ellipsis: true,
      width: width - 20,
    },
    {
      title: "现值",
      dataIndex: "presentValue",
      ellipsis: true,
      width: width - 20,
    },
    {
      title: "操作类型",
      dataIndex: "operationType",
      ellipsis: true,
      width: width - 30,
    },
    {
      title: "字段操作项描述",
      dataIndex: "fieldOperationType",
      ellipsis: true,
      width: width + 20,
    },
    {
      title: "操作人",
      dataIndex: "creatorName",
      ellipsis: true,
      width: width - 20,
    },
    {
      title: "记录时间",
      dataIndex: "writeTime",
      ellipsis: true,
      width,
    },
  ];

  useEffect(() => {
    getTableData();
  }, [props.id]);

  //分页显示返回状态码
  const getTableData = (pagination = { pageNo, pageSize }) => {
    getListFieldLog({
      ...pagination,
      filters: JSON.stringify({
        fieldId: props.id,
      }),
      sort: JSON.stringify({ writeTime: 1 }),
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

  const onSearch = (value) => {
    searchData = {
      fieldCode: value,
      fieldName: value,
      fieldComment: value,
    };
    getTableData({ pageNo: 1, pageSize: 10 });
  };

  const refresh = () => {
    getTableData();
  };

  const onPageChange = (page, size) => {
    getTableData({ pageNo: page, pageSize: size });
  };

  return (
    <div className="">
      <Table
        size="small"
        columns={columns}
        dataSource={dataSource}
        rowKey={(row) => row.id}
        pagination={paginationConfig(pageNo, total, pageSize, onPageChange)}
      />
    </div>
  );
}
