<template>
  <div id="app">
    <div class="topModal" v-show="isAndroidOrIos" v-bind:style="{height: activeHeight + 'rem' }" id="topModalOO" ref="topModal"></div>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: "app",
  data(){
    return {
      isAndroidOrIos: false,
      activeHeight: 1,
    }
  },
  methods: {
    judgeIphone(){
      var u = navigator.userAgent, app = navigator.appVersion;
      var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
      var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
      if( isAndroid ){
        // alert('android')
        this.isAndroidOrIos = false
      }
      if( isIOS ){
        this.isAndroidOrIos = true
        // iPhone X、iPhone XS
        var isIPhoneX = /iphone/gi.test(window.navigator.userAgent) && window.devicePixelRatio && window.devicePixelRatio === 3 && window.screen.width === 375 && window.screen.height === 812;
        // iPhone XS Max
        var isIPhoneXSMax = /iphone/gi.test(window.navigator.userAgent) && window.devicePixelRatio && window.devicePixelRatio === 3 && window.screen.width === 414 && window.screen.height === 896;
        // iPhone XR
        var isIPhoneXR = /iphone/gi.test(window.navigator.userAgent) && window.devicePixelRatio && window.devicePixelRatio === 2 && window.screen.width === 414 && window.screen.height === 896;
        if( !isIPhoneX && !isIPhoneXSMax && !isIPhoneXR ){
          // alert("普通手机")
          this.activeHeight = 0.5
        }else if(isIPhoneX){
          // alert('X')
          this.activeHeight = 1
        }else if(isIPhoneXSMax){
          // alert('XSMax')
          this.activeHeight = 1
        }else if(isIPhoneXR){
          // alert('XR')
          this.activeHeight = 1
        }
      }
      
    }
  },
  created(){
    // this.judgeIphone()
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
body,
#app {
  width: 100%;
  height: 100%;
  background: #fff;
  position: fixed;
  top: 0;
  left: 0;
}
.topModal{
  width: 100%;
  height: 1rem;
  display: none;
  background: url('../static/img/pic4.png') no-repeat center
}
</style>
