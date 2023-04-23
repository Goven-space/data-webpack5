import { Button, Checkbox, Radio, Select, Space } from "antd";
import { useState } from "react";
import "./index.less";

const TableDropdown = (props) => {
    const { update, opts, filterType, resetFun, data } = props;
    const [checkedData, setCheckedData] = useState(props.initValue);
    const handleClick = () => {
        opts.confirm();
        update(checkedData);
    };
    const filters = (value, options) => {
        return options.label.match(value);
    };
    const reset = () => {
        setCheckedData([])
        resetFun()
    }

    const setCheckedDataChange = (value) => {
        setCheckedData(value)
    }
    return (
        <div className="tableDropdown-wrapper">
            {filterType === "radioGroup" ? (
                <Radio.Group
                    value={checkedData.length > 0 && checkedData[0]}
                    className="tableDropdown-radio"
                    options={data}
                    onChange={(values) => setCheckedData([values.target.value])}
                />
            ) : filterType === "select" ? (
                <Select
                    value={checkedData}
                    options={data}
                    onChange={(values) => setCheckedData([values])}
                    filterOption={filters}
                    showSearch
                    className='tableDropdown-select'
                />
            ) : filterType === "checkboxGroup" ? (
                <Checkbox.Group
                    value={checkedData}
                    options={data}
                    onChange={setCheckedDataChange}
                    className='tableDropdown-select'
                />
            ) : null}

            <Space>
                <Button size="small" onClick={reset}>
                    重置
                </Button>
                <Button size="small" type="primary" onClick={handleClick}>
                    确定
                </Button>
            </Space>
        </div>
    );
};

export default TableDropdown;
