import React, { useState, useEffect, useRef } from 'react';
import './index.less'

function ProgressChart(props) {
  const { size = 200, fontSize = 20, value = 0, valueText = '', title = '' } = props;

  const [quantitative, setQuantitative] = useState(0);
  const [text, setText] = useState('0');
  
  const scoreTimer = useRef()

  useEffect(() => {
    const data = calculatePercent(value);
    if (value) {
      let res = 0;
      let num = 0;
      scoreTimer.current = setInterval(() => {
        res = res < data ? res + 5 : data;
        num = num < value ? num + 2 : value;
        setQuantitative(res);
        setText(num + valueText);
        if (res === data && num === value) {
          clearInterval(scoreTimer.current);
        }
      }, 10);
    } else {
      setQuantitative(0);
      setText(`0${valueText}`);
    }
    return () => {
      clearInterval(scoreTimer.current);
    };
  }, [value]);

  const calculatePercent = value => {
    if (value === 100) {
      return 300;
    } else if (value === 0) {
      return 0;
    }

      const percent = value / 100;
    return percent * 280 ;
  };

  return (
    <div className="progress-Chart-wrapper" style={{ fontSize, width: size, height: size }}>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110">
        <path
          d="M 55,55 m 0,-47
                           a 47,47 0 1 1 0,94
                           a 47,47 0 1 1 0,-94"
          strokeLinecap="round"
          strokeWidth="8"
          fillOpacity="0"
          style={{
            stroke: 'rgb(242, 242, 242)',
            strokeDasharray: '300px, 300px',
            strokeDashoffset: 0,
          }}
        ></path>
        <path
          className="ant-progress-circle-path"
          d="M 55,55 m 0,-47
                           a 47,47 0 1 1 0,94
                           a 47,47 0 1 1 0,-94"
          stroke=""
          strokeLinecap="round"
          strokeWidth="12"
          opacity="1"
          fillOpacity="0"
          style={{
            stroke: quantitative ? 'rgb(61, 120, 243)' : 'transparent',
            strokeDasharray: `${quantitative}px, 300px`,
            strokeDashoffset: 0,
          }}
        ></path>
      </svg>
      <div className="chart-text">
        <p className="text-score">{text}</p>
        {!!title && <p className="text-title">{title}</p>}
      </div>
    </div>
  );
}
export default ProgressChart;
