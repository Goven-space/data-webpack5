import React, { useState, useEffect, useRef } from 'react';
import { Button, Image, Card, Space } from 'antd';
import { kernelModule } from "@api/dataAccessApi";
import { renderAsync } from "docx-preview";
import * as PDFJS from "pdfjs-dist/legacy/build/pdf";
import { service } from "@api";
import './index.less';

PDFJS.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/legacy/build/pdf.worker.entry.js");

// 文档配置
const docOptions= {
  className: "docx", // 默认和文档样式类的类名/前缀
  inWrapper: true, // 启用围绕文档内容渲染包装器
  ignoreWidth: false, // 禁止页面渲染宽度
  ignoreHeight: false, // 禁止页面渲染高度
  ignoreFonts: false, // 禁止字体渲染
  breakPages: true, // 在分页符上启用分页
  ignoreLastRenderedPageBreak: true,//禁用lastRenderedPageBreak元素的分页
  experimental: false, //启用实验性功能（制表符停止计算）
  trimXmlDeclaration: true, //如果为真，xml声明将在解析之前从xml文档中删除
  debug: false, // 启用额外的日志记录
}

// 图片格式
const imgType = ["gif", "jpg", "jpeg", "bmp", "tiff", "tif", "png", "svg"]

const { loadFilePreview } = kernelModule.fileServer

/**
 * 渲染文件
 * @param fileId 文件id
 * @param closeModal 关闭弹窗
 */

function FilePreview({ fileId, closeModal }) {
  const [fileType, setFileType] = useState('');
  const [pageNo, setPageNo] = useState(1);
  const [pdfPageNumber, setPdfPageNumber] = useState(0);
  const [imgUrl, getImgUrl] = useState('');
  const [txtContent, setTxtContent] = useState('');

  const previewWrapper = useRef();
  const previewCanvas = useRef();
  const pdfData = useRef();
  const renderingPage = useRef(false);

  useEffect(() => {
    loadFilePreview({ fileId }).then(res => {
      const { state, data } = res.data
      if (state) {
        const { fileUrl, fileSuffix } = data
        const type = fileSuffix.replace('.', '')
        setFileType(type)
        if (type === 'pdf' || imgType.includes(type)) {
          window.open(fileUrl)
          closeModal()
        } else {
          service.get(fileUrl, { responseType: 'blob' }).then(res => {
            const { data } = res
            if (data) {
              if (type === 'docx') {
                renderDoc(data)
              // } else if (type === 'pdf') {
              //   renderPDF(data)
              // } else if (imgType.includes(type)) {
              //   renderImg(data)
              } else if (type === 'txt') {
                renderTxt(data)
              }
            }
          })
        }
      }
    })
  }, [fileId])

  const renderDoc = (buffer) => {
    renderAsync(buffer, previewWrapper.current, null, docOptions)
  }

  // const renderPDF = (buffer) => {
  //   const url = URL.createObjectURL(buffer)
  //   pdfData.current = PDFJS.getDocument(url)
  //   renderPDFPage(pageNo)
    
  // }

  // const renderImg = (buffer) => {
  //   const url = URL.createObjectURL(buffer)
  //   getImgUrl(url)
  // }

  const renderTxt = async (buffer) => {
    const text= await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = loadEvent => resolve(loadEvent.target.result);
      reader.onerror = e => reject(e);
      reader.readAsText(new Blob([buffer]), 'utf-8');
    })
    setTxtContent(text)
  }

  // pdf翻页
  // const renderPDFPage = (num) => {
  //   renderingPage.current = true;
  //   pdfData.current.promise.then((pdf) => {
  //     !pdfPageNumber && setPdfPageNumber(pdf.numPages)
  //     pdf.getPage(num).then((page) => {
  //       // 获取DOM中为预览PDF准备好的canvasDOM对象
  //       let canvas = previewCanvas.current;
  //       let viewport = page.getViewport({ scale: 1.8 });
  //       canvas.height = viewport.height;
  //       canvas.width = viewport.width;

  //       let ctx = canvas.getContext("2d");
  //       let renderContext = {
  //         canvasContext: ctx,
  //         viewport: viewport,
  //       };
  //       page.render(renderContext).promise.then(() => {
  //         renderingPage.current = false;
  //         setPageNo(num);
  //       });
  //     });
  //   });
  // }

  // //上一页
  // const clickPre = () => {
  //   if (!renderingPage.current && pageNo && pageNo > 1) {
  //     renderPDFPage(pageNo - 1);
  //   }
  // }

  // // 下一页
  // const clickNext = () => {
  //   if (
  //     !renderingPage.current &&
  //     pdfPageNumber &&
  //     pageNo &&
  //     pageNo < pdfPageNumber
  //   ) {
  //     renderPDFPage(pageNo + 1);
  //   }
  // }

  return (
    <div ref={previewWrapper} className="file-preview-wrapper">
      {/* {
        fileType === 'pdf' && 
        <div className="canvas-wrapper">
          <canvas ref={previewCanvas}></canvas>
          <Space className="pagination-wrapper">
            <Button onClick={clickPre} >上一页</Button>
            <span>{`第${pageNo} / ${pdfPageNumber}页`}</span>
            <Button onClick={clickNext}>下一页</Button>
          </Space >
        </div>
      }
      {
        imgType.includes(fileType) && 
        <Image src={imgUrl}/>
      } */}
      {
        fileType === 'txt' && 
        <Card>
          {txtContent}
        </Card>
      }
    </div>
  );
}

export default FilePreview;