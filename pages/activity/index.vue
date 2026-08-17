<template>
    <view class="container" :class="[`${themeInfo.theme}-theme`]">
        <view class="activity-wrap" :style="{ 'padding-top': `${state.navHeight}px` }">
            <view class="login-btn" v-if="!state.isLogin">暂未登录</view>
            <template v-else>
                <view class="activity-list" v-if="state.activityList?.length">
                    <view class="activity-item" v-for="(item, index) in state.activityList" :key="index"
                        @click="toActivityDetail(item)">
                        <view class="top-time-bar">
                            <view class="time">
                                <uv-icon name="calendar" :color="themeInfo.activeColor" size="52rpx" />
                                <text class="time-text">{{ item.startTime }}</text>
                            </view>
                            <view class="joined-tag">已参加</view>
                        </view>
                        <view class="detail-wrap">
                            <view class="name">{{ item.name }}</view>
                            <view class="info-wrap">
                                <view class="info-item">
                                    <uv-icon name="map" />
                                    <view class="value">活动地址：{{ item.courtName }}</view>
                                </view>
                                <!-- <view class="info-item">
                                    <uv-icon name="coupon" />
                                    <view class="value">活动费用：$30</view>
                                </view> -->
                            </view>
                        </view>
                    </view>
                </view>
                <view class="empty-btn" v-else>暂无活动</view>
            </template>
        </view>
        <CustomTabBar :selected="3"></CustomTabBar>
    </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { navbarHeightAndStatusBarHeight } from '@/utils/common';

import { useMainStore } from '@/store/index';
const { themeInfo, storeState } = useMainStore();

import CustomTabBar from '@/components/CustomTabbar.vue';

import { getCustomerApi } from '@/api/customer';
const customerApi = getCustomerApi();

const state = reactive({
    navHeight: 0,
    isLogin: true,
    activityList: []
});

onLoad(() => {
    state.navHeight = navbarHeightAndStatusBarHeight().navbarHeight;
});

onShow(() => {
    const token = uni.getStorageSync('token');
    state.isLogin = !!token;
    if (state.isLogin) getActivityList();
});

const getActivityList = () => {
    if (!storeState.userInfo.id) return;
    customerApi.GetGameList(storeState.userInfo.id).then(res => {
        state.activityList = res.data;
    });
}

const toActivityDetail = (item) => {
    if (!item.gameInfoId) return;
    uni.navigateTo({
        url: `/pages/activity/detail?id=${item.gameInfoId}`
    });
}
</script>

<style scoped lang="scss">
.activity-wrap {
    position: relative;
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
    background: linear-gradient(180deg,
            rgba(var(--rgb-color-left), 0.25),
            rgba(var(--rgb-color-right), 0.25) 40%,
            #F6F9F8 70%);

    .activity-list {
        position: relative;
        padding: 0 40rpx;
        margin: 40rpx 0;
        height: calc(100vh - 380rpx);
        box-sizing: border-box;
        overflow: auto;
        z-index: 3;

        .activity-item {
            display: flex;
            flex-direction: column;
            padding: 30rpx 0;
            margin-bottom: 30rpx;
            background: #FFFFFF;
            border-radius: 16rpx;
            box-shadow: var(--box-shadow);

            .top-time-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20rpx 40rpx;
                margin-bottom: 18rpx;
                border-bottom: 1px solid var(--border-color);

                .time {
                    display: flex;
                    gap: 10rpx;
                    align-items: center;

                    .time-text {
                        font-size: 32rpx;
                        color: var(--text-dark);
                        font-weight: 500;
                    }
                }

                .joined-tag {
                    padding: 4rpx 14rpx;
                    font-size: 22rpx;
                    color: #FFFFFF;
                    background: var(--main-color);
                    border-radius: 8rpx;
                }
            }

            .detail-wrap {
                padding: 20rpx 40rpx;

                .name {
                    font-size: 34rpx;
                    font-weight: bold;
                    margin-bottom: 30rpx;
                    color: var(--text-dark);
                }
    
                .info-wrap {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    gap: 20rpx;
    
                    .info-item {
                        display: flex;
                        align-items: center;
                        font-size: 26rpx;
                        color: #666;
    
                        .value {
                            margin-left: 12rpx;
                        }
                    }
                }
            }
        }
    }

    .login-btn,
    .empty-btn {
        padding: 30rpx 40rpx;
        margin: 40rpx;
        font-size: 32rpx;
        color: #FFFFFF;
        border-radius: 16rpx;
        text-align: center;
        background: var(--main-color);
        box-shadow: var(--box-shadow);
    }
}
</style>
