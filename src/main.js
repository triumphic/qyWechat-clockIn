// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';

import  FastClick  from  'fastclick'
import VueTouch from 'vue-touch'
FastClick.attach(document.body);

Vue.config.productionTip = false;
// import Toast from 'vue-toast-component';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'; 
// 引入公共样式
import '../static/css/common.css';
// Vue.use(Toast);
Vue.use(VueTouch, {name: 'v-touch'})
Vue.use(ElementUI);

// 引入mint-ui组件
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
Vue.use(MintUI)
import { Toast, Indicator,MessageBox} from 'mint-ui'
Vue.prototype.$toast = Toast
Vue.prototype.$indicator = Indicator
Vue.prototype.$messageBox = MessageBox

// 引入http请求方法
import http from './utils/http.js';
Vue.prototype.$http = http;
// 引入api
import api from './api/api.js';
Vue.prototype.$api = api;
//引入微信js-sdk
import wx from 'weixin-js-sdk';
//引入vue-jsonp
import VueJsonp from 'vue-jsonp'
Vue.use(VueJsonp)
Vue.prototype.$json = VueJsonp

// 引入千讯sdk
var u = navigator.userAgent, app = navigator.appVersion;
var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
var sdk;
if( isAndroid ){
  sdk = {
    //获取移动端定位信息
    getGpsInfo(){
      window.android.getGpsInfo()
    },
    // 获取wifi和mac
    getMacInfo(){
      window.android.getMacInfo()
    },
    // 获取登录用户信息
    getLoginUserInfo(callback){
      return window.android.getUserInfo()
    },
    //隐藏标题栏
    hideTitle(){
      window.android.hideTitle()
    },
    //返回
    goBack(){
      window.android.closePage()
    },
  }
}
if( isIOS ){
  sdk = {
    // 获取wifi和mac
    getWifiAndMac(callback){
      window.webkit.messageHandlers.jsCallback.postMessage({'function': 'jsCallFetchWifiInfo','callback':callback});
    },
   //获取移动端定位信息
    getLocationInfo(callback){
      window.webkit.messageHandlers.jsCallback.postMessage({'function': 'jsCallFetchLocationInfo','callback':callback});
    },
   // 获取登录用户信息
    getLoginUserInfo(callback){
      window.webkit.messageHandlers.jsCallback.postMessage({'function': 'jsCallFetchUserInfo','parameter':{'account':''},'callback':callback});
    },
    //返回上级页面
    goBack(callback){
      window.webkit.messageHandlers.jsCallback.postMessage({'function': 'jsCallPopVc','callback':callback});
    }
  }
}
Vue.prototype.$sdk = sdk;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
  methods: {
    
  },
  created(){
    
  }
});