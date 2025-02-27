import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      {
        path: 'registration',
        name: 'Registration',
        component: () => import('../views/Registration.vue')
      },
      {
        path: 'assessment',
        name: 'Assessment',
        component: () => import('../views/Assessment.vue')
      },
      {
        path: 'care',
        name: 'Care',
        component: () => import('../views/Care.vue')
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
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 