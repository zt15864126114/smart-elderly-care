<template>
  <div class="data-center">
    <div class="header">
      <h2>数据中心</h2>
      <div class="header-operations">
        <el-radio-group v-model="timeRange" size="large">
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
          <el-radio-button label="year">本年</el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>导出报告
        </el-button>
      </div>
    </div>

    <!-- 数据概览 -->
    <el-row :gutter="20" class="data-overview">
      <el-col :span="6" v-for="card in overviewCards" :key="card.title">
        <el-card shadow="hover">
          <div class="overview-card">
            <div class="card-icon" :style="{ backgroundColor: card.color }">
              <el-icon :size="24" color="#fff"><component :is="card.icon" /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">{{ card.title }}</div>
              <div class="card-value">{{ card.value }}</div>
              <div class="card-trend" :class="card.trend > 0 ? 'up' : 'down'">
                {{ Math.abs(card.trend) }}% 
                <el-icon>
                  <CaretTop v-if="card.trend > 0" />
                  <CaretBottom v-else />
                </el-icon>
                较上期
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表分析 -->
    <el-row :gutter="20" class="chart-container">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>入住趋势分析</span>
              <el-radio-group v-model="occupancyType" size="small">
                <el-radio-button label="total">总人数</el-radio-button>
                <el-radio-button label="new">新增</el-radio-button>
                <el-radio-button label="out">离院</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="occupancyChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>年龄分布</span>
            </div>
          </template>
          <div ref="ageChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据 -->
    <el-row :gutter="20" class="detail-container">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>护理等级分布</span>
            </div>
          </template>
          <div ref="careChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>收支分析</span>
              <el-select v-model="financeType" size="small" style="width: 120px">
                <el-option label="月度" value="month" />
                <el-option label="季度" value="quarter" />
                <el-option label="年度" value="year" />
              </el-select>
            </div>
          </template>
          <div ref="financeChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时监控数据 -->
    <el-card class="monitor-card">
      <template #header>
        <div class="chart-header">
          <span>实时监控数据</span>
          <el-tag type="success">数据更新于 {{ lastUpdateTime }}</el-tag>
        </div>
      </template>
      <el-table :data="monitorData" style="width: 100%" :max-height="300">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="location" label="位置" width="120" />
        <el-table-column prop="value" label="数值" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { 
  User, 
  House, 
  Money, 
  FirstAidKit,
  Download,
  CaretTop,
  CaretBottom
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// 时间范围选择
const timeRange = ref('month')

// 数据概览卡片
const overviewCards = ref([
  {
    title: '入住人数',
    value: '168',
    trend: 5.2,
    icon: 'User',
    color: '#409EFF'
  },
  {
    title: '床位使用率',
    value: '85%',
    trend: 2.1,
    icon: 'House',
    color: '#67C23A'
  },
  {
    title: '月度收入',
    value: '￥286,420',
    trend: 8.5,
    icon: 'Money',
    color: '#E6A23C'
  },
  {
    title: '护理人次',
    value: '1,286',
    trend: -3.2,
    icon: 'FirstAidKit',
    color: '#F56C6C'
  }
])

// 图表相关
const occupancyType = ref('total')
const financeType = ref('month')
let occupancyChart = null
let ageChart = null
let careChart = null
let financeChart = null

const occupancyChartRef = ref(null)
const ageChartRef = ref(null)
const careChartRef = ref(null)
const financeChartRef = ref(null)

// 实时监控数据
const lastUpdateTime = ref(new Date().toLocaleString())
const monitorData = ref([
  {
    time: '2025-02-26 15:00:00',
    type: '温度',
    location: '3楼走廊',
    value: '24.5℃',
    status: '正常',
    description: '室内温度适宜'
  },
  {
    time: '2025-02-26 14:55:00',
    type: '湿度',
    location: '2楼活动室',
    value: '45%',
    status: '正常',
    description: '空气湿度适中'
  },
  {
    time: '2025-02-26 14:50:00',
    type: '空气质量',
    location: '1楼大厅',
    value: 'AQI 75',
    status: '良好',
    description: '空气质量良好'
  },
  {
    time: '2025-02-26 14:45:00',
    type: '噪音',
    location: '4楼休息区',
    value: '45dB',
    status: '正常',
    description: '环境安静'
  }
])

// 初始化图表
onMounted(() => {
  initOccupancyChart()
  initAgeChart()
  initCareChart()
  initFinanceChart()
})

// 入住趋势图表
const initOccupancyChart = () => {
  occupancyChart = echarts.init(occupancyChartRef.value)
  const option = {
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
        name: '入住人数',
        type: 'line',
        smooth: true,
        data: [150, 155, 0,0, 0, 0],
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.3)' },
            { offset: 1, color: 'rgba(64,158,255,0.1)' }
          ])
        }
      }
    ]
  }
  occupancyChart.setOption(option)
}

// 年龄分布图表
const initAgeChart = () => {
  ageChart = echarts.init(ageChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 0,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 20,
      formatter: name => {
        const item = option.series[0].data.find(item => item.name === name)
        return `${name}: ${item.value}人`
      }
    },
    series: [
      {
        name: '年龄分布',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{d}%',
          fontSize: 12
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10
        },
        data: [
          { 
            value: 35, 
            name: '60-70岁',
            itemStyle: { color: '#91cc75' }
          },
          { 
            value: 45, 
            name: '70-80岁',
            itemStyle: { color: '#fac858' }
          },
          { 
            value: 65, 
            name: '80-90岁',
            itemStyle: { color: '#ee6666' }
          },
          { 
            value: 23, 
            name: '90岁以上',
            itemStyle: { color: '#73c0de' }
          }
        ]
      }
    ]
  }
  ageChart.setOption(option)
}

// 护理等级分布图表
const initCareChart = () => {
  careChart = echarts.init(careChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: ['特级护理', '一级护理', '二级护理', '三级护理']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: [25, 45, 58, 40],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  }
  careChart.setOption(option)
}

// 收支分析图表
const initFinanceChart = () => {
  financeChart = echarts.init(financeChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['收入', '支出']
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
        name: '收入',
        type: 'line',
        data: [280000, 285000, 0, 0, 0, 0],
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '支出',
        type: 'line',
        data: [220000, 225000, 0, 0, 0, 0],
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  }
  financeChart.setOption(option)
}

// 状态标签类型
const getStatusType = (status) => {
  switch (status) {
    case '正常': return 'success'
    case '良好': return 'success'
    case '警告': return 'warning'
    case '异常': return 'danger'
    default: return 'info'
  }
}

// 导出报告
const handleExport = () => {
  ElMessage.success('报告导出中...')
}
</script>

<style scoped>
.data-center {
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
  gap: 15px;
}

.data-overview {
  margin-bottom: 20px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 15px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.card-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-trend.up {
  color: #67C23A;
}

.card-trend.down {
  color: #F56C6C;
}

.chart-container {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitor-card {
  margin-bottom: 20px;
}

:deep(.el-card__body) {
  padding: 15px;
}
</style> 