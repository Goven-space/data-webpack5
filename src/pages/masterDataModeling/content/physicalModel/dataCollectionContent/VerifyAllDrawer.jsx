import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Progress, Table } from "antd";
import { standardManage } from "@api/dataAccessApi";
import { paginationConfig } from "@tool";
import { showInfo } from "@tool";
const { systemScanProgressBar } = standardManage.systemModelingApi;

const { Paragraph } = Typography;

export default function VerifyAllDrawer(props) {
  const { classifyId } = props;

  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentTable, setCurrentTable] = useState("");
  const [currentPercent, setCurrentPercent] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    getInfoData();
  }, [classifyId]);

  const width = 150;

  const columns = [
    {
      title: "表中文名称",
      dataIndex: "modelName",
      width: width - 50,
      ellipsis: true,
    },
    {
      title: "表英文名称",
      dataIndex: "tableName",
      ellipsis: true,
      width: width - 50,
    },
    {
      title: "当前核验",
      dataIndex: "currentVerify",
      ellipsis: true,
      width,
    },
  ];

  const getInfoData = () => {
    if (!classifyId) {
      return;
    }
    systemScanProgressBar({ classifyId }).then((res) => {});
  };

  const onPageChange = () => {};

  return (
    <div className="VerifyAllDrawer">
      <div>
        <Row>
          <Col span={4}>
            <div className="time">
              <div className="time-content">{time}</div>
            </div>
          </Col>
          <Col span={20}>
            <Typography.Title level={4}>发现0个表存在问题</Typography.Title>
            <h5 level={5}>{`正在核验表${currentTable}`}</h5>
            <Progress percent={currentPercent} />
          </Col>
        </Row>
      </div>
      <div style={{ marginTop: 40 }}>
        <Table
          size="small"
          columns={columns}
          dataSource={dataSource}
          rowKey={(row) => row.id}
          pagination={paginationConfig(pageNo, total, pageSize, onPageChange)}
        />
      </div>
    </div>
  );
}
