/* 
* @Author: zhangge
* @Date:   2018-11-07 10:58:51
* @Last Modified by:   zhangge
* @Last Modified time: 2019-01-07 19:08:12
*/

var api = {
    fullUrl (str){
        // let serverHost = "/api" //本地跨域处理
        // let serverHost = "";
        // let serverHost = "http://10.39.71.11:8089" //测试环境ip
        let serverHost = "http://dev-qxapi.qdingnet.com" //测试环境域名
        // let serverHost = "https://qxmg.qdingnet.com/api" //正式环境域名
        let api = {
            getPositionList : "/qx/qxClock/getPositionList",//获取区间、位置、MAC地址列表接口
            punchClock: "/qx/qxClock/punchClockFromWechat",//打卡接口
            getClockInfoList: "/qx/qxClock/getClockInfoList",//获取打卡记录接口
            getSignature: "/qx/wx/getSignature",//获取微信签名
            getUserInfo: "/qx/wx/userId"
        }
        return serverHost+api[str]
    }
}

export default{
    api
}