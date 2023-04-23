import { duplicateRemoval } from '@/tool';
import { DownOutlined, PlusOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, notification, Row, Space, Tag } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import './index.less';

const RetrieveTool = (props, ref) => {
	const [data, setData] = useState([])
	const [multiple, setMultiple] = useState(false);
	const [checked, setChecked] = useState([]);
	const [tagData, setTagData] = useState([])
	const [heightFlag, setHeightFlag] = useState(false)
	const { initQueryParas, queryParas, label, value, getIds } = props.config
	const colorAll = [
		"#ff6600", "#ff3300", "#ff3399", "#cccc00", "#cccc99"
		, "#cccccc", "#cc9933", "#ff0099", "#cc00ff", "#99ffff"
		, "#ff00cc", "#ff00ff", "#ccff00", "#ccffcc", "#ccffff"
		, "#cc9966", "#cc99cc", "#cc0066", "#99ff66", "#99cc66"
		, "#999966", "#996666", "#993366", "#990066", "#66ff66"
		, "#66cc66", "#669966", "#666666", "#663366", "#660066"
		, "#33ff66", "#33cc66", "#339966", "#336666", "#333366"
		, "#330066", "#00ff66", "#00cc66", "#009966", "#006666"
		, "#003366", "#000066", "#cc0000", "#cc0033", "#cc00cc"
		, "#99ff00", "#99ff33", "#99ffcc", "#99cc00", "#99cc33"
		, "#99cccc", "#99ccff", "#999900", "#999933", "#9999cc"
		, "#9999ff", "#996600", "#996633", "#9966cc", "#9966ff"
		, "#993300", "#993333", "#9933cc", "#9933ff", "#000000"
		, "#990000", "#990033", "#9900cc", "#9900ff", "#000033"
		, "#66ff00", "#66ff33", "#66ffcc", "#66ffff", "#0000cc"
		, "#66cc00", "#66cc33", "#66cccc", "#66ccff", "#0000ff"
		, "#669900", "#669933", "#6699cc", "#6699ff", "#003300"
		, "#666600", "#666633", "#6666cc", "#6666ff", "#003333"
		, "#663300", "#663333", "#6633cc", "#6633ff", "#0033cc"
		, "#660000", "#660033", "#6600cc", "#6600ff", "#0033ff"
		, "#33ff00", "#33ff33", "#33ffcc", "#33ffff", "#006600"
		, "#33cc00", "#33cc33", "#33cccc", "#33ccff", "#006633"
		, "#339900", "#339933", "#3399cc", "#3399ff", "#0066cc"
		, "#336600", "#336633", "#3366cc", "#3366ff", "#0066ff"
		, "#333300", "#333333", "#3333cc", "#3333ff", "#009900"
		, "#330000", "#330033", "#3300cc", "#3300ff", "#009933"
		, "#00ff00", "#00ff33", "#00ffcc", "#00ffff", "#0099cc"
		, "#00cc00", "#00cc33", "#00cccc", "#00ccff", "#0099ff"]

	useImperativeHandle(ref, () => ({
		getData: () => tagData,
		handleRetrieveClick: handleClick,
		getRetrieveDataList: getDataList
	}));

	const getDataList = async (api, params) => {
		await api({
			filters: JSON.stringify(params) !== '{}' && params ? JSON.stringify(params) : JSON.stringify(initQueryParas)
		}).then(res => {
			const { state, rows, data, msg } = res.data;
			if (state) {
				rows ? setData(rows.map(item => ({ ...item, label: item[label], value: item[value] }))) : setData(data.map(item => ({ ...item, label: item[label], value: item[value] })))
			} else {
				notification.error({
					message: msg
				})
			}
		})
	}

	useEffect(() => {
		if (!props.api) {
			setTagData([])
			setData([])
			return false
		}
		if (!props.data) {
			setTagData([])
			setData([])
			getDataList(props.api)

		} else {
			getDataByData()
		}
	}, [props.api])

	const getDataByData = () => {
		const params = {}
		let flag = false
		for (const key in queryParas) {
			if (!props.data[key]) {
				flag = true
			}
			params[key] = props.data[key]
		}
		if (flag) {
			setTagData([])
		} else {
			setTagData([[{ ...props.data, label: props.data[label], value: props.data[value], noCancel: true }]])
		}
		getDataList(props.api, flag ? undefined : params)
	}

	const handleClick = (values) => {
		if (values && values.length) {
			const tags = data.filter(o => values.includes(o.value));
			const tData = [...tagData];
			let flag = false/* 因为更改成可针对某层可以进行针对某个的删除，所以需要判断删除后的某层再次选择时，是将其插入原先的层里，而不是插入新的一层，好在操作的永远是最外一层 */
			tData.length && tData[tData.length - 1].forEach(tagItem => {
				if (data.findIndex(dataItem => dataItem.value === tagItem.value) !== -1) {
					flag = true
				}
			})
			if (flag) {
				tData[tData.length - 1] = duplicateRemoval([...tData[tData.length - 1], ...tags], 'id') /*在原先层次插入*/
			} else {
				tData.push(tags);/* 新成新的一层，二维数组 */
			}
			setTagData([...tData]);
			const ids = tData[tData.length - 1].map(item => item[getIds]).join(',')
			if (tData.length && props.getClickIds) {
				props.getClickIds(ids)
			}
			if (tData.length && props.getSelectedArr) {
				props.getSelectedArr(tData[tData.length - 1])
			}

			const parasData = getParams(ids, tData[tData.length - 1] ? tData[tData.length - 1][0] : undefined)//将拿到的数据处理成要调的接口的形式
			getDataList(props.api, parasData)
		}
		setMultiple(false)
	}

	const getParams = (ids, data) => {
		if (data) {
			const parasData = {}
			for (const key in queryParas) {
				if (queryParas[key] === getIds) {
					parasData[key] = ids
				} else {
					parasData[key] = data[key]
				}
			}
			return parasData
		} else {
			return initQueryParas
		}

	}

	const handleSubClose = (index, id) => {
		const tags = [...tagData];
		const tData = tags.filter((o, i) => i < index);
		const editTag = tags[index].filter((o, i) => o.value !== id)
		const ids = index - 1 >= 0 ? tags[index - 1].map(item => item[getIds]).join(',') : undefined
		if (editTag.length) {/* 这里进行判断是为了避免新增新的一层为空数组的情况 */
			setTagData([...tData, editTag])
		} else {
			setTagData([...tData])
		}
		if (props.getTableDataByCancel) {/*取消的时候也需要跟新列表  */
			if (editTag.length) {
				props.getTableDataByCancel(editTag)
			} else if (tData.length) {
				props.getTableDataByCancel(tData[tData.length - 1])
			} else {
				props.getTableDataByCancel([])
			}
		}
		const parasData = getParams(ids, tData[tData.length - 1] ? tData[tData.length - 1][0] : undefined)
		getDataList(props.api, parasData)
	}



	const handleHeightChange = () => {
		setHeightFlag(!heightFlag)
	}

	return (
		<div className="retrieveTool-wrapper">
			<Space className="retrieveTool-tags">
				{
					tagData.map((item, index) => (
						<div style={{ marginBottom: 10, }} key={item.index}>
							{item.map(subItem => <Tag closable={subItem.noCancel ? false : true} onClose={() => handleSubClose(index, subItem.value)} color={colorAll[index]} key={subItem.value}>{subItem.label}</Tag>)}
						</div>
					))
				}
			</Space>
			<div className={data.length ? 'searchContent' : null} style={{ overflow: 'hidden', height: heightFlag ? 'auto' : 24, }}>
				<Row>
					<Col span={22}>
						{
							multiple ?
								<Checkbox.Group options={data} onChange={(value) => setChecked(value)} /> :
								<span>

									{
										data.map(item => <Space key={item.value}>
											<Button key={item.value} type="link" size="small" onClick={() => handleClick([item.value])} title={item.label}>
												{item.label && item.label.length > 15 ? item.label.slice(0, 15) + '...' : item.label}
											</Button>
										</Space>)
									}
								</span>
						}
					</Col>
					<Col span={2} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
						{data.length > 8 ? <Button size="small" icon={heightFlag ? <DownOutlined /> : <UpOutlined />} onClick={handleHeightChange}>更多</Button> : null}
						{

							!multiple ?
								(data.length > 1 && <Button size="small" icon={<PlusOutlined />} onClick={() => setMultiple(true)}>多选</Button>) :
								(
									<>
										<Button size="small" type="primary" onClick={() => handleClick(checked)}>确定</Button>
										<Button size="small" onClick={() => setMultiple(false)}>取消</Button>
									</>
								)
						}
					</Col>
				</Row>
			</div>
		</div>
	)
}

export default forwardRef(RetrieveTool)