<template>
  <div class="dashboard">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in cards" :key="card.title">
        <el-card class="data-card" :body-style="{ padding: '20px' }">
          <div class="card-content">
            <div class="card-icon" :style="{ backgroundColor: card.bgColor }">
              <el-icon><component :is="card.icon" /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-title">{{ card.title }}</div>
              <div class="card-number">{{ card.number }}</div>
            </div>
          </div>
          <div class="card-footer">
            <span>{{ card.change }}</span>
            <span>较上月</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>入住情况统计</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="lineChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>设备在线状态</span>
              <el-tag size="small" type="success">98.5%</el-tag>
            </div>
          </template>
          <div ref="deviceChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 告警信息和任务 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>最近告警</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          <el-table :data="alerts" style="width: 100%" size="large">
            <el-table-column prop="time" label="时间" width="160" />
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }">
                <el-tag :type="row.tagType" size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="内容" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="chart-header">
              <span>今日待办</span>
              <el-button type="primary" link>添加任务</el-button>
            </div>
          </template>
          <div class="task-list">
            <div v-for="task in tasks" :key="task.id" class="task-item">
              <el-checkbox v-model="task.done">{{ task.content }}</el-checkbox>
              <span class="task-time">{{ task.time }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import * as echarts from 'echarts'
import { formatDate, getRecentDays } from '../utils/date'
import {
  User,
  FirstAidKit,
  Warning,
  Connection
} from '@element-plus/icons-vue'

// 数据卡片
const cards = [
  {
    title: '入住老人',
    number: '268',
    icon: 'User',
    bgColor: '#409EFF22',
    color: '#409EFF',
    change: '+12'
  },
  {
    title: '照护人员',
    number: '32',
    icon: 'FirstAidKit',
    bgColor: '#67C23A22',
    color: '#67C23A',
    change: '+2'
  },
  {
    title: '在线设备',
    number: '156/158',
    icon: 'Connection',
    bgColor: '#E6A23C22',
    color: '#E6A23C',
    change: '+5'
  },
  {
    title: '今日告警',
    number: '5',
    icon: 'Warning',
    bgColor: '#F56C6C22',
    color: '#F56C6C',
    change: '-2'
  }
]

// 时间范围选择
const timeRange = ref('month')

// 获取当前时间
const now = new Date()

// 告警列表
const alerts = [
  {
    time: formatDate(new Date(now - 1000 * 60 * 30)), // 30分钟前
    type: '跌倒告警',
    tagType: 'danger',
    content: '3号房张建国发生跌倒'
  },
  {
    time: formatDate(new Date(now - 1000 * 60 * 90)), // 90分钟前
    type: '心率异常',
    tagType: 'warning',
    content: '5号房王淑芬心率异常'
  },
  {
    time: formatDate(new Date(now - 1000 * 60 * 120)), // 120分钟前
    type: 'SOS求助',
    tagType: 'danger',
    content: '2号房刘建德按下求助按钮'
  }
]

// 任务列表
const tasks = ref([
  {
    id: 1,
    content: '张建国晨检体温记录',
    time: '09:00',
    done: true
  },
  {
    id: 2,
    content: '王淑芬用药提醒',
    time: '10:00',
    done: false
  },
  {
    id: 3,
    content: '刘建德康复训练',
    time: '14:00',
    done: false
  },
  {
    id: 4,
    content: '集体下午茶活动',
    time: '15:30',
    done: false
  }
])

// 图表相关
const lineChartRef = ref(null)
const deviceChartRef = ref(null)

// 根据时间范围获取X轴数据
const xAxisData = computed(() => {
  switch (timeRange.value) {
    case 'week':
      return getRecentDays(7)
    case 'month':
      return getRecentDays(30)
    case 'year':
      const months = []
      for (let i = 1; i <= 12; i++) {
        months.push(`${i}月`)
      }
      return months
    default:
      return []
  }
})

onMounted(() => {
  // 入住情况折线图
  const lineChart = echarts.init(lineChartRef.value)
  const updateLineChart = () => lineChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData.value
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '入住人数',
        type: 'line',
        smooth: true,
        data: timeRange.value === 'week' 
          ? [256, 259, 262, 265, 266, 267, 268]
          : timeRange.value === 'month'
          ? Array(30).fill(0).map((_, i) => 220 + Math.floor(Math.random() * 50))
          : [220, 232, 245, 239, 256, 267, 268, 270, 272, 275, 276, 278],
        areaStyle: {
          opacity: 0.1
        },
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  })

  updateLineChart()
  
  // 监听时间范围变化
  watch(timeRange, () => {
    updateLineChart()
  })

  // 设备状态饼图
  const deviceChart = echarts.init(deviceChartRef.value)
  deviceChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 135, name: '智能手环' },
          { value: 42, name: '跌倒探测器' },
          { value: 28, name: '测温一体机' },
          { value: 58, name: '紧急呼叫器' }
        ]
      }
    ]
  })

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    lineChart.resize()
    deviceChart.resize()
  })
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.data-card {
  margin-bottom: 20px;
}

.card-content {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.card-icon .el-icon {
  font-size: 24px;
  color: inherit;
}

.card-info .card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.card-info .card-number {
  font-size: 24px;
  font-weight: bold;
}

.card-footer {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 5px;
}

.mt-20 {
  margin-top: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.task-time {
  color: #909399;
  font-size: 13px;
}
</style> 