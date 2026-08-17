<template>
    <view class="activity-card-wrap" @click="toActivityDetail">
        <view class="swiper-wrap">
            <uv-swiper :list="activityData.picsList" :height="200" circular></uv-swiper>
        </view>
        <view class="bottom-wrap">
            <view class="name">{{ activityData.name }}</view>
            <view class="info-wrap">
                <view class="info-item">
                    <uv-icon name="calendar"></uv-icon>
                    <view class="value">{{ activityData.startTime }}</view>
                </view>
                <view class="info-item">
                    <uv-icon name="map"></uv-icon>
                    <view class="value">{{ activityData?.fullAddress || activityData.courtName }}</view>
                </view>
            </view>
            <view class="join-wrap">
                <view class="join-user-list">
                    <template v-if="activityData.playerAvatars?.length">
                        <image v-for="(item, index) in activityData.playerAvatars.slice(0, 6)" :key="index" class="user-img"
                            :src="item" mode="aspectFill"></image>
                        <view class="user-img more" v-if="activityData.playerAvatars.length > 6">+{{ activityData.playerAvatars.length - 6 }}
                        </view>
                    </template>
                    <view class="join-tag" v-if="activityData.remainingSlots > 0">
                        {{ activityData.playerCount }}/{{ activityData.remainingSlots + activityData.playerCount }}
                    </view>
                    <view class="full-tag" v-if="activityData.remainingSlots == 0">名额已满</view>
                </view>
                <view class="join-btn">报名球局</view>
            </view>
        </view>
    </view>
</template>

<script setup>
const props = defineProps({
    activityData: {
        type: Object,
        default: () => { }
    }
});

const toActivityDetail = () => {
    if (!props.activityData.gameInfoId) return;
    uni.navigateTo({
        url: `/pages/activity/detail?id=${props.activityData.gameInfoId}`
    });
}
</script>

<style scoped lang="scss">
.activity-card-wrap {
    display: flex;
    flex-direction: column;
    margin-bottom: 40rpx;

    .top-img {
        width: 100%;
        height: 300rpx;
        object-fit: contain;
        border-radius: 20rpx 20rpx 0 0;
    }

    .bottom-wrap {
        padding: 20rpx 30rpx;
        background: #FFFFFF;
        border-radius: 0 0 20rpx 20rpx;
        border: 1px solid #EEEEEE;

        .name {
            margin-bottom: 20rpx;
            font-size: 36rpx;
            font-weight: bold;
        }

        .info-wrap {
            display: flex;
            flex-direction: column;

            .info-item {
                display: flex;
                align-items: center;
                margin-top: 10rpx;

                .value {
                    margin-left: 16rpx;
                }
            }
        }
    }

    .join-wrap {
        display: flex;
        justify-content: space-between;
        gap: 40rpx;
        margin-top: 30rpx;

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

            .more {
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
                font-size: 22rpx;
                border-color: #F3F3F3;
            }

            .join-tag {
                margin-left: 20rpx;
                font-size: 26rpx;
                color: var(--main-color);
            }

            .full-tag {
                padding: 6rpx 16rpx;
                font-size: 22rpx;
                color: #ff4d4f;
                background: #fff1f0;
                border-radius: 40rpx;
                white-space: nowrap;
            }
        }

        .join-btn {
            width: fit-content;
            padding: 16rpx 38rpx;
            line-height: 18px;
            border-radius: 10rpx;
            color: var(--text-btn);
            font-weight: 600;
            background: linear-gradient(to right, var(--left-linear), var(--right-linear));
        }
    }
}
</style>