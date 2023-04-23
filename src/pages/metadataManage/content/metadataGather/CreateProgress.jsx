import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Progress, Table } from "antd";
import { showInfo,randomString, showError } from "@tool";
import { metadataManage } from "@api/dataAccessApi";
import {CacheUtils} from '@api/cacheUtils.js'
const { getProgress } = metadataManage.metadataGather;

let timer = null;
const CreateTableVerifyProgress = ({ handleCancel, contentFlag }, ref) => {
  const width = 150;
  const align = "left";

  const [percent, setPercent] = useState(0);
  const [steps, setSteps] = useState(0);
  const [dataSource, setDataSource] = useState([]);

  useEffect(
    () => {
      getVerifyTableExistProgress();
      return () => {
        clear();
				CacheUtils.clearCache();
      };
    },
    [contentFlag]
  );

	useImperativeHandle(ref, () => ({
    clear,
  }));

  const getVerifyTableExistProgress = (msg='采集完成') => {
    setDataSource([]);
    timer = setInterval(() => {
      getProgress().then((res) => {
        const { state, data } = res.data;
        if (state) {
          if (JSON.stringify(data) !== "{}") {
            setDataSource(
              data.gatherData.map((item) => ({ ...item, id: randomString() }))
            );
            if (data.tableCount === 0) {
              setPercent(0);
							clear();
							showInfo('无需要采集的表');
            } else {
              setSteps(data.tableCount);
              const newP = (data.schedule / data.tableCount) * 100;
              setPercent(newP.toFixed(2));
              if (data.schedule === data.tableCount) {
                clear();
                /* showInfo(msg); */
              }
            }
          } else {
            clear(); 
            /* showInfo(msg); */
            /* handleCancel(); */
          }
        }
      }).catch(err => {});
    }, 500);
  };


  const clear = () => {
    clearInterval(timer);
    timer = null;
  };

  const verifyColumns = [
    {
      title: "表名",
      dataIndex: "gatherSchedule",
      width: 300,
      ellipsis: true,
    },
    {
      title: "消息",
      dataIndex: "gatherDataMsg",
      ellipsis: true,
      width: width,
    },
  ];

  return (
    <div>
      <h5>{`需采集表总数:${steps}`}</h5>
      <Progress percent={percent} status="active" />
      <div style={{ marginTop: 20 }}>
        <Table
          size="small"
          showHeader={false}
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

export default forwardRef(CreateTableVerifyProgress);