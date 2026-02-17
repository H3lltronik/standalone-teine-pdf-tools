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
          meta: {
            breadcrumbs: [],
            title: 'Inicio',
            seo: {
              title: 'Teine PDF Tools | Comprimir y editar PDFs online',
              description:
                'Comprime y edita archivos PDF en tu navegador. Todos los archivos que quieras, sin limites. Rapido, privado y sin subir documentos a servidores.',
              path: '/',
              robots: 'index, follow',
            },
          },
        },
        {
          path: 'workspaces/editor',
          name: 'workspace-editor',
          component: () => import('../views/WorkspaceEditor.vue'),
          meta: {
            breadcrumbs: [],
            title: 'Editor de PDF',
            seo: {
              title: 'Editor de PDF online | Teine PDF Tools',
              description:
                'Edita, anota y organiza tus PDFs desde el navegador con un flujo rapido y privado.',
              path: '/workspaces/editor',
              robots: 'index, follow',
            },
          },
        },
        {
          path: 'compression',
          name: 'compression',
          component: () => import('../views/Compression.vue'),
          meta: {
            breadcrumbs: [],
            title: 'Comprimir PDF',
            seo: {
              title: 'Comprimir PDF online | Teine PDF Tools',
              description:
                'Reduce el peso de tus PDFs sin perder legibilidad. Comprime todos los archivos que quieras, sin limites. Todo sucede localmente en tu navegador.',
              path: '/compression',
              robots: 'index, follow',
            },
          },
        },
      ],
    },
  ],
})

export default router
