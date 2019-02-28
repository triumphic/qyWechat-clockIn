/* 
* @Author: zhangge
* @Date:   2018-11-15 14:48:20
* @Last Modified by:   zhangge
* @Last Modified time: 2018-12-27 15:39:05
*/

import Vue from 'vue';
import axios from 'axios';
import _ from 'lodash';
import { Loading } from 'element-ui';

let http = axios.create({
  // baseURL: 'http://10.39.72.88:8080',
  // withCredentials: true,
  headers: {}
 
});

http.interceptors.request.use(
    config => {
        // config.headers.common = {
        //     'Content-Type': "application/json",
        // };
        if(config.showLoading){
          showFullScreenLoading()
        }
        
        // 设置超时时间
        config.timeout = 20000;
        return config
    },
    err => {
      tryHideFullScreenLoading()
      return Promise.reject(err)
    }
)
http.interceptors.response.use(
  response => {
    tryHideFullScreenLoading()
    // let timetp = null
    // clearTimeout(timetp)
    // timetp = setTimeout(() => {
    //   tryHideFullScreenLoading()
    //   clearTimeout(timetp)
    // }, 500)
    let msg = ""
    switch (response.data){
      case "401":
        msg = "登录token过期，请重新登录"
      case "300":
        msg = "用户认证信息不全，请重新登录"
    }
    if(msg!=""){
      Vue.$toast({
        message: msg,
        position: 'middle',
        duration: 3000
      })
    }
    
    return response.data
  }, 
  err => {
    console.log(err)
    console.log( url )
    tryHideFullScreenLoading()
    // 这里是返回状态码不为200时候的错误处理
    if (err.toString().indexOf("timeout") != -1) {
      Vue.$toast({
        message: '请求超时，请退出稍后再试',
        position: 'middle',
        duration: 3000
      })
    }
    if (err && err.response) {
      switch (err.response.status) {
        case 400:
          err.message = '请求错误'
          break

        case 401:
          err.message = '未授权，请登录'
          break

        case 403:
          err.message = '拒绝访问'
          break

        case 404:
          err.message = `请求地址出错: ${err.response.config.url}`
          break

        case 408:
          err.message = '请求超时'
          break

        case 500:
          err.message = '服务器开个小差，请退出稍后再试'
          break

        case 501:
          err.message = '服务器开个小差，请稍后再试'
          break

        case 502:
          err.message = '服务器开个小差，请稍后再试'
          break

        case 503:
          err.message = '服务器开个小差，请稍后再试'
          break

        case 504:
          err.message = '服务器开个小差，请稍后再试'
          break

        case 505:
          err.message = 'HTTP版本不受支持'
          break

        default:
      }
      Vue.$toast({
        message: err.message,
        position: 'middle',
        duration: 3000
      })
    }
    return Promise.reject(error)
})

function showFullScreenLoading(){
  Vue.$indicator.open({
    text: '加载中...',
    spinnerType: 'fading-circle'
  });
}
function tryHideFullScreenLoading(){
  // Vue.$indicator.close()
}


function apiAxios(method, url, params, showLoading, response) {
  http({
    method: method,
    url: url,
    data: method === 'POST' || method === 'PUT' ? params : null,
    params: method === 'GET' || method === 'DELETE' ? params : null,
    showLoading : showLoading,
  }).then(function (res) {
    response(res);
  }).catch(function (err) {
    response(err);
  })
}

export default {
  get: function (url, params,showLoading, response) {
    return apiAxios('GET', url, params, showLoading,response)
  },
  post: function (url, params,showLoading, response) {
    return apiAxios('POST', url, params,showLoading, response)
  }
  
}

