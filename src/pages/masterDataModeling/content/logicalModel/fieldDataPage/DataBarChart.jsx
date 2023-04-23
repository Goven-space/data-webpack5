import React, { useEffect, useRef, useState } from 'react';
import { Button, Space, Typography } from 'antd';
import * as echarts from 'echarts/core';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { standardManage } from '@api/dataAccessApi';

const { Title } = Typography;

echarts.use([TooltipComponent, GridComponent, BarChart, CanvasRenderer]);

const { getListByRecent } = standardManage.informationManageApi;

const DataLineChart = ({ dataModelId, classifyName }) => {
  const [limit, setLimit] = useState(7);

  const chart = useRef();
  const chartRef = useRef();

  const options = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        interval: 0,
        // formatter: function (params) {
        //   return params.substring(0, 10) + '\n' + params.substring(10);
        // },
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [],
        name: classifyName,
        type: 'bar',
        barWidth: 80,
        itemStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              {
                // 四个数字分别对应 数组中颜色的开始位置，分别为 右，下，左，上。例如（1,0,0,0 ）代表从右边开始渐
                // 变。offset取值为0~1，0代表开始时的颜色，1代表结束时的颜色，柱子表现为这两种颜色的渐变。
                offset: 0,
                color: '#49bced',
              },
              {
                offset: 1,
                color: '#05abfb',
              },
            ]),
          },
        },
      },
    ],
  };

  useEffect(() => {
    chart.current = echarts.init(chartRef.current);

    // 组件卸载
    // return () => {
    //     chart.dispose()
    // }
  }, []);

  useEffect(() => {
    loadChartData();
  }, [limit, dataModelId]);

  const loadChartData = () => {
    getListByRecent({ dataModelId, flag: true, limit }).then(res => {
      const { data, state } = res.data;
      if (state) {
        let times = [];
        let counts = [];
        data.forEach(item => {
          times.push(item.gatherTime);
          counts.push(item.dataCount);
        });
        options.xAxis.axisLabel.rotate = counts.length > 12 ? 45 : 0;
        options.xAxis.data = times;
        options.series[0].data = counts;
        options.series[0].barWidth = counts.length > 8 ? '60%' : 80;
        // 设置图表实例的配置项和数据
        chart.current.setOption(options);
      }
    });
  };

  const decline = () => {
    const count = limit > 1 ? limit - 1 : 1;
    setLimit(count);
  };

  const increase = () => {
    setLimit(limit + 1);
  };

  return (
    <>
      <Space>
        查询最近
        <Title level={2}>{limit}</Title>
        天数据
        <Button.Group>
          <Button onClick={decline} icon={<MinusOutlined />} />
          <Button onClick={increase} icon={<PlusOutlined />} />
        </Button.Group>
      </Space>
      <div style={{ width: '100%', height: '600px' }} ref={chartRef}></div>
    </>
  );
};
export default DataLineChart;
