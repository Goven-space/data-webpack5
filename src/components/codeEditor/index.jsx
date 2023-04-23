/* 
 * CodeEditor 代码编辑器组件说明
 * ref: 暴露给父组件的方法,目前只设置了获取数据的方法,有其他需要可在useImperativeHandle里增加其他方法
 * code: 初始代码(可选)
 * saveCode: 按CTRL + S时触发的方法, 返回当前编辑的code内容
 */
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import './index.less';

const CodeEditor = (props, ref) => {
    const [code, setCode] = useState(props.value || props.code)
    
    useImperativeHandle(ref, () => ({
        getData: () => code,
    }));

    useEffect(() => {
        return () => { }
    }, [props.code])

    const getCodeData = (editor, data, value) => {
        if (props.onChange) {
            props.onChange(value)
        }
        setCode(value)
    }

    return (
        <div style={{ ...props.style }}>
            <CodeMirror
                className="codeEditor-wrapper"
                autoCursor={true}
                autofocus={true}
                value={props.value ? props.value : props.code}
                options={props.option ? {
                    ...props.option,
                    mode: 'text/x-java',
                    theme: 'material',
                    lineNumbers: true,
                    extraKeys: props.saveCode && {
                        "Ctrl-S": () => props.saveCode(code)
                    }
                } : {
                    mode: 'text/x-java',
                    theme: 'material',
                    lineNumbers: true,
                    extraKeys: props.saveCode && {
                        "Ctrl-S": () => props.saveCode(code)
                    }
                }}
                indentUnit={2}
                onChange={getCodeData}
            />
        </div>

    )
}

export default forwardRef(CodeEditor)