import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMainStore = defineStore('main', () => {
	const storeState = ref({
		userInfo: {
			nickname: '',
			avatar: ''
		}
	});

	// 获取用户信息（本地存储）
	const getUserInfo = () => {
		storeState.value.userInfo = uni.getStorageSync('userInfo') || {};
		return storeState.value.userInfo;
	}

	const setUserInfo = (userInfo) => {
		storeState.value.userInfo = userInfo;
		uni.setStorageSync('userInfo', userInfo);
	}

	const themeInfo = ref(
		{ theme: 'default', iconColor: '#04004F', activeColor: '#4E8CFF' }
	);

	return { storeState, getUserInfo, setUserInfo, themeInfo };
});
