<template>
  <div class="registration">
    <h2>登记管理</h2>
    <el-card class="mt-20">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="address" label="住址" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="操作" width="200">
          <template #default>
            <el-button type="primary" size="small">编辑</el-button>
            <el-button type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tableData = ref([
  {
    id: '1',
    name: '张三',
    gender: '男',
    age: '75',
    phone: '13800138000',
    address: '北京市朝阳区某街道1号',
    status: '在住'
  },
  {
    id: '2',
    name: '李四',
    gender: '女',
    age: '68',
    phone: '13800138001',
    address: '北京市海淀区某街道2号',
    status: '在住'
  }
])
</script>

<style scoped>
.registration {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}
</style> 