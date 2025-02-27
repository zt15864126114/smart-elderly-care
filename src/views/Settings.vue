<template>
  <div class="settings">
    <div class="header">
      <h2>系统设置</h2>
    </div>

    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- 基础设置 -->
      <el-tab-pane label="基础设置" name="basic">
        <el-form :model="basicForm" label-width="120px">
          <el-form-item label="机构名称">
            <el-input v-model="basicForm.orgName" placeholder="请输入机构名称" />
          </el-form-item>
          <el-form-item label="机构地址">
            <el-input v-model="basicForm.address" placeholder="请输入机构地址" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="basicForm.phone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="机构简介">
            <el-input
              v-model="basicForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入机构简介"
            />
          </el-form-item>
          <el-form-item label="系统Logo">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleLogoChange"
            >
              <img v-if="basicForm.logo" :src="basicForm.logo" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 账号设置 -->
      <el-tab-pane label="账号设置" name="account">
        <el-table :data="accounts" style="width: 100%">
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="role" label="角色" width="120">
            <template #default="{ row }">
              <el-tag :type="getRoleType(row.role)">{{ row.role }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column prop="lastLogin" label="最后登录" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button-group>
                <el-button size="small" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
        <div class="table-footer">
          <el-button type="primary" @click="handleAddAccount">
            <el-icon><Plus /></el-icon>添加账号
          </el-button>
        </div>
      </el-tab-pane>

      <!-- 权限设置 -->
      <el-tab-pane label="权限设置" name="permission">
        <el-table :data="roles" style="width: 100%">
          <el-table-column prop="name" label="角色名称" width="150" />
          <el-table-column prop="description" label="角色描述" />
          <el-table-column label="权限配置" width="300">
            <template #default="{ row }">
              <el-checkbox-group v-model="row.permissions">
                <el-checkbox label="dashboard">首页概览</el-checkbox>
                <el-checkbox label="registration">登记管理</el-checkbox>
                <el-checkbox label="care">照护管理</el-checkbox>
                <el-checkbox label="finance">财务管理</el-checkbox>
              </el-checkbox-group>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button-group>
                <el-button size="small" @click="handleEditRole(row)">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button size="small" type="danger" @click="handleDeleteRole(row)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
        <div class="table-footer">
          <el-button type="primary" @click="handleAddRole">
            <el-icon><Plus /></el-icon>添加角色
          </el-button>
        </div>
      </el-tab-pane>

      <!-- 系统参数 -->
      <el-tab-pane label="系统参数" name="params">
        <el-form :model="paramsForm" label-width="160px">
          <el-form-item label="数据备份周期">
            <el-select v-model="paramsForm.backupCycle" style="width: 200px">
              <el-option label="每天" value="daily" />
              <el-option label="每周" value="weekly" />
              <el-option label="每月" value="monthly" />
            </el-select>
          </el-form-item>
          <el-form-item label="日志保留时间">
            <el-input-number 
              v-model="paramsForm.logRetention" 
              :min="1" 
              :max="365"
              style="width: 200px"
            />
            <span class="param-unit">天</span>
          </el-form-item>
          <el-form-item label="密码有效期">
            <el-input-number 
              v-model="paramsForm.passwordExpiry" 
              :min="30" 
              :max="365"
              style="width: 200px"
            />
            <span class="param-unit">天</span>
          </el-form-item>
          <el-form-item label="会话超时时间">
            <el-input-number 
              v-model="paramsForm.sessionTimeout" 
              :min="1" 
              :max="1440"
              style="width: 200px"
            />
            <span class="param-unit">分钟</span>
          </el-form-item>
          <el-form-item label="系统通知">
            <el-switch v-model="paramsForm.enableNotification" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <div class="settings-footer">
      <el-button type="primary" @click="handleSave">保存设置</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 账号编辑对话框 -->
    <el-dialog
      v-model="accountDialogVisible"
      :title="dialogType === 'add' ? '添加账号' : '编辑账号'"
      width="500px"
    >
      <el-form :model="accountForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="accountForm.username" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="accountForm.name" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="accountForm.role" style="width: 100%">
            <el-option
              v-for="role in roles"
              :key="role.name"
              :label="role.name"
              :value="role.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="accountForm.department" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="accountDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAccount">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Plus, 
  Edit, 
  Delete 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 当前激活的标签页
const activeTab = ref('basic')

// 基础设置表单
const basicForm = ref({
  orgName: '汶上县养老院',
  address: '山东省济宁市汶上县',
  phone: '0537-6532556',
  description: '汶上县养老院是一家专业的养老服务机构，致力于为老年人提供优质的养老服务。',
  logo: ''
})

// 账号数据
const accounts = ref([
  {
    username: 'admin',
    name: '管理员',
    role: '超级管理员',
    department: '管理部',
    lastLogin: '2025-02-26 14:30:00',
    status: 1
  },
  {
    username: 'nurse1',
    name: '张丽',
    role: '护理员',
    department: '护理部',
    lastLogin: '2025-02-26 13:20:00',
    status: 1
  },
  {
    username: 'doctor1',
    name: '李腾',
    role: '医生',
    department: '医疗部',
    lastLogin: '2025-02-26 12:15:00',
    status: 1
  }
])

// 角色数据
const roles = ref([
  {
    name: '超级管理员',
    description: '系统最高权限，可以进行所有操作',
    permissions: ['dashboard', 'registration', 'care', 'finance']
  },
  {
    name: '护理员',
    description: '负责日常护理工作',
    permissions: ['dashboard', 'care']
  },
  {
    name: '医生',
    description: '负责医疗相关工作',
    permissions: ['dashboard', 'care', 'registration']
  }
])

// 系统参数表单
const paramsForm = ref({
  backupCycle: 'daily',
  logRetention: 90,
  passwordExpiry: 90,
  sessionTimeout: 30,
  enableNotification: true
})

// 账号对话框相关
const accountDialogVisible = ref(false)
const dialogType = ref('add')
const accountForm = ref({
  username: '',
  name: '',
  role: '',
  department: ''
})

// Logo上传
const handleLogoChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    basicForm.value.logo = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 获取角色类型
const getRoleType = (role) => {
  switch (role) {
    case '超级管理员': return 'danger'
    case '护理员': return 'success'
    case '医生': return 'warning'
    default: return 'info'
  }
}

// 账号状态变更
const handleStatusChange = (row) => {
  ElMessage.success(`${row.username} 状态已${row.status === 1 ? '启用' : '禁用'}`)
}

// 编辑账号
const handleEdit = (row) => {
  dialogType.value = 'edit'
  accountForm.value = { ...row }
  accountDialogVisible.value = true
}

// 删除账号
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除账号 ${row.username} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    accounts.value = accounts.value.filter(item => item.username !== row.username)
    ElMessage.success('删除成功')
  })
}

// 添加账号
const handleAddAccount = () => {
  dialogType.value = 'add'
  accountForm.value = {
    username: '',
    name: '',
    role: '',
    department: ''
  }
  accountDialogVisible.value = true
}

// 保存账号
const handleSaveAccount = () => {
  if (dialogType.value === 'add') {
    accounts.value.push({
      ...accountForm.value,
      lastLogin: '-',
      status: 1
    })
    ElMessage.success('添加成功')
  } else {
    const index = accounts.value.findIndex(item => item.username === accountForm.value.username)
    if (index !== -1) {
      accounts.value[index] = { ...accounts.value[index], ...accountForm.value }
      ElMessage.success('修改成功')
    }
  }
  accountDialogVisible.value = false
}

// 编辑角色
const handleEditRole = (row) => {
  ElMessage.info('角色编辑功能开发中')
}

// 删除角色
const handleDeleteRole = (row) => {
  ElMessageBox.confirm(
    `确定要删除角色 ${row.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    roles.value = roles.value.filter(item => item.name !== row.name)
    ElMessage.success('删除成功')
  })
}

// 添加角色
const handleAddRole = () => {
  ElMessage.info('角色添加功能开发中')
}

// 保存设置
const handleSave = () => {
  ElMessage.success('设置保存成功')
}

// 重置设置
const handleReset = () => {
  ElMessageBox.confirm(
    '确定要重置所有设置吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('设置已重置')
  })
}
</script>

<style scoped>
.settings {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.settings-tabs {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
}

.avatar-uploader {
  width: 178px;
  height: 178px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.table-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.settings-footer {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.param-unit {
  margin-left: 10px;
  color: #909399;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style> 