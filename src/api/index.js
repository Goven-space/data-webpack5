import axios from 'axios';
import loading from './loading';
import { CacheUtils } from './cacheUtils.js';
import { showError, showInfo, getCurrentServerHost } from '@tool';
import { getToken } from '@tool/cookies';

const ignoreLoading = [];
const ignoreTokenCheck = [];
/* const cancelTipArr = [
  '/rest/core/serialnumber/new',
  '/rest/core/datasource/select',
  '/rest/dataassets/sync/verify/systemVerifyTableExist',
  '/rest/dataassets/sync/verify/verifyCodeConfigTableExist',
  '/rest/dataassets/dataelement/exportBson',
  '/rest/base/menu/tree',
  '/rest/base/system/info',
  '/rest/base/platformConfig/system/permissions'
]; */
const serverHost = getCurrentServerHost();
export const baseURL = serverHost || `${window.location.origin}/restcloud`;
export const service = axios.create({
  baseURL,
  timeout: 600 * 1000,
  responseType: 'json',
});

service.interceptors.request.use(
  function (config) {
    /* if (ignoreLoading.includes(config.url)){
			loading(false);
		}else {
			loading(true);
    } */
    config.loading && loading(true);

    let host = getCurrentServerHost();
    if (config.baseURL !== host) {
      service.defaults.baseURL = host;
      config.baseURL = host;
    }
    if (!window.location.pathname.includes('/login')) {
      const identitytoken = getToken();
      if (identitytoken) {
        config.headers.identitytoken = identitytoken;
      }
    }
    let cacheKey = config.url;
    
    // 每次发送请求之前将上一个未完成的相同请求进行中断
    CacheUtils.cache[cacheKey] && CacheUtils.clearCache(cacheKey);

    // 将当前请求所对应的取消函数存入缓存
    config.cancelToken = new axios.CancelToken(function executor(c) {
      CacheUtils.cache[cacheKey] = c;
    });

    // 临时保存 cacheKey，用于在响应拦截器中清除缓存
    config.cacheKey = cacheKey;

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  function (res) {
    // 响应接收之后清除缓存
    const cacheKey = res.config.cacheKey;
    delete CacheUtils.cache[cacheKey];

    if (res.status === 200) {
      if (res.data && !res.data.state && !(res.data instanceof Blob)) {
        /* if (!cancelTipArr.includes(res.config.url)) {
          showError(res.data.msg || '接口异常');
        } */
        res.data.msg && showError(res.data.msg);
      }
      return Promise.resolve(res);
    } else {
      return Promise.reject(res);
    }
  },
  function (err) {
    if (!err) return false;
    // 响应异常清除缓存
    if (err.config) {
      const cacheKey = err.config.cacheKey;
      delete CacheUtils.cache[cacheKey];
      return {
        data: {},
      };
    }
    if (err && err.constructor.prototype.toString.call({}) === 'Cancel') {
      //说明是手动取消请求
      return { data: {} };
    }
    if (err && !err.response) {
      //自己将超时的判断条件补全
      err.response = {};
      err.response.status = 2021;
      err.response.data = {};
      err.response.data.msg = '请求接口超时!';
      err.response.data.state = false;
      showError('服务请求超时！');
      return Promise.reject(err.response && err.response.data);
    } else if (err.response.status === 500) {
      showError((err.response.data && err.response.data.msg) || '500,服务请求处理异常!');
      return Promise.reject(err.response && err.response.data);
    } else if (err.response.status === 404) {
      showError(
        (err.response.data && err.response.data.msg) || '404,服务请求失败,请检查服务器填写及服务接口是否正确!'
      );
      return Promise.reject(err.response && err.response.data);
    } else {
      showError((err.response.data && err.response.data.msg) || '接口异常');
      return Promise.reject(err.response && err.response.data);
    }
  }
);

export const get = (url, params, config) => {
  return new Promise((resolve, reject) => {
    service
      .get(url, {
        params,
        ...config,
      })
      .then(res => {
        //导出
        if (res.config && res.config.responseType === 'blob') {
          exportData(res);
        }
        resolve(res);
      })
      .catch(err => {
        reject(err);
      })
      .finally(res => {
        loading(false);
      });
  });
};

export const post = (url, params, config) => {
  let cType;
  let data;
  if (config && config.headers) {
    cType = config.headers['Content-Type'];
    if (cType === 'application/x-www-form-urlencoded') {
      if (params instanceof URLSearchParams) {
        data = params;
      } else {
        data = '';
        for (let k in params) {
          data += `${data !== '' ? '&' : ''}${k}=${params[k]}`;
        }
      }
    }
  }
  return new Promise((resolve, reject) => {
    service
      .post(
        url,
        cType === 'application/x-www-form-urlencoded'
          ? data
          : {
              ...params,
            },
        config
      )
      .then(res => {
        //导出
        if (res && res.config && res.config.responseType === 'blob') {
          exportData(res);
        }
        resolve(res);
      })
      .catch(err => {
        reject(err);
      })
      .finally(res => {
        loading(false);
      });
  });
};

//
export const importPost = (url, params, config = {}) => {
  return new Promise((resolve, reject) => {
    service
      .post(url, params, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(res => {
        if (res.data.state) {
          //如果没将响应设置为blob
          showInfo(res.data?.msg);
        }
        if (res.config && res.config.responseType === 'blob') {
          if (res && !res.headers['content-disposition']) {
            //说明后端返回的是对象，成功也是返回对象，失败也有可能是返回对象（失败可能是流也可能是对象）
            //将blob转成json =>fileReader.readAsText
            let data = res.data;
            let fileReader = new FileReader();
            fileReader.readAsText(data);
            fileReader.onload = function () {
              try {
                let jsonData = JSON.parse(this.result); //如果能将blob转成json，说明后端给的是对象，此时可以通过state去判断成功还是失败
                if (jsonData.state) {
                  showInfo(jsonData.msg);
                } else {
                  showError(jsonData.msg);
                }
                resolve(res);
              } catch (err) {
                //如果来到这里，说明是流文件
              }
            };
          } else {
            //失败，且返回文件流让下载
            exportData(res, resolve);
          }
        } else {
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

//对于返回类型为blob类型就认为是导出为文件流
export const exportData = (res, resolve) => {
  let data = res.data || res;
  if (res && !res.headers['content-disposition']) {
    showError(data.msg || '导出失败');
    resolve && resolve(res);
    return;
  }
  let fileReader = new FileReader();
  fileReader.readAsText(data);
  fileReader.onload = function () {
    resolve && resolve(res);
    blobDownload(res);
  };
};

export const blobDownload = (res, name) => {
  let blobObject = new Blob([res.data]);
  var link = document.createElement('a');
  let url = window.URL.createObjectURL(blobObject);
  link.href = url;
  var filename = res.headers; //下载后文件名
  filename = filename['content-disposition'];
  filename =
    decodeURI(filename && filename.split(';')[1] && filename.split(';')[1].split('filename=')[1]) || name;
  link.download = filename.replace(new RegExp('"', 'gm'), '');
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 0);
};
