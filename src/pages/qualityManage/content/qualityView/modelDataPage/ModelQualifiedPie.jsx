import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { isArray } from 'lodash';
import ReactEcharts from 'echarts-for-react';

const colorList = ['#01c2c7', '#d1a544', '#389e0d', '#531dab', '#ad4e00'];

function DataPieChart(props) {
  const { pieData } = props;

  const [options, setOptions] = useState({})

  useEffect(() => {
    if (isArray(pieData) && pieData.length) {
      let data = pieData.map((item, index) => ({
        ...item,
        itemStyle: {
          color: colorList[index],
        },
      }));
      initOptions(data);
    } else {
      initOptions([]);
    }
  }, [pieData]);

  const getPercent = data => {
    if (isArray(data) && data.length) {
      const total = data[0].value + data[1].value;
      if (!total) return '0';
      const percent = ((data[0].name === '正常记录数' ? data[0].value / total : data[1].value / total) * 100).toFixed(1) + '%';
      return percent;
    }
    return '0';
  };

  const initOptions = (data) => {
    let options = {
      tooltip: {
        trigger: 'item',
      },
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        silent: true,
        style: {
          fill: '#000',
          text: getPercent(pieData),
          fontSize: '16px',
          fontWeight: 'bold',
        },
      },
      legend: {
        top: 'top',
      },
      grid: {
        left: '0',
        right: '0',
        bottom: '0',
        top: '0',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: false,
              fontSize: 20,
              fontWeight: 'bold',
              formatter: '{d}%',
            },
          },
          labelLine: {
            show: false,
          },
          data: data,
        },
      ],
    };
    setOptions(options)
  };
  return <ReactEcharts option={options} style={{ height: 180 }} className="react_for_echarts" />;
}
export default DataPieChart;
