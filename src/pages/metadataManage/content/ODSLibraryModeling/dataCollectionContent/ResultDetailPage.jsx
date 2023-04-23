import React,{useEffect, useState} from 'react'
import { Tabs, Table, Typography, Tooltip } from "antd";

const { TabPane } = Tabs;
const { Paragraph } = Typography;

export default function ResultDetailPage(props) {
	const {record} = props
  const width = 150;
	const syncErrorListColumn = [
    {
      title: "编号",
      dataIndex: "fieldCode",
      width: width - 40,
      ellipsis: true,
    },
    {
      title: "字段名称",
      dataIndex: "fieldName",
      ellipsis: true,
      width,
    },
    {
      title: "字段注释",
      dataIndex: "fieldComment",
      ellipsis: true,
      width,
    },
    {
      title: "字段类型",
      dataIndex: "fieldType",
      ellipsis: true,
      width: width - 20,
    },
    {
      title: "字段长度",
      dataIndex: "fieldLength",
      ellipsis: true,
      width: width - 30,
    },
    {
      title: "字段小数点",
      dataIndex: "fieldRadixPoint",
      ellipsis: true,
      width,
    },

    {
      title: "是否为空",
      dataIndex: "fieldNull",
      ellipsis: true,
      width: width - 30,
      render: (text) => {
        return text ? "是" : "否";
      },
    },
    {
      title: "字段默认值",
      dataIndex: "defaultValue",
      ellipsis: true,
      width,
    },
    {
      title: "排序",
      dataIndex: "sort",
      ellipsis: true,
      width: width - 40,
    },
    {
      title: "失败日志",
      dataIndex: "physicalSyncErrorMessage",
      width: 250,
      ellipsis: true,
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
  ];

	const [columns, setColumns] = useState([...syncErrorListColumn]);
	const [contentFlag, setContentFlag] = useState("syncErrorList");
	const [dataSource, setDataSource] = useState(record.syncErrorList||[])
	
	useEffect(() => {
		onTabChange("syncErrorList");		
	}, [record]);

	const onTabChange = (key) => {
		setContentFlag(key);
		const newColumns = [...syncErrorListColumn];
		if(key==='syncErrorList'){
			setDataSource(record.syncErrorList);
			setColumns(newColumns);
		}else if(key === 'syncSuccessList') {
			newColumns.pop();
			setDataSource(record.syncSuccessList);
			setColumns(newColumns);
		}else if (key === "primaryKeyErrorMessage") {
    }else {

		}
	};

	return (
    <div style={{ marginLeft: 15 }}>
      <Tabs defaultActiveKey="syncErrorList" onChange={onTabChange}>
        <TabPane tab="建模同步失败字段详情" key="syncErrorList"></TabPane>
        <TabPane tab="建模同步成功字段详情" key="syncSuccessList"></TabPane>
        <TabPane tab="主键构建失败日志" key="primaryKeyErrorMessage"></TabPane>
        {/* <TabPane
          tab="表名修改失败日志"
          key="updateTableNameMessage"
        ></TabPane> */}
      </Tabs>
      {contentFlag === "syncErrorList" || contentFlag === "syncSuccessList" ? (
        <Table
          size="small"
          columns={columns}
          dataSource={dataSource}
          rowKey={(row) => row.id}
          scroll={{ x: 'max-content' }}
          pagination={false}
          bordered
        />
      ) : contentFlag === "primaryKeyErrorMessage" ? (
        <div>{record.primaryKeyErrorMessage&&record.primaryKeyErrorMessage!=='null'?record.primaryKeyErrorMessage:'暂无数据'}</div>
      ) : (
        <div>{record.updateTableNameMessage&&record.primaryKeyErrorMessage!=='null'?record.updateTableNameMessage:'暂无数据'}</div>
      )}
    </div>
  );
}
