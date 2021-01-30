import Vue from "vue"
import App from "./App.vue"
import router from "./router/index"

import "./plugins/element.js"
import input from "element-ui"
import "./assets/css/global.css"
//引入字体图标
import "../fonts/iconfont.css"
//引入axios
import axios from "axios"
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"
//请求拦截器
axios.interceptors.request.use(config => {
	config.headers.Authorization = window.sessionStorage.getItem("token")
	return config
})
//相应拦截器
axios.interceptors.response.use(res => {
	if (res.data.meta.msg === "无效token" && res.data.meta.status === 400) {
		location.href = "/#/login"
	}
	return res
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.use(input)
new Vue({
	router,
	render: h => h(App),
}).$mount("#app")
