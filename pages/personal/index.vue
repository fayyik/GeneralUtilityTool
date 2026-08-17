<template>
    <view class="container" :class="[`${themeInfo.theme}-theme`]">
        <view class="personal-wrap" :style="{ 'padding-top': `${state.navHeight}px` }">
            <view class="bg-wrap"></view>
            <view class="personal-top">
                <image class="avatar" v-if="storeState.userInfo?.avatar" :src="storeState.userInfo?.avatar"></image>
                <view class="default-wrap" v-else>
                    <uv-icon name="account-fill" size="70" color="#FFFFFF"></uv-icon>
                </view>
                <view class="name">{{ storeState.userInfo.name || 'unknown' }}</view>
                <view class="tag-wrap" v-if="state.isLogin && storeState.userInfo?.selfEvaluate">
                    <view class="tag" v-for="(tag, index) in storeState.userInfo.selfEvaluate" :key="index">{{ tag }}</view>
                </view>
                <!-- <view class="desc">这是简介这是简介这是简介这是简介这是简介这是简介这是简介  主打项目：女双、混双</view> -->
            </view>
            <view class="detail-wrap">
                <view class="detail-item" v-for="(item, index) in state.navList" :key="index" @click="clickNav(item)">
                    <view class="left">
                        <uv-icon :name="item.icon" :color="themeInfo.activeColor" :size="20"></uv-icon>
                        <view class="label">{{ item.name }}</view>
                    </view>
                    <uv-icon name="arrow-right" color="#B6C2D7" :size="12"></uv-icon>
                </view>
            </view>
        </view>

        <!-- 未登录遮罩 -->
        <view class="mask-wrap" v-if="!state.isLogin" @click="toLogin"></view>
        <CustomTabBar :selected="4"></CustomTabBar>
    </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { navbarHeightAndStatusBarHeight, navigateBack } from '@/utils/common';

import { useMainStore } from '@/store/index';
const { themeInfo, storeState, logOut } = useMainStore();

import CustomTabBar from '@/components/CustomTabbar.vue';

const state = reactive({
    isLogin: false,
    navHeight: 0,
    navList: [
        { name: '个人信息', icon: 'account-fill', path: '/pages/personal/info' },
        { name: '我的订单', icon: 'order' },
        { name: '我的钱包', icon: 'coupon-fill' },
        { name: '退出登录', icon: 'lock-opened-fill', type: 'logout' },
    ]
});

onShow(() => {
    const token = uni.getStorageSync('token');
    state.isLogin = !!token;
});

onLoad(() => {
    state.navHeight = navbarHeightAndStatusBarHeight().navbarHeight;
});

const toLogin = () => {
    uni.navigateTo({
        url: '/pages/login/index',
    });
}

const clickNav = (item) => {
    if (item.path) {
        navigateBack(item.path);
    } else if (item.type === 'logout') {
        logOut();
        uni.showToast({
            title: '退出成功',
            icon: 'none',
        });
        setTimeout(() => {
            uni.reLaunch({
                url: '/pages/index/index',
            });
        }, 500);
    }
}
</script>

<style scoped lang="scss">
.personal-wrap {
    position: relative;
    padding: 0 40rpx 40rpx;
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
    background: linear-gradient(180deg,
            rgba(var(--rgb-color-left), 0.25),
            rgba(var(--rgb-color-right), 0.25) 40%,
            #F6F9F8 70%);

    .personal-top {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 40rpx;
        margin-bottom: 50rpx;

        .avatar,
        .default-wrap {
            width: 180rpx;
            height: 180rpx;
            border-radius: 32rpx;
            box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.12);
            background: #FFFFFF;
        }

        .default-wrap {
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #e0e3ea, #f5f6fa);
        }

        .name {
            margin: 30rpx 0;
            font-size: 42rpx;
            font-weight: 600;
            color: var(--text-dark);
        }

        .tag-wrap {
            display: flex;
            gap: 16rpx;

            .tag {
                padding: 8rpx 20rpx;
                font-size: 22rpx;
                border-radius: 20rpx;
                color: var(--text-btn);
                background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
            }
        }
    }

    .detail-wrap {
        padding: 16rpx 0;
        border-radius: 24rpx;
        background: #FFFFFF;
        box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.05);

        .detail-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 28rpx 30rpx;

            .left {
                display: flex;
                align-items: center;

                .label {
                    margin-left: 24rpx;
                    font-size: 28rpx;
                    color: var(--text-dark);
                }
            }

            &+.detail-item {
                border-top: 1px solid #f0f0f0;
            }
        }
    }
}

.mask-wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999;
}
</style>
