import Vue from "vue"
import { Button, Form, Message, pagination, MessageBox } from "element-ui"
Vue.use(Button)
Vue.use(Form)
Vue.use(pagination)
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
