import React from "react";
import propsTypes from "prop-types";
import classNames from "classnames";

function IconFont({ icon, size, customClassName, color }) {
  return (
    <i
      className={classNames("iconfont", `icon-${icon}`, customClassName)}
      aria-hidden="true"
      style={size ? { fontSize: size, color } : {}}
    ></i>
  );
}

IconFont.propsTypes = {
  icon: propsTypes.string.isRequired,
  size: propsTypes.number,
  size: propsTypes.string,
  customClassName: propsTypes.string,
};

IconFont.defaultProps = {
  size: 16,
	color:''
};

export default IconFont;
