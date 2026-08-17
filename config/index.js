const systemInfo = uni.getSystemInfoSync();
export const isWeChatMiniProgram = systemInfo.hostName === 'WeChat'; // 是否是微信小程序环境
export const isXiaohongshu = systemInfo.hostName === 'xhs'; // 是否是小红书环境
const isDev = process.env.NODE_ENV === 'development'; // 是否是开发环境

let accountInfo = {};
// #ifdef MP-WEIXIN || MP-XHS
accountInfo = uni.getAccountInfoSync();
// #endif
export const AppId = accountInfo?.miniProgram?.appId || '';

const returnBaseUrl = () => {
	if (isWeChatMiniProgram || isXiaohongshu) {
		if (isDev) {
			// return 'https://newtest.kingkongcang.com/api';
			return 'http://localhost:8888/api';
		} else {
			return 'https://newtest.kingkongcang.com/api';
		}
	} else {
		return isDev
			? `${window.location.origin}/api`
			: `${window.location.origin}/adminApi`;
	}
};
export const baseUrl = returnBaseUrl();
export const baseImageUrl = 'https://elitesysapartment.oss-cn-hongkong.aliyuncs.com/';
