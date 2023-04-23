import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Spin, Card, Modal, Menu, Dropdown, Space } from 'antd';
import { qualityManageApi } from '@api/dataAccessApi';
import { showInfo } from '@tool/';
import ListCommitHistorySelect from './ListCommitHistorySelect';
import MonacoEditor from '@components/monacoEditor';
import { showConfirm } from '@components/confirm';

const {
  saveRule,
  compileCheck,
  getDetailById,
  readCodeClasspath,
  checkout,
  overCode,
  commitCode,
  getBranchname,
} = qualityManageApi.qualityRule;

export default function EditJavaCode(props) {
  const { record, beanId } = props;
  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [code, setCode] = useState('');

  const editorRef = useRef();
  const commitInfo = useRef();
  const branchname = useRef()

  useEffect(() => {
    getBranchName();
  }, [])

  useEffect(() => {
    record.ruleCode && setCode(record.ruleCode);
  }, [record]);

  const handleCancel = () => {
    setVisible(false);
  };

  const getClassPath = code => {
    //先获得包名
    let startStr = 'package ';
    let endpos = code.indexOf(';');
    let spos = code.indexOf(startStr);
    let packageName = code.substring(spos + startStr.length, endpos).trim();

    startStr = 'public class ';
    endpos = code.indexOf('implements');
    spos = code.indexOf(startStr);
    let className = code.substring(spos + startStr.length, endpos).trim();
    let classPath = packageName + '.' + className;
    return classPath;
  };

  const saveCode = () => {
    let code = editorRef.current?.getData();
    let classPath = getClassPath(code);
    saveEditCode(classPath, code, record, true);
  };

  const saveEditCode = (classPath, code, record, showMsg) => {
    record.classPath = classPath;
    record.ruleCode = code;
    saveRule({ ...record }).then(res => {
      const { state } = res.data;
      if (state) {
        showInfo('保存成功!');
      }
    });
  };

  const saveCompile = () => {
    let code = editorRef.current?.getData();
    let classPath = getClassPath(code);
    compileCheck({ classPath, code }).then(res => {
      const { state } = res.data;
      if (state) {
        showInfo('编译成功!');
        saveEditCode(classPath, code, record, false);
      }
    });
  };

  const showCommitHistory = () => {
    setVisible(true);
    setAction('showCommitHistory');
    setModalTitle('提交历史记录');
  };

  const readFileCode = () => {
    let code = editorRef.current?.getData();
    let classPath = getClassPath(code);
    readCodeClasspath({ classPath }).then(res => {
      const { state, code } = res.data;
      if (state !== false) {
        setCode(code);
        showInfo('读取成功!');
      }
    });
  };

  //从仓库读取代码
  const readFromRepository = remote => {
    let msg = '同步本地代码仓库中的最新版本吗?';
    if (remote) {
      msg = '从远程代码仓库中读取将会把本地文件更新到最新版本?';
    }
    showConfirm('更新代码确认', msg, () => {
      checkout({ configId: beanId || record.classPath, codeType: 'java', remote }).then(res => {
        const { state, version, code } = res.data;
        if (state !== false && version) {
          setCode(code);
          showInfo(`代码已更新到版本 ${version}`);
        }
      });
    });
  };

  const overFileCode = () => {
    let code = editorRef.current?.getData();
    let classPath = getClassPath(code);
    overCode({ code: code, classPath: classPath }).then(res => {
      const { state, msg } = res.data;
      if (state !== false && msg) {
        showInfo(msg);
      }
    });
  };

  //与代码仓库中进行代码同步
  const readCode = e => {
    let key = e.key;
    if (key === 'ReadFromLocalProject') {
      readFileCode();
    } else if (key === 'ReadFromRepository') {
      readFromRepository(true); //读取代码仓库中的最新版本
    } else if (key === 'ReadFromLocalRepository') {
      readFromRepository(false); //读取代码仓库中的最新版本
    } else if (key === 'CommitToLocalProject') {
      showConfirm('', '确定覆盖本地工程中的源文件吗?', overFileCode);
    } else if (key === 'CommitToRepository') {
      setModalTitle('提交代码到远程仓库');
      setAction('CommitToRepository');
      setVisible(true);
    } else if (key === 'CommitToLocalRepository') {
      setVisible(true);
      setAction('CommitToLocalRepository');
    }
  };

  //选择提交代码的历史记录后的ok后从提交记录中获取代码
  const closeCommitHistoryCodeModal = id => {
    setVisible(false);
    if (!id) return;
    getDetailById({ id }).then(res => {
      const { state, commitCode } = res.data;
      if (state !== false) {
        setCode(commitCode);
      }
    });
  };

  const commitInputChange = e => {
    commitInfo.current = e.target.value;
  };

  //提交代码到仓库
  const commitToRepository = e => {
    setVisible(false);
    let code = editorRef.current?.getData();
    let remote = action === 'CommitToRepository' ? true : false;
    commitCode({
      configId: beanId || record.classPath,
      remote,
      codeType: 'java',
      code,
      msg: commitInfo.current,
    }).then(res => {
      const { state, msg } = res.data;
      if (state !== false && msg) {
        showInfo(msg);
      }
    });
  };

  //获取git当前的分支名称
  const getBranchName = () => {
    getBranchname().then(res => {
      const { msg } = res.data;
      branchname.current = msg;
    });
  };

  const checkoutMenu = (
    <Menu onClick={readCode}>
      <Menu.Item key="ReadFromLocalProject">从本地工程文件中读取源码</Menu.Item>
      <Menu.Item key="ReadFromRepository">同步远程代码仓库中的最新版本</Menu.Item>
      <Menu.Item key="ReadFromLocalRepository">同步本地代码仓库中的最新版本</Menu.Item>
      <Menu.Item key="CommitToRepository">覆盖并Commit代码到远程仓库中</Menu.Item>
      <Menu.Item key="CommitToLocalRepository">覆盖并Commit代码到本地仓库中</Menu.Item>
      <Menu.Item key="CommitToLocalProject">覆盖本地工程文件中的源码</Menu.Item>
    </Menu>
  );

  return (
    <div className="content-table">
      <Modal
        key={Math.random()}
        title={modalTitle}
        visible={visible}
        width="850px"
        footer=""
        style={{ top: '20px' }}
        onOk={handleCancel}
        onCancel={handleCancel}
      >
        {action === 'showCommitHistory' ? (
          <ListCommitHistorySelect configId={record.id} closeDialog={closeCommitHistoryCodeModal} />
        ) : ['CommitToRepository', 'CommitToLocalRepository'].includes(action) ? (
          <span>
            <b>当前分支:{branchname.current}</b> 提交说明:
            <Input.TextArea autosize={{ minRows: 4, maxRows: 16 }} onChange={commitInputChange} />
            <br />
            <br />
            <center>
              <Button type="primary" onClick={commitToRepository}>
                确定提交
              </Button>
            </center>
          </span>
        ) : null}
      </Modal>
      <div style={{ margin: '0 0 5px 0', padding: '5px', border: 'solid 1px #ccc', borderRadius: '5px' }}>
        <Space>
          <Button type="primary" onClick={saveCode}>
            保存(Ctr+S)
          </Button>
          <Button onClick={saveCompile}>编译</Button>
          {/* <Dropdown overlay={checkoutMenu}>
            <Button>同步源代码</Button>
          </Dropdown> */}
          <Button onClick={showCommitHistory}>历史版本</Button>
        </Space>
      </div>
      <div style={{ border: '1px #cccccc solid', borderRadius: 10, margin: '0px', borderRadius: '2px' }}>
        <MonacoEditor
          ref={editorRef}
          code={code}
          style={{ minHeight: '600px', width: '100%', border: 'none' }}
          saveCode={saveCode}
        />
      </div>
    </div>
  );
}
