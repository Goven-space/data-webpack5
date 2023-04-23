import React, { Component } from 'react';
import E from 'wangeditor';

export default class MyEditor extends Component {

	constructor(props) {
		super(props) 
		this.state = {
			editorHtml: '',
			editorText: '',
			name:props.name,
			editorValue:props.editorValue,
			value: ''
		}
		this.myDiv = React.createRef()
	}

	componentDidMount() {
		this.initEditor()
	}

	initEditor = () => {
		const { onChange, value } = this.props;
		this.myEditor = new E(this.myDiv.current)
		 this.myEditor.config.onchange = (newHtml) => {
		 onChange(newHtml)
		}
		this.myEditor.create();
		this.myEditor.txt.html(value)	
	}

	setData=(value)=>{
		this.myEditor.txt.html(value)
	}

	render() {
		const {width} = this.props;
		return (
			<div ref={this.myDiv} id='requestBodySampleStr' style={{width:width || 600}}></div>
		)
	}
}
