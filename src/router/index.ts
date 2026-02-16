import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/Home.vue'),
          meta: { breadcrumbs: [] },
        },
        {
          path: 'workspaces/editor',
          name: 'workspace-editor',
          component: () => import('../views/WorkspaceEditor.vue'),
          meta: { breadcrumbs: [] },
        },
        {
          path: 'compressions',
          name: 'compressions-list',
          component: () => import('../views/CompressionsList.vue'),
          meta: { breadcrumbs: [] },
        },
        {
          path: 'compression',
          name: 'compression',
          component: () => import('../views/Compression.vue'),
          meta: { breadcrumbs: [] },
        },
      ],
    },
  ],
})

export default router
