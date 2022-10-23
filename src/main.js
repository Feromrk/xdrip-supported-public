import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';

import 'material-design-icons-iconfont/dist/material-design-icons.css'


import VueRouter from 'vue-router'
Vue.use(VueRouter)
import Auth from './components/Auth.vue'
import Home from './components/Home.vue'
import CookiesPolicy from './components/pages/CookiesPolicy.vue'
import TermsOfService from './components/pages/TermsOfService.vue'
import PrivacyPolicy from './components/pages/PrivacyPolicy.vue'

import * as firebase from "firebase/app";
//make firebase available to all components via this.$firebase
Object.defineProperty(Vue.prototype, '$firebase', { value: firebase });

import "firebase/auth";


const firebaseConfig = {
  apiKey: "",
  authDomain: "xdrip-supported.web.app",
  databaseURL: "https://xdrip-supported.firebaseio.com",
  projectId: "xdrip-supported",
  storageBucket: "xdrip-supported.appspot.com",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// Initialize Firebase and make firebase.app available as this.$firebase.$app
Object.defineProperty(Vue.prototype.$firebase, '$app', { value: firebase.initializeApp(firebaseConfig) });

//google analytics
import "firebase/analytics";
//const analytics = firebase.analytics();
Object.defineProperty(Vue.prototype, '$analytics', { value: firebase.analytics() });


Vue.config.productionTip = false


const router = new VueRouter({
  //mode: 'history',
  base: __dirname,
  routes: [
    { path: '/', name: 'home', component: Home },
    //{ path: '/home', name: 'home', component: Home },
    { path: '/auth', name: 'auth', component: Auth },
    { path: '/cookiesPolicy', name: 'cookiesPolicy', component: CookiesPolicy},
    { path: '/termsOfService', name: 'termsOfService', component: TermsOfService},
    { path: '/privacyPolicy', name: 'privacyPolicy', component: PrivacyPolicy},
  ],
  scrollBehavior() {
    document.getElementById('app').scrollIntoView(); //always scroll to top after changing routes
}
});

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')