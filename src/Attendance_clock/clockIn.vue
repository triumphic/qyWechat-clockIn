<template>
  <div class="content" ref="content">
    <div class="calendarBox">
      <!-- <div class="dakaRemind" @click="handleHideThis" ref="dakaRemind">
        <span>左右滑动可以切换月份</span>
      </div> -->
      <div class="calendarTop" ref="calendarTop"></div>
      <div class="calendarBottom"></div>
      <Calendar class="calendar" ref="Calendar" :sundayStart="true" :markDateMore="arr" :markDate="arr2" v-on:isToday="clickToday" agoDayHide=1530115200 v-on:choseDay="clickDay" v-on:changeMonth="changeDate" v-on:dayListLength="getDayListLength"></Calendar>
    </div>
    <div class="pointExample" ref="pointExample">
      <div class="multipleTimes">
        <div class="pointOrange"></div>
        <span>多次打卡</span>
      </div>
      <div class="oneTimes">
        <div class="ponitRed"></div>
        <span>单次打卡</span>
      </div>
    </div>
    <div class="dakaMain">
      <ul v-if="isCurrentCheck" class="checkListMain">
        <li v-for="(item, index) in clockHistoryList" :key="index">
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
      <img v-else class="noDaka" ref="noDaKa" src="../../static/img/nochecking.png" alt="">
    </div>
    <!-- <h3 @click="demo">markDateMore标记不同风格：：1号2号一种风格====13号另一种风格</h3> -->
    <!-- <h3>markDate 标记23号 单一风格 更简单</h3> -->
    <!-- <div class="div" @click="demo ">
      点击跳到2018-12-12
    </div> -->
  </div>
</template>

<script>
import Calendar from '../vue-calendar-component/index';
import $api from "../api/api.js"
import $http from "../utils/http.js"
// import Calendar from 'vue-calendar-component';
export default {
  data() {
    return {
      // arr2: ['2018/6/23'],
      arr2: [],
      arr: [
        {
          date: '2018/8/1',
          className: 'mark1'
        },
        {
          date: '2018/8/13',
          className: 'mark2'
        }
      ],
      isCurrentCheck: false,
      currentTime: '08:40:02',
      currentDay: '2019-01-10',
      clockHistoryList: [],   //打卡历史数据
    };
  },
  components: {
    Calendar
  },
  methods: {
    getDayListLength(dataNum){
      console.log("dataNum"+dataNum)
      if( dataNum > 35 ){
        this.$refs.pointExample.style.marginTop = 1 + "rem";
      }else{
        this.$refs.pointExample.style.marginTop = 0.43 + "rem";
      }
    },
    clickDay(data) {
      console.log('选中了', data); //选中某天
      // this.$toast('选中了' + data);
      let loginUserCode = localStorage.getItem("loginUser")
      let clockTimesParams = {
        // userCode: 'likai',
        userCode: loginUserCode,
        startTime: data,
        endTime: data
      }
      this.$http.post( $api.api.fullUrl('getClockInfoList'),clockTimesParams,false,response => {
        console.log(response)
        if( response.code == 0 ){
          if( response.data.length == 0 ){
            this.isCurrentCheck = false;
          }else{
            this.isCurrentCheck = true;
            response.data.forEach((item,index) => {
                item.time = item.time.split(" ")[1]
                let timeHours = item.time.split(":")[0]
                let timeMinutes = item.time.split(":")[1]
                item.timeHmm = timeHours+":"+timeMinutes
            });
          }
            
        }
        this.clockHistoryList = response.data
      })
    },
    clickToday(data) {
      console.log('跳到了本月今天', data); //跳到了本月
    },
    changeDate(dataNum) {
      // this.$toast('切换到的月份为' + data);
      console.log('左右点击切换月份', dataNum); //左右点击切换月份
      if( dataNum > 35 ){
        this.$refs.pointExample.style.marginTop = 1 + "rem";
      }else{
        this.$refs.pointExample.style.marginTop = 0.43 + "rem";
      }
    },
    demo() {
      this.$refs.Calendar.ChoseMonth('2018-12-12'); //跳到12月12日选中12月12日
    },
    //去申诉页面
    goToShenSu(){
      if (navigator && navigator.onLine === false) {
          this.$toast({
              title: 'Error',
              message: '当前网络不可用'
          })
      }else{
        let userCode = localStorage.getItem("loginUser")
        // window.location.href = 'http://dev-bpmh5.qdingnet.cn/index.html?usercode='+userCode
        window.location.href = "https://devoaapi.qdingnet.com/bpmh5?userCode="+userCode
      }
      
    },
    //返回
    backToCheck(){
      history.go(-1)
    },
    //点击之后隐藏提示
    // handleHideThis(){
    //   this.$refs.dakaRemind.style.display = 'none';
    //   sessionStorage.setItem("hideImage","isHide")
    // },
    //获取当前系统时间
    getCurrentTime(){
        var myDate = new Date();
        let myYears = "";
        let myMonths = "";
        let myDays = "";
        let myHours = "";
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
        // this.getClockHistoryList()
    },
    //判断是否为白天
    isLightDay(){
        if( '07:00:00' < this.currentTime &&  this.currentTime < '19:00:00' ){
            // console.log("白天")
            this.$refs.contentHeader.style.backgroundImage = "url('static/img/pic4.png')"
            this.$refs.calendarTop.style.backgroundImage = "url('static/img/pic4.png')"
        }else{
            // console.log("黑夜")
            this.$refs.contentHeader.style.backgroundImage = "url('static/img/bgNight.png')"
            this.$refs.calendarTop.style.backgroundImage = "url('static/img/bgNight.png')"
        }
    },
    //打卡历史数据加载
    getClockHistoryList(){
      this.getCurrentTime()
      let loginUserCode = localStorage.getItem("loginUser")
      let clockTimesParams = {
          // userCode: 'likai',
          userCode: loginUserCode,
          // startTime: '2019-01-14',
          startTime: this.currentDay,
          // endTime: '2019-01-14',
          endTime: this.currentDay
      }
      // alert( this.currentDay )
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
    }
  },
  created() {
    function format(date, index) {
      date = new Date(date);
      return `${date.getFullYear()}-${date.getMonth() + 1}-${index}`;
    }
    setTimeout(() => {
      this.arr = [
        {
          date: format(new Date(), 3),
          className: 'mark1'
        },
        {
          date: format(new Date(), 12),
          className: 'mark2'
        }
      ];
      this.arr.push({
        date: format(new Date(), 15),
        className: 'mark1'
      })
    }, 1000)

  },
  mounted() {
    // let isHide = sessionStorage.getItem("hideImage")
    // if( isHide == 'isHide' ){
    //   this.$refs.dakaRemind.style.display = 'none';
    // }
    console.log(this.$route.query.isCurrentCheck)
    this.isCurrentCheck = this.$route.query.isCurrentCheck
    this.timer = setInterval( this.getCurrentTime, 1000 )
    this.isLightDay()
    this.getClockHistoryList()
    
  },
  beforeDestroy() {
    if (this.timer) {
        clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
    }
  }
};
</script>

<!-- Add "scoped " attribute to limit CSS to this component only -->
<style lang='scss' scoped>
.content{
  width: 100%;
  height: calc(100% - 1rem);
  .calendarBox{
    width: 100%;
    height: 5.2rem;
    position: relative;
    // .dakaRemind{
    //   width: 2.57rem;
    //   height: 1.68rem;
    //   background: url('../../static/img/toastmode.png') no-repeat center;
    //   background-size: 100%;
    //   font-size: 0.25rem;
    //   color: #fff;
    //   position: absolute;
    //   top: 2.1rem;
    //   left: 2.7rem;
    //   z-index: 15;
    //   span{
    //     position: absolute;
    //     top: 36%;
    //     left: 0;
    //     transform: scale(0.8)
    //   }
    // }
    .calendarTop{
        width: 100%;
        height: 1rem;
        background: url('../../static/img/pic4.png') no-repeat -3.65rem -1.69rem;
    }
    .calendarBottom{
        width: 100%;
        height: 3.26rem;
        background-color: #fff;
    }
    .calendar{
      width: 6.79rem;
      margin-left: 0.34rem;box-shadow:1px 8px 10px 0px rgba(118,118,118,0.13);
      border-radius: 0.2rem;
      position: absolute;
      top: 0.5rem;
      left: 0;
    }
  }
  .pointExample{
    width: 100%;
    height: 0.3rem;
    margin-top: 0.43rem;
    display: flex;
    justify-content: flex-end;
    padding-right: 0.36rem;
    .multipleTimes{
      display: flex;
      align-items: center;
      margin-right: 0.29rem;
      .pointOrange{
        width: 0.14rem;
        height: 0.14rem;
        background:linear-gradient(0deg,rgba(255,179,22,1) 0%,rgba(254,195,4,1) 100%);
        border-radius:50%;
        margin-right: 0.17rem;
      }
      span{
        font-size: 0.22rem;
        color: #ADADAD;
      }
    }
    .oneTimes{
      display: flex;
      align-items: center;
      .ponitRed{
        width: 0.14rem;
        height: 0.14rem;
        background:rgba(203,6,6,1);
        border-radius:50%;
        margin-right: 0.17rem;
      }
      span{
        font-size: 0.22rem;
        color: #ADADAD;
      }
    }
  }
  .dakaMain{
    width: 100%;
    .noDaka{
      display: block;
      margin: 0 auto;
      width: 4.63rem;
      height: 3.44rem;
      margin-top: 0.5rem;
    }
    .checkListMain{
      width: 100%;
      height: 5.0rem;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      background:rgba(255,255,255,1);
      margin-top: 0.65rem;
      li{
          width: 100%;
          height: 1.42rem;
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
                  font-size: 0.26rem;
                  color: #1B1B1B;
                  margin-left: 0rem;
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
              top: 0.65rem;
              left: 0.55rem;
          }
              
          .checkLiBottom{
              font-size: 0.24rem;
              color: #545454;
              margin-left: 15%;
          }
      }
  }
  li:nth-last-child(1){
      margin-bottom: 0.8rem;
      .checkLiTop:before{
          display: none;
      }
  }
  }
}
h3 {
  text-align: center;
  width: 90%;
  margin: auto;
}

.div {
  margin: auto;
  width: 220px;
  height: 44px;
  line-height: 44px;
  background: #0fc37c;
  color: #fff;
  font-size: 17px;
  text-align: center;
  margin-top: 20px;
}

.wh_container >>> .mark1 {
  background-color: orange;
}

.wh_container >>> .mark2 {
  background-color: blue;
}
.wh_content_item > .wh_isMark {
  background: orange;
}
.wh_container >>> .wh_content_all {
  background-color: red;
}
</style>