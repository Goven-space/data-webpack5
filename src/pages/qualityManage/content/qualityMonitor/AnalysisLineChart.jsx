import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { numUnitConversion } from '@tool/';
import ReactEcharts from 'echarts-for-react';

function DataLineChart(props) {
  const { lineData } = props;

  const [options, setOptions] = useState({})

  useEffect(() => {
    if (Object.keys(lineData).length) {
      initOptions(lineData.dateTimeList, [lineData.normalList, lineData.questionList]);
    } else {
      initOptions([], [])
    }
  }, [lineData]);

  const initOptions = (xData, yData) => {
    const options = {
      tooltip: {
        trigger: 'axis',
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
      legend: {},
      color: ['#4babf3', '#f19c4f'],
      grid: {
        left: '3%',
        right: '6%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        // 不显示x轴刻度
        axisTick: {
          show: false,
        },
        data: xData,
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: {
          lineStyle: {
            opacity: 0.5,
          },
        },
        axisLabel: {
          formatter: function (value) {
            return numUnitConversion(value, 1, true);
          },
        },
      },
      series: [
        {
          name: '正常记录数',
          type: 'line',
          stack: 'Total',
          smooth: true,
          showSymbol: false,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(75, 171, 243, 1)',
              },
              {
                offset: 1,
                color: 'rgba(75, 171, 243, 0)',
              },
            ]),
          },
          data: yData[0],
        },
        {
          name: '问题记录数',
          type: 'line',
          stack: 'Total',
          smooth: true,
          showSymbol: false,
          data: yData[1],
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(241, 156, 79, 1)',
              },
              {
                offset: 1,
                color: 'rgba(241, 156, 79, 0)',
              },
            ]),
          },
        },
      ],
    };
    setOptions(options)
  }

  return <ReactEcharts option={options} style={{ height: 180 }} className="react_for_echarts" />
}

export default DataLineChart;
