<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-table :data="rightList" border stripe>
        <el-table-column prop="date" label="#" type="index">
        </el-table-column>
        <el-table-column prop="authName" label="权限名称">
        </el-table-column>
        <el-table-column prop="path" label="路径">
        </el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level==0">等级 1</el-tag>
            <el-tag v-else-if="scope.row.level==1">等级 2</el-tag>
            <el-tag v-else>等级 3</el-tag>

          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rightList: []
    }
  },
  created() {
    this.getRightList()
  },
  methods: {
    async getRightList() {
      const { data } = await this.$http.get('rights/list')
      if (data.meta.status !== 200) return this.$message.error("获取权限列表失败")
      this.rightList = data.data


    }
  }
}
</script>

<style>
</style>