<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryData.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table border stripe :data="userlist">
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column prop="username" label="姓名" width="80px">
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="150px">
        </el-table-column>
        <el-table-column prop="mobile" label="电话" width="150px">
        </el-table-column>
        <el-table-column prop="role_name" label="角色" width="100%">
        </el-table-column>
        <el-table-column prop="zip" label="状态" width="130px">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="changeUserState(scope.row)">
            </el-switch>

          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template width="100%" slot-scope="scope">
            <el-button type="success" size="mini" icon="el-icon-edit" @click="editUser(scope.row.id)"></el-button>
            <el-button type="info" size="mini" icon="el-icon-delete" @click="deleteUser(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" size="mini" icon="el-icon-setting" @click="userRoleAllot(scope.row)">分配角色</el-button>
            </el-tooltip>
          </template>
        </el-table-column>

      </el-table>

      <!-- ?分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryData.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryData.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
    </el-card>

    <!-- 添加用户dialog -->
    <el-dialog title="提示" :visible.sync="dialogVisible" width="30%" @close="resetDialog">
      <el-form ref="formref" :model="userFormData" label-width="80px" :rules="userFormRule">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userFormData.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userFormData.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userFormData.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="userFormData.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserTodb">确 定</el-button>
      </span>
    </el-dialog>
    <!-- ?用户编辑dialog -->
    <el-dialog title="提示" :visible.sync="editVisible" width="30%" @close="editUserDiaClose">
      <el-form ref="editform" :model="editformData" label-width="80px" :rules="editFormRule">
        <el-form-item label="性名">
          <el-input v-model="editformData.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editformData.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editformData.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="realEditUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="提示" :visible.sync="allotUserRight" width="30%" @close="listenRoleLog">
      <div>
        <p>用户名 :{{userRoleInfo.username}}</p>
        <p>角色 :{{userRoleInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in roleLists" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotUserRight = false">取 消</el-button>
        <el-button type="primary" @click="roleFinalAllot">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import hub from '../../../tool/hub'
export default {
  data() {
    //自定义邮箱手机校验规则
    const checkmail = (rule, val, cb) => {
      const regemail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (regemail.test(val)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    const checkmobile = (rule, val, cb) => {
      const regmobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
      if (regmobile.test(val)) {
        return cb()
      }
      cb(new Error('请输入正确的手机号码'))
    }
    return {
      queryData: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userlist: [],
      total: 0,
      dialogVisible: false,
      editVisible: false,
      userFormData: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      userFormRule: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' },
        { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: checkmail, trigger: 'blur' }
        ],
        mobile: [{ required: true, message: '请输入手机', trigger: 'blur' }, { validator: checkmobile, trigger: 'blur' }]
      },
      editformData: {},
      editFormRule: {
        username: [],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: checkmail, trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入手机', trigger: 'blur' }, { validator: checkmobile, trigger: 'blur' }]

      },
      //分配角色
      allotUserRight: false,
      userRoleInfo: '',
      roleLists: '',
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
    hub.$emit('saveNavState', '/users')
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('/users', {
        params: this.queryData
      })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userlist = res.data.users
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryData.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      this.queryData.pagenum = newPage
      this.getUserList()
    },
    //改变用户状态
    async changeUserState(userinfo) {
      const { data } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (data.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('改变用户状态失败')
      }
      this.$message.success('改变用户状态成功')
    },
    //重置关闭对话框的数据
    resetDialog() {
      this.$refs.formref.resetFields()
    },
    addUserTodb() {
      //先进行验证
      this.$refs.formref.validate(async valid => {
        if (!valid) return
        //发送请求
        const { data } = await this.$http.post('users', this.userFormData)
        if (data.meta.status !== 201) {
          return Error('添加用户失败')
        }
        this.dialogVisible = false
        this.getUserList()
      })
    },
    //用户编辑功能
    async editUser(id) {
      //发起请求
      const { data } = await this.$http.get('users/' + id)
      if (data.meta.status !== 200) return this.$message.error('获取用户失败')
      this.editformData = data.data
      this.editVisible = true
    },
    editUserDiaClose() {
      //结局上一次填充后没消失问题,报错
      this.$refs.editform.resetFields()
    },
    realEditUser() {
      //先校验数据
      this.$refs.editform.validate(async valid => {
        if (!valid) return
        //发请求

        const { data } = await this.$http.put(`users/${this.editformData.id}`, {
          email: this.editformData.email, mobile: this.editformData.mobile
        })
        if (data.meta.status !== 200) return this.$message.error('更新数据失败')
        this.editVisible = false
        this.getUserList()
        this.$message.success('更新用户数据成功')
      })
    },
    async deleteUser(id) {
      const data = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (data !== 'confirm') return this.$message.info('用户取消删除')
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('用户删除失败')
      }
      this.$message.success('用户删除成功')
      this.getUserList()
    },
    //角色分配
    async userRoleAllot(userinfo) {
      this.userRoleInfo = userinfo
      //获取角色列表
      const { data } = await this.$http.get('roles')
      if (data.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleLists = data.data

      this.allotUserRight = true
    },
    //确定角色分配
    async roleFinalAllot() {
      if (!this.selectedRoleId) {
        return this.$message.error('请正确选择角色')
      }
      const { data } = await this.$http.put(`users/${this.userRoleInfo.id}/role`, { rid: this.selectedRoleId })
      if (data.meta.status !== 200) {
        return this.$message.error('设置角色失败')
      }
      this.$message.success('设置角色成功')
      this.getUserList()
      this.allotUserRight = false
    },
    listenRoleLog() {
      this.selectedRoleId = ''
      this.userRoleInfo = ''
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
</style>