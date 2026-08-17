import { defineStore } from 'pinia';
import { ref } from 'vue';

import { getCustomerApi } from '@/api/customer.js';
const customerApi = getCustomerApi();

export const useMainStore = defineStore('main', () => {
	const storeState = ref({
		token: '',
		userInfo: {}
	});

	const setToken = (token) => {
		storeState.value.token = token;
		uni.setStorageSync('token', token);
	}

	// 获取用户信息
	const getUserInfo = () => {
		return customerApi.GetCustomerInfoByToken().then(res => {
			if (res.code == 200) {
				storeState.value.userInfo = res.data ?? {};
			} else {
				storeState.value.userInfo = {};
				logOut();
			}
			return res;
		}).catch(err => {
			storeState.value.userInfo = {};
			logOut();
			return err;
		});
	}

	const logOut = () => {
		storeState.value.token = '';
		storeState.value.userInfo = {};
		uni.removeStorage({
			key: 'token'
		});
	}

	const themeInfo = ref(
		{ theme: 'default', iconColor: '#04004F', activeColor: '#40EDF0' }
	);
	function setTheme() {
		const language = uni.getStorageSync('eliteSys-language-wx') || 'zh-Hans';
		const themeList = [
			{ theme: 'default', iconColor: '#04004F', activeColor: '#40EDF0' }
		];
		let item = themeList.find(item => item.theme == theme);
		item.language = language === 'en' ? 'en_lang' : 'zh_lang';
		themeInfo.value = item;
	}

	return { storeState, setToken, getUserInfo, logOut, themeInfo, setTheme };
});

