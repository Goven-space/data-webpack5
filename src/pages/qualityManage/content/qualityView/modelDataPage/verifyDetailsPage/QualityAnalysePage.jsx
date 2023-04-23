import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import { numUnitConversion } from '@tool/';
import { Space, DatePicker, Select, Typography, Button } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { qualityManageApi } from '@api/dataAccessApi';
import moment from 'moment';
import { isObject } from 'lodash';
import ReactEcharts from 'echarts-for-react';

const { getModelFpyAnalyse } = qualityManageApi.qualityView;

const { Title } = Typography;

const typeOptions = [
  {
    value: 'week',
    label: '周',
  },
  {
    value: 'month',
    label: '月',
  },
  {
    value: 'year',
    label: '年',
  },
];

const pickerType = {
  week: {
    format: 'YYYY-MM-DD',
    type: 'date',
  },
  month: {
    format: 'YYYY-MM',
    type: 'month',
  },
  year: {
    format: 'YYYY',
    type: 'year',
  },
};

function QualityAnalysePage(props) {
  const { dataModelId, showView } = props;

  const [dateValue, setDateValue] = useState(moment());
  const [type, setType] = useState('week');
  const [limit, setLimit] = useState(7);
  const [options, setOptions] = useState({})


  useEffect(() => {
    loadModelFpyAnalyse();
  }, [dataModelId, type, dateValue, limit]);

  const loadModelFpyAnalyse = () => {
    const params = {
      dataModelId,
      type,
      value: type !== 'week' ? dateValue.format(pickerType[type].format) : limit,
    };
    getModelFpyAnalyse(params).then(res => {
      const { state, data } = res.data;
      if (state && isObject(data)) {
        const { dataFpyList = [], dateTimeList = [] } = data;
        if (dataFpyList.length) {
         initOptions(dateTimeList, dataFpyList);
        } else {
         initOptions([], [])
        }
      }
    });
  };

   const initOptions = (xData, yData) => {
      const options = {
        title: [
          {
            left: 'center',
            text: '数据模型合格率查看',
          },
        ],
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
        },
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
          data: xData,
          axisLabel: {
            interval: 0,
            margin: 15,
            rotate: xData.length > 12 ? 45 : 0,
            formatter: function (params) {
              return params.substring(0, 10) + '\n' + params.substring(10);
            },
          },
        },
        yAxis: {
          type: 'value',
          max: 100,
          axisLine: {
            show: true,
          },
          axisLabel: {
            formatter: function (value) {
              return numUnitConversion(value, 0);
            },
          },
        },
        series: [
          {
            name: '质量得分',
            type: 'line',
            stack: 'Total',
            data: yData,
          },
        ],
      };
     setOptions(options)
   };


  const onDateChange = (dates, dateStrings) => {
    setDateValue(dates);
  };

  const onTypeChange = value => {
    setType(value);
  };

  const decline = () => {
    const count = limit > 1 ? limit - 1 : 1;
    setLimit(count);
  };

  const increase = () => {
    setLimit(limit + 1);
  };

  return (
    <div>
      <Space style={{ paddingLeft: 15 }}>
        类型:
        <Select options={typeOptions} value={type} onChange={onTypeChange} />
        {type !== 'week' ? (
          <Space>
            日期:
            <DatePicker
              onChange={onDateChange}
              allowClear={false}
              value={dateValue}
              format={pickerType[type].format}
              picker={pickerType[type].type}
              disabledDate={current => {
                // 限制最大日期为今天
                return current && current >= moment();
              }}
            />
          </Space>
        ) : (
          <Space>
            查询最近
            <Title level={3}>{limit}</Title>
            天数据
            <Button.Group>
              <Button onClick={decline} icon={<MinusOutlined />} />
              <Button onClick={increase} icon={<PlusOutlined />} />
            </Button.Group>
          </Space>
        )}
      </Space>
      <ReactEcharts option={options} style={{ height: showView ? 250 : 500, width: '100%' }} className="react_for_echarts" />
    </div>
  );
}

export default QualityAnalysePage;
