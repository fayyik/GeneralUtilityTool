<template>
    <view class="waterfall-list">
        <uv-waterfall ref="waterfall" v-model="props.list" :add-time="10" column-gap="20" @changeList="changeList">
            <template v-slot:list1>
                <view>
                    <view v-for="item in state.list1" :key="item.id" class="waterfall-item">
                        <image class="waterfall-image" :src="item.image" mode="widthFix" :style="{ width: item.width + 'px' }"></image>
                        <view class="waterfall-info" :style="{ width: item.width + 'px' }">
                            <view class="desc">{{ item.desc }}</view>
                            <view class="info-wrap">
                                <view class="title-wrap">
                                    <image class="avatar" :src="item.image" ></image>
                                    <view class="title">{{ item.title }}</view>
                                </view>
                                <view class="join-btn">加入</view>
                            </view>
                        </view>
                    </view>
                </view>
            </template>
            <template v-slot:list2>
                <view>
                    <view v-for="item in state.list2" :key="item.id" class="waterfall-item">
                        <image class="waterfall-image" :src="item.image" mode="widthFix" :style="{ width: item.width + 'px' }"></image>
                        <view class="waterfall-info" :style="{ width: item.width + 'px' }">
                            <view class="desc">{{ item.desc }}</view>
                            <view class="info-wrap">
                                <view class="title-wrap">
                                    <image class="avatar" :src="item.image" ></image>
                                    <view class="title">{{ item.title }}</view>
                                </view>
                                <view class="join-btn">加入</view>
                            </view>
                        </view>
                    </view>
                </view>
            </template>
        </uv-waterfall>
    </view>
</template>

<script setup>
import { reactive } from 'vue';

const props = defineProps({
    list: {
        type: Array,
        default: () => []
    }
});

const state = reactive({
    list: [],
    list1: [],
    list2: [],
});

const changeList = (e) => {
    state[e.name].push(e.value);
}
</script>

<style scoped lang="scss">
.waterfall-item {
    overflow: hidden;
    margin-top: 10px;
    border-radius: 6px;

    .waterfall-image {
        display: block;
    }
}

.waterfall-info {
    background: #FFFFFF;
    padding: 20rpx;
    box-sizing: border-box;

    .desc {
        margin-bottom: 10rpx;
        font-size: 26rpx;
        color: var(--text-light);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .info-wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;

        .title-wrap {
            display: flex;
            align-items: center;
            width: calc(100% - 80rpx);

            .avatar {
                width: 30rpx;
                height: 30rpx;
                border-radius: 50%;
                margin-right: 10rpx;
            }

            .title {
                width: calc(90% - 40rpx);
                font-size: 26rpx;
                color: var(--text-dark);
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
        }

        .join-btn {
            width: 80rpx;
            min-width: 80rpx;
            padding: 10rpx 0;
            font-size: 24rpx;
            color: #FFFFFF;
            text-align: center;
            border-radius: 20rpx;
            background: var(--main-color);
        }
    }
}
</style>