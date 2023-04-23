import React, { useState, useEffect } from 'react';
import {Input} from 'antd';

function EditText({value, options = {}, placeholder, size, onChange}) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    value && setInputValue(value)
  }, [value])

//   shouldComponentUpdate(nextProps, nextState) {
//     if(nextProps.value !== this.state.value) {
//       this.setState({
//         value: nextProps.value
//       })
//     }
//     return nextProps.value !== this.state.value;
//   }

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onChange(value);
  }
    
    return (<Input size={size || 'default'} placeholder={placeholder || ''} value={inputValue} {...options} onChange={handleChange} />);
}

export default EditText;
