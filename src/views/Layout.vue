<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical"
        router
      >
        <el-menu-item index="/">
          <el-icon><Monitor /></el-icon>
          <span>首页概览</span>
        </el-menu-item>
        <el-menu-item index="/registration">
          <el-icon><User /></el-icon>
          <span>登记管理</span>
        </el-menu-item>
        <el-menu-item index="/assessment">
          <el-icon><Files /></el-icon>
          <span>评估管理</span>
        </el-menu-item>
        <el-menu-item index="/care">
          <el-icon><FirstAidKit /></el-icon>
          <span>照护管理</span>
        </el-menu-item>
        <el-menu-item index="/finance">
          <el-icon><Money /></el-icon>
          <span>财务结算</span>
        </el-menu-item>
        <el-menu-item index="/devices">
          <el-icon><Connection /></el-icon>
          <span>智能设备</span>
        </el-menu-item>
        <el-menu-item index="/data">
          <el-icon><DataLine /></el-icon>
          <span>数据中心</span>
        </el-menu-item>
        <el-menu-item index="/settings">
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
  Money,
  Connection,
  DataLine,
  Setting,
  ArrowDown
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
</style> 