import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import { numUnitConversion } from '@tool/';
import { statisticalAnalysis, standardManage } from '@api/dataAccessApi';
import { Space, Select, DatePicker, Card } from 'antd';
import moment from 'moment';
import { isArray } from 'lodash';
import ReactEcharts from 'echarts-for-react';

const { RangePicker } = DatePicker;

const { getDataTrend } = statisticalAnalysis;
const { getRootClassify } = standardManage.systemModelingApi;

const monthFormat = 'YYYY-MM-DD';

function DataVolumeLineChart(props) {
  const [dateRange, setDateRange] = useState([moment(moment().subtract(7, 'days'), monthFormat), moment(moment().subtract(1, 'days'), monthFormat)]);
  const [typeOptions, setTypeOptions] = useState([{ value: 'all', label: '全部' }]);
  const [selectKey, setSelectKey] = useState('all');
  const [options, setOptions] = useState({});

  useEffect(() => {
    loadClassifyOpitons();
    const params = {
      type: selectKey,
      startDate: dateRange[0].format(monthFormat),
      endDate: dateRange[1].format(monthFormat),
    };
    getDataTrend(params).then(res => {
      const { state, data } = res.data;
      if (state && Object.keys(data).length) {
        initOptions(data.dateList, data.countList);
      } else {
        initOptions([], []);
      }
    });
  }, [dateRange, selectKey]);

  const loadClassifyOpitons = () => {
    getRootClassify().then(res => {
      const { state, data } = res.data;
      if (state && isArray(data)) {
        let list = data.map(item => ({
          label: item.modelName,
          value: item.id,
        }));

        setTypeOptions([
          {
            label: '全部',
            value: 'all',
          },
          ...list,
        ]);
      }
    });
  };

  const onDataChange = (dates, dateStrings) => {
    setDateRange(dates);
  };

  const onClassifySelect = value => {
    setSelectKey(value);
  };

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
      legend: {
        data: ['表数据量'],
      },
      grid: {
        left: '3%',
        right: '6%',
        bottom: '1%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          margin: 15,
        },
        axisTick: {
          show: false,
        },
        data: xData,
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: {
          show: false,
        },
        axisLabel: {
          formatter: function (value) {
            return numUnitConversion(value, 1, true);
          },
        },
      },
      series: [
        {
          name: '表数据量',
          type: 'line',
          stack: 'Total',
          smooth: true,
          showSymbol: false,
          itemStyle: {
            color: '#339CFF',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(51, 156, 255, 1)',
              },
              {
                offset: 1,
                color: 'rgba(51, 156, 255, 0)',
              },
            ]),
          },
          data: yData,
        },
      ],
    };
    setOptions(options);
  };

  const titleContent = (
    <div>
      <span className="title-text">系统数据量趋势</span>
      <Space style={{ marginLeft: 250 }}>
        主数据系统:
        <Select options={typeOptions} value={selectKey} style={{ width: 100, marginRight: 40 }} onSelect={onClassifySelect} />
        日期范围:
        <RangePicker
          onChange={onDataChange}
          allowClear={false}
          value={dateRange}
          format={monthFormat}
          disabledDate={current => {
            // 限制最大日期为今天
            return current && current >= moment();
          }}
        />
      </Space>
    </div>
  );

  return (
    <Card className="chart-wrapper" title={titleContent} size="small" style={{ marginBottom: 10 }}>
      <ReactEcharts option={options} style={{ height: 180 }} className="react_for_echarts" />
    </Card>
  );
}

export default DataVolumeLineChart;
