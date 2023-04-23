import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { BarChart } from 'echarts/charts';
import { isArray } from 'lodash';
import { qualityManageApi } from '@api/dataAccessApi';
import ReactEcharts from 'echarts-for-react';

const { getSystemModelFpy } = qualityManageApi.qualityView;


const colorList = [
  ['#0576eb', '#0ecbf8'],
  ['#ff8213', '#ffb06b'],
  ['#9de45f', '#b6f282'],
  ['#ffc53d', '#ffd87f'],
  ['#b37feb', '#c191f7'],
];

  const dataZoom = [
    {
      type: 'slider',
      realtime: true,
      start: 0,
      show: true, // 是否展示
      bottom: -20,
      zoomLock: true, //是否只平移不缩放
      filterMode: 'empty',
      textStyle: {
        color: '#ccd7d7',
      },
      startValue: 0, // 从头开始。
      endValue: 9, // 最多5个
    },
  ];


function DataBarChart(props) {
  const { systemId, batchTime, showView } = props;

  const [options, setOptions] = useState({})

  useEffect(() => {
    systemId &&
      batchTime &&
      getSystemModelFpy({ systemId, batchTime }).then(res => {
        const { state, data } = res.data;
        if (state && isArray(data)) {
          let x = [];
          let y = [];
          data.forEach((item, index) => {
            index = index % 5
            x.push(item.name);
            y.push({
              value: item.value,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: colorList[index][1] },
                  { offset: 1, color: colorList[index][0] },
                ]),
              },
            });
          });
          initOptions(x, y)
        } else {
          initOptions([], []);
        }
      });

  }, [systemId, batchTime]);


  const initOptions = (xData, yData) => {
    const options = {
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        silent: true,
        invisible: yData.length > 0, //是否可见，这里的意思是当没有数据时可见
        style: {
          fill: '#666',
          text: '暂无数据',
          fontSize: '16px',
        },
      },
      dataZoom: xData.length > 10 ? dataZoom : [],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: function (params) {
          let str = params[0].name + '<br/>';
          //params是数组格式
          for (let item of params) {
            //设置浮层图形的样式跟随图中展示的颜色
            str += "<span style='display:inline-block;width:10px;height:10px;border-radius:10px;background-color:" + item.color.colorStops[1].color + ";'></span>" + '\t' + item.value + '%';
          }
          return str;
        },
      },
      grid: {
        top: '3%',
        left: '3%',
        right: '4%',
        bottom: '7%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        axisTick: {
          show: false,
        },
        data: xData,
        axisLabel: {},
      },
      yAxis: {
        type: 'value',
        max: 100,
        splitLine: {
          lineStyle: {
            opacity: 0.5,
          },
        },
        axisLabel: {
          interval: 0,
          formatter: '{value} %',
        },
      },
      series: [
        {
          data: yData,
          type: 'bar',
          barWidth: 40,
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(242,242,242,0.6)',
            borderRadius: 20,
          },
          itemStyle: {
            borderRadius: 20,
          },
        },
      ],
    };
    setOptions(options)
  };

  return <ReactEcharts option={options} style={{ height: showView ? 280 : 500 }} className="react_for_echarts" />;
}
export default DataBarChart;
