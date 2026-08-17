<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="settings-wrap">
            <view class="group-card">
                <view class="group-title">时长设置</view>
                <view class="setting-row" @click="pickDuration('focusDuration')">
                    <view class="row-label">专注时长</view>
                    <view class="row-value">
                        {{ settings.focusDuration }} 分钟
                        <uv-icon name="arrow-right" color="#B6C2D7" :size="12"></uv-icon>
                    </view>
                </view>
                <view class="setting-row" @click="pickDuration('shortBreakDuration')">
                    <view class="row-label">短休息</view>
                    <view class="row-value">
                        {{ settings.shortBreakDuration }} 分钟
                        <uv-icon name="arrow-right" color="#B6C2D7" :size="12"></uv-icon>
                    </view>
                </view>
                <view class="setting-row" @click="pickDuration('longBreakDuration')">
                    <view class="row-label">长休息</view>
                    <view class="row-value">
                        {{ settings.longBreakDuration }} 分钟
                        <uv-icon name="arrow-right" color="#B6C2D7" :size="12"></uv-icon>
                    </view>
                </view>
                <view class="setting-row" @click="pickDuration('longBreakInterval')">
                    <view class="row-label">长休息间隔</view>
                    <view class="row-value">
                        每 {{ settings.longBreakInterval }} 次专注
                        <uv-icon name="arrow-right" color="#B6C2D7" :size="12"></uv-icon>
                    </view>
                </view>
            </view>

            <view class="group-card">
                <view class="group-title">提醒设置</view>
                <view class="setting-row">
                    <view class="row-label">
                        结束提醒
                        <view class="row-desc">计时结束时震动</view>
                    </view>
                    <uv-switch v-model="settings.vibrate" :activeColor="themeInfo.activeColor" />
                </view>
                <view class="setting-row">
                    <view class="row-label">
                        自动开始下一段
                        <view class="row-desc">结束后自动开始下一轮计时</view>
                    </view>
                    <uv-switch v-model="settings.autoNext" :activeColor="themeInfo.activeColor" />
                </view>
            </view>

            <view class="notice-card">
                <view class="notice-title">关于后台提醒</view>
                <view class="notice-content">
                    微信小程序在退出后台时无法实时推送通知。计时器切到后台后，回到小程序时会自动检测：若计时已结束，将补记完成记录并立即提醒。
                </view>
            </view>

            <view class="save-btn" @click="save">保存设置</view>
        </view>
    </view>
</template>

<script setup>
import { reactive } from 'vue';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import Navbar from '@/components/Navbar.vue';
import storage from '@/utils/storage';

const durationOptions = {
    focusDuration: [15, 25, 30, 45, 60],
    shortBreakDuration: [3, 5, 10],
    longBreakDuration: [10, 15, 20, 30],
    longBreakInterval: [2, 3, 4, 6],
};

const durationLabels = {
    focusDuration: '专注时长',
    shortBreakDuration: '短休息',
    longBreakDuration: '长休息',
    longBreakInterval: '长休息间隔',
};

const settings = reactive({ ...storage.getSettings() });

const pickDuration = (key) => {
    const options = durationOptions[key].map(v => key === 'longBreakInterval' ? `每 ${v} 次专注` : `${v} 分钟`);
    uni.showActionSheet({
        itemList: options,
        success: (res) => {
            settings[key] = durationOptions[key][res.tapIndex];
        },
    });
};

const save = () => {
    storage.setSettings({ ...settings });
    uni.showToast({ title: '已保存', icon: 'none' });
    setTimeout(() => {
        uni.navigateBack();
    }, 500);
};
</script>

<style scoped lang="scss">
.settings-wrap {
    padding: 0 40rpx 80rpx;
    box-sizing: border-box;

    .group-card {
        padding: 30rpx 30rpx 10rpx;
        margin-bottom: 30rpx;
        background: #FFFFFF;
        border-radius: 20rpx;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);

        .group-title {
            font-size: 28rpx;
            font-weight: 600;
            color: var(--text-light);
            margin-bottom: 10rpx;
        }

        .setting-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 28rpx 0;

            &+.setting-row {
                border-top: 1px solid #F0F1F5;
            }

            .row-label {
                font-size: 30rpx;
                color: var(--text-dark);

                .row-desc {
                    margin-top: 6rpx;
                    font-size: 22rpx;
                    color: var(--text-light);
                }
            }

            .row-value {
                display: flex;
                align-items: center;
                gap: 8rpx;
                font-size: 28rpx;
                color: var(--main-color);
            }
        }
    }

    .notice-card {
        padding: 30rpx;
        margin-bottom: 30rpx;
        background: rgba(78, 140, 255, 0.08);
        border-radius: 20rpx;

        .notice-title {
            font-size: 26rpx;
            font-weight: 600;
            color: var(--main-color);
            margin-bottom: 12rpx;
        }

        .notice-content {
            font-size: 24rpx;
            line-height: 1.6;
            color: var(--text-light);
        }
    }

    .save-btn {
        height: 90rpx;
        line-height: 90rpx;
        text-align: center;
        font-size: 32rpx;
        font-weight: 600;
        color: #FFFFFF;
        border-radius: 45rpx;
        background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
        box-shadow: 0 16rpx 40rpx rgba(78, 140, 255, 0.3);
    }
}
</style>