<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="activity-detail-wrap">
            <view class="swiper-wrap">
                <uv-swiper :list="state.activityInfo.picsList" :height="200" circular></uv-swiper>
            </view>

            <view class="main-info-card">
                <view class="title-price-row">
                    <view class="name">{{ state.activityInfo.name }}</view>
                    <view class="price-tag" v-if="!state.activityInfo.fee">免费</view>
                </view>

                <view class="info-wrap">
                    <view class="info-item">
                        <view class="label">开始时间</view>
                        <view class="value">{{ state.activityInfo.startTime }}</view>
                    </view>
                    <view class="info-item">
                        <view class="label">时长</view>
                        <view class="value">{{ formatDuration(state.activityInfo.duration) }}</view>
                    </view>
                    <view class="info-item">
                        <view class="label">球馆</view>
                        <view class="value">{{ state.activityInfo.courtName }}</view>
                    </view>
                    <view class="info-item">
                        <view class="label">场地号</view>
                        <view class="value">{{ state.activityInfo.courtNumber }}</view>
                    </view>
                    <view class="info-item">
                        <view class="label">报名人数</view>
                        <view class="join-users-wrap" @click="openJoinUserPopup">
                            <view class="join-user-list" v-if="state.activityInfo.players?.length">
                                <image v-for="(item, index) in state.activityInfo.players.slice(0, 6)" :key="index"
                                    class="user-img" :src="item.avatar" mode="aspectFill"></image>
                                <view class="user-img" v-if="state.activityInfo.players.length > 6">...</view>
                            </view>
                            <view class="count">{{ state.activityInfo.players?.length || 0 }}/{{ state.activityInfo.maxPlayer
                            }}</view>
                        </view>
                    </view>
                    <view class="info-item">
                        <view class="label">最少成局人数</view>
                        <view class="value">{{ state.activityInfo.minPlayer }}人</view>
                    </view>
                    <view class="info-item" v-if="state.activityInfo?.deadlineTimeStr">
                        <view class="label">报名截止时间</view>
                        <view class="value">{{ state.activityInfo.deadlineTimeStr }}</view>
                    </view>
                </view>
            </view>

            <view class="desc-card">
                <view class="card-header">
                    活动描述
                </view>
                <view class="desc-content">{{ state.activityInfo.intro }}</view>
            </view>

            <view class="action-wrap">
                <view class="left-price">￥{{ state.activityInfo.fee }}</view>
                <view class="btn-group">
                    <view class="add-btn has-join" v-if="state.activityInfo.isRegistered">已报名</view>
                    <template v-else>
                        <view class="add-btn no-join" v-if="state.activityInfo.remainingSlots == 0">名额已满</view>
                        <view class="add-btn" v-else @click="handleJoin">报名球局</view>
                    </template>
                    <view class="add-btn leave" v-if="state.activityInfo.isRegistered" @click="handleLeave">取消报名</view>
                </view>
            </view>
        </view>

        <!-- 全部参加人列表 -->
        <uv-popup ref="joinUserPopup" mode="center" :close-on-click-overlay="false" :safe-area-inset-bottom="false">
            <view class="join-user-popup">
                <view class="close-icon" @click="closeJoinUserPopup">
                    <uv-icon name="close" size="32rpx" color="#666"></uv-icon>
                </view>
                <view class="popup-title">已报名人员</view>
                <view class="user-list">
                    <view class="user-item" v-for="(user, index) in state.activityInfo.players" :key="index">
                        <image class="user-avatar" :src="user.avatar" mode="aspectFill" lazy-load></image>
                        <view class="user-name">{{ user.name }}</view>
                    </view>
                    <view v-if="!state.activityInfo.players?.length" class="empty-tip">
                        暂无报名人员
                    </view>
                </view>
            </view>
        </uv-popup>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from '@/uni_modules/uv-ui-tools/libs/util/dayjs.js';

import { useMainStore } from '@/store/index';
const { themeInfo, storeState } = useMainStore();

import { getGameInfoApi } from '@/api/gameInfo';
const gameInfoApi = getGameInfoApi();

import Navbar from '@/components/Navbar.vue';

const joinUserPopup = ref(null);
const state = reactive({
    activityId: '',
    activityInfo: {}
});

onLoad((options) => {
    state.activityId = options.id;
    getActivityInfo(true);
});

const formatDuration = (minutes) => {
    if (minutes < 60) {
        return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

const getActivityInfo = (showLoading) => {
    if (!state.activityId) return;
    if (showLoading) uni.showLoading();
    gameInfoApi.GetGameInfoDetail(state.activityId).then((res) => {
        state.activityInfo = res.data;
        if (res.data.startTime && res.data.deadlineMinutes) {
            let startTime = res.data.startTime.replace(/\s+/g, 'T');
            startTime = new Date(startTime);
            const deadlineTime = new Date(startTime.getTime() - res.data.deadlineMinutes * 60000);
            state.activityInfo.deadlineTime = deadlineTime;
            state.activityInfo.deadlineTimeStr = dayjs(deadlineTime).format('YYYY-MM-DD HH:mm:ss');
        };
    }).finally(() => {
        if (showLoading) uni.hideLoading();
    });
}

const handleJoin = () => {
    const token = uni.getStorageSync('token');
    if (!token) {
        uni.showModal({
            title: '提示',
            content: '是否前往登录 ',
            success: function (res) {
                if (res.confirm) {
                    uni.navigateTo({
                        url: '/pages/login/index'
                    });
                }
            }
        });
        return;
    }
    if (state.activityInfo.deadlineTime && new Date() > state.activityInfo.deadlineTime) {
        uni.showToast({
            title: '报名已截止',
            icon: 'none',
        });
        return;
    }
    gameInfoApi.JoinGame({
        gameId: state.activityInfo.gameInfoId,
        customerId: storeState.userInfo.id,
    }).then((res) => {
        if (res.code == 200) {
            uni.showToast({
                title: '报名成功',
                icon: 'none',
            })
            getActivityInfo();
        }
    });
}

const handleLeave = () => {
    if (state.activityInfo.startTime) {
        const startTime = state.activityInfo.startTime.replace(' ', 'T')
        if (new Date() > new Date(startTime)) {
            uni.showToast({
                title: '取消报名已截止',
                icon: 'none',
            });
            return;
        }
    }
    uni.showModal({
        title: '提示',
        content: '确定取消报名吗？',
        success: function (res) {
            if (res.confirm) {
                gameInfoApi.LeaveGame({
                    gameId: state.activityInfo.gameInfoId,
                    customerId: storeState.userInfo.id,
                }).then((res) => {
                    if (res.code == 200) {
                        uni.showToast({
                            title: '取消成功',
                            icon: 'none',
                        });
                        getActivityInfo();
                    }
                });
            }
        }
    });
}

const openJoinUserPopup = () => {
    joinUserPopup.value?.open();
}

const closeJoinUserPopup = () => {
    joinUserPopup.value?.close();
}
</script>

<style scoped lang="scss">
.activity-detail-wrap {
    padding-bottom: 140rpx;

    .swiper-wrap {
        margin: 0 24rpx;
    }

    .main-info-card {
        margin: 30rpx 24rpx;
        padding: 32rpx;
        background: #FFFFFF;
        border-radius: 16rpx;
        box-shadow: var(--box-shadow);

        .title-price-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32rpx;

            .name {
                flex: 1;
                font-size: 36rpx;
                font-weight: bold;
                line-height: 1.4;
                color: #333;
            }

            .price-tag {
                margin-left: 20rpx;
                padding: 8rpx 20rpx;
                background: var(--main-color);
                color: #FFFFFF;
                font-size: 28rpx;
                font-weight: 600;
                border-radius: 8rpx;
                white-space: nowrap;
            }
        }

        .info-wrap {
            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16rpx 0;

                &:not(:last-child) {
                    border-bottom: 1rpx solid #f5f5f5;
                }

                .label {
                    font-size: 28rpx;
                    color: #666;
                }

                .join-users-wrap {
                    display: flex;
                    align-items: center;
                    gap: 20rpx;

                    .join-user-list {
                        display: flex;
                        align-items: center;

                        .user-img {
                            width: 50rpx;
                            height: 50rpx;
                            border-radius: 50%;
                            text-align: center;
                            border: 2rpx solid #FFFFFF;
                            background: #F3F3F3;

                            &:not(:first-child) {
                                margin-left: -20rpx;
                            }
                        }
                    }

                    .count {
                        font-size: 28rpx;
                        color: var(--main-color);
                        font-weight: 600;
                    }
                }

                .value {
                    font-size: 28rpx;
                    color: #333;
                    font-weight: 500;
                }
            }
        }
    }

    .desc-card {
        margin: 30rpx 24rpx 40rpx;
        padding: 32rpx;
        background: #FFFFFF;
        border-radius: 16rpx;
        box-shadow: var(--box-shadow);

        .card-header {
            margin-bottom: 24rpx;
            font-size: 32rpx;
            font-weight: bold;
            color: #333;
        }

        .desc-content {
            line-height: 1.6;
            color: #666;
            font-size: 28rpx;
        }
    }

    .action-wrap {
        position: fixed;
        left: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 40rpx 60rpx;
        width: 100%;
        background: #FFFFFF;
        box-sizing: border-box;
        border-top: 1px solid var(--border-color);

        .left-price {
            color: var(--main-color);
            font-size: 40rpx;
        }

        .btn-group {
            display: flex;
            align-items: center;
        }

        .add-btn {
            width: fit-content;
            padding: 18rpx 48rpx;
            line-height: 18px;
            border-radius: 10rpx;
            color: var(--text-btn);
            font-weight: 600;
            background: linear-gradient(to right, var(--left-linear), var(--right-linear));

            &.has-join {
                background: var(--right-linear);
            }

            &.no-join {
                background: var(--disabled-color);
            }

            &.leave {
                margin-left: 20rpx;
                color: #FFFFFF;
                background: #F56C6C;
            }
        }
    }
}

.join-user-popup {
    position: relative;
    width: 600rpx;
    padding: 40rpx 0;

    .close-icon {
        position: absolute;
        top: 20rpx;
        right: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        background: #F5F5F5;
    }

    .popup-title {
        font-size: 32rpx;
        font-weight: bold;
        color: var(--text-dark);
        text-align: center;
        padding-bottom: 30rpx;
        border-bottom: 1px solid var(--border-color);
    }

    .user-list {
        max-height: 600rpx;
        overflow-y: auto;

        .user-item {
            display: flex;
            align-items: center;
            padding: 20rpx 30rpx;
            border-bottom: 1px solid var(--border-color);
        }
    
        .user-avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
            margin-right: 20rpx;
        }
    
        .user-name {
            font-size: 28rpx;
            color: var(--text-dark);
            font-weight: 500;
        }
    
        .empty-tip {
            text-align: center;
            padding: 60rpx 0;
            font-size: 28rpx;
            color: var(--text-empty);
        }
    }
}
</style>
