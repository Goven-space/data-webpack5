import React, { useRef, useEffect, useCallback } from 'react'

import './index.less';


const drag = ({ leftDom: ref1, rightDom: ref2, contentDom }, draggleLineDom) => {
    const _ref1 = ref1;
    const _ref2 = ref2;
    const parentWidth = contentDom.offsetWidth
    _ref1.style.width = `${parentWidth * 0.15}px`;
    _ref2.style.width = `${parentWidth * 0.85}px`;
    draggleLineDom.onmousedown = (e) => {
        let _e = e;
        const dir = 'horizontal'; // 设置好方向 可通过变量控制默认水平方向 horizontal | vertical
        const firstX = _e.clientX; // 获取第一次点击的横坐标
        const width = ref1.offsetWidth; // 获取到元素的宽度
        // 移动过程中对左右元素宽度计算赋值
        document.onmousemove = (_event) => {
            _e = _event;
            // 可扩展上下拖动等
            switch (dir) {
                case 'horizontal':
                    let leftWidth = width + (_e.clientX - firstX) 
                    leftWidth > parentWidth * 0.5 && (leftWidth = parentWidth * 0.5) //最大宽度
                    leftWidth < parentWidth * 0.05 && (leftWidth = parentWidth * 0.05)//最小宽度
                    _ref1.style.width = `${leftWidth}px`;
                    _ref2.style.width = `${parentWidth - leftWidth}px`;
                    break;
                default:
                    break;
            }
        };
        // 在左侧和右侧元素父容器上绑定松开鼠标解绑拖拽事件
        contentDom.onmouseup = () => {
            document.onmousemove = null;
        };
        return false;
    };
};
export default function DraggleLayout({ contentDom, leftDom, rightDom }) {
    const draggleLineRef = useRef();
    const init = useCallback(drag.bind(null, { leftDom, rightDom, contentDom }),
        [leftDom, rightDom, contentDom, draggleLineRef.current]);

    useEffect(() => {
        // 初始化绑定拖拽事件
        init(draggleLineRef.current);
    }, []);

    return (<div className='draggleLine-wrapper' ><div className='draggleLine' ref={draggleLineRef}>{'>'}</div></div>)
}