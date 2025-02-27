<!-- <template>
  <el-menu
    :default-active="route.path"
    class="side-menu"
    router
  >
    <el-menu-item index="">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </el-menu-item>

    <el-menu-item index="registration">
      <el-icon><UserFilled /></el-icon>
      <span>登记管理</span>
    </el-menu-item>

    <el-menu-item index="assessment">
      <el-icon><DocumentChecked /></el-icon>
      <span>评估管理</span>
    </el-menu-item>

    <el-menu-item index="care">
      <el-icon><FirstAidKit /></el-icon>
      <span>护理管理</span>
    </el-menu-item>

    <el-menu-item index="health-record">
      <el-icon><Document /></el-icon>
      <span>健康档案</span>
    </el-menu-item>

    <el-menu-item index="finance">
      <el-icon><Money /></el-icon>
      <span>财务管理</span>
    </el-menu-item>

    <el-menu-item index="devices">
      <el-icon><Monitor /></el-icon>
      <span>设备管理</span>
    </el-menu-item>

    <el-menu-item index="data">
      <el-icon><DataLine /></el-icon>
      <span>数据中心</span>
    </el-menu-item>

    <el-menu-item index="settings">
      <el-icon><Setting /></el-icon>
      <span>系统设置</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { useRoute } from 'vue-router'
import {
  HomeFilled,
  UserFilled,
  DocumentChecked,
  FirstAidKit,
  Document,
  Money,
  Monitor,
  DataLine,
  Setting
} from '@element-plus/icons-vue'

const route = useRoute()
</script>

<style scoped>
.side-menu {
  height: 100%;
  border-right: none;
}

.side-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

.side-menu :deep(.el-menu-item.is-active) {
  background-color: var(--el-menu-hover-bg-color);
}

.side-menu :deep(.el-menu-item:hover) {
  background-color: var(--el-menu-hover-bg-color);
}
</style>  -->