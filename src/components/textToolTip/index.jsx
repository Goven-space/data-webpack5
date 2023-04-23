import React from "react";
import { Tooltip } from "antd";
import propsTypes from "prop-types";

function TextTooltip({ placement, text, children, options }) {
  const boxRef = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  
  // 判断是否开启tooltip功能
  let showTooltip = () => {
    if (!boxRef.current) return;
    const box = boxRef.current;
    setVisible((v) => {
      // 如果为开启状态，则不进行判断
      if (v) return v;
      // 父级宽度
      const parent = box.parentNode ? box.parentNode.offsetWidth : 0;
      // 盒子宽度
      const content = box.offsetWidth || 0;
      // 盒子的可滚动宽度
      const scrollWidth = box.scrollWidth || 0;
      // 如果盒子的宽度大于父级或者盒子的可滚动宽度大于盒子的宽度，就开启tooltip功能
      return content > parent || scrollWidth > content;
    });
  };

  return (
    <Tooltip visible={visible} placement={placement} title={text} {...options}>
      <div
        ref={boxRef}
        className="text-tooltip-box"
        onMouseOver={showTooltip}
        onMouseLeave={() => {
          setVisible(false);
        }}
      >
        {children || <span>{text}</span>}
      </div>
    </Tooltip>
  );
}

TextTooltip.propsTypes = {
  text: propsTypes.string.isRequired,
  placement: propsTypes.string,
  customClassName: propsTypes.string,
};

TextTooltip.defaultProps = {
  placement: "right",
};

export default TextTooltip;
