const systemInfo = uni.getSystemInfoSync();
export const isWeChatMiniProgram = systemInfo.hostName === 'WeChat'; // 是否是微信小程序环境
const isDev = process.env.NODE_ENV === 'development'; // 是否是开发环境

const returnBaseUrl = () => {
    return isDev
        ? 'http://localhost:8080/api'
        : 'https://api.example.com/api';
};
export const baseUrl = returnBaseUrl();
