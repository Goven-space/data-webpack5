
import React, { useState } from "react";
import propTypes from 'prop-types'
import { InboxOutlined } from "@ant-design/icons";
import { Upload, Button } from "antd";
import { importPost } from "@api";
const { Dragger } = Upload;

const App = ({ url, uploadCallBack, uploadProps,postData , unUpload }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const props = {
    name: "file",
    multiple: true,
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    /* onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
      }
      if (status === "done") {
        message.success(`${info.file.name} 上传成功.`);
      } else if (status === "error") {
        message.error(`${info.file.name} 上传失败.`);
      }
    }, */
    onDrop(e) {
			setFileList([...fileList, e.dataTransfer.files[0]]);
    },
    ...uploadProps,
  };

  const handleUpload = () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("file", file);
    });
		for(const key in postData){
			formData.append(key, postData[key]);
    }
    setUploading(true);
    importPost(url, formData, { responseType: "blob" })
      .then((res) => {
				if (uploadCallBack) {
          uploadCallBack();
        }
      })
      .finally(() => {
        setFileList([]);
        setUploading(false);
      });
  };
  return (
    <div>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或者拖拽文件到这里上传</p>
        <p className="ant-upload-hint">仅支持单个文件上传</p>
      </Dragger>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0 || !!unUpload}
        loading={uploading}
        style={{
          marginTop: 16,
        }}
      >
        {uploading ? "上传中" : "开始上传"}
      </Button>
    </div>
  );
};
App.propTypes = {
  uploadProps: propTypes.object,
  postData: propTypes.object,
};
App.defaultProps = {
  uploadProps: {},
  postData: {},
};

export default App;
