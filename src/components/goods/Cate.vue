<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">

        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>

      </tree-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类dialog -->
    <el-dialog title="提示" :visible.sync="addCateDialog" width="50%" @close="lstenCloseCateAdd">
      <el-form ref="addCateFormRef" :model="addCateForm" label-width="80px" :rules="addCateFormRule">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader v-model="selectedKey" :options="parentCateList" :props="casaderData" @change="parentCateListChange" clearable change-on-select></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialog = false">取 消</el-button>
        <el-button type="primary" @click="addFinalCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      catelist: [],
      total: 0,
      columns: [
        {
          lable: '分类名称',
          prop: 'cat_name'
        }, {
          lable: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          lable: '排序',
          type: 'template',
          template: 'order'
        },
        {
          lable: '操作',
          type: 'template',
          template: 'opt'
        },
      ],
      addCateDialog: false,
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addCateFormRule: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentCateList: [],
      selectedKey: [],
      casaderData: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      }
    }
  },
  created() {
    this.getCateLists()
  },
  methods: {
    //获取商品列表
    async getCateLists() {
      const { data } = await this.$http.get('categories', { params: this.queryInfo })
      if (data.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.catelist = data.data.result
      this.total = data.data.total
    },
    //分页处理
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateLists()
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateLists()
    },
    //添加分类
    addCate() {
      //点击添加的时候就要获取父级分类数据
      this.getParentCateList()
      this.addCateDialog = true
    },
    async getParentCateList() {
      const { data } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (data.meta.status !== 200) {
        return this.$message.error('')
      }
      this.parentCateList = data.data
    },
    parentCateListChange() {
      if (this.selectedKey.length > 0) {
        this.addCateForm.cat_pid = this.selectedKey[this.selectedKey.length - 1]
        this.addCateForm.cat_level = this.selectedKey.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    //最终添加
    addFinalCate() {
      //对表单先验证
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data } = await this.$http.post('categories', this.addCateForm)
        if (data.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.addCateDialog = false
        this.getCateLists()
      })
    },
    //对添加dialog关闭行为检测
    lstenCloseCateAdd() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKey = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
</style>