import Vue from 'vue'
import Router from 'vue-router'
import { resolve } from 'url';

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'CheckingIn',
            component: resolve => require( ['@/Attendance_clock/checkingIn'], resolve )
        },{
            path: '/clockIn',
            name: 'ClockIn',
            component: resolve => require( ['@/Attendance_clock/clockIn'], resolve )
        }
    ]
})