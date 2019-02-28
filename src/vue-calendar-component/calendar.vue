<template>
  <section class="wh_container">
    <div class="wh_content_all">
      <div class="wh_top_changge">
        <li class="wh_top_changge_liLeft" @click="PreMonth(myDate,false)">
          <div class="wh_jiantou1"></div>
        </li>
        <li class="wh_content_li">{{dateTop}}</li>
        <li class="wh_top_changge_liRight" @click="NextMonth(myDate,false)">
          <div class="wh_jiantou2"></div>
        </li>
      </div>
      <div class="wh_content">
        <div class="wh_content_item" v-for="tag in textTop">
          <div class="wh_top_tag">
            {{tag}}
          </div>
        </div>
      </div>
      <v-touch v-on:swipeleft="leftChangeImg" height="500px" v-on:swiperight="rightChangeImg">
        <div class="wh_content">
          <div class="wh_content_item" v-for="(item,index) in list" @click="clickDay(item,index)">
            <div class="wh_item_date" v-bind:class="[{ wh_isMark: item.isMark},{wh_other_dayhide:item.otherMonth!=='nowMonth'},{wh_want_dayhide:item.dayHide},{wh_isToday:item.isToday},{wh_chose_day:item.chooseDay},setClass(item)]">
              {{item.id}}
            </div>
            <div v-show="item.clockTime != 0" v-bind:class="item.clockTime > 1   ? 'isMulPoint' : 'isNotMulPoint'"></div>
          </div>
        </div>
      </v-touch>
    </div>
  </section>
</template>
<script>
import timeUtil from './calendar';
import $api from "../api/api.js"
import $http from "../utils/http.js"
export default {
  data() {
    return {
      myDate: [],
      list: [],
      listLength: 0,
      historyChose: [],
      dateTop: '',
      startTime: '',
      endTime: '',
      ceshiTimes: 0,
      isChangePage: false,
      currentMonth: "", //当前月份
      currentDayOne: "",   //当前日期
      currentDay: "",   //当前年月日
      everyChooseDay: "",     //选择的日期
    };
  },
  props: {
    markDate: {
      type: Array,
      default: () => []
    },
    markDateMore: {
      type: Array,
      default: () => []
    },
    textTop: {
      type: Array,
      default: () => ['日', '一', '二', '三', '四', '五', '六']
    },
    sundayStart: {
      type: Boolean,
      default: () => false
    },
    agoDayHide: { type: String, default: `0` },
    futureDayHide: { type: String, default: `2554387200` }
  },
  created() {
    this.intStart();
    this.myDate = new Date();
  },
  methods: {
    leftChangeImg(){
      console.log('left')
      this.NextMonth(this.myDate,false)
      this.$emit( "dayListLength", this.listLength )
      this.isChangePage = true;
    },
    rightChangeImg(){
      console.log('right')
      this.PreMonth(this.myDate,false)
      this.$emit( "dayListLength", this.listLength )
      this.isChangePage = true;
    },
    intStart() {
      timeUtil.sundayStart = this.sundayStart;
    },
    setClass(data) {
      let obj = {};
      obj[data.markClassName] = data.markClassName;
      return obj;
    },
    clickDay: function (item, index) {
      if (item.otherMonth === 'nowMonth' && !item.dayHide) {
        this.getList(this.myDate, item.date);
      }
      if (item.otherMonth !== 'nowMonth') {
        item.otherMonth === 'preMonth'
          ? this.PreMonth(item.date)
          : this.NextMonth(item.date);
      }
    },
    ChoseMonth: function (date, isChosedDay = true) {
      date = timeUtil.dateFormat(date);
      this.myDate = new Date(date);
      this.$emit('changeMonth', timeUtil.dateFormat(this.myDate));
      if (isChosedDay) {
        this.getList(this.myDate, date, isChosedDay);
      } else {
        this.getList(this.myDate);
      }
    },
    PreMonth: function (date, isChosedDay = true) {
      date = timeUtil.dateFormat(date);
      this.myDate = timeUtil.getOtherMonth(this.myDate, 'preMonth');
      // this.$emit('changeMonth', timeUtil.dateFormat(this.myDate));
      if (isChosedDay) {
        this.getList(this.myDate, date, isChosedDay);
      } else {
        this.getList(this.myDate);
      }
      
      console.log(this.dateTop)
      // let dateCurMonth = this.dateTop.split("月")[0]
      // console.log(dateCurMonth)
      // console.log( this.currentMonth )
      // console.log( dateCurMonth == this.currentMonth )
      // if( this.dateTop == this.currentMonth ){
      //   this.isChangePage = false;
      // }else{
      //   this.isChangePage = true;
      // }
      // if (isChosedDay) {
      //   this.getList(this.myDate, date, isChosedDay);
      // } else {
      //   this.getList(this.myDate);
      // }
      this.isChangePage = true;
      this.$emit('changeMonth', this.listLength)
      // this.getList(this.myDate);
    },
    NextMonth: function (date, isChosedDay = true) {
      date = timeUtil.dateFormat(date);
      this.myDate = timeUtil.getOtherMonth(this.myDate, 'nextMonth');
      // this.$emit('changeMonth', timeUtil.dateFormat(this.myDate));
      if (isChosedDay) {
        this.getList(this.myDate, date, isChosedDay);
      } else {
        this.getList(this.myDate);
      }

      console.log(this.dateTop)
      // let dateCurMonth = this.dateTop.split("月")[0]
      // console.log(dateCurMonth)
      // console.log( this.currentMonth )
      // console.log( dateCurMonth == this.currentMonth )
      // if( this.dateTop == this.currentMonth ){
      //   this.isChangePage = false;
      // }else{
      //   this.isChangePage = true;
      // }
      // if (isChosedDay) {
      //   this.getList(this.myDate, date, isChosedDay);
      // } else {
      //   this.getList(this.myDate);
      // }

      this.isChangePage = true;
      this.$emit('changeMonth', this.listLength)
      // this.getList(this.myDate);
    },
    forMatArgs: function () {
      let markDate = this.markDate;
      let markDateMore = this.markDateMore;
      markDate = markDate.map((k) => {
        return timeUtil.dateFormat(k);
      })
      markDateMore = markDateMore.map((k) => {
        k.date = timeUtil.dateFormat(k.date)
        return k;
      })
      return [markDate, markDateMore];
    },
    getList: function (date, chooseDay, isChosedDay = true) {
      console.log( this.everyChooseDay )
      const [markDate, markDateMore] = this.forMatArgs();
      var myDate = new Date();
      let currentYear = myDate.getFullYear()
      if( date.getFullYear() != currentYear ){
        this.dateTop = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      }else{
        this.dateTop = `${date.getMonth() + 1}月`;
      }
      
      let arr = timeUtil.getMonthList(this.myDate);
      for (let i = 0; i < arr.length; i++) {

        let reg = new RegExp( '/', 'g' )
        arr[i].date = arr[i].date.replace(reg, "-");
        arr[i].clockTime = 0;
        let arrYear = arr[i].date.split("-")[0]
        let arrMonth = arr[i].date.split("-")[1] <10 ? "0"+arr[i].date.split("-")[1] : arr[i].date.split("-")[1]
        let arrDay = arr[i].date.split("-")[2] <10 ? "0"+arr[i].date.split("-")[2] : arr[i].date.split("-")[2]
        arr[i].date = arrYear+"-"+arrMonth+"-"+arrDay

        let markClassName = '';
        let k = arr[i];
        k.chooseDay = false;
        const nowTime = k.date;
        const t = new Date(nowTime).getTime() / 1000;
        //看每一天的class
        for (const c of markDateMore) {
          if (c.date === nowTime) {
            markClassName = c.className || '';
          }
        }
        //标记选中某些天 设置class
        k.markClassName = markClassName;
        k.isMark = markDate.indexOf(nowTime) > -1;
        //无法选中某天
        k.dayHide = t < this.agoDayHide || t > this.futureDayHide;
        if (k.isToday) {
          this.$emit('isToday', nowTime);
          this.lightDay = nowTime
          console.log( "nowTime:"+this.lightDay )
        }
        let flag = !k.dayHide && k.otherMonth === 'nowMonth';
        if (chooseDay && chooseDay === nowTime && flag) {
          this.$emit('choseDay', chooseDay);
          this.historyChose.push(nowTime);
          k.chooseDay = true;
        } else if (
          this.historyChose[this.historyChose.length - 1] === nowTime && !chooseDay && flag
        ) {
          k.chooseDay = true;
        }
        
        if( chooseDay ){
          arr[i].isToday = false
        }
        if( this.isChangePage ){
          arr[i].isToday = false
        }
        if( chooseDay ){
          this.everyChooseDay = chooseDay
        }
        if( this.isChangePage ){
          console.log( this.everyChooseDay )
          if( this.everyChooseDay ){
            console.log("21")
            arr[i].isToday = false;
          }else{
            console.log("22")
            let myMonths = ""
            myMonths = (myDate.getMonth()+1 < 10 ? (myDate.getMonth()+1) : myDate.getMonth()+1);       //获取当前月份
            this.currentMonth = myMonths
            if( arr[i].date == this.lightDay && this.dateTop.split("月")[0] == this.currentMonth ){
              arr[i].isToday = true;
            }
          }          
        }else{
          if( this.everyChooseDay ){
            arr[i].isToday = false;
          }
        }
      }
      arr.forEach( (ele, index) => {
        let reg = new RegExp( '/', 'g' )
        ele.date = ele.date.replace(reg, "-");
        ele.clockTime = 0;
      } )
      this.list = arr;
      this.listLength = arr.length;
      this.startTime = arr[0].date;
      this.endTime = arr[arr.length-1].date;
      console.log( this.startTime )
      console.log( this.endTime )
      this.getClockInfoList( this.startTime, this.endTime )

    },
    //获取打卡记录
    getClockInfoList( startTime, endTime ){
      console.log( "时间"+startTime, endTime )
      this.ceshiTimes++
      console.log(this.ceshiTimes)
        let loginUserCode = localStorage.getItem("loginUser")
        let clockTimesParams = {
          // userCode: 'likai',
          userCode: loginUserCode,
          startTime: startTime,
          endTime: endTime
        }
        console.log( clockTimesParams )
        this.$http.post( $api.api.fullUrl('getClockInfoList'),clockTimesParams,false,response => {
            // alert(JSON.stringify(response))
            console.log(response)
            if( response.code == 0 ){
              response.data.forEach((item,index) => {
                item.timeDay = item.time.split(" ")[0]
              });
            }
            let listData = this.list
            listData.forEach( (arrItem, arrIndex) => {
              let arrYear = arrItem.date.split("-")[0]
              let arrMonth = arrItem.date.split("-")[1] <10 ? arrItem.date.split("-")[1] : arrItem.date.split("-")[1]
              let arrDay = arrItem.date.split("-")[2] <10 ? arrItem.date.split("-")[2] : arrItem.date.split("-")[2]
              arrItem.date = arrYear+"-"+arrMonth+"-"+arrDay
              response.data.forEach( (resItem, resIndex) => {
                if( arrItem.date == resItem.timeDay ){
                  arrItem.clockTime ++
                }
              } )
            } )
            this.list = listData
            this.list.forEach( (listItem,listIndex) => {
              // listItem.clockTime = listItem.clockTime / (this.ceshiTimes - 1)  //待定，此方法多次点击不行
            } )
            console.log(this.list)
        } )
        
      
    }
  },
  mounted() {
    this.getList(this.myDate);
    var myDate = new Date();
    let myMonths = ""
    let myDays = ""
    myMonths = (myDate.getMonth()+1 < 10 ? (myDate.getMonth()+1) : myDate.getMonth()+1);       //获取当前月份
    myDays = myDate.getDate() + ' ';           //获取当前日期
    console.log( myMonths )
    this.currentMonth = myMonths
    this.currentDayOne = myDays
    console.log( myDays )

    let myYears = "";
    let myHours = "";
    let myMinutes = "";
    let mySeconds = "";
    myYears = myDate.getFullYear() + '-';      //获取当前年份
    myHours = myDate.getHours();       //获取当前小时数(0-23)
    myMinutes = myDate.getMinutes();     //获取当前分钟数(0-59)
    mySeconds = myDate.getSeconds();     //获取当前秒数
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

  },
  // watch: {
  //   markDate: {
  //     handler(val, oldVal) {
  //       console.log( "markDate"+val+","+oldVal )
  //       if( val != oldVal ){
  //         this.getList(this.myDate);
  //       }
  //     },
  //     deep: true
  //   },
  //   markDateMore: {
  //     handler(val, oldVal) {
  //       console.log( "markDateMore"+val+","+oldVal )
  //       if( val != oldVal ){
  //         this.getList(this.myDate);
  //       }
  //     },
  //     deep: true
  //   },
  //   agoDayHide: {
  //     handler(val, oldVal) {
  //       if( val != oldVal ){
  //         this.agoDayHide = parseInt(val);
  //         this.getList(this.myDate);
  //       }
  //     },
  //     deep: true
  //   },
  //   futureDayHide: {
  //     handler(val, oldVal) {
  //       if( val != oldVal ){
  //         this.futureDayHide = parseInt(val);
  //         this.getList(this.myDate);
  //       }
        
  //     },
  //     deep: true
  //   },
  //   sundayStart: {
  //     handler(val, oldVal) {
  //       if( val != oldVal ){
  //         this.intStart();
  //         this.getList(this.myDate);
  //       }
  //     }, deep: true
  //   }
  // }
};
</script>
<style scoped>
@media screen and (min-width: 460px) {
  .wh_item_date:hover {
    background: #71c7a5;
    cursor: pointer;
  }
}
* {
  margin: 0;
  padding: 0;
}

.wh_container {
  /* display: none; */
  max-width: 8.20rem;
  margin: auto;
  /* border-radius: 0.2rem; */
}

li {
  list-style-type: none;
}
.wh_top_changge {
  display: flex;
  border-radius: 0.18rem 0.18rem 0 0;
}

.wh_top_changge li {
  cursor: pointer;
  display: flex;
  color: #1B1B1B;
  font-family:PingFangSC-Medium;
  font-size: 0.36rem;
  font-weight: 500;
  flex: 0.5;
  justify-content: center;
  align-items: center;
  height: 0.85rem;
}
.wh_top_changge .wh_top_changge_liLeft{
  /* border-radius: 0 0.18rem 0 0; */
  border-radius: 0.18rem;
}
.wh_top_changge .wh_content_li {
  cursor: auto;
  flex: 4;
}
.wh_content_all {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
    "Helvetica Neue", STHeiti, "Microsoft Yahei", Tahoma, Simsun, sans-serif;
  background-color: #fff;
  width: 100%;
  overflow: hidden;
  padding-bottom: 0.16rem;
  border-radius: 0.18rem;
}

.wh_content {
  display: flex;
  flex-wrap: wrap;
  padding: 0 3% 0 3%;
  width: 100%;
}

.wh_content:first-child .wh_content_item_tag,
.wh_content:first-child .wh_content_item {
  color: #2C2C2C;
  font-size: 0.32rem;
}

.wh_content_item,
.wh_content_item_tag {
  font-size: 0.3rem;
  width: 13.4%;
  text-align: center;
  color: #2C2C2C;
  position: relative;
}
.wh_content_item {
  height: 0.6rem;
}

.wh_top_tag {
  width: 0.8rem;
  height: 0.8rem;
  line-height: 0.8rem;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #969696;
}

.wh_item_date {
  width: 0.8rem;
  height: 0.6rem;
  line-height: 0.8rem;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wh_jiantou1 {
  width: 0.24rem;
  height: 0.24rem;
  border-top: 0.04rem solid #E7E7E7;
  border-left: 0.04rem solid #E7E7E7;
  transform: rotate(-45deg);
}

.wh_jiantou1:active,
.wh_jiantou2:active {
  border-color: #ddd;
}

.wh_jiantou2 {
  width: 0.24rem;
  height: 0.24rem;
  border-top: 0.04rem solid #E7E7E7;
  border-right: 0.04rem solid #E7E7E7;
  transform: rotate(45deg);
}
.wh_content_item > .wh_isMark {
  margin: auto;
  border-radius: 2rem;
  background: blue;
  z-index: 2;
}
.wh_content_item .wh_other_dayhide {
  color: #bfbfbf;
}
.wh_content_item .wh_want_dayhide {
  color: #bfbfbf;
}
.wh_content_item .wh_isToday {
  background:linear-gradient(0deg,rgba(255,179,22,1) 0%,rgba(254,195,4,1) 100%);
  border-radius: 2rem;
  /* color: #fff; */
}
.wh_content_item .wh_chose_day {
  /* background: green; */
  background:linear-gradient(0deg,rgba(255,179,22,1) 0%,rgba(254,195,4,1) 100%);
  border-radius: 2rem;
}
.isMulPoint{
  width: 0.06rem;
  height: 0.06rem;
  background:linear-gradient(0deg,rgba(255,179,22,1) 0%,rgba(254,195,4,1) 100%);
  border-radius: 50%;
  position: absolute;
  top: 29%;
  left: 65%;
}
.isNotMulPoint{
  width: 0.06rem;
  height: 0.06rem;
  background:#CB0606;
  border-radius: 50%;
  position: absolute;
  top: 29%;
  left: 65%;
}
</style>