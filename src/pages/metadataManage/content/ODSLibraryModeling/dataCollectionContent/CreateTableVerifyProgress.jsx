import React, { useEffect, useState } from "react";
import { Progress, Table } from "antd";
import { showInfo } from "@tool";
import { metadataManage } from "@api/dataAccessApi";
const { systemVerifyTableExistProgressBar, systemCreateTableProgressBar } =
  metadataManage.systemModeling;

let timer = null;
export default function CreateTableVerifyProgress(props) {
  const { handleCancel, contentFlag } = props;
  const width = 150;

  const [percent, setPercent] = useState(0);
  const [steps, setSteps] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  useEffect(
    (res) => {
      const msg = contentFlag === "verify" ? "核验完成" : "建表完成";
      getVerifyTableExistProgress(msg);
      return () => {
        clear();
      };
    },
    [contentFlag]
  );

  const getVerifyTableExistProgress = (msg) => {
    const url =
      contentFlag === "verify"
        ? systemVerifyTableExistProgressBar
        : systemCreateTableProgressBar;
    setDataSource([]);
    timer = setInterval(() => {
      url().then((res) => {
        const { state, data } = res.data;
        if (state) {
          if (JSON.stringify(data) !== "{}") {
            const newData =
              contentFlag === "verify" ? data.createTable : data.syncTable;
            setDataSource(newData);
            if (data.dataModelCount === 0) {
              setPercent(0);
            } else {
              setSteps(data.dataModelCount);
              const newP = (data.schedule / data.dataModelCount) * 100;
              setPercent(newP.toFixed(2));
              if (data.schedule === data.dataModelCount) {
                clear();
                showInfo(msg);
              }
            }
          } else {
            clear();
            showInfo(msg);
            /* handleCancel(); */
          }
        }
      });
    }, 500);
  };

  const getCreateTableProgressBar = (params) => {
    systemCreateTableProgressBar().then((res) => {});
  };

  const clear = () => {
    clearInterval(timer);
    timer = null;
  };

  const verifyColumns = [
    {
      title: "模型名称",
      dataIndex: "modelName",
      width: width - 20,
      ellipsis: true,
    },
    {
      title: "表名",
      dataIndex: "tableName",
      ellipsis: true,
      width,
    },
    {
      title: "核验结果",
      dataIndex: "result",
      ellipsis: true,
      width: width + 50,
    },
  ];

  return (
    <div>
      <h5>{`${
        contentFlag === "verify" ? "需核验表总数" : "需创建表总数"
      }:${steps}`}</h5>
      <Progress percent={percent} status="active" />
      <div style={{ marginTop: 20 }}>
        <Table
          size="small"
          columns={verifyColumns}
          dataSource={dataSource}
          rowKey={(row) => row.id}
          pagination={false}
          scroll={{ y: 500 }}
        />
      </div>
    </div>
  );
}
