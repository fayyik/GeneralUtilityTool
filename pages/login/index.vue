<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="login-container">
            <view class="title">羽你相遇，球圈等你</view>
            <view class="desc">这里是羽毛球球友的快乐基地 —— 约球、聊装备、看赛事，快来加入我们！</view>
            <view class="login-btn" @click="handleLogin">快捷登录</view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { navigateBack } from '@/utils/common.js';

import { useMainStore } from '@/store/index';
const { themeInfo, getUserInfo, setToken } = useMainStore();

import Navbar from '@/components/Navbar.vue';

import { getCustomerApi } from '@/api/customer.js';
const customerApi = getCustomerApi();

const handleLogin = () => {
    uni.showLoading({
        mask: true
    });
    wx.login({
        success (loginRes) {
            console.log('loginRes', loginRes);
            wx.getUserInfo({
                success (infoRes) {
                    console.log('用户信息：', infoRes.userInfo);
                    customerApi.AuthorizedLogin({
                        code: loginRes.code,
                        encryptedData: infoRes.encryptedData,
                        iv: infoRes.iv
                    }).then((res) => {
                        uni.hideLoading();
                        if (res.code === 200) {
                            console.log(res);
                            setToken(res.data.token);
                            uni.setStorageSync('openId', res.data.openId);
                            getUserInfo();
                            navigateBack();
                        } else {
                            uni.showToast({
                                title: '登录失败',
                                icon: 'none'
                            });
                        }
                    });
                },
                fail (infoErr) {
                    console.log('获取用户信息失败', infoErr);
                    uni.hideLoading();
                    uni.showToast({
                        title: '登录失败',
                        icon: 'none'
                    });
                }
            });
        },
        fail (err) {
            console.log('登录失败', err);
            uni.hideLoading();
            uni.showToast({
                title: '登录失败',
                icon: 'none'
            });
        }
    });
}
</script>

<style lang="scss">
.page-container {
    display: flex;
    flex-direction: column;
}

.login-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 80rpx;

    .title {
        color: var(--text-dark);
        font-weight: bold;
        font-size: 48rpx;
    }

    .desc {
        margin: 60rpx 0 100rpx;
        width: 90%;
        color: var(--text-dark);
        font-size: 30rpx;
        text-align: center;
        line-height: 1.8;
    }

    .login-btn {
        padding: 20rpx 80rpx;
        border-radius: 40rpx;
        color: #FFFFFF;
        background-color: var(--main-color);
    }
}
</style>