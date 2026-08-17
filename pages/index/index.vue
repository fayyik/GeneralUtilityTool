<template>
    <view class="container" :class="[`${themeInfo.theme}-theme`]">
        <view class="home-wrap">
            <LocationNavbar></LocationNavbar>
            <view class="top-wrap">
                <view class="search-wrap">
                    <uv-input
                        placeholder="活动/球群"
                        prefixIcon="search"
                        prefixIconStyle="font-size: 22px; color: #909399"
                    ></uv-input>
                </view>
                <view class="filter-wrap">
                    <view class="type">
                        <view class="filter-item" :class="{ active: state.selectType === ''}" @click="getActivityList()">全部活动</view>
                        <view class="filter-item" :class="{ active: state.selectType === 'hot'}" @click="getActivityList('hot')">热门活动</view>
                    </view>
                    <view class="region">
                        <view class="text">全城</view>
                        <uv-icon name="arrow-down"></uv-icon>
                    </view>
                </view>
            </view>
            <view class="activity-list">
                <ActivityCard v-for="(item, index) in state.activityList" :key="index" :activity-data="item"></ActivityCard>
            </view>
        </view>
        <CustomTabBar :selected="0"></CustomTabBar>
    </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { navbarHeightAndStatusBarHeight } from '@/utils/common';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import LocationNavbar from '@/components/LocationNavbar.vue';
import CustomTabBar from '@/components/CustomTabbar.vue';
import ActivityCard from '@/components/ActivityCard.vue';

import { getGameInfoApi } from '@/api/gameInfo';
const gameInfoApi = getGameInfoApi();

const state = reactive({
    navHeight: 0,
    selectType: '',
    selectRegion: '',
    activityList: []
});

onLoad(() => {
    state.navHeight = navbarHeightAndStatusBarHeight().navbarHeight;
});

onShow(() => {
    getActivityList();
});

const getActivityList = (type) => {
    state.selectType = type || '';

    gameInfoApi.GetGameInfoList().then(res => {
        state.activityList = res.data;
    });
}
</script>

<style scoped lang="scss">
.home-wrap {
    position: relative;
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
    background: linear-gradient(180deg,
            rgba(var(--rgb-color-left), 0.25),
            rgba(var(--rgb-color-right), 0.25) 40%,
            #F6F9F8 70%);

    .top-wrap {
        padding: 0 40rpx;
    }

    .search-wrap {
        margin: 20rpx 0 40rpx;
        background: #FFFFFF;
        border-radius: 16rpx;
        overflow: hidden;
    }

    .filter-wrap {
        display: flex;
        justify-content: space-between;

        .type {
            display: flex;
            align-items: center;

            .filter-item {
                position: relative;
                margin-right: 40rpx;

                &.active {
                    color: var(--text-dark);
                    font-weight: 600;

                    &::after {
                        content: '';
                        position: absolute;
                        bottom: -8rpx;
                        left: 0;
                        width: 100%;
                        height: 6rpx;
                        border-radius: 4rpx;
                        background: var(--main-color);
                    }
                }
            }
        }

        .region {
            display: flex;
            align-items: center;

            .text {
                margin-right: 16rpx;
            }
        }
    }

    .activity-list {
        position: relative;
        padding: 0 40rpx 100rpx;
        margin: 40rpx 0;
        height: calc(100vh - 480rpx);
        box-sizing: border-box;
        overflow: auto;
        z-index: 3;
    }
}
</style>
