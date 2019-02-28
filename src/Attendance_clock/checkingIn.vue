<template>
    <div class="checkingIn">
        <div class="checkingHeader" ref="checkingHeader">
            <span>今日打卡</span>
            <div class="gotoHistory" @click="gotohistory">历史打卡</div>
        </div>
        <div class="isCheckingBox">
            <img v-show="!isCurrentCheck" class="gotocheckingPic" src="../../static/img/goToChecking.png" alt="">
            <div v-show="!isCurrentCheck" class="gotoCheckWords">快去打卡吧~</div>
            <div v-show="isCurrentCheck" class="checkListBox">
                <div class="checkListTop" ref="checkListTop"></div>
                <div class="checkListBottom"></div>
                <ul class="checkListMain" ref="checkListMain">
                    <li v-for="(item, index) in clockHistoryList" :key="index" ref="checkListLi">
                        <div class="checkLiTop">
                            <img v-if="item.timeHmm > '07:00:00' && item.timeHmm < '18:59:00'" src="../../static/img/tianqiicon_qingtian_baitian-3.png" alt="">
                            <img v-else src="../../static/img/tianqiicon_qingtian_heiye.png" alt="">
                            <span>{{item.timeHmm}}</span>
                        </div>
                        <div class="checkLiBottom">
                            {{item.position}}
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="wantClock">我要打卡</div>
        <div class="checkingAddress" ref="checkingAddress">
            <img class="dingwei" src="../../static/img/dingwei-2.png" alt="定位">
            <div class="addressBox"><span class="address">{{currentAddress}}</span></div>
            <!-- <img class="refreshPic" @click="refreshLocation" src="../../static/img/shuaxin-2.png" alt="刷新"> -->
            <div class="refreshPic" @click="refreshLocation">刷新</div>
        </div>
        <div class="dakaClick">
            <div class="circleOne" v-show="isCanCheckFlag&&handleCanCheck" ref="circleOne">
                <div class="circleTwo" ref="circleTwo">
                    <div class="circleThree" @click="dakaClick" ref="circleThree">
                        <span>打卡</span>
                        <p>{{currentTime}}</p>
                    </div>
                </div>
            </div>
            <div class="circleNull" v-show="!isCanCheckFlag || !handleCanCheck" ref="circleNull">
                <span>打卡</span>
                <p>{{currentTime}}</p>
            </div>
        </div>
    </div>
</template>
<script>
import $api from "../api/api.js"
import $http from "../utils/http.js"
import wx from 'weixin-js-sdk';
import { setTimeout } from 'timers';
import { promisify } from 'util';
import { resolve } from 'url';
export default {
    name: 'CheckingIn',
    data(){
        return {
            currentAddress: '',
            currentTime: '08:40:02',
            currentDay: '2019-01-10',
            canCheck: true,         //当前是否可以打卡
            isCurrentCheck: false,  //当前是否打卡
            isLight: true,
            currentMac: '',       //当前的mac
            currentWifiName: '',     //当前的wifi名称
            currentLat: 0,      //当前纬度
            currentLong: 0,      //当前经度
            clockId: '',        //位置表ID（参数）
            clockType: '',        //位置表类型（参数）
            isWifi: true,       //是否为wifi打卡
            clockHistoryList: [],   //打卡历史数据
            loginUserCode: "",  //当前用户usercode
            urlState: "", 
            urlCode: "",
            handleCanCheck: true,
            getCanCheckFlag: true,
            trueFlagNum: 0,
            checkFlag: '',
            isCanCheckFlag: false,//判断是否可以打卡
        }
    },
    methods: {
        //返回上级页面
        goBackTopPage(){
            var u = navigator.userAgent
            if( u.indexOf('Android') > -1 || u.indexOf('Linux') > -1 ){
                this.$sdk.goBack()
            }else if( !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ){
                this.$sdk.goBack("goBackPage")
            }
        },
        goBackPage(){
            window.history.back()
        },
        //去打卡历史页面
        gotohistory(){
            if (navigator && navigator.onLine === false) {
                this.$toast({
                    title: 'Error',
                    message: '当前网络不可用'
                })
            }else{
                this.$router.push({
                    path: '/clockIn',
                    query: {
                        isCurrentCheck: this.isCurrentCheck
                    }
                })
            }
        },
        //打卡
        dakaClick(){
            let that = this;
            if (navigator && navigator.onLine === false) {
                this.$toast({
                    title: 'Error',
                    message: '当前网络不可用'
                })
            }else{
                // that.refreshLocation() 
                that.handleCanCheck = false;
                //刷新
                let state = that.getQueryString("state")
                let code = that.getQueryString("code")
                that.urlState = state;
                that.urlCode = code;
                var u = navigator.userAgent
                if( u.indexOf('Android') > -1 || u.indexOf('Linux') > -1 ){
                    state = state
                }else if( !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ){
                    state = state.split("#")[0]
                }
                that.getWeChatSignature( state )

                setTimeout(() => {
                    that.getAddresss(that.currentLat,that.currentLong)
                    // alert("打卡地址:"+ that.currentAddress)
                    let loginUserCode = localStorage.getItem("loginUser")
                    let positionParams = {
                        userCode: loginUserCode,
                        // userCode: 'likai',
                        time: that.currentDay
                    }
                    console.log(positionParams)
                    that.$http.post($api.api.fullUrl('getPositionList'),positionParams,false,response => {
                        if( response.data.point.length != 0 ){
                            response.data.point.forEach((item,index) => {
                                let distanceBetween = that.getDistance( that.currentLat,that.currentLong,item.latitude,item.longitude )
                                console.log(distanceBetween)
                                if( distanceBetween < item.range ){
                                    item.canCheck = true
                                    that.clockId = item.id;
                                    that.clockType = item.type;
                                    that.checkFlag = item;
                                    that.isCanCheckFlag = true;
                                    that.dakaCode( item.canCheck )
                                }
                                if(!that.isCanCheckFlag){
                                    item.canCheck = false;
                                    that.dakaCode( item.canCheck )
                                }
                            });
                        }else{
                            that.canCheck = false;
                            that.dakaCode( that.canCheck )
                        }
                    })
                }, 1000);
            }
        },
        //打卡方法
        dakaCode( canCheck ){
            let that = this;
            if( canCheck == true ){
                let loginUserCode = localStorage.getItem("loginUser")
                if( that.currentAddress ){
                    let punchParams = {
                        userCode: loginUserCode,
                        clockId: that.clockId,
                        clockType: that.clockType,
                        position: that.currentAddress,
                    }
                    // alert( JSON.stringify( punchParams ) )
                    that.$http.post( $api.api.fullUrl('punchClock'),punchParams,false,response => {
                        if( response.code == 200 ){
                            that.isCurrentCheck = true;
                            let clockTimesParams = {
                                userCode: loginUserCode,
                                startTime: that.currentDay,
                                endTime: that.currentDay
                            }
                            that.$http.post( $api.api.fullUrl('getClockInfoList'),clockTimesParams,false,response => {
                                if( response.code == 0 ){
                                    response.data.forEach((item,index) => {
                                        item.time = item.time.split(" ")[1]
                                        let timeHours = item.time.split(":")[0]
                                        let timeMinutes = item.time.split(":")[1]
                                        item.timeHmm = timeHours+":"+timeMinutes
                                    });
                                }
                                that.$indicator.open({
                                    text: '',
                                    spinnerType: 'fading-circle'
                                })
                                setTimeout(() => {
                                    this.$toast({
                                        title: 'Success',
                                        message: '打卡成功'
                                    })
                                    that.clockHistoryList = response.data
                                    // that.$refs.circleOne.style.display = 'block';
                                    // that.$refs.circleNull.style.display = 'none';
                                    that.handleCanCheck = true;
                                },3000)
                                //未完全正确
                                // this.$nextTick( () => {
                                //     let divDom = this.$refs.checkListMain
                                //     alert( "h:"+divDom.scrollHeight )
                                //     alert( "top:"+ divDom.scrollTop )
                                //     let domHeight = divDom.scrollHeight + 214
                                //     alert( "domH"+domHeight )
                                //     divDom.scrollTop = domHeight
                                //     alert( divDom.scrollTop )
                                // } )
                            })
                        }else{
                            this.$toast({
                                title: 'Error',
                                message: response.msg
                            })
                        }
                    } )
                }
            }
        },
        //获取当前系统时间
        getCurrentTime(){
            var myDate = new Date();
            let myYears = "";
            let myMonths = "";
            let myHours = "";
            let myDays = "";
            let myMinutes = "";
            let mySeconds = "";
            myYears = myDate.getFullYear() + '-';      //获取当前年份
            myMonths = (myDate.getMonth()+1 < 10 ? '0'+(myDate.getMonth()+1) : myDate.getMonth()+1) + '-';       //获取当前月份
            myDays = myDate.getDate() + ' ';           //获取当前日期
            myHours = myDate.getHours();       //获取当前小时数(0-23)
            myMinutes = myDate.getMinutes();     //获取当前分钟数(0-59)
            mySeconds = myDate.getSeconds();     //获取当前秒数
            if( myMonths < 10 && myMonths != 0 ){
                myMonths = '0'+ myMonths
            }
            if( myDays < 10 ){
                myDays = '0'+ myDays
            }
            if( myHours < 10 ){
                myHours = '0'+ myHours
            }
            if( myMinutes < 10 ){
                myMinutes = '0'+ myMinutes
            }
            if( mySeconds < 10 ){
                mySeconds = '0'+ mySeconds
            }
            this.currentTime = myHours+":"+myMinutes+":"+mySeconds
            this.currentDay = myYears+myMonths+myDays
            this.isLightDay()
        },
        //判断是否为白天
        isLightDay(){
            
        },
        //刷新位置按钮
        refreshLocation(){
            let that = this;
            if (navigator && navigator.onLine === false) {
                this.$toast({
                    title: 'Error',
                    message: '当前网络不可用'
                })
            }else{
                that.isCanCheckFlag = false;
                this.$indicator.open({
                    text: '',
                    spinnerType: 'fading-circle',
                })
                setTimeout(() => {
                    this.$indicator.close();
                }, 3000);
                let state = that.getQueryString("state")
                let code = that.getQueryString("code")
                that.urlState = state;
                that.urlCode = code;
                var u = navigator.userAgent
                if( u.indexOf('Android') > -1 || u.indexOf('Linux') > -1 ){
                    state = state
                }else if( !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ){
                    state = state.split("#")[0]
                }
                that.getWeChatSignature( state )

                
                setTimeout( function(){
                    that.getAddresss(that.currentLat,that.currentLong)
                    let loginUserCode = localStorage.getItem("loginUser")
                    let positionParams = {
                        userCode: loginUserCode,
                        // userCode: 'likai',
                        time: that.currentDay
                    }
                    that.$http.post($api.api.fullUrl('getPositionList'),positionParams,false,response => {
                        if( response.data.point.length != 0 ){
                            response.data.point.forEach((item,index) => {
                                let distanceBetween = that.getDistance( that.currentLat,that.currentLong,item.latitude,item.longitude )
                                console.log(distanceBetween)
                                if( distanceBetween < item.range ){
                                    item.canCheck = true
                                    that.clockId = item.id;
                                    that.clockType = item.type;
                                    that.checkFlag = item;
                                    that.isCanCheckFlag = true;
                                }
                                if(!that.isCanCheckFlag){
                                    item.canCheck = false;
                                }
                                
                            });
                        }else{
                            that.canCheck = false;
                        }
                    })
                    // alert( "刷新："+that.canCheck )
                },1000 )
                that.handleCanCheck = true;
            }
           
        },
        //获取区间、位置、MAC地址列表接口
        getPositionList(latitude,longitude){
            this.getCurrentTime()
            let loginUserCode = localStorage.getItem("loginUser")
            let positionParams = {
                userCode: loginUserCode,
                // userCode: 'likai',
                time: this.currentDay
            }
            this.$http.post($api.api.fullUrl('getPositionList'),positionParams,false,response => {
                console.log( response )
                if( response.code == 0 ){
                    // this.isCurrentCheck = true
                    this.isCurrentCheck = response.data.hasClock
                    if( this.isCurrentCheck ){
                        let clockTimesParams = {
                            userCode: loginUserCode,
                            // userCode: 'likai',
                            startTime: this.currentDay,
                            endTime: this.currentDay
                        }
                        this.$http.post( $api.api.fullUrl('getClockInfoList'),clockTimesParams,false,response => {
                            console.log( response )
                            if( response.code == 0 ){
                                response.data.forEach((item,index) => {
                                    item.time = item.time.split(" ")[1]
                                    let timeHours = item.time.split(":")[0]
                                    let timeMinutes = item.time.split(":")[1]
                                    item.timeHmm = timeHours+":"+timeMinutes
                                });
                            }
                            this.clockHistoryList = response.data
                        })
                    }else{
                        this.$refs.checkingAddress.style.marginTop = 0.5 + 'rem'
                    }
                    console.log(response.data.point)
                    if( response.data.point.length != 0 ){
                        let flagArr = [];
                        response.data.point.forEach((item,index) => {
                            let distanceBetween = this.getDistance( latitude,longitude,item.latitude,item.longitude )
                            console.log(distanceBetween)
                            // alert("距离:"+distanceBetween)
                            if( distanceBetween < item.range ){
                                // alert("可打卡:"+true)
                                item.canCheck = true
                                this.clockId = item.id;
                                this.clockType = item.type;
                                this.checkFlag = item;
                                this.isCanCheckFlag = true;
                            }
                            if(!this.isCanCheckFlag){
                                // alert("不可打卡:"+false)
                                item.canCheck = false;
                            }

                            console.log( item.canCheck )
                        });
                    }else{
                        this.canCheck = false;
                    }
                }
            })
            
        },
        //判断两个经纬度之间的距离
        getDistance( lat1,  lng1,  lat2,  lng2){
            var radLat1 = lat1*Math.PI / 180.0;
            var radLat2 = lat2*Math.PI / 180.0;
            var a = radLat1 - radLat2;
            var  b = lng1*Math.PI / 180.0 - lng2*Math.PI / 180.0;
            var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
            Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
            s = s *6378.137 ;// EARTH_RADIUS;
            s = Math.round(s * 10000) / 10000;
            return s * 1000;
        },

        getQueryString (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        },
        //获取微信签名
        getWeChatSignature(state){
            // alert( "签名state:"+state )
            let wxUrl = ""
            var u = navigator.userAgent
            if( u.indexOf('Android') > -1 || u.indexOf('Linux') > -1 ){
                wxUrl = window.location.href.split("#")[0]
            }else if( !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ){
                wxUrl = window.location.href.split("#")[0]
            }
            // let wxUrl = "http://devoaapi.qdingnet.com/clockproject/?code=FMB-C1SIfUOP99HUG4gTuwwSNVfYvQ_bwjFnkA1rPuk&state=1000011"
            let signatureParams = {
                agentId: state,
                // agentId: "1000014",
                url: wxUrl
            }
            this.$http.get( $api.api.fullUrl('getSignature'),signatureParams,false,response => {
                // alert( JSON.stringify( response ) )
                if( response.code == 200 && response.data ){
                    response.data =  response.data
                    this.handleInWeChat( response.data )
                }else{
                    this.$toast({
                        title: 'Error',
                        message: response.msg
                    })
                }
            })
        },
        //获取用户信息
        getUserInfomation(state, code){
            let userInfoParams = {
                agentId: state,
                code: code
                // agentId: "1000011",
                // code: "FMB-C1SIfUOP99HUG4gTuwwSNVfYvQ_bwjFnkA1rPuk"
            }
            this.$http.get( $api.api.fullUrl('getUserInfo'),userInfoParams,false,response => {
                // alert( "getUserInfo:"+JSON.stringify(response) )
                if( response.code == 200 && response.data ){
                    localStorage.setItem("loginUser", response.data)
                }
            } )
        },

        //微信注入
        handleInWeChat(signatureData){
            let that = this;
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: signatureData.appId, // 必填，公众号的唯一标识
                timestamp: signatureData.timestamp, // 必填，生成签名的时间戳
                nonceStr: signatureData.nonceStr, // 必填，生成签名的随机串
                signature: signatureData.signature,// 必填，签名，见附录1
                jsApiList: ['getLocation'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
            wx.ready(function(){
                // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
                wx.getLocation({
                    type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                    success: function (res) {
                        // alert( "获取经纬度："+ JSON.stringify(res) )
                        var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                        var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                        var speed = res.speed; // 速度，以米/每秒计
                        var accuracy = res.accuracy; // 位置精度
                        // longitude = longitude - 0.00659713818359 
                        // latitude = latitude - 0.00118342991723
                        that.currentLat = latitude;
                        that.currentLong = longitude;
                        that.getAddresss(latitude,longitude)
                        that.getPositionList(latitude,longitude)
                    }
                });
            });
            wx.error(function(res){
                // alert(JSON.stringify(res))
                // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
            });
        },
        getAddresss(lat,lng){
            alert( "经纬度："+lat+","+lng )
            let that = this
	        const KEY ="YPUBZ-XDCLX-VPT4F-ZFG4A-3562O-5OFPD"; //key 秘钥自己申请
	        let url = 'https://apis.map.qq.com/ws/geocoder/v1?&poi_options=address_format=short&get_poi=0';
            let locationdata = lat+','+lng //纬度，经度
            // let locationdata = "40.040245056152344,116.41533660888672";
	        that.$jsonp(url,{
	          key:KEY,
	          callbackName: 'QQmap',
	          output:'jsonp',
	          location:locationdata
	        })
			.then(json => {
                console.log(json)
				let address = json.result.address;
                    console.log(address) //附近街道地址信息
                    // alert( "地址为:"+ address )
                    that.currentAddress = address
            })
			.catch(err => {
                console.log(err)
			})
	    }
    },
    created(){
        let state = this.getQueryString("state")
        let code = this.getQueryString("code")
        this.urlState = state;
        this.urlCode = code;
        var u = navigator.userAgent
        if( u.indexOf('Android') > -1 || u.indexOf('Linux') > -1 ){
            state = state
        }else if( !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ){
            state = state.split("#")[0]
        }
        this.getWeChatSignature( state )
        let userCode = localStorage.getItem("loginUser")
        this.loginUserCode = userCode;
        this.getUserInfomation( state, code )
        // alert( state+","+code )
    },
    mounted(){
        this.getPositionList( this.currentLat, this.currentLong )
        this.timer = setInterval( this.getCurrentTime, 1000 )
        this.isLightDay()        
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
        }
    },
    watch: {
        loginUserCode( oldVal, newVal ){
            if( oldVal != newVal ){
                this.getUserInfomation( this.urlState, this.urlCode )
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.checkingIn{
    width: 100%;
    height: calc(100% - 1rem);
    .checkingHeader{
        width: 100%;
        height: 0.58rem;
        color: #fff;
        // background:linear-gradient(196deg,rgba(255,96,95,1) 0%,rgba(254,137,107,1) 100%);
        background: #fff;
        background-size: 150%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.38rem;
        // padding: 0 0.21rem;
        span{
            font-size: 0.28rem;
            color: #A0A0A0;
            margin-left: 0.23rem;
        }
        .gotoHistory{
            width: 1.71rem;
            height: 0.58rem;
            line-height: 0.58rem;
            text-align: center;
            font-size: 0.32rem;
            font-family:PingFangSC-Regular;
            font-weight:400;
            color:rgba(255,255,255,1);
            background: url('../../static/img/circleJuxing1.png') no-repeat 0px 0px;
            background-size: 100%;
        }
    }
    .isCheckingBox{
        width: 100%;
        .gotocheckingPic{
            display: block;
            margin: 0 auto;
            width: 4.88rem;
            margin-top: 0.32rem;
        }
        .gotoCheckWords{
            width: 100%;
            text-align: center;
            font-size: 0.38rem;
            font-family:PingFangSC-Regular;
            font-weight:400;
            color:rgba(107,106,106,1);
            margin-top: 0.42rem;
        }
        .checkListBox{
            width: 100%;
            position: relative;
            .checkListTop{
                width: 100%;
                height: 1.5rem;
                background: url('../../static/img/pic4.png') no-repeat -3.65rem -1.69rem;
            }
            .checkListBottom{
                width: 100%;
                height: 3.26rem;
                background-color: #fff;
            }
            .checkListMain{
                width: 6.79rem;
                height: 4.27rem;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                background: url('../../static/img/historybg.png') no-repeat center;
                background-size: 6.9rem 4.5rem;
                box-shadow:0.01rem 0.08rem 0.1rem 0 rgba(118,118,118,0.13);
                border-radius:0.18rem;
                position: absolute;
                top: 0.7rem;
                left: 0.35rem;
                li{
                    width: 100%;
                    height: 1.42rem;
                    padding-top: 0.15rem;
                    position: relative;
                    .checkLiTop{
                        width: 90%;
                        height: 0.8rem;
                        line-height: 0.8rem;
                        margin: 0 auto;
                        overflow: hidden;
                        img{
                            width: 0.38rem;
                            height: 0.39rem;
                            vertical-align: middle;
                            z-index: 10;
                        }
                        span{
                            font-size: 0.46rem;
                            color: #1A1A1A;
                            margin-left: -5%;
                            vertical-align: middle;
                        }
                    }
                    .checkLiTop:before{
                        display: block;
                        content:"";
                        width: 2px;
                        height: 100%;
                        background: #EFEFEF;
                        position: absolute;
                        top: 0.9rem;
                        left: 0.50rem;
                    }
                        
                    .checkLiBottom{
                        width: 5.02rem;
                        font-size: 0.24rem;
                        color: #545454;
                        margin-left: 15%;
                    }
                }
            }
            .checkListMain::-webkit-scrollbar {
                display: none;
            }
            li:nth-last-child(1){
                .checkLiTop:before{
                    display: none;
                }
            }
        }
    }
    .wantClock{
        width: 2.1rem;
        height: 0.4rem;
        line-height: 0.4rem;
        font-size: 0.28rem;
        font-family:PingFangSC-Regular;
        font-weight:400;
        color:rgba(160,160,160,1);
        margin-left: 0.25rem;
        margin-top: 0.53rem;
    }
    .checkingAddress{
        width: 100%;
        margin-top: 1.69rem;
        display: flex;
        justify-content: space-between;
        padding: 0 0 0 0.22rem;
        .dingwei{
            width: 0.44rem;
            height: 0.53rem;
        }
        .addressBox{
            width: 90%;
            font-size: 0.26rem;
            color: #1B1B1B;
            margin-left: 0.17rem;
        }
        .refreshPic{
            width: 1.06rem;
            height: 0.58rem;
            font-size: 0.32rem;
            font-family:PingFangSC-Regular;
            line-height: 0.58rem;
            text-align: center;
            color: #fff;
            padding-left: 0.15rem;
            background: url('../../static/img/circleJuxing1.png') no-repeat 0px 0px;
        }
    }
    .dakaClick{
        width: 100%;
        margin-top: 0.68rem;
        .circleOne{
            margin: 0 auto;
            width: 3.35rem;
            height: 3.35rem;
            background:rgba(254,247,227,1);
            border-radius:50%;
            overflow: hidden;
        }
        .circleTwo{
            margin: 0.17rem auto;
            width: 3rem;
            height: 3rem;
            background:rgba(253,212,152,1);
            border-radius:50%;
            overflow: hidden;
        }
        .circleThree{
            margin: 0.18rem auto;
            width: 2.65rem;
            height: 2.65rem;
            background:linear-gradient(-26deg,rgba(255,176,26,1) 0%,rgba(254,197,2,1) 100%);
            color: #fff;
            border-radius:50%;
            text-align: center;
            padding-top: 0.23rem;
            span{
                font-size: 0.48rem;
            }
            p{
                font-size: 0.34rem;
                margin-top: 0.15rem;
            }
        }
        .circleNull{
            margin: 0 auto;
            width: 2.65rem;
            height: 2.65rem;
            background:rgba(225,225,225,1);
            border-radius:50%;
            text-align: center;
            padding-top: 0.23rem;
            pointer-events: none;
            span{
                font-size: 0.48rem;
            }
            p{
                font-size: 0.34rem;
                margin-top: 0.15rem;
            }
        }
    }
}
</style>
