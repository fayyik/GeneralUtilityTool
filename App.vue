<script>
import { useMainStore } from '@/store/index.js';

import { getCustomerApi } from '@/api/customer.js';
const customerApi = getCustomerApi();

export default {
	globalData: {
		statusBarHeight: 0,
		navbarHeight: 0,
	},
	onLaunch: async function () {
		const { getUserInfo, setToken, logOut } = useMainStore();

		// #ifdef MP-WEIXIN
		// 状态栏高度
		const statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
		const wxMenuBtn = uni.getMenuButtonBoundingClientRect();
		// 导航栏高度(标题栏高度) = 胶囊高度 + (顶部距离 - 状态栏高度) * 2
		const barHeight = wxMenuBtn.height + (wxMenuBtn.top - statusBarHeight) * 2;
		// 总体高度 = 状态栏高度 + 导航栏高度
		this.globalData.navbarHeight = (barHeight || 40) + statusBarHeight;
		this.globalData.statusBarHeight = statusBarHeight || 20;
		// #endif

		// #ifdef MP-WEIXIN
		// 有 openid 直接登陆
		let openId = uni.getStorageSync('openId');
		if (openId) {
			wx.login({
				async success(res) {
					customerApi
						.AuthorizedLogin({
							openId,
							code: res.code
						})
						.then((res) => {
							uni.hideLoading();
							if (res.code == 200) {
								// uni.$emit('loginSuccess')
								setToken(res.data.token);
								getUserInfo();
							} else {
								logOut();
							}
						}).catch((err) => {
							logOut();
						})
				},
				fail: (err) => {
					reject(err)
					console.error('wx.login调用失败：', err);
				},
			});
		}
		// #endif
	},

	onShow: function () {
		console.log('App Show')
	},
	onHide: function () {
		console.log('App Hide')
	}
}
</script>

<style lang="scss">
@import "@/static/iconfont/iconfont.css";
@import "@/static/style/theme.scss";
</style>
