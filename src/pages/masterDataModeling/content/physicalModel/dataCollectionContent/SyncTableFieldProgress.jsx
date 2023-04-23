import React, { useEffect, useState } from "react";
import { Progress, Table } from "antd";
import { showInfo } from "@tool";
import { standardManage } from "@api/dataAccessApi";

const { systemTableFieldProgressBar } = standardManage.systemModelingApi;

let timer = null;
export default function SyncTableFieldProgress(props) {
  const { handleCancel } = props;
  const width = 150;
  const align = "center";

  const [percent, setPercent] = useState(0);
  const [steps, setSteps] = useState(0);
  const [dataSource, setDataSource] = useState([]);
  useEffect(
    (res) => {
      getTableFieldProgress();
      return () => {
        clear();
      };
    },
    []
  );

  const getTableFieldProgress = () => {
    setDataSource([]);
    timer = setInterval(() => {
      systemTableFieldProgressBar().then((res) => {
        const { state, data } = res.data;
        if (state) {
          if (JSON.stringify(data) !== "{}") {
            const {dataModelCount, syncFiledTable, schedule} = data
            setDataSource(syncFiledTable);
            if (dataModelCount === 0) {
              setPercent(0);
            } else {
              setSteps(dataModelCount);
              const newP = (schedule / dataModelCount) * 100;
              setPercent(newP.toFixed(2));
              if (schedule === dataModelCount) {
                clear();
                showInfo('同步完成');
              }
            }
          } else {
            clear();
            showInfo('同步完成');
            /* handleCancel(); */
          }
        }
      });
    }, 500);
  };

  const clear = () => {
    clearInterval(timer);
    timer = null;
  };

  const columns = [
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
      title: "同步结果",
      dataIndex: "result",
      ellipsis: true,
      width: width + 50,
    },
  ];

  return (
    <div>
      <h5>{`需同步表总数:${steps}`}</h5>
      <Progress percent={percent} status="active" />
      <div style={{ marginTop: 20 }}>
        <Table
          size="small"
          columns={columns}
          dataSource={dataSource}
          rowKey={(row) => row.id}
          pagination={false}
          scroll={{ y: 500 }}
        />
      </div>
    </div>
  );
}
