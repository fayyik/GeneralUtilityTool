import App from "./App";
import i18n from "./locale/index";
import * as Pinia from "pinia";

import uvUI from '@/uni_modules/uv-ui-tools'

// #ifndef VUE3
import Vue from "vue";
import "./uni.promisify.adaptor";
Vue.config.productionTip = false;
App.mpType = "app";
const app = new Vue({
    ...App,
});
app.use(Pinia.createPinia());
app.use(i18n);
app.use(uvUI);
app.$mount();
// #endif

// #ifdef VUE3
import { createSSRApp } from "vue";
export function createApp() {
    const app = createSSRApp(App);
    app.use(Pinia.createPinia());
    app.use(i18n);
    app.use(uvUI);
    return {
        app,
        Pinia
    };
}
// #endif
