import Vue from "vue"
import VueRouter from "vue-router"
import Login from "../components/Login.vue"
import Home from "../components/Home.vue"
import Welcome from "../components/Welcome.vue"
import User from "../components/user/User.vue"
import Right from "../components/right/Right.vue"
import Roles from "../components/right/Roles.vue"
import Cate from "../components/goods/Cate.vue"
//注册路由组件
Vue.use(VueRouter)

const routes = [
	{ path: "/", redirect: "/login" },
	{ path: "/login", component: Login },
	{
		path: "/home",
		component: Home,
		redirect: "/welcome",
		children: [
			{ path: "/welcome", component: Welcome },
			{ path: "/users", component: User },
			{ path: "/rights", component: Right },
			{ path: "/roles", component: Roles },
			{ path: "/goods", component: Cate },
		],
	},
]

const router = new VueRouter({
	routes,
})
router.beforeEach((to, from, next) => {
	if (to.path === "/login") return next()
	let tokenStr = window.sessionStorage.getItem("token")
	if (!tokenStr) return next("/login")
	next()
})
export default router
