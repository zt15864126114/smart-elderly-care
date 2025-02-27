<template>
  <div class="devices">
    <div class="header">
      <h2>智能设备</h2>
      <div class="header-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>添加设备
        </el-button>
        <el-button type="warning" @click="handleBatchCheck">
          <el-icon><Warning /></el-icon>批量检查
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索设备..."
        style="width: 200px"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select
        v-model="deviceType"
        placeholder="设备类型"
        clearable
        style="margin-left: 10px; width: 150px"
      >
        <el-option
          v-for="type in deviceTypes"
          :key="type.value"
          :label="type.label"
          :value="type.value"
        />
      </el-select>
      <el-select
        v-model="deviceStatus"
        placeholder="设备状态"
        clearable
        style="margin-left: 10px; width: 120px"
      >
        <el-option label="在线" value="在线" />
        <el-option label="离线" value="离线" />
        <el-option label="故障" value="故障" />
      </el-select>
    </div>

    <!-- 设备状态概览 -->
    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>设备总数</span>
            </div>
          </template>
          <div class="card-amount">
            {{ devices.length }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>在线设备</span>
            </div>
          </template>
          <div class="card-amount success">
            {{ devices.filter(d => d.status === '在线').length }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>离线设备</span>
            </div>
          </template>
          <div class="card-amount warning">
            {{ devices.filter(d => d.status === '离线').length }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>故障设备</span>
            </div>
          </template>
          <div class="card-amount danger">
            {{ devices.filter(d => d.status === '故障').length }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 设备列表 -->
    <el-table
      :data="filteredDevices"
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="设备名称" width="150" />
      <el-table-column prop="type" label="设备类型" width="150">
        <template #default="{ row }">
          <el-tag>{{ getDeviceTypeName(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="安装位置" width="150" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastCheck" label="最后检查" width="180" />
      <el-table-column prop="battery" label="电量" width="180">
        <template #default="{ row }">
          <el-progress
            :percentage="row.battery"
            :status="getBatteryStatus(row.battery)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">配置</el-button>
          <el-button link type="primary" @click="handleView(row)">详情</el-button>
          <el-button link type="success" @click="handleCheck(row)">检查</el-button>
          <el-button 
            v-if="row.status === '离线'"
            link 
            type="warning" 
            @click="handleRestart(row)"
          >
            重启
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
      />
    </div>

    <!-- 设备表单对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加设备' : dialogType === 'edit' ? '设备配置' : '设备详情'"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        :disabled="dialogType === 'view'"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择设备类型">
            <el-option
              v-for="type in deviceTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="form.location" />
        </el-form-item>
        <el-form-item label="MAC地址" prop="mac">
          <el-input v-model="form.mac" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="form.ip" />
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          v-if="dialogType !== 'view'"
          type="primary"
          @click="handleSubmit"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, Plus, Warning } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索和筛选
const searchQuery = ref('')
const deviceType = ref('')
const deviceStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

// 表单数据
const form = ref({
  name: '',
  type: '',
  location: '',
  mac: '',
  ip: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
  mac: [{ required: true, message: '请输入MAC地址', trigger: 'blur' }],
  ip: [{ required: true, message: '请输入IP地址', trigger: 'blur' }]
}

// 设备类型选项
const deviceTypes = [
  { value: 'camera', label: '监控摄像头' },
  { value: 'sensor', label: '环境传感器' },
  { value: 'bracelet', label: '智能手环' },
  { value: 'mattress', label: '智能床垫' },
  { value: 'monitor', label: '生命体征监测仪' },
  { value: 'intercom', label: '对讲设备' },
  { value: 'gateway', label: '网关设备' },
  { value: 'alarm', label: '紧急呼叫器' },
  { value: 'lock', label: '智能门锁' },
  { value: 'light', label: '智能照明' }
]

// 设备数据
const devices = ref([
  {
    id: '1',
    name: '呼叫器-301',
    type: 'caller',
    location: '301房间',
    status: '在线',
    lastCheck: '2025-02-26 10:00:00',
    battery: 85,
    mac: '00:11:22:33:44:55',
    ip: '192.168.1.101',
    description: '床头呼叫器'
  },
  {
    id: '2',
    name: '摄像头-大厅',
    type: 'camera',
    location: '一楼大厅',
    status: '在线',
    lastCheck: '2025-02-26 10:00:00',
    battery: 100,
    mac: '00:11:22:33:44:56',
    ip: '192.168.1.102',
    description: '大厅监控摄像头'
  },
  {
    id: '3',
    name: '手环-张建国',
    type: 'bracelet',
    location: '301房间',
    status: '在线',
    lastCheck: '2025-02-26 10:00:00',
    battery: 45,
    mac: '00:11:22:33:44:57',
    ip: '192.168.1.103',
    description: '老人定位手环'
  },
  {
    id: '4',
    name: '床垫-302',
    type: 'mattress',
    location: '302房间',
    status: '离线',
    lastCheck: '2025-02-26 09:00:00',
    battery: 20,
    mac: '00:11:22:33:44:58',
    ip: '192.168.1.104',
    description: '智能监测床垫'
  },
  {
    id: '5',
    name: '监测仪-303',
    type: 'monitor',
    location: '303房间',
    status: '故障',
    lastCheck: '2025-02-26 08:00:00',
    battery: 0,
    mac: '00:11:22:33:44:59',
    ip: '192.168.1.105',
    description: '生命体征监测仪'
  },
  {
    id: '6',
    name: '摄像头-304',
    type: 'camera',
    location: '304房间',
    status: '在线',
    lastCheck: '2025-02-26 11:30:00',
    battery: 100,
    mac: '00:11:22:33:44:60',
    ip: '192.168.1.106',
    description: '高清监控摄像头'
  },
  {
    id: '7',
    name: '传感器-305',
    type: 'sensor',
    location: '305房间',
    status: '在线',
    lastCheck: '2025-02-26 11:00:00',
    battery: 85,
    mac: '00:11:22:33:44:61',
    ip: '192.168.1.107',
    description: '温湿度空气质量传感器'
  },
  {
    id: '8',
    name: '对讲机-306',
    type: 'intercom',
    location: '306房间',
    status: '在线',
    lastCheck: '2025-02-26 10:30:00',
    battery: 90,
    mac: '00:11:22:33:44:62',
    ip: '192.168.1.108',
    description: '双向语音对讲设备'
  },
  {
    id: '9',
    name: '网关-3楼',
    type: 'gateway',
    location: '3楼走廊',
    status: '在线',
    lastCheck: '2025-02-26 10:00:00',
    battery: 100,
    mac: '00:11:22:33:44:63',
    ip: '192.168.1.109',
    description: '物联网设备网关'
  },
  {
    id: '10',
    name: '呼叫器-307',
    type: 'alarm',
    location: '307房间',
    status: '离线',
    lastCheck: '2025-02-26 09:30:00',
    battery: 15,
    mac: '00:11:22:33:44:64',
    ip: '192.168.1.110',
    description: '紧急呼叫按钮'
  },
  {
    id: '11',
    name: '门锁-308',
    type: 'lock',
    location: '308房间',
    status: '在线',
    lastCheck: '2025-02-26 09:00:00',
    battery: 75,
    mac: '00:11:22:33:44:65',
    ip: '192.168.1.111',
    description: '智能门锁'
  },
  {
    id: '12',
    name: '照明-309',
    type: 'light',
    location: '309房间',
    status: '在线',
    lastCheck: '2025-02-26 08:30:00',
    battery: 100,
    mac: '00:11:22:33:44:66',
    ip: '192.168.1.112',
    description: '智能照明控制器'
  },
  {
    id: '13',
    name: '手环-310',
    type: 'bracelet',
    location: '310房间',
    status: '故障',
    lastCheck: '2025-02-26 08:00:00',
    battery: 0,
    mac: '00:11:22:33:44:67',
    ip: '192.168.1.113',
    description: '老人定位手环'
  },
  {
    id: '14',
    name: '床垫-311',
    type: 'mattress',
    location: '311房间',
    status: '在线',
    lastCheck: '2025-02-26 07:30:00',
    battery: 95,
    mac: '00:11:22:33:44:68',
    ip: '192.168.1.114',
    description: '智能监测床垫'
  },
  {
    id: '15',
    name: '监测仪-312',
    type: 'monitor',
    location: '312房间',
    status: '在线',
    lastCheck: '2025-02-26 07:00:00',
    battery: 88,
    mac: '00:11:22:33:44:69',
    ip: '192.168.1.115',
    description: '生命体征监测仪'
  }
])

// 计算过滤后的数据
const filteredDevices = computed(() => {
  let result = devices.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(device => 
      device.name.toLowerCase().includes(query) ||
      device.location.toLowerCase().includes(query)
    )
  }

  if (deviceType.value) {
    result = result.filter(device => device.type === deviceType.value)
  }

  if (deviceStatus.value) {
    result = result.filter(device => device.status === deviceStatus.value)
  }

  return result
})

// 计算总数
const total = computed(() => filteredDevices.value.length)

// 获取设备类型名称
const getDeviceTypeName = (type) => {
  const found = deviceTypes.find(t => t.value === type)
  return found ? found.label : type
}

// 获取状态对应的类型
const getStatusType = (status) => {
  switch (status) {
    case '在线': return 'success'
    case '离线': return 'warning'
    case '故障': return 'danger'
    default: return 'info'
  }
}

// 获取电量状态
const getBatteryStatus = (battery) => {
  if (battery <= 20) return 'exception'
  if (battery <= 50) return 'warning'
  return 'success'
}

// CRUD 操作处理函数
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    name: '',
    type: '',
    location: '',
    mac: '',
    ip: '',
    description: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleView = (row) => {
  dialogType.value = 'view'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleCheck = (row) => {
  loading.value = true
  setTimeout(() => {
    ElMessage.success(`设备 ${row.name} 检查完成`)
    const index = devices.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      devices.value[index] = {
        ...row,
        lastCheck: new Date().toLocaleString(),
        status: '在线'
      }
    }
    loading.value = false
  }, 1500)
}

const handleRestart = (row) => {
  ElMessageBox.confirm(
    `确认重启设备 ${row.name}？`,
    '重启确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    loading.value = true
    setTimeout(() => {
      const index = devices.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        devices.value[index] = { ...row, status: '在线' }
      }
      ElMessage.success('设备重启成功')
      loading.value = false
    }, 2000)
  })
}

const handleBatchCheck = () => {
  loading.value = true
  setTimeout(() => {
    devices.value = devices.value.map(device => ({
      ...device,
      lastCheck: new Date().toLocaleString(),
      status: device.status === '故障' ? '故障' : '在线'
    }))
    ElMessage.success('批量检查完成')
    loading.value = false
  }, 2000)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        const newId = String(Math.max(...devices.value.map(item => Number(item.id))) + 1)
        devices.value.push({
          id: newId,
          ...form.value,
          status: '在线',
          lastCheck: new Date().toLocaleString(),
          battery: 100
        })
        ElMessage.success('添加成功')
      } else if (dialogType.value === 'edit') {
        const index = devices.value.findIndex(item => item.id === form.value.id)
        if (index !== -1) {
          devices.value[index] = { ...devices.value[index], ...form.value }
          ElMessage.success('修改成功')
        }
      }
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.devices {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-operations {
  display: flex;
  gap: 10px;
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.statistics-cards {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-amount {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

.success {
  color: #67C23A;
}

.warning {
  color: #E6A23C;
}

.danger {
  color: #F56C6C;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-progress-bar__outer) {
  background-color: #E9E9E9 !important;
}

.el-table {
  border-radius: 4px;
  overflow: hidden;
}
</style> 