<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="record-wrap">
            <view class="tab-bar">
                <view class="tab-item" v-for="item in state.tabList" :key="item.key"
                    :class="{ active: state.currentTab === item.key }" @click="state.currentTab = item.key">
                    {{ item.title }}
                </view>
            </view>
            <view class="activity-list">
                <view v-if="!state.activityList?.length" class="empty">
                    暂无活动
                </view>
                <template v-else>
                    <ActivityCard v-for="(item, index) in state.activityList" :key="index" :activity-data="item">
                    </ActivityCard>
                </template>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

import Navbar from '@/components/Navbar.vue';
import ActivityCard from '@/components/ActivityCard.vue';

import { useMainStore } from '@/store';
const { themeInfo } = useMainStore();

const state = reactive({
    currentTab: 'all',
    tabList: [
        { key: 'all', title: '全部' },
        { key: 'upcoming', title: '未开始' },
        { key: 'ongoing', title: '活动中' },
        { key: 'ended', title: '已结束' },
        { key: 'canceled', title: '已取消' },
    ],
    activityList: []
});

onMounted(() => {
    fetchList();
});

const fetchList = () => {
    state.activityList = [
        {
            id: 1,
            title: '城市骑行活动',
            desc: '一起骑行，感受城市的风光。',
            time: '2023-10-01 09:00',
            address: '北京市朝阳区',
            remainingSlots: 0,
            startTime: '2023-10-01 09:00',
            endTime: '2023-10-01 12:00',
            playerCount: 2,
            picsList: ['https://inews.gtimg.com/om_bt/O6SG7dHjdG0kWNyWz6WPo2_3v6A6eAC9ThTazwlKPO1qMAA/641'],
            playerAvatars: ['https://inews.gtimg.com/om_bt/O6SG7dHjdG0kWNyWz6WPo2_3v6A6eAC9ThTazwlKPO1qMAA/641', 'https://inews.gtimg.com/om_bt/O6SG7dHjdG0kWNyWz6WPo2_3v6A6eAC9ThTazwlKPO1qMAA/641']
        }
    ];
}
</script>

<style lang="scss" scoped>
.record-wrap {
    padding: 0 var(--padding-size);

    .tab-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: var(--padding-size);

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

    .activity-list {
        .empty {
            text-align: center;
            color: var(--text-light);
            padding-top: 400rpx;
        }
    }
}
</style>
