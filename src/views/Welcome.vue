<template>
  <div class="welcome">
    <div class="enter-system">
      <el-button type="primary" @click="$router.push('/main/dashboard')">
        <el-icon><ArrowRight /></el-icon>
        进入系统
      </el-button>
    </div>
    <div class="welcome-left">
      <div class="bg-pattern"></div>
      <div class="welcome-text">
        <div class="title-group">
          <h1>智慧养老</h1>
          <h2>服务平台</h2>
        </div>
        <p class="slogan">
          <span>科技赋能养老服务</span>
          <span>为长者提供更好的生活</span>
        </p>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-icon">👨‍👩‍👦‍👦</div>
            <h3>200+</h3>
            <p>入住长者</p>
          </div>
          <div class="stat-item">
            <div class="stat-icon">⭐</div>
            <h3>98%</h3>
            <p>满意度</p>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🕒</div>
            <h3>24h</h3>
            <p>全天候服务</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="welcome-right">
      <div class="feature-header">
        <h2>核心功能</h2>
        <p>专业的养老服务解决方案</p>
      </div>
      <div class="feature-list">
        <div class="feature-item">
          <el-icon><User /></el-icon>
          <div class="feature-info">
            <h3>智能评估</h3>
            <p>专业的入住评估和动态跟踪</p>
          </div>
        </div>
        <div class="feature-item">
          <el-icon><FirstAidKit /></el-icon>
          <div class="feature-info">
            <h3>照护管理</h3>
            <p>个性化照护计划和执行监督</p>
          </div>
        </div>
        <div class="feature-item">
          <el-icon><Monitor /></el-icon>
          <div class="feature-info">
            <h3>设备监测</h3>
            <p>24小时实时监测和智能预警</p>
          </div>
        </div>
        <div class="feature-item">
          <el-icon><DataLine /></el-icon>
          <div class="feature-info">
            <h3>数据分析</h3>
            <p>全面的数据统计和分析报告</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User, FirstAidKit, Monitor, DataLine, ArrowRight } from '@element-plus/icons-vue'
</script>

<style scoped>
.welcome {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
  background: #fff;
  overflow: hidden;
}

.welcome-left {
  padding: 60px;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f6f8fc 0%, #edf4ff 100%);
  position: relative;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(#4a90e2 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.1;
}

.welcome-text {
  max-width: 500px;
  position: relative;
  z-index: 1;
}

.title-group {
  margin-bottom: 30px;
}

h1 {
  font-size: 48px;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.2;
  font-weight: 800;
  background: linear-gradient(45deg, #2b5876, #4e4376);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

h2 {
  font-size: 36px;
  color: #4a90e2;
  margin: 0;
  line-height: 1.2;
}

.slogan {
  font-size: 18px;
  color: #666;
  margin-bottom: 60px;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats {
  display: flex;
  gap: 40px;
  margin-bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  padding: 30px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-item h3 {
  font-size: 36px;
  background: linear-gradient(45deg, #2b5876, #4e4376);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  font-weight: 800;
}

.welcome-right {
  padding: 60px;
  display: flex;
  align-items: center;
  flex-direction: column;
  background: #fff;
}

.feature-header {
  text-align: center;
  margin-bottom: 40px;
}

.feature-header h2 {
  font-size: 32px;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.feature-header p {
  color: #666;
  font-size: 16px;
}

.feature-list {
  width: 100%;
  max-width: 600px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.feature-item:hover {
  transform: translateX(10px);
  background: linear-gradient(90deg, rgba(74, 144, 226, 0.1) 0%, transparent 100%);
  padding-left: 20px;
  border-radius: 8px;
}

.feature-item .el-icon {
  font-size: 32px;
  color: #4a90e2;
  margin-right: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f6f8fc 0%, #edf4ff 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.1);
}

.feature-info h3 {
  color: #1a1a1a;
  margin-bottom: 8px;
  font-size: 18px;
}

.feature-info p {
  color: #606266;
  font-size: 14px;
  margin: 0;
}

.enter-system {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.enter-system .el-button {
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 8px;
  background: linear-gradient(45deg, #2b5876, #4e4376);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.enter-system .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.enter-system .el-icon {
  margin-right: 8px;
}
</style> 