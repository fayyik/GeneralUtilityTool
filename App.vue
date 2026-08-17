<script>
export default {
	globalData: {
		statusBarHeight: 0,
		navbarHeight: 0,
	},
	onLaunch: function () {
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