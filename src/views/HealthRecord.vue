<template>
  <div class="health-record">
    <div class="header">
      <h2>健康档案</h2>
      <el-button type="primary" @click="handleAdd">新增体检记录</el-button>
    </div>

    <el-card class="mt-20">
      <el-tabs v-model="activeTab">
        <!-- 健康档案列表 -->
        <el-tab-pane label="档案列表" name="list">
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

          <el-table :data="filteredRecords" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="老人姓名" width="120" />
            <el-table-column prop="room" label="房间号" width="100" />
            <el-table-column prop="age" label="年龄" width="80" />
            <el-table-column prop="bloodType" label="血型" width="80" />
            <el-table-column prop="chronicDiseases" label="慢性病史">
              <template #default="{ row }">
                <el-tag
                  v-for="disease in row.chronicDiseases"
                  :key="disease"
                  class="mx-1"
                  size="small"
                  type="warning"
                >
                  {{ disease }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastExamDate" label="最近体检" width="180" sortable />
            <el-table-column prop="healthStatus" label="健康状况" width="120">
              <template #default="{ row }">
                <el-tag :type="getHealthStatusType(row.healthStatus)">
                  {{ row.healthStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
                <el-button type="success" size="small" @click="handleAddExam(row)">体检</el-button>
                <el-button type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
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

        <!-- 体检记录 -->
        <el-tab-pane label="体检记录" name="exam">
          <el-timeline>
            <el-timeline-item
              v-for="record in examRecords"
              :key="record.id"
              :timestamp="record.date"
              :type="getExamStatusType(record.status)"
            >
              <el-card class="timeline-card">
                <template #header>
                  <div class="card-header">
                    <span>{{ record.name }} - {{ record.examType }}</span>
                    <el-tag size="small" :type="getExamStatusType(record.status)">
                      {{ record.status }}
                    </el-tag>
                  </div>
                </template>
                <div class="card-content">
                  <p><strong>检查项目：</strong>{{ record.items.join('、') }}</p>
                  <p><strong>检查医生：</strong>{{ record.doctor }}</p>
                  <p><strong>检查结果：</strong>{{ record.result }}</p>
                  <p><strong>建议：</strong>{{ record.suggestion }}</p>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>

        <!-- 健康统计 -->
        <el-tab-pane label="健康统计" name="stats">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card>
                <template #header>
                  <div class="chart-header">
                    <span>慢性病分布</span>
                  </div>
                </template>
                <div ref="diseaseChartRef" style="height: 300px"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <template #header>
                  <div class="chart-header">
                    <span>健康状况分布</span>
                  </div>
                </template>
                <div ref="statusChartRef" style="height: 300px"></div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 健康档案表单对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增体检记录' : dialogType === 'edit' ? '编辑健康档案' : '档案详情'"
      v-model="dialogVisible"
      width="800px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        :disabled="dialogType === 'view'"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="房间号" prop="room">
          <el-input v-model="form.room" />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model="form.age" type="number" />
        </el-form-item>
        <el-form-item label="血型" prop="bloodType">
          <el-select v-model="form.bloodType" placeholder="请选择血型">
            <el-option
              v-for="type in bloodTypeOptions"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="慢性病史" prop="chronicDiseases">
          <el-select
            v-model="form.chronicDiseases"
            multiple
            placeholder="请选择慢性病史"
          >
            <el-option
              v-for="disease in chronicDiseaseOptions"
              :key="disease"
              :label="disease"
              :value="disease"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="健康状况" prop="healthStatus">
          <el-select v-model="form.healthStatus" placeholder="请选择健康状况">
            <el-option
              v-for="status in healthStatusOptions"
              :key="status"
              :label="status"
              :value="status"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="既往病史" prop="medicalHistory">
          <el-input
            v-model="form.medicalHistory"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="过敏史" prop="allergies">
          <el-input v-model="form.allergies" />
        </el-form-item>
        <el-form-item label="紧急联系人" prop="emergencyContact">
          <el-input v-model="form.emergencyContact" />
        </el-form-item>
        
        <!-- 体检记录特有字段 -->
        <template v-if="activeTab === 'exam'">
          <el-divider>体检信息</el-divider>
          <el-form-item label="体检类型" prop="examType">
            <el-select v-model="form.examType" placeholder="请选择体检类型">
              <el-option
                v-for="type in examTypeOptions"
                :key="type"
                :label="type"
                :value="type"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="检查项目" prop="items">
            <el-select
              v-model="form.items"
              multiple
              placeholder="请选择检查项目"
            >
              <el-option
                v-for="item in examItemOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="检查医生" prop="doctor">
            <el-input v-model="form.doctor" />
          </el-form-item>
          <el-form-item label="检查结果" prop="result">
            <el-input
              v-model="form.result"
              type="textarea"
              :rows="2"
            />
          </el-form-item>
          <el-form-item label="医生建议" prop="suggestion">
            <el-input
              v-model="form.suggestion"
              type="textarea"
              :rows="2"
            />
          </el-form-item>
        </template>
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'

// 标签页
const activeTab = ref('list')
const currentDate = ref(new Date())

// 搜索和分页
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 图表引用
const diseaseChartRef = ref(null)
const statusChartRef = ref(null)

// 图表实例
let diseaseChart = null
let statusChart = null

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

// 表单数据
const form = ref({
  name: '',
  room: '',
  age: '',
  bloodType: '',
  chronicDiseases: [],
  healthStatus: '',
  medicalHistory: '',
  allergies: '',
  emergencyContact: '',
  // 体检记录特有字段
  examType: '',
  items: [],
  doctor: '',
  result: '',
  suggestion: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  room: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  bloodType: [{ required: true, message: '请选择血型', trigger: 'change' }],
  healthStatus: [{ required: true, message: '请选择健康状况', trigger: 'change' }],
  emergencyContact: [{ required: true, message: '请输入紧急联系人', trigger: 'blur' }]
}

// 选项数据
const bloodTypeOptions = ['A', 'B', 'O', 'AB']
const healthStatusOptions = ['良好', '稳定', '需注意']
const chronicDiseaseOptions = [
  '高血压', '糖尿病', '心脏病', '关节炎', '骨质疏松',
  '帕金森', '阿尔茨海默病', '哮喘', '白内障', '冠心病'
]
const examTypeOptions = ['常规体检', '专项检查', '复查']
const examItemOptions = [
  '血常规', '血压测量', '心电图', '血糖检测', '骨密度测量',
  '血钙检测', '维生素D检测', '步态评估', '运动功能测试',
  '视力检查', '眼压测量', '眼底检查', '肺功能测试'
]

// 健康档案数据
const healthRecords = ref([
  {
    id: '1',
    name: '张建国',
    room: '301',
    age: '75',
    bloodType: 'A',
    chronicDiseases: ['高血压', '糖尿病'],
    lastExamDate: '2025-02-15',
    healthStatus: '良好',
    medicalHistory: '2023年做过心脏支架手术',
    allergies: '对青霉素过敏',
    emergencyContact: '张小明（儿子）13800138000'
  },
  {
    id: '2',
    name: '王淑芬',
    room: '302',
    age: '68',
    bloodType: 'B',
    chronicDiseases: ['高血压', '关节炎'],
    lastExamDate: '2025-02-10',
    healthStatus: '稳定',
    medicalHistory: '长期高血压病史',
    allergies: '无',
    emergencyContact: '王丽（女儿）13900139000'
  },
  {
    id: '3',
    name: '李桂芝',
    room: '303',
    age: '72',
    bloodType: 'O',
    chronicDiseases: ['心脏病', '骨质疏松'],
    lastExamDate: '2025-02-18',
    healthStatus: '需注意',
    medicalHistory: '2022年髋关节置换',
    allergies: '海鲜过敏',
    emergencyContact: '李强（儿子）13911112222'
  },
  {
    id: '4',
    name: '赵明德',
    room: '305',
    age: '80',
    bloodType: 'AB',
    chronicDiseases: ['帕金森', '高血压'],
    lastExamDate: '2025-02-12',
    healthStatus: '稳定',
    medicalHistory: '长期服用降压药',
    allergies: '无',
    emergencyContact: '赵海燕（女儿）13922223333'
  },
  {
    id: '5',
    name: '孙秀兰',
    room: '306',
    age: '69',
    bloodType: 'A',
    chronicDiseases: ['糖尿病', '白内障'],
    lastExamDate: '2025-02-20',
    healthStatus: '良好',
    medicalHistory: '2023年白内障手术',
    allergies: '磺胺类药物过敏',
    emergencyContact: '孙伟（儿子）13933334444'
  },
  {
    id: '6',
    name: '王德福',
    room: '308',
    age: '78',
    bloodType: 'B',
    chronicDiseases: ['冠心病', '前列腺肥大'],
    lastExamDate: '2025-02-16',
    healthStatus: '稳定',
    medicalHistory: '2021年做过心脏搭桥手术',
    allergies: '无',
    emergencyContact: '王建国（儿子）13944445555'
  },
  {
    id: '7',
    name: '张玉珍',
    room: '310',
    age: '71',
    bloodType: 'A',
    chronicDiseases: ['哮喘', '骨关节炎'],
    lastExamDate: '2025-02-19',
    healthStatus: '稳定',
    medicalHistory: '支气管哮喘10年史',
    allergies: '花粉过敏',
    emergencyContact: '张明（儿子）13955556666'
  },
  {
    id: '8',
    name: '刘长海',
    room: '311',
    age: '82',
    bloodType: 'B',
    chronicDiseases: ['阿尔茨海默病', '高血压'],
    lastExamDate: '2025-02-17',
    healthStatus: '需注意',
    medicalHistory: '2020年确诊阿尔茨海默病',
    allergies: '无',
    emergencyContact: '刘芳（女儿）13966667777'
  },
  {
    id: '9',
    name: '陈德华',
    room: '312',
    age: '77',
    bloodType: 'O',
    chronicDiseases: ['冠心病', '糖尿病', '高血压'],
    lastExamDate: '2025-02-21',
    healthStatus: '需注意',
    medicalHistory: '2021年冠脉支架植入，糖尿病史15年',
    allergies: '对磺胺类药物过敏',
    emergencyContact: '陈晓明（儿子）13977778888'
  },
  {
    id: '10',
    name: '刘淑英',
    room: '315',
    age: '73',
    bloodType: 'A',
    chronicDiseases: ['骨质疏松', '白内障', '高血压'],
    lastExamDate: '2025-02-22',
    healthStatus: '稳定',
    medicalHistory: '2023年右眼白内障手术',
    allergies: '无',
    emergencyContact: '刘洋（儿子）13988889999'
  },
  {
    id: '11',
    name: '王金凤',
    room: '316',
    age: '81',
    bloodType: 'B',
    chronicDiseases: ['帕金森', '骨关节炎'],
    lastExamDate: '2025-02-23',
    healthStatus: '需注意',
    medicalHistory: '帕金森病史5年，定期服用左旋多巴',
    allergies: '对花生过敏',
    emergencyContact: '王建军（儿子）13999990000'
  },
  {
    id: '12',
    name: '张宝华',
    room: '318',
    age: '79',
    bloodType: 'AB',
    chronicDiseases: ['慢性支气管炎', '前列腺增生'],
    lastExamDate: '2025-02-24',
    healthStatus: '稳定',
    medicalHistory: '支气管炎反复发作20年',
    allergies: '对青霉素过敏',
    emergencyContact: '张伟（儿子）13900001111'
  }
])

// 体检记录数据
const examRecords = ref([
  {
    id: '1',
    date: '2025-02-15',
    name: '张建国',
    examType: '常规体检',
    items: ['血常规', '血压测量', '心电图', '血糖检测'],
    doctor: '李医生',
    status: '已完成',
    result: '血压偏高，其他指标正常',
    suggestion: '建议控制饮食，规律服药'
  },
  {
    id: '2',
    date: '2025-02-10',
    name: '王淑芬',
    examType: '专项检查',
    items: ['关节检查', '血压测量', 'X光检查'],
    doctor: '张医生',
    status: '已完成',
    result: '关节活动度良好，血压正常',
    suggestion: '建议继续保持，适当运动'
  },
  {
    id: '3',
    date: '2025-02-18',
    name: '李桂芝',
    examType: '骨密度检查',
    items: ['骨密度测量', '血钙检测', '维生素D检测'],
    doctor: '王医生',
    status: '已完成',
    result: '骨密度略低，维生素D不足',
    suggestion: '补充钙剂和维生素D，适当进行户外活动'
  },
  {
    id: '4',
    date: '2025-02-12',
    name: '赵明德',
    examType: '神经系统检查',
    items: ['步态评估', '运动功能测试', '血压监测'],
    doctor: '陈医生',
    status: '已完成',
    result: '步态稳定性一般，血压控制良好',
    suggestion: '继续服用降压药，加强平衡训练'
  },
  {
    id: '5',
    date: '2025-02-20',
    name: '孙秀兰',
    examType: '眼科复查',
    items: ['视力检查', '眼压测量', '眼底检查'],
    doctor: '刘医生',
    status: '已完成',
    result: '术后恢复良好，视力提升明显',
    suggestion: '注意用眼卫生，定期复查'
  },
  {
    id: '6',
    date: '2025-02-19',
    name: '张玉珍',
    examType: '呼吸系统检查',
    items: ['肺功能测试', '支气管反应性测试', '血氧饱和度监测'],
    doctor: '周医生',
    status: '已完成',
    result: '肺功能轻度受限，支气管反应性增高',
    suggestion: '规律用药，避免接触过敏原'
  },
  {
    id: '7',
    date: '2025-02-21',
    name: '陈德华',
    examType: '心脏检查',
    items: ['心电图', '血压监测', '血脂检查', '血糖检测'],
    doctor: '赵医生',
    status: '已完成',
    result: '血压偏高，血糖控制一般',
    suggestion: '调整降压药物剂量，加强血糖监测'
  },
  {
    id: '8',
    date: '2025-02-22',
    name: '刘淑英',
    examType: '骨科检查',
    items: ['骨密度测量', 'X光检查', '关节活动度评估'],
    doctor: '孙医生',
    status: '已完成',
    result: '骨密度T值-2.8，关节活动度良好',
    suggestion: '继续补钙和维生素D，保持适度运动'
  },
  {
    id: '9',
    date: '2025-02-23',
    name: '王金凤',
    examType: '神经内科检查',
    items: ['步态评估', '肌力测试', '震颤评估'],
    doctor: '李医生',
    status: '已完成',
    result: '步态不稳，轻度震颤',
    suggestion: '调整药物方案，加强平衡训练'
  },
  {
    id: '10',
    date: '2025-02-24',
    name: '张宝华',
    examType: '呼吸系统检查',
    items: ['肺功能测试', '血氧饱和度监测', '痰液检查'],
    doctor: '王医生',
    status: '已完成',
    result: '肺功能中度受限，无感染征象',
    suggestion: '保持规律用药，注意保暖防寒'
  }
])

// 计算过滤后的数据
const filteredRecords = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return healthRecords.value.filter(record => 
    record.name.toLowerCase().includes(query) ||
    record.room.toLowerCase().includes(query)
  )
})

// 计算总数
const total = computed(() => filteredRecords.value.length)

// 获取健康状况对应的标签类型
const getHealthStatusType = (status) => {
  switch (status) {
    case '良好': return 'success'
    case '稳定': return 'warning'
    case '需注意': return 'danger'
    default: return 'info'
  }
}

// 获取体检状态对应的类型
const getExamStatusType = (status) => {
  switch (status) {
    case '已完成': return 'success'
    case '进行中': return 'warning'
    case '未开始': return 'info'
    default: return ''
  }
}

// 初始化图表函数
const initCharts = () => {
  nextTick(() => {
    if (activeTab.value === 'stats') {
      // 慢性病分布图表
      if (diseaseChartRef.value) {
        diseaseChart = echarts.init(diseaseChartRef.value)
        diseaseChart.setOption({
          title: {
            text: '慢性病分布',
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
                { value: 15, name: '高血压' },
                { value: 10, name: '糖尿病' },
                { value: 8, name: '心脏病' },
                { value: 12, name: '关节炎' },
                { value: 5, name: '其他' }
              ]
            }
          ]
        })
      }

      // 健康状况分布图表
      if (statusChartRef.value) {
        statusChart = echarts.init(statusChartRef.value)
        statusChart.setOption({
          title: {
            text: '健康状况分布',
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
                  value: healthRecords.value.filter(r => r.healthStatus === '良好').length,
                  name: '良好',
                  itemStyle: { color: '#67C23A' }
                },
                { 
                  value: healthRecords.value.filter(r => r.healthStatus === '稳定').length,
                  name: '稳定',
                  itemStyle: { color: '#E6A23C' }
                },
                { 
                  value: healthRecords.value.filter(r => r.healthStatus === '需注意').length,
                  name: '需注意',
                  itemStyle: { color: '#F56C6C' }
                }
              ]
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

// 初始化
onMounted(() => {
  if (activeTab.value === 'stats') {
    initCharts()
  }

  window.addEventListener('resize', () => {
    if (diseaseChart) diseaseChart.resize()
    if (statusChart) statusChart.resize()
  })
})

// 组件卸载
onUnmounted(() => {
  if (diseaseChart) diseaseChart.dispose()
  if (statusChart) statusChart.dispose()
})

// CRUD 操作处理函数
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    name: '',
    room: '',
    age: '',
    bloodType: '',
    chronicDiseases: [],
    healthStatus: '',
    medicalHistory: '',
    allergies: '',
    emergencyContact: '',
    examType: '',
    items: [],
    doctor: '',
    result: '',
    suggestion: ''
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

const handleAddExam = (row) => {
  dialogType.value = 'add'
  activeTab.value = 'exam'
  form.value = {
    name: row.name,
    room: row.room,
    examType: '',
    items: [],
    doctor: '',
    status: '未开始',
    result: '',
    suggestion: ''
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        if (activeTab.value === 'exam') {
          // 添加体检记录
          const maxId = Math.max(...examRecords.value.map(item => Number(item.id)));
          const newId = String(maxId + 1);
          examRecords.value.push({
            id: newId,
            date: new Date().toISOString().split('T')[0],
            ...form.value,
            status: '未开始'
          });
        } else {
          // 添加健康档案
          const maxId = Math.max(...healthRecords.value.map(item => Number(item.id)));
          const newId = String(maxId + 1);
          healthRecords.value.push({
            id: newId,
            ...form.value,
            lastExamDate: new Date().toISOString().split('T')[0]
          });
        }
        ElMessage.success('添加成功');
      } else if (dialogType.value === 'edit') {
        // 编辑健康档案
        const index = healthRecords.value.findIndex(item => item.id === form.value.id);
        if (index !== -1) {
          healthRecords.value[index] = { ...form.value };
          ElMessage.success('修改成功');
        }
      }
      dialogVisible.value = false;
    }
  });
};
</script>

<style scoped>
.health-record {
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

.timeline-card {
  margin-bottom: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  font-size: 14px;
  line-height: 1.8;
}

.card-content p {
  margin: 5px 0;
}

.mx-1 {
  margin: 0 4px;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}
</style> 