<template>
  <div class="registration">
    <div class="header">
      <h2>登记管理</h2>
      <el-button type="primary" @click="handleAdd">新增老人</el-button>
    </div>

    <el-card class="mt-20">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchQuery"
          placeholder="请输入姓名或房间号搜索"
          style="width: 300px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 表格区域 -->
      <el-table :data="filteredTableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="room" label="房间号" width="100" />
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column prop="address" label="住址" min-width="300" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '在住' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 编辑/新增对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增老人' : '编辑信息'"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="form.age" :min="60" :max="120" />
        </el-form-item>
        <el-form-item label="房间号" prop="room">
          <el-input v-model="form.room" placeholder="请输入房间号" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="住址" prop="address">
          <el-input v-model="form.address" placeholder="请输入住址" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option label="在住" value="在住" />
            <el-option label="暂离" value="暂离" />
            <el-option label="退住" value="退住" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 表格数据
const tableData = ref([
  {
    id: '1',
    name: '张建国',
    gender: '男',
    age: '75',
    room: '301',
    phone: '13853798521',
    address: '济宁市汶上县郭仓镇阳光花园3号楼2单元',
    status: '在住'
  },
  {
    id: '2',
    name: '王淑芬',
    gender: '女',
    age: '68',
    room: '302',
    phone: '13969707456',
    address: '济宁市汶上县南站街道水景花园5号楼',
    status: '在住'
  },
  {
    id: '3',
    name: '刘建德',
    gender: '男',
    age: '72',
    room: '303',
    phone: '15563793367',
    address: '济宁市汶上县寅寺镇运河天地小区8号楼',
    status: '在住'
  },
  {
    id: '4',
    name: '李桂芝',
    gender: '女',
    age: '70',
    room: '305',
    phone: '13854798245',
    address: '济宁市汶上县次丘镇阳光国际小区2号楼',
    status: '在住'
  },
  {
    id: '5',
    name: '赵明德',
    gender: '男',
    age: '78',
    room: '306',
    phone: '15253797856',
    address: '济宁市汶上县南站街道运河名都3号楼',
    status: '在住'
  },
  {
    id: '6',
    name: '孙秀兰',
    gender: '女',
    age: '73',
    room: '308',
    phone: '13953795642',
    address: '济宁市汶上县汶上街道汉韵花园2号楼',
    status: '在住'
  },
  {
    id: '7',
    name: '王德福',
    gender: '男',
    age: '76',
    room: '309',
    phone: '15553792468',
    address: '济宁市汶上县苑庄镇锦绣花园6号楼',
    status: '暂离'
  },
  {
    id: '8',
    name: '张玉珍',
    gender: '女',
    age: '69',
    room: '310',
    phone: '13754796321',
    address: '济宁市汶上县白石镇康泰花园1号楼',
    status: '在住'
  },
  {
    id: '9',
    name: '李长海',
    gender: '男',
    age: '71',
    room: '311',
    phone: '13853791234',
    address: '济宁市汶上县南站街道阳光国际2期5号楼',
    status: '在住'
  },
  {
    id: '10',
    name: '赵淑华',
    gender: '女',
    age: '69',
    room: '312',
    phone: '15553795678',
    address: '济宁市汶上县郭仓镇华润中央公园3号楼',
    status: '在住'
  },
  {
    id: '11',
    name: '王宝山',
    gender: '男',
    age: '82',
    room: '315',
    phone: '13754799876',
    address: '济宁市汶上县寅寺镇运河名都6号楼',
    status: '在住'
  },
  {
    id: '12',
    name: '张桂兰',
    gender: '女',
    age: '77',
    room: '316',
    phone: '13953797890',
    address: '济宁市汶上县次丘镇锦绣华庭1号楼',
    status: '在住'
  },
  {
    id: '13',
    name: '刘德山',
    gender: '男',
    age: '75',
    room: '318',
    phone: '15563794567',
    address: '济宁市汶上县汶上街道和美家园4号楼',
    status: '暂离'
  },
  {
    id: '14',
    name: '孙兰芝',
    gender: '女',
    age: '68',
    room: '319',
    phone: '13854793456',
    address: '济宁市汶上县苑庄镇御景华庭2号楼',
    status: '在住'
  },
  {
    id: '15',
    name: '周福生',
    gender: '男',
    age: '79',
    room: '320',
    phone: '15253798901',
    address: '济宁市汶上县白石镇运河风景线5号楼',
    status: '在住'
  },
  {
    id: '16',
    name: '杨玉兰',
    gender: '女',
    age: '73',
    room: '321',
    phone: '13969702345',
    address: '济宁市汶上县南站街道水韵花都3号楼',
    status: '在住'
  },
  {
    id: '17',
    name: '吴长春',
    gender: '男',
    age: '81',
    room: '322',
    phone: '13853796789',
    address: '济宁市汶上县郭仓镇阳光馨苑1号楼',
    status: '在住'
  },
  {
    id: '18',
    name: '郭秀英',
    gender: '女',
    age: '74',
    room: '323',
    phone: '15553791122',
    address: '济宁市汶上县寅寺镇香堤雅郡4号楼',
    status: '在住'
  },
  {
    id: '19',
    name: '陈宝林',
    gender: '男',
    age: '76',
    room: '325',
    phone: '13754795544',
    address: '济宁市汶上县次丘镇运河一品7号楼',
    status: '暂离'
  },
  {
    id: '20',
    name: '徐桂花',
    gender: '女',
    age: '72',
    room: '326',
    phone: '13953793377',
    address: '济宁市汶上县汶上街道水韵华府6号楼',
    status: '在住'
  },
  {
    id: '21',
    name: '马德福',
    gender: '男',
    age: '77',
    room: '328',
    phone: '15563798899',
    address: '济宁市汶上县苑庄镇阳光里小区2号楼',
    status: '在住'
  },
  {
    id: '22',
    name: '韩秀珍',
    gender: '女',
    age: '69',
    room: '329',
    phone: '13854791010',
    address: '济宁市汶上县白石镇锦绣园5号楼',
    status: '在住'
  },
  {
    id: '23',
    name: '朱长贵',
    gender: '男',
    age: '83',
    room: '330',
    phone: '15253792233',
    address: '济宁市汶上县南站街道运河人家3号楼',
    status: '在住'
  },
  {
    id: '24',
    name: '胡玉英',
    gender: '女',
    age: '71',
    room: '331',
    phone: '13969704455',
    address: '济宁市汶上县郭仓镇水岸华府1号楼',
    status: '在住'
  },
  {
    id: '25',
    name: '江德海',
    gender: '男',
    age: '78',
    room: '332',
    phone: '13853794466',
    address: '济宁市汶上县寅寺镇阳光丽景4号楼',
    status: '暂离'
  }
])

// 搜索和分页
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 计算总数和过滤后的数据
const filteredTableData = computed(() => {
  const filtered = searchQuery.value
    ? tableData.value.filter(
        data =>
          data.name.includes(searchQuery.value) ||
          data.room.includes(searchQuery.value)
      )
    : tableData.value
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

const total = computed(() => tableData.value.length)

// 表单相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const form = ref({
  name: '',
  gender: '男',
  age: 70,
  room: '',
  phone: '',
  address: '',
  status: '在住'
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  room: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入住址', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    name: '',
    gender: '男',
    age: 70,
    room: '',
    phone: '',
    address: '',
    status: '在住'
  }
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除 ${row.name} 的信息吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    tableData.value = tableData.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 新增
        const newId = String(Math.max(...tableData.value.map(item => Number(item.id))) + 1)
        tableData.value.push({
          id: newId,
          ...form.value
        })
        ElMessage.success('添加成功')
      } else {
        // 编辑
        const index = tableData.value.findIndex(item => item.id === form.value.id)
        if (index !== -1) {
          tableData.value[index] = { ...form.value }
          ElMessage.success('修改成功')
        }
      }
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.registration {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-area {
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}
</style> 