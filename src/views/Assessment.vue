<template>
  <div class="assessment">
    <div class="header">
      <h2>评估管理</h2>
      <el-button type="primary" @click="handleAdd">新增评估</el-button>
    </div>

    <!-- 评估列表 -->
    <el-card class="mt-20">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="最新评估" name="latest">
          <div class="table-operations">
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

          <el-table :data="filteredTableData" style="width: 100%" v-loading="loading">
            <el-table-column prop="date" label="评估日期" width="180" sortable />
            <el-table-column prop="name" label="老人姓名" width="120" />
            <el-table-column prop="room" label="房间号" width="100" />
            <el-table-column prop="type" label="评估类型" width="120">
              <template #default="{ row }">
                <el-tag :type="row.type === '入住评估' ? 'success' : 'warning'">
                  {{ row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="level" label="护理等级" width="120">
              <template #default="{ row }">
                <el-tag :type="getLevelType(row.level)">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="score" label="评分" width="100" sortable />
            <el-table-column prop="assessor" label="评估人" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '已完成' ? 'success' : 'info'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
                <el-button type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="评估统计" name="stats">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card>
                <template #header>
                  <div class="chart-header">
                    <span>护理等级分布</span>
                  </div>
                </template>
                <div ref="levelChartRef" style="height: 300px"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <template #header>
                  <div class="chart-header">
                    <span>评估趋势</span>
                  </div>
                </template>
                <div ref="trendChartRef" style="height: 300px"></div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 评估表单对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增评估' : dialogType === 'edit' ? '编辑评估' : '评估详情'"
      v-model="dialogVisible"
      width="800px"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="120px"
        :disabled="dialogType === 'view'"
      >
        <el-form-item label="评估对象" prop="name">
          <el-select
            v-model="form.name"
            filterable
            placeholder="请选择老人"
            @change="handlePersonChange"
          >
            <el-option
              v-for="person in elderlyList"
              :key="person.id"
              :label="person.name"
              :value="person.name"
            >
              <span>{{ person.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ person.room }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="评估类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="入住评估">入住评估</el-radio>
            <el-radio label="定期评估">定期评估</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-divider>基本评估项</el-divider>

        <el-form-item label="生活自理能力" prop="selfCare">
          <el-rate v-model="form.selfCare" :max="3" show-score />
        </el-form-item>

        <el-form-item label="认知能力" prop="cognition">
          <el-rate v-model="form.cognition" :max="3" show-score />
        </el-form-item>

        <el-form-item label="情绪状态" prop="emotion">
          <el-rate v-model="form.emotion" :max="3" show-score />
        </el-form-item>

        <el-form-item label="社会参与" prop="social">
          <el-rate v-model="form.social" :max="3" show-score />
        </el-form-item>

        <el-divider>健康状况</el-divider>

        <el-form-item label="慢性病情况" prop="chronicDiseases">
          <el-checkbox-group v-model="form.chronicDiseases">
            <el-checkbox label="高血压">高血压</el-checkbox>
            <el-checkbox label="糖尿病">糖尿病</el-checkbox>
            <el-checkbox label="心脏病">心脏病</el-checkbox>
            <el-checkbox label="关节炎">关节炎</el-checkbox>
            <el-checkbox label="其他">其他</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="备注说明" prop="remarks">
          <el-input
            v-model="form.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入评估备注"
          />
        </el-form-item>

        <el-form-item label="评估人" prop="assessor">
          <el-input v-model="form.assessor" placeholder="请输入评估人姓名" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" v-if="dialogType !== 'view'">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

// 标签页
const activeTab = ref('latest')

// 搜索和分页
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 图表引用
const levelChartRef = ref(null)
const trendChartRef = ref(null)

// 图表实例
let levelChart = null
let trendChart = null

// 老人列表（从登记管理获取）
const elderlyList = ref([
  { id: '1', name: '张建国', room: '301' },
  { id: '2', name: '王淑芬', room: '302' },
  { id: '3', name: '刘建德', room: '303' },
  { id: '4', name: '李桂芝', room: '305' },
  { id: '5', name: '赵明德', room: '306' },
  { id: '6', name: '孙秀兰', room: '308' },
  { id: '7', name: '王德福', room: '309' },
  { id: '8', name: '张玉珍', room: '310' },
  { id: '9', name: '李长海', room: '311' },
  { id: '10', name: '赵淑华', room: '312' }
])

// 评估数据
const tableData = ref([
  {
    id: '1',
    date: '2025-02-20',
    name: '张建国',
    room: '301',
    type: '入住评估',
    level: '中度照护',
    score: 75,
    assessor: '王医生',
    status: '已完成'
  },
  {
    id: '2',
    date: '2025-02-19',
    name: '王淑芬',
    room: '302',
    type: '定期评估',
    level: '轻度照护',
    score: 85,
    assessor: '李医生',
    status: '已完成'
  },
  {
    id: '3',
    date: '2025-02-18',
    name: '张宝华',
    room: '318',
    type: '定期评估',
    level: '重度照护',
    score: 65,
    assessor: '张医生',
    status: '已完成'
  },
  {
    id: '4',
    date: '2025-02-18',
    name: '刘淑英',
    room: '319',
    type: '定期评估',
    level: '重度照护',
    score: 60,
    assessor: '陈医生',
    status: '已完成'
  },
  {
    id: '5',
    date: '2025-02-17',
    name: '陈宝山',
    room: '320',
    type: '入住评估',
    level: '中度照护',
    score: 78,
    assessor: '赵医生',
    status: '已完成'
  },
  {
    id: '6',
    date: '2025-02-17',
    name: '李秀珍',
    room: '321',
    type: '定期评估',
    level: '重度照护',
    score: 55,
    assessor: '孙医生',
    status: '已完成'
  },
  {
    id: '7',
    date: '2025-02-16',
    name: '王德明',
    room: '322',
    type: '入住评估',
    level: '中度照护',
    score: 72,
    assessor: '周医生',
    status: '已完成'
  },
  {
    id: '8',
    date: '2025-02-16',
    name: '张玉兰',
    room: '323',
    type: '定期评估',
    level: '重度照护',
    score: 58,
    assessor: '吴医生',
    status: '已完成'
  },
  {
    id: '9',
    date: '2025-02-15',
    name: '赵淑华',
    room: '315',
    type: '入住评估',
    level: '重度照护',
    score: 55,
    assessor: '杨医生',
    status: '已完成'
  },
  {
    id: '10',
    date: '2025-02-15',
    name: '王金凤',
    room: '316',
    type: '定期评估',
    level: '中度照护',
    score: 75,
    assessor: '林医生',
    status: '已完成'
  },
  {
    id: '11',
    date: '2025-02-14',
    name: '张宝华',
    room: '318',
    type: '定期评估',
    level: '轻度照护',
    score: 85,
    assessor: '黄医生',
    status: '已完成'
  },
  {
    id: '12',
    date: '2025-02-14',
    name: '刘淑英',
    room: '319',
    type: '入住评估',
    level: '重度照护',
    score: 52,
    assessor: '马医生',
    status: '已完成'
  },
  {
    id: '13',
    date: '2025-02-13',
    name: '陈宝山',
    room: '320',
    type: '定期评估',
    level: '中度照护',
    score: 78,
    assessor: '胡医生',
    status: '已完成'
  },
  {
    id: '14',
    date: '2025-02-13',
    name: '李秀珍',
    room: '321',
    type: '定期评估',
    level: '重度照护',
    score: 58,
    assessor: '朱医生',
    status: '已完成'
  },
  {
    id: '15',
    date: '2025-02-12',
    name: '王德明',
    room: '322',
    type: '入住评估',
    level: '中度照护',
    score: 72,
    assessor: '徐医生',
    status: '已完成'
  },
  {
    id: '16',
    date: '2025-02-12',
    name: '张玉兰',
    room: '323',
    type: '定期评估',
    level: '轻度照护',
    score: 88,
    assessor: '何医生',
    status: '已完成'
  },
  {
    id: '17',
    date: '2025-02-11',
    name: '刘长春',
    room: '325',
    type: '入住评估',
    level: '中度照护',
    score: 76,
    assessor: '高医生',
    status: '已完成'
  },
  {
    id: '18',
    date: '2025-02-11',
    name: '孙桂英',
    room: '326',
    type: '定期评估',
    level: '重度照护',
    score: 50,
    assessor: '彭医生',
    status: '已完成'
  }
])

// 评估记录数据
const healthRecords = ref([
  {
    id: '13',
    name: '张宝华',
    room: '318',
    age: 78,
    bloodType: 'B',
    chronicDiseases: ['高血压', '糖尿病', '冠心病'],
    lastExamDate: '2025-02-18',
    healthStatus: '需注意',
    medicalHistory: '2022年冠脉支架手术，长期服用降压药'
  },
  {
    id: '14',
    name: '刘淑英',
    room: '319',
    age: 82,
    bloodType: 'AB',
    chronicDiseases: ['帕金森', '骨质疏松', '高血压'],
    lastExamDate: '2025-02-19',
    healthStatus: '需注意',
    medicalHistory: '帕金森病5年，多次骨折史'
  },
  {
    id: '15',
    name: '陈宝山',
    room: '320',
    age: 75,
    bloodType: 'A',
    chronicDiseases: ['慢性支气管炎', '前列腺增生'],
    lastExamDate: '2025-02-20',
    healthStatus: '稳定',
    medicalHistory: '2023年前列腺手术'
  },
  {
    id: '16',
    name: '李秀珍',
    room: '321',
    age: 85,
    bloodType: 'O',
    chronicDiseases: ['阿尔茨海默病', '高血压', '骨关节炎'],
    lastExamDate: '2025-02-21',
    healthStatus: '需注意',
    medicalHistory: '2021年确诊阿尔茨海默病，需要长期照护'
  },
  {
    id: '17',
    name: '王德明',
    room: '322',
    age: 79,
    bloodType: 'B',
    chronicDiseases: ['冠心病', '糖尿病'],
    lastExamDate: '2025-02-22',
    healthStatus: '稳定',
    medicalHistory: '糖尿病史15年，定期监测血糖'
  },
  {
    id: '18',
    name: '张玉兰',
    room: '323',
    age: 81,
    bloodType: 'A',
    chronicDiseases: ['高血压', '心律失常', '骨质疏松'],
    lastExamDate: '2025-02-23',
    healthStatus: '需注意',
    medicalHistory: '2023年安装心脏起搏器'
  },
  {
    id: '19',
    name: '刘长春',
    room: '325',
    age: 77,
    bloodType: 'O',
    chronicDiseases: ['慢性肾病', '高血压'],
    lastExamDate: '2025-02-24',
    healthStatus: '需注意',
    medicalHistory: '每周需要透析3次'
  },
  {
    id: '20',
    name: '孙桂英',
    room: '326',
    age: 83,
    bloodType: 'AB',
    chronicDiseases: ['脑梗后遗症', '高血压', '糖尿病'],
    lastExamDate: '2025-02-25',
    healthStatus: '需注意',
    medicalHistory: '2021年脑梗塞，右侧肢体偏瘫'
  },
  {
    id: '21',
    name: '赵德华',
    room: '328',
    age: 76,
    bloodType: 'B',
    chronicDiseases: ['慢性支气管炎', '高血压'],
    lastExamDate: '2025-02-26',
    healthStatus: '稳定',
    medicalHistory: '支气管炎反复发作，冬季需要特别注意'
  },
  {
    id: '22',
    name: '李玉珍',
    room: '329',
    age: 84,
    bloodType: 'A',
    chronicDiseases: ['白内障', '骨质疏松', '高血压'],
    lastExamDate: '2025-02-27',
    healthStatus: '稳定',
    medicalHistory: '2024年双眼白内障手术'
  }
])

// 添加体检记录数据
const examRecords = ref([
  {
    id: '1',
    date: '2025-02-26',
    name: '张宝华',
    examType: '常规体检',
    items: ['血常规', '血压', '心电图', '血糖'],
    doctor: '王医生',
    status: '已完成',
    result: '血压偏高，其他指标正常',
    suggestion: '建议调整降压药物剂量'
  },
  // ... 添加更多体检记录
])

// 计算过滤后的数据
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

// 获取等级标签类型
const getLevelType = (level) => {
  switch (level) {
    case '轻度照护': return ''
    case '中度照护': return 'warning'
    case '重度照护': return 'danger'
    default: return 'info'
  }
}

// 表单相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const form = ref({
  name: '',
  type: '入住评估',
  selfCare: 0,
  cognition: 0,
  emotion: 0,
  social: 0,
  chronicDiseases: [],
  remarks: '',
  assessor: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请选择评估对象', trigger: 'change' }],
  type: [{ required: true, message: '请选择评估类型', trigger: 'change' }],
  assessor: [{ required: true, message: '请输入评估人姓名', trigger: 'blur' }]
}

// 处理人员选择变化
const handlePersonChange = (value) => {
  const person = elderlyList.value.find(p => p.name === value)
  if (person) {
    form.value.room = person.room
  }
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    name: '',
    type: '入住评估',
    selfCare: 0,
    cognition: 0,
    emotion: 0,
    social: 0,
    chronicDiseases: [],
    remarks: '',
    assessor: ''
  }
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

// 处理查看
const handleView = (row) => {
  dialogType.value = 'view'
  form.value = { ...row }
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除 ${row.name} 的评估记录吗？`,
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

// 计算评估等级和分数
const calculateLevel = (form) => {
  const scores = {
    selfCare: form.selfCare * 10,
    cognition: form.cognition * 10,
    emotion: form.emotion * 10,
    social: form.social * 10
  }
  
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
  const averageScore = totalScore / 4
  
  let level = '轻度照护'
  if (averageScore < 60) {
    level = '重度照护'
  } else if (averageScore < 80) {
    level = '中度照护'
  }
  
  return {
    level,
    score: Math.round(averageScore)
  }
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      const { level, score } = calculateLevel(form.value)
      const now = new Date()
      
      if (dialogType.value === 'add') {
        // 新增
        const newId = String(Math.max(...tableData.value.map(item => Number(item.id))) + 1)
        tableData.value.push({
          id: newId,
          date: now.toISOString().split('T')[0],
          ...form.value,
          level,
          score,
          status: '已完成'
        })
        ElMessage.success('添加成功')
      } else {
        // 编辑
        const index = tableData.value.findIndex(item => item.id === form.value.id)
        if (index !== -1) {
          tableData.value[index] = {
            ...form.value,
            level,
            score
          }
          ElMessage.success('修改成功')
        }
      }
      dialogVisible.value = false
    }
  })
}

// 初始化图表函数
const initCharts = () => {
  // 确保 DOM 已经渲染
  nextTick(() => {
    if (activeTab.value === 'stats') {
      // 护理等级分布图表
      if (levelChartRef.value) {
        levelChart = echarts.init(levelChartRef.value)
        levelChart.setOption({
          title: {
            text: '护理等级分布',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}人 ({d}%)'
          },
          legend: {
            orient: 'horizontal',
            bottom: '5%',
            left: 'center'
          },
          series: [
            {
              type: 'pie',
              radius: ['40%', '70%'],
              center: ['50%', '45%'],
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: true,
                formatter: '{b}: {c}人'
              },
              data: [
                { 
                  value: 10, 
                  name: '轻度照护',
                  itemStyle: { color: '#67C23A' }
                },
                { 
                  value: 8, 
                  name: '中度照护',
                  itemStyle: { color: '#E6A23C' }
                },
                { 
                  value: 4, 
                  name: '重度照护',
                  itemStyle: { color: '#F56C6C' }
                }
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        })
      }

      // 评估趋势图表
      if (trendChartRef.value) {
        trendChart = echarts.init(trendChartRef.value)
        trendChart.setOption({
          title: {
            text: '评估分数趋势'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: [75, 78, 72, 80, 82, 85],
              type: 'line',
              smooth: true
            }
          ]
        })
      }
    }
  })
}

// 监听标签页切换
watch(activeTab, (newVal) => {
  if (newVal === 'stats') {
    initCharts()
  }
})

// 初始化图表
onMounted(() => {
  // 如果默认显示统计页，初始化图表
  if (activeTab.value === 'stats') {
    initCharts()
  }

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (levelChart) levelChart.resize()
    if (trendChart) trendChart.resize()
  })
})

// 组件卸载时销毁图表
onUnmounted(() => {
  if (levelChart) levelChart.dispose()
  if (trendChart) trendChart.dispose()
})
</script>

<style scoped>
.assessment {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-operations {
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

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}

.el-divider {
  margin: 20px 0;
}
</style> 