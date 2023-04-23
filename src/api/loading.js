import { LoadingOutlined } from '@ant-design/icons'
import ReactDOM from 'react-dom';

let count = 0

const loading = (show) => {
    let div = document.querySelector('.vitasoy-loading')
    if (show) {
        count ++
        if(div === null){
            div = document.createElement('div');
            div.className="vitasoy-loading"
            document.body.appendChild(div);
            ReactDOM.render(<LoadingOutlined className="vitasoy-loading-icon" spin />, div)
        }else{
            div = document.querySelector('vitasoy-loading')
        }
    }else{
        if (div !== null && --count === 0) div.parentNode.removeChild(div)
    }
}

export default loading