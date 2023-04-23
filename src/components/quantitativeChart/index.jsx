import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { DatasetComponent, PolarComponent, TooltipComponent } from 'echarts/components';
import { CustomChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import _panelImageURL from '@img/custom-gauge-panel.png';

echarts.use([DatasetComponent, PolarComponent, TooltipComponent, CustomChart, CanvasRenderer]);

function QuantitativeChart(props) {
  const { style, max = 200, min = 0, value = 50, textUnit, numSize = 35, type } = props;
  const chart = useRef();
  const chartRef = useRef();

  const _animationDuration = 1000;
  const _animationDurationUpdate = 1000;
  const _animationEasingUpdate = 'quarticInOut';
  const _outerRadius = style.height ? style.height * 0.44 : 115;
  const _innerRadius = style.height ? style.height * 0.34 : 90;
  const _pointerInnerRadius = 50;
  const _insidePanelRadius = style.height ? (style.height * 0.3) : 80;
  const _currentDataIndex = 0;

  useEffect(() => {
    chart.current = echarts.init(chartRef.current);
    chart.current.setOption(options);
  }, []);

  useEffect(() => {
    chart.current.setOption(options);
  }, [min, max])

  function renderItem(params, api) {
  var valOnRadian = api.value(1);
  var coords = api.coord([api.value(0), valOnRadian]);
  var polarEndRadian = coords[3];
  var imageStyle = {
    image: _panelImageURL,
    x: params.coordSys.cx - _outerRadius,
    y: params.coordSys.cy - _outerRadius,
    width: _outerRadius * 2,
    height: _outerRadius * 2,
  };
  return {
    type: 'group',
    children: [
      {
        type: 'image',
        style: imageStyle,
        clipPath: {
          type: 'sector',
          shape: {
            cx: params.coordSys.cx,
            cy: params.coordSys.cy,
            r: _outerRadius,
            r0: _innerRadius,
            startAngle: 0,
            endAngle: -polarEndRadian,
            transition: 'endAngle',
            enterFrom: { endAngle: 0 },
          },
        },
      },
      {
        type: 'image',
        style: imageStyle,
        clipPath: {
          type: 'polygon',
          shape: {
            points: makePionterPoints(params, polarEndRadian),
          },
          extra: {
            polarEndRadian: polarEndRadian,
            transition: 'polarEndRadian',
            enterFrom: { polarEndRadian: 0 },
          },
          during: function (apiDuring) {
            apiDuring.setShape('points', makePionterPoints(params, apiDuring.getExtra('polarEndRadian')));
          },
        },
      },
      {
        type: 'circle',
        shape: {
          cx: params.coordSys.cx,
          cy: params.coordSys.cy,
          r: _insidePanelRadius,
        },
        style: {
          fill: '#fff',
          shadowBlur: 25,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowColor: 'rgba(76,107,167,0.4)',
        },
      },
      {
        type: 'text',
        extra: {
          valOnRadian: valOnRadian,
          transition: 'valOnRadian',
          enterFrom: { valOnRadian: 0 },
        },
        style: {
          text: makeText(valOnRadian),
          fontSize: numSize,
          fontWeight: 800,
          x: params.coordSys.cx,
          y: params.coordSys.cy,
          fill: 'rgb(0,50,190)',
          align: 'center',
          verticalAlign: 'middle',
          enterFrom: { opacity: 0 },
        },
        during: function (apiDuring) {
          apiDuring.setStyle('text', makeText(apiDuring.getExtra('valOnRadian')));
        },
      },
    ],
  };
}
function convertToPolarPoint(renderItemParams, radius, radian) {
  return [
    Math.cos(radian) * radius + renderItemParams.coordSys.cx,
    -Math.sin(radian) * radius + renderItemParams.coordSys.cy,
  ];
}
function makePionterPoints(renderItemParams, polarEndRadian) {
  return [
    convertToPolarPoint(renderItemParams, _outerRadius, polarEndRadian),
    convertToPolarPoint(renderItemParams, _outerRadius, polarEndRadian + Math.PI * 0.03),
    convertToPolarPoint(renderItemParams, _pointerInnerRadius, polarEndRadian),
  ];
  }
  
  function makeText(valOnRadian) {
  const value = type === 'percent' ? ((valOnRadian / max) * 100).toFixed(0) + '%' : valOnRadian.toFixed(0);
  return value;
  }
  
const options = {
  animationEasing: _animationEasingUpdate,
  animationDuration: _animationDuration,
  animationDurationUpdate: _animationDurationUpdate,
  animationEasingUpdate: _animationEasingUpdate,
  dataset: {
    source: [[min, value]],
  },
  tooltip: {},
  angleAxis: {
    type: 'value',
    startAngle: 0,
    show: false,
    min: min,
    max: max,
  },
  radiusAxis: {
    type: 'value',
    show: false,
  },
  polar: {},
  series: [
    {
      type: 'custom',
      coordinateSystem: 'polar',
      renderItem: renderItem,
    },
  ],
};

  return <div style={style}  ref={chartRef}></div>;
}
export default QuantitativeChart;