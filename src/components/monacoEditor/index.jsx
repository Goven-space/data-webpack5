import React, { useState, useRef, forwardRef, useEffect, useImperativeHandle } from 'react';
import MonacoEditor from 'react-monaco-editor';

function MyEdit(props, ref) {
  const { code, mode, style, saveCode } = props;
  const [text, setText] = useState('');

  const editorRef = useRef();

  useImperativeHandle(ref, () => ({
    getData: () => text,
  }));

  useEffect(() => {
    if (editorRef.current && editorRef.current.onkeydown === null) {
      editorRef.current.onkeydown = function (event) {
        if (event.ctrlKey && event.key === 's' && saveCode) {
          event.preventDefault();
          saveCode();
        }
      };
    }
  }, []);

  useEffect(() => {
    code && setText(code);
  }, [code]);

  const onChangeHandle = value => {
    setText(value);
  };
  return (
    <div ref={editorRef} style={{ ...style }}>
      <MonacoEditor
        width="100%"
        height="600px"
        language={mode || 'java'}
        value={text}
        onChange={onChangeHandle}
        options={{
          selectOnLineNumbers: true,
          matchBrackets: 'near',
          renderSideBySide: false,
          highlightActiveIndentGuide: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}

export default forwardRef(MyEdit);
