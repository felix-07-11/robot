import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    vuetify,
    render: (h) => h(App),
<<<<<<< HEAD
}).$mount('#app');
=======
}).$mount('#app')
>>>>>>> 0369535d8e24f38cd4bfe72352f41f78f5568264
