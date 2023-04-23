import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Progress, Table, Space } from "antd";
import { showInfo } from "@tool";
import { standardManage } from "@api/dataAccessApi";
const { codeSyncProgressBar } = standardManage.systemModelingApi;

let syTimer = null;
const SynProgress = (props, ref) => {
  const { handleCancel, contentFlag } = props;
  const width = 150;
  const align = "center";

  const [percent, setPercent] = useState(0);
  const [steps, setSteps] = useState({
    normCodeSyncCount: 0,
    normCodeCount: 0,
    normCodeItemCount: 0,
  });
  const [dataSource, setDataSource] = useState([]);
  useEffect(() => {
    getVerifyTableExistProgress();
    return () => {
      clear();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    clear,
  }));

  const getVerifyTableExistProgress = () => {
    setDataSource([]);
    syTimer = setInterval(() => {
      codeSyncProgressBar().then((res) => {
        const { state, data } = res.data;
        if (state) {
          if (JSON.stringify(data) !== "{}") {
            setDataSource(data.codeSync);
            if (data.normCodeSyncCount === 0) {
              setPercent(0);
            } else {
              setSteps({
                normCodeSyncCount: data.normCodeSyncCount || 0,
                normCodeCount: data.normCodeCount || 0,
                normCodeItemCount: data.normCodeItemCount || 0,
              });
              if (!data.schedule) {
                data.schedule = 0;
              }
              const newP = (data.schedule / data.normCodeSyncCount) * 100;
              setPercent(newP.toFixed(2));
              if (data.schedule === data.normCodeSyncCount) {
                clear();
                showInfo("同步完成！");
              }
            }
          } else {
            clear();
            showInfo("同步完成！");
          }
        }
      });
    }, 2000);
  };

  const clear = () => {
    clearInterval(syTimer);
    syTimer = null;
  };

  const columns = [
    {
      title: "基础代码名称",
      dataIndex: "codeName",
      width,
      ellipsis: true,
    },
    {
      title: "同步总数据量",
      dataIndex: "normCodeSyncCount",
      ellipsis: true,
      width: width - 30,
    },
    {
      title: "基础代码数量",
      dataIndex: "normCodeCount",
      ellipsis: true,
      width: width - 30,
    },
    {
      title: "基础代码子项数据量",
      dataIndex: "normCodeItemCount",
      ellipsis: true,
      width,
    },
    {
      title: "同步结果",
      dataIndex: "result",
      ellipsis: true,
      width: width - 50,
    },
    {
      title: "同步失败的异常信息",
      dataIndex: "errorMsg",
      ellipsis: true,
      width: width + 50,
    },
  ];

  return (
    <div>
      <h4>
        <Space>
          <span>{`同步总数据:${steps.normCodeSyncCount}`}</span>
          <span>{`同步基础代码数据:${steps.normCodeCount}`}</span>
          <span>{`同步基础代码子项数据:${steps.normCodeItemCount}`}</span>
        </Space>
      </h4>
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
};

export default forwardRef(SynProgress);
