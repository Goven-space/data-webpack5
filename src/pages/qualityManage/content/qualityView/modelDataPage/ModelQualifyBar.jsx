import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { isArray } from 'lodash';
import ReactEcharts from 'echarts-for-react';


const colorList = [
  ['#0576eb', '#0ecbf8'],
  ['#ff8213', '#ffb06b'],
  ['#9de45f', '#b6f282'],
  ['#ffc53d', '#ffd87f'],
  ['#b37feb', '#c191f7'],
];

function DataBarChart(props) {
  const { barData } = props;

   const [options, setOptions] = useState({});

  

  useEffect(() => {
    if (isArray(barData) && barData.length) {
      let x = [];
      let y = [];

      barData.forEach((item, index) => {
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
  }, [barData]);

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
         left: '4%',
         right: '4%',
         bottom: '5%',
         top: '5%',
         containLabel: true,
       },
       xAxis: {
         type: 'category',
         axisTick: {
           show: false,
         },
         data: xData,
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
           formatter: '{value} %',
         },
       },
       series: [
         {
           data: yData,
           type: 'bar',
           barWidth: 26,
           showBackground: true,
           backgroundStyle: {
             color: 'rgba(242,242,242,0.6)',
             borderRadius: 13,
           },
           itemStyle: {
             borderRadius: 13,
           },
         },
       ],
     };
     setOptions(options)
   };

  return <ReactEcharts option={options} style={{ height: 200 }} className="react_for_echarts" />;
}

export default DataBarChart;