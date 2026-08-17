<template>
    <view class="container" :class="[`${themeInfo.theme}-theme`]">
        <view class="personal-wrap" :style="{ 'padding-top': `${state.navHeight}px` }">
            <view class="personal-top">
                <view class="bg-wrap"></view>
                <image class="avatar" v-if="storeState.userInfo?.avatar" :src="storeState.userInfo?.avatar"></image>
                <view class="default-wrap" v-else @click="chooseAvatar">
                    <uv-icon name="account-fill" size="70" color="#FFFFFF"></uv-icon>
                </view>
                <view class="name-wrap">
                    <view class="name">{{ storeState.userInfo?.nickname || '未设置昵称' }}</view>
                    <view class="edit-tip" v-if="!storeState.userInfo?.nickname" @click="setNickname">点击设置昵称</view>
                </view>
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
        <CustomTabBar :selected="1"></CustomTabBar>
    </view>
</template>

<script setup>
import { reactive } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { navbarHeightAndStatusBarHeight, navigateBack } from '@/utils/common';

import { useMainStore } from '@/store/index';
const { themeInfo, storeState, getUserInfo, setUserInfo } = useMainStore();

import CustomTabBar from '@/components/CustomTabbar.vue';

const state = reactive({
    navHeight: 0,
    navList: [
        { name: '个人信息', icon: 'account-fill', path: '/pages/personal/info' },
        { name: '清除缓存', icon: 'trash', type: 'clear' },
        { name: '关于我们', icon: 'info-circle-fill', type: 'about' },
    ],
});

onShow(() => {
    getUserInfo();
});

onLoad(() => {
    state.navHeight = navbarHeightAndStatusBarHeight().navbarHeight;
});

const chooseAvatar = () => {
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        success: (res) => {
            const avatar = res.tempFilePaths[0];
            const userInfo = { ...storeState.value.userInfo, avatar };
            setUserInfo(userInfo);
        },
    });
}

const setNickname = () => {
    uni.showModal({
        title: '设置昵称',
        editable: true,
        placeholderText: '请输入昵称',
        success: (res) => {
            if (res.confirm && res.content) {
                const userInfo = { ...storeState.value.userInfo, nickname: res.content };
                setUserInfo(userInfo);
            }
        },
    });
}

const clickNav = (item) => {
    if (item.path) {
        navigateBack(item.path);
    } else if (item.type === 'clear') {
        uni.showModal({
            title: '提示',
            content: '确定清除本地缓存吗？',
            success: (res) => {
                if (res.confirm) {
                    uni.clearStorageSync();
                    getUserInfo();
                    uni.showToast({ title: '清除成功', icon: 'none' });
                }
            },
        });
    } else if (item.type === 'about') {
        uni.showModal({
            title: '关于我们',
            content: '万能工具箱 v1.0.0',
            showCancel: false,
        });
    }
}
</script>

<style scoped lang="scss">
.personal-wrap {
    position: relative;
    padding: 0 40rpx 200rpx;
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
    background: linear-gradient(180deg,
            rgba(var(--rgb-color-left), 0.3),
            rgba(var(--rgb-color-right), 0.3) 40%,
            #F6F9F8 70%);

    .personal-top {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 60rpx;
        margin-bottom: 50rpx;

        .avatar,
        .default-wrap {
            width: 180rpx;
            height: 180rpx;
            border-radius: 50%;
            box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.12);
            background: #FFFFFF;
        }

        .default-wrap {
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
        }

        .name-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 30rpx;

            .name {
                font-size: 40rpx;
                font-weight: 600;
                color: var(--text-dark);
            }

            .edit-tip {
                margin-top: 10rpx;
                font-size: 24rpx;
                color: var(--main-color);
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
</style>