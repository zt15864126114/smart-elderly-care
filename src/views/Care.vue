<template>
  <div class="care">
    <div class="header">
      <h2>护理管理</h2>
      <el-button type="primary" @click="handleAdd">新增护理计划</el-button>
    </div>

    <el-card class="mt-20">
      <el-tabs v-model="activeTab">
        <!-- 护理计划列表 -->
        <el-tab-pane label="护理计划" name="plan">
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

          <el-table :data="filteredPlans" style="width: 100%" v-loading="loading">
            <el-table-column prop="name" label="老人姓名" width="120" />
            <el-table-column prop="room" label="房间号" width="100" />
            <el-table-column prop="level" label="护理等级" width="120">
              <template #default="{ row }">
                <el-tag :type="getLevelType(row.level)">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="items" label="护理项目">
              <template #default="{ row }">
                <el-tag
                  v-for="item in row.items"
                  :key="item"
                  class="mx-1"
                  size="small"
                >
                  {{ item }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="frequency" label="频次" width="150" />
            <el-table-column prop="nurse" label="责任护士" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '执行中' ? 'success' : 'info'">
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
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
              layout="total, sizes, prev, pager, next, jumper"
            />
          </div>
        </el-tab-pane>

        <!-- 执行记录 -->
        <el-tab-pane label="执行记录" name="record">
          <el-calendar v-model="currentDate">
            <template #dateCell="{ data }">
              <div class="calendar-cell">
                <p :class="['date-text', data.isSelected ? 'is-selected' : '']">
                  {{ data.day.split('-').slice(2).join('') }}
                </p>
                <div class="tasks-preview" v-if="getDateTasks(data.day).length">
                  <div 
                    v-for="(task, index) in getDateTasks(data.day).slice(0, 3)" 
                    :key="index"
                    class="task-item"
                  >
                    <el-tooltip 
                      :content="`${task.time} - ${task.name} - ${task.item}`" 
                      placement="top"
                    >
                      <el-tag 
                        size="small" 
                        :type="getTaskStatusStyle(task.status)"
                        class="task-tag"
                      >
                        {{ task.time.split(':')[0] }}:{{ task.time.split(':')[1] }}
                      </el-tag>
                    </el-tooltip>
                  </div>
                  <div v-if="getDateTasks(data.day).length > 3" class="more-tasks">
                    +{{ getDateTasks(data.day).length - 3 }}
                  </div>
                </div>
              </div>
            </template>
          </el-calendar>
        </el-tab-pane>

        <!-- 数据统计 -->
        <el-tab-pane label="数据统计" name="stats">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card>
                <template #header>
                  <div class="chart-header">
                    <span>护理任务完成情况</span>
                  </div>
                </template>
                <div ref="completionChartRef" style="height: 300px"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <template #header>
                  <div class="chart-header">
                    <span>护理项目分布</span>
                  </div>
                </template>
                <div ref="itemsChartRef" style="height: 300px"></div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 护理计划表单对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增护理计划' : dialogType === 'edit' ? '编辑护理计划' : '计划详情'"
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
        <el-form-item label="老人姓名" prop="name">
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

        <el-form-item label="护理等级" prop="level">
          <el-select v-model="form.level" placeholder="请选择护理等级">
            <el-option label="轻度照护" value="轻度照护" />
            <el-option label="中度照护" value="中度照护" />
            <el-option label="重度照护" value="重度照护" />
          </el-select>
        </el-form-item>

        <el-form-item label="护理项目" prop="items">
          <el-checkbox-group v-model="form.items">
            <el-checkbox label="生活照料">生活照料</el-checkbox>
            <el-checkbox label="清洁卫生">清洁卫生</el-checkbox>
            <el-checkbox label="用药提醒">用药提醒</el-checkbox>
            <el-checkbox label="康复训练">康复训练</el-checkbox>
            <el-checkbox label="心理慰藉">心理慰藉</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="护理频次" prop="frequency">
          <el-select v-model="form.frequency" placeholder="请选择护理频次">
            <el-option label="每天一次" value="每天一次" />
            <el-option label="每天两次" value="每天两次" />
            <el-option label="每天三次" value="每天三次" />
            <el-option label="每周三次" value="每周三次" />
          </el-select>
        </el-form-item>

        <el-form-item label="责任护士" prop="nurse">
          <el-select v-model="form.nurse" placeholder="请选择责任护士">
            <el-option label="李晓华" value="李晓华" />
            <el-option label="张玉梅" value="张玉梅" />
            <el-option label="王秀英" value="王秀英" />
            <el-option label="陈丽娟" value="陈丽娟" />
            <el-option label="刘春燕" value="刘春燕" />
          </el-select>
        </el-form-item>

        <el-form-item label="注意事项" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入注意事项"
          />
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
const activeTab = ref('plan')
const currentDate = ref(new Date())

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const form = ref({
  name: '',
  level: '',
  items: [],
  frequency: '',
  nurse: '',
  notes: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请选择老人', trigger: 'change' }],
  level: [{ required: true, message: '请选择护理等级', trigger: 'change' }],
  items: [{ required: true, message: '请选择护理项目', trigger: 'change' }],
  frequency: [{ required: true, message: '请选择护理频次', trigger: 'change' }],
  nurse: [{ required: true, message: '请选择责任护士', trigger: 'change' }]
}

// 搜索和分页
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 图表引用
const completionChartRef = ref(null)
const itemsChartRef = ref(null)

// 图表实例
let completionChart = null
let itemsChart = null

// 护理计划数据
const carePlans = ref([
  {
    id: '1',
    name: '张建国',
    room: '301',
    level: '中度照护',
    items: ['血压监测', '服药提醒', '助浴'],
    frequency: '每日三次',
    nurse: '李护士',
    status: '执行中'
  },
  {
    id: '2',
    name: '王淑芬',
    room: '302',
    level: '轻度照护',
    items: ['血糖监测', '康复训练'],
    frequency: '每日两次',
    nurse: '张护士',
    status: '执行中'
  },
  {
    id: '3',
    name: '李桂芝',
    room: '303',
    level: '重度照护',
    items: ['翻身', '管饲', '伤口护理', '血压监测'],
    frequency: '每2小时一次',
    nurse: '王护士',
    status: '执行中'
  },
  {
    id: '4',
    name: '赵明德',
    room: '305',
    level: '中度照护',
    items: ['服药提醒', '康复训练', '血压监测'],
    frequency: '每日三次',
    nurse: '刘护士',
    status: '暂停'
  },
  {
    id: '5',
    name: '孙秀兰',
    room: '306',
    level: '轻度照护',
    items: ['血糖监测', '运动陪伴'],
    frequency: '每日两次',
    nurse: '陈护士',
    status: '执行中'
  },
  {
    id: '6',
    name: '王德福',
    room: '308',
    level: '中度照护',
    items: ['血压监测', '服药提醒', '康复训练'],
    frequency: '每日三次',
    nurse: '赵护士',
    status: '执行中'
  },
  {
    id: '7',
    name: '张玉珍',
    room: '309',
    level: '重度照护',
    items: ['翻身', '管饲', '血压监测', '伤口护理'],
    frequency: '每2小时一次',
    nurse: '孙护士',
    status: '执行中'
  },
  {
    id: '8',
    name: '刘建德',
    room: '310',
    level: '中度照护',
    items: ['服药提醒', '血压监测', '助浴'],
    frequency: '每日三次',
    nurse: '周护士',
    status: '执行中'
  },
  {
    id: '9',
    name: '陈德华',
    room: '311',
    level: '轻度照护',
    items: ['康复训练', '运动陪伴'],
    frequency: '每日两次',
    nurse: '吴护士',
    status: '执行中'
  },
  {
    id: '10',
    name: '李长海',
    room: '312',
    level: '中度照护',
    items: ['血压监测', '服药提醒', '康复训练'],
    frequency: '每日三次',
    nurse: '郑护士',
    status: '执行中'
  },
  {
    id: '11',
    name: '赵淑华',
    room: '315',
    level: '重度照护',
    items: ['翻身', '管饲', '血压监测', '伤口护理', '吸痰'],
    frequency: '每2小时一次',
    nurse: '杨护士',
    status: '执行中'
  },
  {
    id: '12',
    name: '王金凤',
    room: '316',
    level: '中度照护',
    items: ['血压监测', '服药提醒', '康复训练', '助浴'],
    frequency: '每日三次',
    nurse: '林护士',
    status: '执行中'
  },
  {
    id: '13',
    name: '张宝华',
    room: '318',
    level: '轻度照护',
    items: ['血糖监测', '运动陪伴', '康复训练'],
    frequency: '每日两次',
    nurse: '黄护士',
    status: '执行中'
  },
  {
    id: '14',
    name: '刘淑英',
    room: '319',
    level: '重度照护',
    items: ['翻身', '管饲', '血压监测', '氧疗', '伤口护理'],
    frequency: '每2小时一次',
    nurse: '马护士',
    status: '执行中'
  },
  {
    id: '15',
    name: '陈宝山',
    room: '320',
    level: '中度照护',
    items: ['血压监测', '服药提醒', '康复训练', '心理辅导'],
    frequency: '每日三次',
    nurse: '胡护士',
    status: '暂停'
  },
  {
    id: '16',
    name: '李秀珍',
    room: '321',
    level: '轻度照护',
    items: ['血糖监测', '运动陪伴', '营养指导'],
    frequency: '每日两次',
    nurse: '朱护士',
    status: '执行中'
  },
  {
    id: '17',
    name: '王德明',
    room: '322',
    level: '重度照护',
    items: ['翻身', '管饲', '血压监测', '吸痰', '康复训练'],
    frequency: '每2小时一次',
    nurse: '徐护士',
    status: '执行中'
  },
  {
    id: '18',
    name: '张玉兰',
    room: '323',
    level: '中度照护',
    items: ['血压监测', '服药提醒', '助浴', '心理辅导'],
    frequency: '每日三次',
    nurse: '何护士',
    status: '执行中'
  },
  {
    id: '19',
    name: '刘长春',
    room: '325',
    level: '轻度照护',
    items: ['血糖监测', '运动陪伴', '用药指导'],
    frequency: '每日两次',
    nurse: '高护士',
    status: '执行中'
  },
  {
    id: '20',
    name: '孙桂英',
    room: '326',
    level: '重度照护',
    items: ['翻身', '管饲', '血压监测', '伤口护理', '康复训练'],
    frequency: '每2小时一次',
    nurse: '彭护士',
    status: '执行中'
  },
  {
    id: '21',
    name: '赵德华',
    room: '328',
    level: '中度照护',
    items: ['血压监测', '服药提醒', '康复训练', '营养指导'],
    frequency: '每日三次',
    nurse: '曾护士',
    status: '执行中'
  },
  {
    id: '22',
    name: '李玉珍',
    room: '329',
    level: '轻度照护',
    items: ['血糖监测', '运动陪伴', '心理辅导'],
    frequency: '每日两次',
    nurse: '萧护士',
    status: '执行中'
  },
  {
    id: '23',
    name: '王建国',
    room: '330',
    level: '重度照护',
    items: ['翻身', '管饲', '血压监测', '氧疗', '吸痰'],
    frequency: '每2小时一次',
    nurse: '潘护士',
    status: '执行中'
  },
  {
    id: '24',
    name: '张秀英',
    room: '331',
    level: '中度照护',
    items: ['血压监测', '服药提醒', '助浴', '康复训练'],
    frequency: '每日三次',
    nurse: '袁护士',
    status: '暂停'
  },
  {
    id: '25',
    name: '刘德福',
    room: '332',
    level: '轻度照护',
    items: ['血糖监测', '运动陪伴', '用药指导', '营养指导'],
    frequency: '每日两次',
    nurse: '于护士',
    status: '执行中'
  }
])

// 老人列表
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

// 护理项目列表
const careItems = [
  '生活照料',
  '清洁卫生',
  '用药提醒',
  '康复训练',
  '心理慰藉'
]

// 护士列表
const nurses = [
  '李晓华',
  '张玉梅',
  '王秀英',
  '陈丽娟',
  '刘春燕'
]

// 执行记录数据
const taskRecords = ref([])

// 生成一天的任务
const generateDayTasks = (date, isHistory = false) => {
  const tasks = []
  const baseHour = 8 // 从早上8点开始
  
  // 为每个老人生成1-2个任务
  elderlyList.value.forEach((elderly, index) => {
    const taskCount = Math.floor(Math.random() * 2) + 1
    for (let i = 0; i < taskCount; i++) {
      const hour = baseHour + Math.floor((index * 2 + i) / 4)
      const minute = ((index * 2 + i) % 4) * 15
      const status = isHistory ? '已完成' : 
        (date === new Date().toISOString().split('T')[0] && hour <= new Date().getHours()) ? 
        '进行中' : '未开始'
      
      tasks.push({
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        name: elderly.name,
        item: careItems[Math.floor(Math.random() * careItems.length)],
        status: status,
        nurse: nurses[Math.floor(Math.random() * nurses.length)]
      })
    }
  })
  
  return tasks.sort((a, b) => a.time.localeCompare(b.time))
}

// 生成一个月的任务数据
const generateMonthTasks = () => {
  const tasks = []
  const currentDate = new Date()
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const tasksPerDay = Math.floor(Math.random() * 5) + 3 // 每天3-7个任务
    for (let i = 0; i < tasksPerDay; i++) {
      const plan = carePlans.value[Math.floor(Math.random() * carePlans.value.length)]
      const hour = Math.floor(Math.random() * 12) + 8 // 8:00 - 20:00
      const minute = Math.floor(Math.random() * 60)
      tasks.push({
        date: `2025-02-${day.toString().padStart(2, '0')}`,
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        name: plan.name,
        item: plan.items[Math.floor(Math.random() * plan.items.length)],
        status: Math.random() > 0.1 ? '已完成' : '未完成' // 90%完成率
      })
    }
  }
  taskRecords.value = tasks
}

// 获取日期的任务记录
const getDateTasks = (date) => {
  const record = taskRecords.value.find(r => r.date === date)
  return record ? record.tasks : []
}

// 计算过滤后的数据
const filteredPlans = computed(() => {
  let filtered = carePlans.value.filter(plan => 
    plan.name.includes(searchQuery.value) ||
    plan.room.includes(searchQuery.value)
  )
  
  // 计算当前页的数据
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  
  return filtered.slice(startIndex, endIndex)
})

// 计算总数
const total = computed(() => carePlans.value.length)

// 获取护理等级样式
const getLevelType = (level) => {
  switch (level) {
    case '轻度照护': return 'success'
    case '中度照护': return 'warning'
    case '重度照护': return 'danger'
    default: return 'info'
  }
}

// 获取任务状态的样式
const getTaskStatusStyle = (status) => {
  switch (status) {
    case '已完成': return 'success'
    case '进行中': return 'warning'
    case '未开始': return 'info'
    default: return ''
  }
}

// 处理人员选择变化
const handlePersonChange = (value) => {
  const person = elderlyList.value.find(p => p.name === value)
  if (person) {
    form.value.room = person.room
  }
}

// 初始化图表函数
const initCharts = () => {
  nextTick(() => {
    if (activeTab.value === 'stats') {
      // 任务完成情况图表
      if (completionChartRef.value) {
        completionChart = echarts.init(completionChartRef.value)
        completionChart.setOption({
          title: {
            text: '护理任务完成情况',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['计划任务', '已完成'],
            bottom: '5%'
          },
          xAxis: {
            type: 'category',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: '计划任务',
              type: 'bar',
              data: [30, 28, 32, 30, 35, 25, 28]
            },
            {
              name: '已完成',
              type: 'bar',
              data: [28, 26, 31, 29, 32, 25, 27]
            }
          ]
        })
      }

      // 护理项目分布图表
      if (itemsChartRef.value) {
        itemsChart = echarts.init(itemsChartRef.value)
        itemsChart.setOption({
          title: {
            text: '护理项目分布',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}次 ({d}%)'
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
                formatter: '{b}: {c}次'
              },
              data: [
                { value: 45, name: '生活照料' },
                { value: 30, name: '清洁卫生' },
                { value: 35, name: '用药提醒' },
                { value: 25, name: '康复训练' },
                { value: 20, name: '心理慰藉' }
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

// 监听页码变化
watch([currentPage, pageSize], () => {
  // 当页码或每页条数变化时，如果当前页已经超出总页数，则跳转到最后一页
  const maxPage = Math.ceil(total.value / pageSize.value)
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage || 1
  }
})

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page
}

// 处理每页显示条数变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1  // 重置到第一页
}

// 初始化
onMounted(() => {
  // 生成本月的任务数据
  generateMonthTasks()

  if (activeTab.value === 'stats') {
    initCharts()
  }

  window.addEventListener('resize', () => {
    if (completionChart) completionChart.resize()
    if (itemsChart) itemsChart.resize()
  })
})

// 组件卸载
onUnmounted(() => {
  if (completionChart) completionChart.dispose()
  if (itemsChart) itemsChart.dispose()
})

// CRUD 操作处理函数
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    name: '',
    level: '',
    items: [],
    frequency: '',
    nurse: '',
    notes: ''
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

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除 ${row.name} 的护理计划吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    carePlans.value = carePlans.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        const newId = String(Math.max(...carePlans.value.map(item => Number(item.id))) + 1)
        carePlans.value.push({
          id: newId,
          ...form.value,
          status: '执行中'
        })
        ElMessage.success('添加成功')
      } else {
        const index = carePlans.value.findIndex(item => item.id === form.value.id)
        if (index !== -1) {
          carePlans.value[index] = { ...form.value }
          ElMessage.success('修改成功')
        }
      }
      dialogVisible.value = false
    }
  })
}

// 确保在切换到执行记录标签页时数据已准备好
watch(activeTab, (newVal) => {
  if (newVal === 'record' && taskRecords.value.length === 0) {
    generateMonthTasks()
  } else if (newVal === 'stats') {
    initCharts()
  }
})
</script>

<style scoped>
.care {
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

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 4px;
  min-height: 120px;
}

.date-text {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.date-text.is-selected {
  color: #409EFF;
  font-weight: bold;
}

.tasks-preview {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-item {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.task-item:hover .task-tag {
  opacity: 0.8;
}

.task-tag {
  font-size: 11px;
  padding: 0 4px;
  height: 20px;
  line-height: 18px;
  width: 45px;
  text-align: center;
  cursor: pointer;
}

.more-tasks {
  font-size: 12px;
  color: #909399;
  text-align: center;
  margin-top: 4px;
  cursor: pointer;
}

.more-tasks:hover {
  color: #409EFF;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}
</style> 