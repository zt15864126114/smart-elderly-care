import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Registration from '../views/Registration.vue'
import Assessment from '../views/Assessment.vue'
import Care from '../views/Care.vue'
import Layout from '../views/Layout.vue'

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('../views/Welcome.vue')
  },
  {
    path: '/main',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'registration',
        name: 'Registration',
        component: Registration
      },
      {
        path: 'assessment',
        name: 'Assessment',
        component: Assessment
      },
      {
        path: 'care',
        name: 'Care',
        component: Care
      },
      {
        path: 'finance',
        name: 'Finance',
        component: () => import('../views/Finance.vue')
      },
      {
        path: 'devices',
        name: 'Devices',
        component: () => import('../views/Devices.vue')
      },
      {
        path: 'data',
        name: 'DataCenter',
        component: () => import('../views/DataCenter.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue')
      },
      {
        path: 'health-record',
        name: 'HealthRecord',
        component: () => import('../views/HealthRecord.vue')
      },
      {
        path: 'interaction',
        name: 'interaction',
        component: () => import('../views/Interaction.vue'),
        meta: {
          title: '智能交互',
          icon: 'ChatDotRound'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router 