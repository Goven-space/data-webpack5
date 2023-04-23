import * as allIcons from '@ant-design/icons';
import { createElement } from 'react';

export const IconFont = allIcons.createFromIconfontCN({
	scriptUrl: "//at.alicdn.com/t/font_2771502_xlwy5g1s61.js"
})

const Icon = (props) => {
    let icon;
    const NewIcon = allIcons[props.type]
    if (NewIcon) {
        try {
            icon = createElement(NewIcon);
        } catch (error) {
        }
    }
    return icon
}



export default Icon