<template>
    <view class="location-navbar" :style="{ height: `${state.navHeight}px` }">
        <view class="main-wrap" :style="{ 'margin-top': `${state.statusBarHeight}px` }" @click="toSelectLocation">
            <uv-icon name="map" size="18" bold></uv-icon>
            <view class="text">{{ state.currentLocation ? state.currentLocation.city + ' | ' + state.currentLocation.name : '请选择位置' }}</view>
        </view>
    </view>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { navbarHeightAndStatusBarHeight } from '@/utils/common.js';

let state = reactive({
    currentLocation: '',
    navHeight: 50,
    statusBarHeight: 0,
});

onMounted(() => {
    // #ifdef MP-WEIXIN || MP-XHS
    const { tempHeight, navbarHeight, statusBarHeight } = navbarHeightAndStatusBarHeight();
    state.navHeight = navbarHeight || tempHeight.navbarHeight;
    state.statusBarHeight = statusBarHeight || tempHeight.statusBarHeight;
    // #endif

    const currentLocation = uni.getStorageSync('userLocation');
    if (currentLocation) state.currentLocation = currentLocation;
});

const toSelectLocation = () => {
    uni.navigateTo({
        url: '/pages/map/chooseLocation'
    });
}
</script>

<style lang="scss">
.location-navbar {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100vw;
    padding-left: var(--padding-size);
    margin-bottom: var(--padding-size);
    overflow: hidden;

    .main-wrap {
        display: flex;
        align-items: center;
        width: 100%;
        height: fit-content;

        .text {
            width: calc(100% - 240rpx);
            margin-left: 20rpx;
            font-size: 32rpx;
            font-weight: 500;
            color: var(--text-dark);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}
</style>