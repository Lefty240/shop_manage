<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoletoWeb">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="rolesData" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级权限 -->
                    <el-tag closable @close="deleteRole(scope.row,item3.id)" v-for="(item3) in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>

        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称">
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="editRole(scope.row)">编辑</el-button>
            <el-button type="warning" size="mini" @click="roleDelete(scope.row)">删除</el-button>
            <el-button type="info" size="mini" @click="setRights(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分配权限对话框 -->
      <el-dialog title="提示" :visible.sync="dialogSetRight" width="30%" @close="lisenerClose()">
        <el-tree ref="treeRef" :props="treeProps" :data="rightList" show-checkbox node-key="id" default-expand-all :default-checked-keys="defkeys">
        </el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogSetRight = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑角色对话框 -->
      <el-dialog title="提示" :visible.sync="editRoleLog" width="30%">
        <el-form ref="roleInfoRef" :model="roleInfo" label-width="80px" :rules="roleInfoRule">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="roleInfo.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="roleInfo.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRoleLog = false">取 消</el-button>
          <el-button type="primary" @click="finalEdit">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 添加角色对话框 -->
      <el-dialog title="提示" :visible.sync="addRoleDialog" width="30%" @close="watchAddRoleDialog">
        <el-form ref="addRoleFormRef" :model="addRoleForm" label-width="80px" :rules="roleInfoRule">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRoleDialog = false">取 消</el-button>
          <el-button type="primary" @click="finalAddRole">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesData: [],
      dialogSetRight: false,
      rightList: [],
      treeProps: {
        label: 'authName',
        children: 'children'

      },
      defkeys: [],
      roleId: "",
      roleInfo: '',
      editRoleLog: false,
      roleInfoRule: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
      },
      addRoleDialog: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },

    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data } = await this.$http.get('roles')
      if (data.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesData = data.data

    },
    //删除角色权限
    async deleteRole(role, rightId) {
      const confirmStr = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmStr !== 'confirm') {
        return this.$message.error('删除权限失败')
      }
      const { data } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (data.meta.status !== 200) {
        return this.$message.error('取消授权失败')
      }
      this.$message.success('取消授权成功')

      role.children = data.data
    },
    //分配权限
    async setRights(a) {
      const { data } = await this.$http.get('rights/tree')
      if (data.meta.status !== 200) {
        return this.$message.error('获取用户权限失败')
      }

      this.$message.success('获取用户权限成功')
      this.rightList = data.data

      this.roleId = a.id
      this.defkeysReduce(a, this.defkeys)
      this.dialogSetRight = true
    },
    //递归获取id改变子级选中
    defkeysReduce(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        //开始递归
        this.defkeysReduce(item, arr)
      });
    },
    //关闭对话框重置勾选
    lisenerClose() {
      this.defkeys = []
    },
    async allotRights() {
      const rids = [...this.$refs.treeRef.getHalfCheckedKeys(), ...this.$refs.treeRef.getCheckedKeys()]
      const ridsStr = rids.join(',')
      const { data } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: ridsStr })

      if (data.meta.status !== 200) {
        return this.$message.error('分配角色权限失败')
      }
      this.$message.success('分配角色权限成功')
      this.getRolesList()
      this.dialogSetRight = false
    },
    //角色编辑
    async editRole({ id }) {
      //根据id去请求数据
      const { data } = await this.$http.get(`roles/${id}`)
      if (data.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      this.roleInfo = data.data
      console.log(this.roleInfo);
      this.editRoleLog = true
    },
    //最终角色编辑确定
    finalEdit() {
      //先对内容校验
      this.$refs.roleInfoRef.validate(async valid => {
        if (!valid) return
        //发请求更新数据
        const { data } = await this.$http.put(`roles/${this.roleInfo.roleId}`, this.roleInfo)
        if (data.meta.status !== 200) {
          return this.$message.error('角色编辑提交失败')
        }
        this.$message.success('编辑角色成功')
        this.getRolesList()
        this.editRoleLog = false
      })
    },
    //删除角色
    async roleDelete({ id }) {
      const confirm = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirm !== 'confirm') {
        return this.$message.info('取消删除')
      }
      const { data } = await this.$http.delete(`roles/${id}`)
      if (data.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除角色成功')
      this.getRolesList()
    },
    //添加角色
    addRoletoWeb() {
      this.addRoleDialog = true
    },
    finalAddRole() {
      //先对form数据验证
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        //发起请求把数据
        const { data } = await this.$http.post(`roles`, this.addRoleForm)
        if (data.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        this.getRolesList()
        this.addRoleDialog = false
      })
    },
    //监听dialog关闭事件,关了要清空相应数据,不然重新打开会有上次的数据保持
    watchAddRoleDialog() {
      this.addRoleForm = {}
    }
  },

}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>>