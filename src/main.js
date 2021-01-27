import Vue from "vue"
import App from "./App.vue"
import router from "./router/index"

import "./plugins/element.js"
import input from "element-ui"
import "./assets/css/global.css"
//引入字体图标
import "../fonts/iconfont.css"
Vue.config.productionTip = false
Vue.use(input)
new Vue({
	router,
	render: h => h(App),
}).$mount("#app")
