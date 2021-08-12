import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

// Components
import ProjectView from '@/views/Project.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        name: 'Projekt',
        path: '',
        component: ProjectView,
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

export default router;
