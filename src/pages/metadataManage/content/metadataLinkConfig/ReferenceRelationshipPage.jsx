import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import ReactECharts from "echarts-for-react";
import { Card } from "antd";
import { standardManage } from "@api/dataAccessApi";
import { showInfo } from "@tool";
const { getRelationalGraph } = standardManage.metaDataManageApi;

const ReferenceRelationshipPage = (props, ref) => {
  const { selectKey, setSelectRow } = props;
  const [echartConfig, setEchartConfig] = useState({
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: "quinticInOut",
    series: [
      {
        type: "graph",
        layout: "none",
        symbolSize: 50,
        roam: true,
        label: {
          show: true,
          position: "bottom",
        },
        edgeSymbol: ["circle", "arrow"],
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          fontSize: 18,
        },
        data: [],
        links: [],
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0,
        },
      },
    ],
  });
  const [hasReference, setHasReference] = useState(false);
  const [height, setHeight] = useState(300);

  useImperativeHandle(ref, () => ({
    getData: getEchartRelationship,
  }));

  useEffect(() => {
    getEchartRelationship();
  }, [selectKey]);

  const getEchartRelationship = () => {
    getRelationalGraph({ id: selectKey[0] }).then((res) => {
      const { state, data } = res.data;
      const start = data?.dataElementField[0];
      const newLinks = [];
      let distance = 0;
      if (state && data.dataModelList instanceof Array) {
        data.dataModelList.length
          ? setHasReference(true)
          : setHasReference(false);
        const newData = data.dataModelList.map((item, index) => {
          distance += (index + 1) * 50;
          newLinks.push({
            source: start.name,
            target: item.name,
          });
          return {
            name: item.name,
            x: 150,
            y: data.dataModelList.length === 1 ? 300 : (index + 1) * 50,
          };
        });
        setHeight(distance > 300 ? distance : 300);
        const yDistance =
          newData.length && newData.length !== 1
            ? (newData[0].y + newData[newData.length - 1].y) / 2
            : 300;
        newData.push({
          name: start.name,
          x: 50,
          y: yDistance,
        });
        const newConfig = {
          ...echartConfig,
          series: [
            {
              type: "graph",
              layout: "none",
              symbolSize: 50,
              roam: true,
              edgeSymbol: ["circle", "arrow"],
              edgeSymbolSize: [4, 10],
              edgeLabel: {
                fontSize: 18,
              },
              data: newData,
              links: newLinks,
            },
          ],
        };
        setEchartConfig(newConfig);
      }
    });
  };

  const getStartDistance = () => {};
  return (
    <div>
      <Card style={{ minHeight: 600, borderRadius: 6, width: "100%" }}>
        {hasReference ? (
          <ReactECharts option={echartConfig} style={{ height }} />
        ) : (
          "暂无引用关系"
        )}
      </Card>
    </div>
  );
};

export default forwardRef(ReferenceRelationshipPage);
