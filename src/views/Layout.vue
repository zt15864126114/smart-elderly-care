<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <div class="logo-container">
        <img src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=care&backgroundColor=409EFF&radius=50&scale=90&translateY=5" alt="logo" class="logo" style="background: white; border-radius: 50%; padding: 2px;" />
        <h1 class="platform-title">智慧养老服务平台</h1>
      </div>
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical"
        router
      >
        <el-menu-item index="/main/dashboard">
          <el-icon><Monitor /></el-icon>
          <span>首页概览</span>
        </el-menu-item>
        <el-menu-item index="/main/registration">
          <el-icon><User /></el-icon>
          <span>登记管理</span>
        </el-menu-item>
        <el-menu-item index="/main/assessment">
          <el-icon><Files /></el-icon>
          <span>评估管理</span>
        </el-menu-item>
        <el-menu-item index="/main/care">
          <el-icon><FirstAidKit /></el-icon>
          <span>照护管理</span>
        </el-menu-item>
        <el-menu-item index="/main/health-record">
          <el-icon><Document /></el-icon>
          <span>健康档案</span>
        </el-menu-item>
        <el-menu-item index="/main/finance">
          <el-icon><Money /></el-icon>
          <span>财务结算</span>
        </el-menu-item>
        <el-menu-item index="/main/devices">
          <el-icon><Monitor /></el-icon>
          <span>智能设备</span>
        </el-menu-item>
        <el-menu-item index="/main/interaction">
          <el-icon><ChatDotRound /></el-icon>
          <span>智能交互</span>
        </el-menu-item>
        <el-menu-item index="/main/data">
          <el-icon><DataLine /></el-icon>
          <span>数据中心</span>
        </el-menu-item>
        <el-menu-item index="/main/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div class="header-left">
          <h2>智慧养老服务平台</h2>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="el-dropdown-link">
              管理员 <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人信息</el-dropdown-item>
                <el-dropdown-item>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute } from 'vue-router'
import {
  Monitor,
  User,
  Files,
  FirstAidKit,
  Document,
  Money,
  Connection,
  DataLine,
  Setting,
  ArrowDown,
  ChatDotRound
} from '@element-plus/icons-vue'

const route = useRoute()
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
}

.el-menu {
  border-right: none;
  background-color: #304156;
}

.el-menu-item {
  color: #bfcbd9;
}

.el-menu-item:hover {
  color: #fff !important;
  background-color: #263445 !important;
}

.el-menu-item.is-active {
  color: #fff !important;
  background-color: transparent !important;
  position: relative;
}

.el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #409EFF;
}

.el-header {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dcdfe6;
  height: 60px;
  padding: 0 20px;
}

.header-right {
  cursor: pointer;
}

.el-menu-vertical {
  height: 100%;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  color: #606266;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: #304156;
  color: #E6E6E6;
}

.logo {
  width: 28px;
  height: 28px;
  margin-right: 12px;
}

.platform-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 