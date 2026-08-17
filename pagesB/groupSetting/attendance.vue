<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>

        <view class="attendance-wrap">
            <view class="club-info">
                <image class="club-avatar"
                    src="https://pic.rmb.bdstatic.com/bjh/news/3fe6db1a8d291be39192f9a06c74ce99.png" mode="aspectFill">
                </image>
                <text class="club-name">天天开心</text>
            </view>

            <view class="tab-bar">
                <view>
                    <text class="tab-item" :class="{ active: state.filterTime === 'current' }"
                        @click="handleSelectTime('current')">
                        本{{ filterTypeName }}
                    </text>
                    <text class="tab-item" :class="{ active: state.filterTime === 'last' }"
                        @click="handleSelectTime('last')">
                        上{{ filterTypeName }}
                    </text>
                </view>
                <view class="filter-btn" @click="openFilter">
                    <text class="text">筛选</text>
                    <uv-icon name="arrow-down" size="12"></uv-icon>
                </view>
            </view>

            <view class="main-wrap">
                <view class="empty-wrap" v-if="!state.dataList?.length">
                    <view class="empty-icon">
                        <uv-icon name="empty-data" size="30" color="#FFFFFF"></uv-icon>
                    </view>
                    <text class="empty-text">暂无记录</text>
                </view>
                <view class="list-wrap" v-else>
                    <view class="list-item" v-for="(item, index) in state.dataList" :key="index">
                        <view class="rank-number">{{ index + 1 }}</view>
                        <image class="item-avatar" :src="item.avatar" mode="aspectFill"></image>
                        <text class="item-name">{{ item.name }}</text>
                        <text class="item-count">{{ item.count }}次</text>
                    </view>
                </view>
            </view>

            <view class="footer-user">
                <image class="avatar" src="https://pic.rmb.bdstatic.com/bjh/news/3fe6db1a8d291be39192f9a06c74ce99.png">
                </image>
                <!-- <image class="avatar" :src="storeState.userInfo?.avatar"></image> -->
                <text class="name">{{ storeState.userInfo?.name || '言言' }}</text>
                <text class="count">6次</text>
            </view>
        </view>

        <uv-picker ref="typePickerRef" :columns="[state.filterList]" keyName="label" @confirm="handleSelectType"></uv-picker>
    </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

import Navbar from '@/components/Navbar.vue';

import { useMainStore } from '@/store';
const { themeInfo, storeState } = useMainStore();

const typePickerRef = ref(null);

const state = reactive({
    filterType: 'week',
    filterTime: 'current',  // current - 本月 last - 上月
    filterList: [
        { label: '按周', name: '周', value: 'week' },
        { label: '按月', name: '月', value: 'month' },
        { label: '按季度', name: '季度', value: 'quarter' },
        { label: '按年', name: '年', value: 'year' },
    ],
    dataList: []
});

const filterTypeName = computed(() => {
    const item = state.filterList.find(item => item.value === state.filterType);
    return item?.name || '';
});

const openFilter = () => {
    typePickerRef.value?.open();
}

const handleSelectType = (e) => {
    state.filterType = e.value[0]?.value;
    getList();
}

const handleSelectTime = (type) => {
    state.filterTime = type;
    getList();
}

const getList = () => {
    state.dataList = []
}
</script>

<style lang="scss" scoped>
.attendance-wrap {
    display: flex;
    flex-direction: column;
    padding: 20rpx 30rpx 100rpx;

    .club-info {
        display: flex;
        align-items: center;

        .club-avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
        }

        .club-name {
            margin-left: 20rpx;
        }
    }

    .tab-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--padding-size) 0;

        .tab-item {
            position: relative;
            margin-right: 40rpx;
            font-size: 30rpx;

            &.active {
                color: var(--text-dark);
                font-weight: 600;

                &::after {
                    content: '';
                    position: absolute;
                    bottom: -8rpx;
                    left: 0;
                    width: 100%;
                    height: 8rpx;
                    border-radius: 8rpx;
                    background: var(--main-color);
                }
            }
        }

        .filter-btn {
            display: flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 4px;
            background-color: #FFFFFF;

            .text {
                margin-right: 16rpx;
                font-size: 28rpx;
            }
        }
    }

    .main-wrap {
        height: calc(100vh - 600rpx);
        background-color: #FFFFFF;
        border-radius: 20rpx;
        overflow: auto;

        .empty-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;

            .empty-icon {
                width: 120rpx;
                height: 120rpx;
                background: linear-gradient(135deg, var(--left-linear) 0%, var(--right-linear) 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20rpx;
            }

            .empty-text {
                font-size: 28rpx;
                color: #C0C4CC;
            }
        }

        .list-wrap {
            .list-item {
                display: flex;
                align-items: center;
                padding: 28rpx 30rpx;
                margin-bottom: 12rpx;
                background-color: #ffffff;
                border-bottom: 1rpx solid var(--border-color);

                &:last-child {
                    border-bottom: none;
                }

                .rank-number {
                    width: 60rpx;
                    font-size: 28rpx;
                    color: var(--text-dark);
                    text-align: center;
                    font-weight: 500;

                    &:nth-child(1) {
                        color: #ffffff;
                        background: linear-gradient(90deg, var(--left-linear), var(--right-linear));
                        border-radius: 50%;
                        width: 40rpx;
                        height: 40rpx;
                        line-height: 40rpx;
                        margin: 0 10rpx;
                    }
                }

                .item-avatar {
                    width: 60rpx;
                    height: 60rpx;
                    border-radius: 50%;
                    margin: 0 20rpx;
                    border: 2rpx solid var(--light-color2);
                    box-shadow: 0 2rpx 8rpx rgba(168, 245, 247, 0.3);
                }

                .item-name {
                    flex: 1;
                    font-size: 30rpx;
                    color: var(--text-dark);
                    font-weight: 400;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .item-count {
                    width: 80rpx;
                    margin-left: 30rpx;
                    font-size: 28rpx;
                    color: var(--text-light);
                    font-weight: 500;
                }
            }
        }
    }

    .footer-user {
        position: fixed;
        bottom: 0;
        left: 0;
        display: flex;
        align-items: center;
        padding: 30rpx 40rpx;
        width: 100%;
        background: #FFFFFF;
        box-sizing: border-box;

        .avatar {
            width: 60rpx;
            height: 60rpx;
            border-radius: 50%;
            margin-right: 20rpx;
        }

        .name {
            flex: 1;
            font-size: 30rpx;
            color: #303133;
        }

        .count {
            font-size: 28rpx;
            color: #909399;
        }
    }
}
</style>