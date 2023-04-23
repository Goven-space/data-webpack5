import React from 'react'
import {Modal} from 'antd'
import { ExclamationCircleOutlined } from "@ant-design/icons";
const { confirm } = Modal;

 export const showConfirm = (title, content, onOk, onCancel) => {
   confirm({
     title: title || '提示',
     icon: <ExclamationCircleOutlined />,
     content,

     onOk() {
       if (onOk) {
         onOk();
       }
     },

     onCancel() {
       if (onCancel) {
         onCancel();
       }
     },
   });
 };