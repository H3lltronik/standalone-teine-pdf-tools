import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import CompressionsList from '../views/CompressionsList.vue'
import Compression from '../views/Compression.vue'
import Home from '../views/Home.vue'
import WorkspaceEditor from '../views/WorkspaceEditor.vue'

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
          component: Home,
          meta: { breadcrumbs: [] },
        },
        {
          path: 'workspaces/editor',
          name: 'workspace-editor',
          component: WorkspaceEditor,
          meta: { breadcrumbs: [] },
        },
        {
          path: 'compressions',
          name: 'compressions-list',
          component: CompressionsList,
          meta: { breadcrumbs: [] },
        },
        {
          path: 'compression',
          name: 'compression',
          component: Compression,
          meta: { breadcrumbs: [] },
        }
      ],
    },
  ],
})

export default router
