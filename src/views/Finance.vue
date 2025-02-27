<template>
  <div class="finance">
    <div class="header">
      <h2>财务结算</h2>
      <div class="header-operations">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增账单
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>导出账单
        </el-button>
        <el-button type="success" @click="handleBatchPay">
          <el-icon><Wallet /></el-icon>批量结算
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索账单..."
        style="width: 200px"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :shortcuts="dateShortcuts"
        style="margin-left: 10px"
      />
      <el-select
        v-model="billType"
        placeholder="账单类型"
        clearable
        style="margin-left: 10px; width: 120px"
      >
        <el-option
          v-for="type in billTypes"
          :key="type"
          :label="type"
          :value="type"
        />
      </el-select>
      <el-select
        v-model="paymentStatus"
        placeholder="支付状态"
        clearable
        style="margin-left: 10px; width: 120px"
      >
        <el-option label="已支付" value="已支付" />
        <el-option label="待支付" value="待支付" />
        <el-option label="已取消" value="已取消" />
      </el-select>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总收入</span>
            </div>
          </template>
          <div class="card-amount income">
            ￥{{ statistics.income.toFixed(2) }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总支出</span>
            </div>
          </template>
          <div class="card-amount expense">
            ￥{{ statistics.expense.toFixed(2) }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待支付</span>
            </div>
          </template>
          <div class="card-amount warning">
            ￥{{ statistics.pending.toFixed(2) }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>结余</span>
            </div>
          </template>
          <div class="card-amount" :class="statistics.income - statistics.expense >= 0 ? 'income' : 'expense'">
            ￥{{ (statistics.income - statistics.expense).toFixed(2) }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 账单列表 -->
    <el-table
      :data="filteredBills"
      style="width: 100%; margin-top: 20px"
      v-loading="loading"
    >
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="room" label="房间号" width="100" />
      <el-table-column prop="type" label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getBillTypeTag(row.type)">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="金额" width="120">
        <template #default="{ row }">
          <span :class="{ 'income': row.type === '收入', 'expense': row.type === '支出' }">
            {{ row.type === '支出' ? '-' : '+' }}￥{{ row.amount }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTag(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="备注" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="primary" @click="handleView(row)">查看</el-button>
          <el-button 
            v-if="row.status === '待支付'"
            link 
            type="success" 
            @click="handlePay(row)"
          >
            支付
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

    <!-- 账单表单对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增账单' : dialogType === 'edit' ? '编辑账单' : '账单详情'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        :disabled="dialogType === 'view'"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="房间号" prop="room">
          <el-input v-model="form.room" />
        </el-form-item>
        <el-form-item label="账单类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择账单类型">
            <el-option
              v-for="type in billTypes"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="费用类别" prop="category">
          <el-select v-model="form.category" placeholder="请选择费用类别">
            <el-option
              v-for="category in billCategories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number 
            v-model="form.amount" 
            :min="0" 
            :precision="2"
            :step="100"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="form.paymentMethod" placeholder="请选择支付方式">
            <el-option label="现金" value="现金" />
            <el-option label="银行卡" value="银行卡" />
            <el-option label="微信" value="微信" />
            <el-option label="支付宝" value="支付宝" />
          </el-select>
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
import { Search, Plus, Download, Wallet } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索和筛选
const searchQuery = ref('')
const dateRange = ref([])
const billType = ref('')
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
  room: '',
  type: '',
  amount: 0,
  description: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  room: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  type: [{ required: true, message: '请选择账单类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
}

// 选项数据
const billTypes = ['收入', '支出']
const billCategories = [
  { label: '房费', value: '房费' },
  { label: '护理费', value: '护理费' },
  { label: '医疗费', value: '医疗费' },
  { label: '餐费', value: '餐费' },
  { label: '康复费', value: '康复费' },
  { label: '其他', value: '其他' }
]

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 账单数据
const bills = ref([
  {
    id: '1',
    date: '2025-02-20',
    name: '张建国',
    room: '301',
    type: '支出',
    amount: 2000,
    status: '已支付',
    description: '1月份房费'
  },
  {
    id: '2',
    date: '2025-02-21',
    name: '王淑芬',
    room: '302',
    type: '支出',
    amount: 2500,
    status: '待支付',
    description: '1月份房费+护理费'
  },
  {
    id: '3',
    date: '2025-02-22',
    name: '李桂芝',
    room: '303',
    type: '支出',
    amount: 3000,
    status: '已支付',
    description: '1月份房费+特需护理费'
  },
  {
    id: '4',
    date: '2025-02-22',
    name: '赵明德',
    room: '305',
    type: '支出',
    amount: 2800,
    status: '待支付',
    description: '1月份房费+医疗费'
  },
  {
    id: '5',
    date: '2025-02-23',
    name: '孙秀兰',
    room: '306',
    type: '收入',
    amount: 10000,
    status: '已支付',
    description: '预存3个月房费'
  },
  {
    id: '6',
    date: '2025-02-23',
    name: '王德福',
    room: '308',
    type: '支出',
    amount: 2200,
    status: '已支付',
    description: '1月份房费+餐费'
  },
  {
    id: '7',
    date: '2025-02-24',
    name: '张玉珍',
    room: '310',
    type: '支出',
    amount: 3500,
    status: '已支付',
    description: '1月份房费+康复理疗费'
  },
  {
    id: '8',
    date: '2025-02-24',
    name: '刘长海',
    room: '311',
    type: '支出',
    amount: 4000,
    status: '待支付',
    description: '1月份房费+特护费+医疗费'
  },
  {
    id: '9',
    date: '2025-02-25',
    name: '陈德华',
    room: '312',
    type: '收入',
    amount: 8000,
    status: '已支付',
    description: '预存2个月房费+护理费'
  },
  {
    id: '10',
    date: '2025-02-25',
    name: '刘淑英',
    room: '315',
    type: '支出',
    amount: 2600,
    status: '已支付',
    description: '1月份房费+营养餐费'
  },
  {
    id: '11',
    date: '2025-02-26',
    name: '王金凤',
    room: '316',
    type: '支出',
    amount: 3200,
    status: '待支付',
    description: '1月份房费+康复训练费'
  },
  {
    id: '12',
    date: '2025-02-26',
    name: '张宝华',
    room: '318',
    type: '收入',
    amount: 12000,
    status: '已支付',
    description: '预存半年房费'
  }
])

// 计算过滤后的数据
const filteredBills = computed(() => {
  let result = bills.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(bill => 
      bill.name.toLowerCase().includes(query) ||
      bill.room.toLowerCase().includes(query) ||
      bill.description.toLowerCase().includes(query)
    )
  }

  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    result = result.filter(bill => {
      const billDate = new Date(bill.date)
      return billDate >= dateRange.value[0] && billDate <= dateRange.value[1]
    })
  }

  // 账单类型过滤
  if (billType.value) {
    result = result.filter(bill => bill.type === billType.value)
  }

  return result
})

// 计算总数
const total = computed(() => filteredBills.value.length)

// 获取账单类型对应的标签类型
const getBillTypeTag = (type) => {
  switch (type) {
    case '收入': return 'success'
    case '支出': return 'danger'
    default: return 'info'
  }
}

// 获取状态对应的标签类型
const getStatusTag = (status) => {
  switch (status) {
    case '已支付': return 'success'
    case '待支付': return 'warning'
    case '已取消': return 'info'
    default: return ''
  }
}

// CRUD 操作处理函数
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    name: '',
    room: '',
    type: '',
    amount: 0,
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

const handlePay = (row) => {
  ElMessageBox.confirm(
    `确认支付 ${row.name} 的账单 ￥${row.amount}？`,
    '支付确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = bills.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      bills.value[index] = { ...row, status: '已支付' }
      ElMessage.success('支付成功')
    }
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        const newId = String(Math.max(...bills.value.map(item => Number(item.id))) + 1)
        bills.value.push({
          id: newId,
          date: new Date().toISOString().split('T')[0],
          ...form.value,
          status: '待支付'
        })
        ElMessage.success('添加成功')
      } else if (dialogType.value === 'edit') {
        const index = bills.value.findIndex(item => item.id === form.value.id)
        if (index !== -1) {
          bills.value[index] = { ...form.value }
          ElMessage.success('修改成功')
        }
      }
      dialogVisible.value = false
    }
  })
}

// 收支统计
const statistics = computed(() => {
  const income = bills.value
    .filter(bill => bill.type === '收入')
    .reduce((sum, bill) => sum + bill.amount, 0)
  
  const expense = bills.value
    .filter(bill => bill.type === '支出')
    .reduce((sum, bill) => sum + bill.amount, 0)
  
  const pending = bills.value
    .filter(bill => bill.status === '待支付')
    .reduce((sum, bill) => sum + bill.amount, 0)
  
  return { income, expense, pending }
})
</script>

<style scoped>
.finance {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.income {
  color: #67C23A;
  font-weight: bold;
}

.expense {
  color: #F56C6C;
  font-weight: bold;
}

.statistics-cards {
  margin-top: 20px;
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

.warning {
  color: #E6A23C;
}

.header-operations {
  display: flex;
  gap: 10px;
}

.header-operations .el-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

:deep(.el-input-number .el-input__wrapper) {
  width: 180px;
}

.el-table {
  margin-top: 15px;
  border-radius: 4px;
  overflow: hidden;
}
</style> 