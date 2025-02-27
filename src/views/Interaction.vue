<template>
  <div class="interaction">
    <div class="header">
      <h2>智能交互</h2>
      <div class="header-operations">
        <el-button type="primary" @click="handleStartVoice">
          <el-icon><Microphone /></el-icon>语音对话
        </el-button>
        <el-button type="success" @click="handleStartVideo">
          <el-icon><VideoCamera /></el-icon>视频通话
        </el-button>
        <el-button type="warning" @click="handleEmergency">
          <el-icon><Warning /></el-icon>紧急呼叫
        </el-button>
      </div>
    </div>

    <!-- 房间状态概览 -->
    <el-row :gutter="20" class="room-status">
      <el-col :span="8" v-for="room in activeRooms" :key="room.id">
        <el-card shadow="hover" :class="{ 'alert': room.alert }">
          <template #header>
            <div class="room-header">
              <span>{{ room.name }}</span>
              <el-tag :type="room.status === '正常' ? 'success' : 'danger'">
                {{ room.status }}
              </el-tag>
            </div>
          </template>
          <div class="room-info">
            <div class="info-item">
              <span>老人姓名：</span>
              <span>{{ room.elderName }}</span>
            </div>
            <div class="info-item">
              <span>活动状态：</span>
              <span>{{ room.activity }}</span>
            </div>
            <div class="info-item">
              <span>最近交互：</span>
              <span>{{ room.lastInteraction }}</span>
            </div>
            <div class="room-actions">
              <el-button-group>
                <el-button size="small" @click="handleVoiceCall(room)">
                  <el-icon><ChatDotRound /></el-icon>语音
                </el-button>
                <el-button size="small" type="primary" @click="handleVideoCall(room)">
                  <el-icon><VideoPlay /></el-icon>视频
                </el-button>
                <el-button size="small" type="success" @click="handleCheck(room)">
                  <el-icon><View /></el-icon>查看
                </el-button>
              </el-button-group>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 交互记录 -->
    <el-card class="interaction-log">
      <template #header>
        <div class="card-header">
          <span>交互记录</span>
          <el-radio-group v-model="logType" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="voice">语音</el-radio-button>
            <el-radio-button label="video">视频</el-radio-button>
            <el-radio-button label="emergency">紧急</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="log in filteredLogs"
          :key="log.id"
          :type="getLogType(log.type)"
          :timestamp="log.time"
          :hollow="log.status === '已结束'"
        >
          <el-card class="log-card">
            <h4>{{ log.title }}</h4>
            <p>房间：{{ log.room }}</p>
            <p>老人：{{ log.elderName }}</p>
            <p>状态：{{ log.status }}</p>
            <p>时长：{{ log.duration }}</p>
            <p>备注：{{ log.note }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 视频通话对话框 -->
    <el-dialog
      v-model="videoDialogVisible"
      title="视频通话"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="video-container">
        <div class="video-main">
          <div class="video-placeholder">
            <el-icon :size="64" color="#909399"><VideoCamera /></el-icon>
            <p>视频未连接</p>
          </div>
          <div class="video-controls">
            <el-button circle><el-icon><Microphone /></el-icon></el-button>
            <el-button circle><el-icon><VideoCamera /></el-icon></el-button>
            <el-button circle type="danger"><el-icon><CircleClose /></el-icon></el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Microphone, 
  VideoCamera, 
  Warning,
  ChatDotRound,
  VideoPlay,
  View,
  CircleClose
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 房间数据
const activeRooms = ref([
  {
    id: '1',
    name: '301房间',
    elderName: '张建国',
    status: '正常',
    activity: '在床休息',
    lastInteraction: '10分钟前',
    alert: false
  },
  {
    id: '2',
    name: '302房间',
    elderName: '王淑芬',
    status: '正常',
    activity: '看电视',
    lastInteraction: '5分钟前',
    alert: false
  },
  {
    id: '3',
    name: '303房间',
    elderName: '李桂芝',
    status: '需要关注',
    activity: '无活动',
    lastInteraction: '30分钟前',
    alert: true
  },
  {
    id: '4',
    name: '305房间',
    elderName: '赵明德',
    status: '正常',
    activity: '散步',
    lastInteraction: '15分钟前',
    alert: false
  },
  {
    id: '5',
    name: '306房间',
    elderName: '孙秀兰',
    status: '正常',
    activity: '用餐',
    lastInteraction: '20分钟前',
    alert: false
  },
  {
    id: '6',
    name: '308房间',
    elderName: '王德福',
    status: '正常',
    activity: '看书',
    lastInteraction: '25分钟前',
    alert: false
  }
])

// 交互记录
const interactionLogs = ref([
  {
    id: '1',
    type: 'voice',
    time: '2025-02-26 14:30:00',
    title: '日常问候',
    room: '301房间',
    elderName: '张建国',
    status: '已结束',
    duration: '5分钟',
    note: '心情愉快，无特殊情况'
  },
  {
    id: '2',
    type: 'emergency',
    time: '2025-02-26 14:00:00',
    title: '紧急呼叫',
    room: '303房间',
    elderName: '李桂芝',
    status: '已处理',
    duration: '10分钟',
    note: '身体不适，已通知医护人员'
  },
  {
    id: '3',
    type: 'video',
    time: '2025-02-26 13:30:00',
    title: '视频通话',
    room: '302房间',
    elderName: '王淑芬',
    status: '已结束',
    duration: '15分钟',
    note: '与家人视频通话'
  }
])

// 日志类型筛选
const logType = ref('all')
const filteredLogs = computed(() => {
  if (logType.value === 'all') return interactionLogs.value
  return interactionLogs.value.filter(log => log.type === logType.value)
})

// 获取日志类型对应的样式
const getLogType = (type) => {
  switch (type) {
    case 'voice': return 'primary'
    case 'video': return 'success'
    case 'emergency': return 'danger'
    default: return 'info'
  }
}

// 视频通话相关
const videoDialogVisible = ref(false)
const currentRoom = ref(null)

// 操作处理函数
const handleVoiceCall = (room) => {
  ElMessage.success(`开始与 ${room.name} ${room.elderName} 的语音通话`)
}

const handleVideoCall = (room) => {
  currentRoom.value = room
  videoDialogVisible.value = true
}

const handleCheck = (room) => {
  ElMessage.success(`正在查看 ${room.name} ${room.elderName} 的实时状态`)
}

const handleStartVoice = () => {
  ElMessage.info('请选择要进行语音对话的房间')
}

const handleStartVideo = () => {
  ElMessage.info('请选择要进行视频通话的房间')
}

const handleEmergency = () => {
  ElMessage.warning('已启动紧急呼叫处理流程')
}
</script>

<style scoped>
.interaction {
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

.room-status {
  margin-bottom: 20px;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-info {
  font-size: 14px;
}

.info-item {
  margin-bottom: 8px;
}

.room-actions {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.alert {
  border: 1px solid #F56C6C;
}

.alert :deep(.el-card__header) {
  background-color: #FEF0F0;
}

.interaction-log {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-card {
  margin-bottom: 10px;
}

.log-card h4 {
  margin: 0 0 10px 0;
}

.log-card p {
  margin: 5px 0;
  font-size: 14px;
}

.video-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background-color: #000;
}

.video-main {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
}

:deep(.el-timeline-item__node--normal) {
  left: -1px;
}

:deep(.el-card__body) {
  padding: 15px;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  color: #909399;
}

.video-placeholder p {
  margin-top: 16px;
  font-size: 16px;
}
</style> 