import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { isArray, isNumber } from 'lodash';
import ReactEcharts from 'echarts-for-react';

function DataBarChart(props) {
  const { barData } = props;
  const [options, setOptions] = useState({})

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
      endValue: 4, // 最多5个
    },
  ];
  
  useEffect(() => {
    if (isArray(barData) && barData.length) {
      let x = [];
      let y = [];
      barData.forEach((item, index) => {
        x.push(item.value);
        y.push({
          score: item.systemVerifyScore || 0,
          isVerify: item.qualityVerifyStatus,
        });
      });
      initOptions(x, y)
    } else {
      initOptions([], []);
    }
  }, [barData]);

  const getRating = (score, flag) => {
    if (!flag) {
      return { grade: '无', color: '#ccc', linear: '#e0dede' };
    } else if (isNumber(score)) {
      if (score > 89) {
        return { grade: '优', color: '#0570E9', linear: '#BADCF0' };
      } else if (score > 79) {
        return { grade: '良', color: '#13e375', linear: '#79f2b1' };
      } else if (score > 69) {
        return { grade: '中', color: '#13c2c2', linear: '#65f2f2' };
      } else if (score > 59) {
        return { grade: '及', color: '#EF7C16', linear: '#FFE1C6' };
      } else {
        return { grade: '差', color: '#ff4d4f', linear: '#fc7979' };
      }
    }
  };

  const initOptions = (xData, yData) => {
    // 设置顶部和底部的值
    let y = [];
    yData.forEach(item => {
      const { score, isVerify } = item;
      const itemType = getRating(score, isVerify);
      y.push({
        value: isVerify ? score : -1,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: itemType.color },
            { offset: 1, color: itemType.linear },
          ]),
        },
      });
    });
    const options = {
      // 直角坐标系内绘图网格,设置组件距离容器的距离
      grid: {
        left: 50,
        top: 20,
        right: 50,
        bottom: 30,
      },
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
      dataZoom: xData.length > 5 ? dataZoom : [],
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
          type: 'none',
        },
        formatter: function (params) {
          let text = params[0].value < 0 ? '暂无数据' : params[0].value;
          let str = params[0].name + '<br/>';
          //params是数组格式
          //设置浮层图形的样式跟随图中展示的颜色
          str += "<span style='display:inline-block;width:10px;height:10px;border-radius:10px;background-color:" + params[0]?.color.colorStops[0].color + ";'></span>" + '\t' + text;
          return str;
        },
      },
      // 设置x轴
      xAxis: {
        data: xData,
        // 显示x轴
        axisLabel: {
          margin: -10,
        },
        axisLine: {
          show: false,
        },
        // 不显示x轴刻度
        axisTick: {
          show: false,
        },
        type: 'category',
      },
      // 设置y轴
      yAxis: {
        type: 'value',
        // 显示y轴
        axisLine: {
          show: false,
        },
        // 设置y轴的颜色
        axisLabel: {
          show: false,
        },
        // 不显示y轴刻度
        axisTick: {
          show: false,
        },
        // 不显示分隔线
        splitLine: {
          show: false,
        },
      },
      // 表示不同系列的列表
      series: [
        {
          name: '',
          type: 'bar',
          barWidth: 80,
          barGap: '-100%',
          data: y,
        },
      ],
    };
   setOptions(options)
  };

  return <ReactEcharts option={options} style={{ height: 210 }} className="react_for_echarts" />
}
export default DataBarChart;
