<template>
    <view class="back" :style="{ height: `${state.navHeight}px` }">
        <view class="left-icon" :style="{ 'margin-top': `${state.statusBarHeight}px` }">
            <view class="icon-wrap" @click="toBack">
                <uv-icon name="arrow-left" size="18" bold></uv-icon>
            </view>
            <view class="border"></view>
            <view class="icon-wrap" @click="toHome">
                <uv-icon name="home-fill" size="20" bold></uv-icon>
            </view>
        </view>
        <slot></slot>
    </view>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { navigateBack, navbarHeightAndStatusBarHeight } from '@/utils/common.js';

const toBack = () => {
    navigateBack();
}

const toHome = () => {
    navigateBack('/pages/index/index');
}

let state = reactive({
    navHeight: 50,
    statusBarHeight: 0,
});
onMounted(() => {
    // #ifdef MP-WEIXIN || MP-XHS
    const { tempHeight, navbarHeight, statusBarHeight } = navbarHeightAndStatusBarHeight();
    state.navHeight = navbarHeight || tempHeight.navbarHeight;
    state.statusBarHeight = statusBarHeight || tempHeight.statusBarHeight;
    // #endif
});
</script>

<style lang="scss">
.back {
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    width: 100vw;
    padding-left: var(--padding-size);
    margin-bottom: var(--padding-size);
    overflow: hidden;

    .left-icon {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: fit-content;
        height: fit-content;
        border-radius: 40rpx;
        background: rgba(255, 255, 255, 0.8);

        .icon-wrap {
            padding: 12rpx 28rpx;
        }

        .border {
            width: 1px;
            height: 40rpx;
            background: var(--border-color);
        }
    }
}
</style>