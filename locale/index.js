import { createI18n } from 'vue-i18n';

// 导入静态翻译内容
import en from './en.json';
import zhHans from './zh-Hans.json';
// 导入动态翻译函数
import messagesFunctions from './messagesFunctions.js';

// 合并静态和动态的翻译内容
const mergedMessages = {
    en: {
        ...en,
        ...messagesFunctions.en,
    },
    'zh-Hans': {
        ...zhHans,
        ...messagesFunctions.zhHans,
    }
};

const language = uni.getStorageSync('yu-language') || 'zh-Hans';
const i18n = createI18n({
    locale: language,
    messages: mergedMessages,
});
uni.setStorageSync('yu-language', language);

export default i18n;
