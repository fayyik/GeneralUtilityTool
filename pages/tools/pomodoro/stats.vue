<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="stats-wrap">
            <!-- 时间范围切换 -->
            <view class="range-tabs">
                <view class="range-item" v-for="r in rangeList" :key="r.key"
                    :class="{ active: state.range === r.key }" @click="switchRange(r.key)">
                    {{ r.label }}
                </view>
            </view>

            <!-- 指标卡 -->
            <view class="metric-cards">
                <view class="metric-card">
                    <view class="num">{{ rangeData.pomodoros }}</view>
                    <view class="label">完成专注</view>
                </view>
                <view class="metric-card">
                    <view class="num">{{ rangeData.minutes }}</view>
                    <view class="label">专注分钟</view>
                </view>
                <view class="metric-card">
                    <view class="num">{{ rangeData.days }}</view>
                    <view class="label">专注天数</view>
                </view>
            </view>

            <!-- 近7天柱状图 -->
            <view class="chart-card">
                <view class="chart-title">近 7 天专注</view>
                <view class="chart">
                    <view class="bar-item" v-for="(item, index) in weekData" :key="index">
                        <view class="bar-wrap">
                            <view class="bar" :style="{ height: item.pct + '%' }">
                                <view class="bar-value" v-if="item.count > 0">{{ item.count }}</view>
                            </view>
                        </view>
                        <view class="bar-label">{{ item.label }}</view>
                    </view>
                </view>
            </view>

            <!-- 记录列表 -->
            <view class="record-section">
                <view class="record-title">最近记录</view>
                <view class="record-empty" v-if="recordList.length === 0">
                    <view class="empty-text">还没有专注记录</view>
                </view>
                <view class="record-list" v-else>
                    <view class="record-item" v-for="record in recordList" :key="record.id">
                        <view class="record-dot" :class="record.status === 'completed' ? 'ok' : 'interrupted'"></view>
                        <view class="record-main">
                            <view class="record-name">{{ record.taskName }}</view>
                            <view class="record-time">{{ record.date }} {{ record.startTime }}</view>
                        </view>
                        <view class="record-right">
                            <view class="record-duration">{{ Math.round(record.duration / 60) }}min</view>
                            <view class="record-status"
                                :class="record.status === 'completed' ? 'ok-text' : 'interrupted-text'">
                                {{ record.status === 'completed' ? '完成' : '中断' }}
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import Navbar from '@/components/Navbar.vue';
import storage from '@/utils/storage';

const rangeList = [
    { key: 'today', label: '今日' },
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' },
    { key: 'all', label: '全部' },
];

const state = reactive({
    range: 'week',
});

const records = ref([]);

const isSameDay = (dateStr, date) => {
    const d = new Date(date);
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return dateStr === str;
};

const filterByRange = (record) => {
    const now = new Date();
    const recordDate = new Date(record.date);
    switch (state.range) {
        case 'today':
            return isSameDay(record.date, now);
        case 'week': {
            const day = (now.getDay() + 6) % 7; // 周一为一周开始
            const monday = new Date(now);
            monday.setDate(now.getDate() - day);
            monday.setHours(0, 0, 0, 0);
            return recordDate >= monday && recordDate <= now;
        }
        case 'month': {
            return recordDate.getFullYear() === now.getFullYear() && recordDate.getMonth() === now.getMonth();
        }
        default:
            return true;
    }
};

const focusRecords = computed(() =>
    records.value.filter(r => r.mode === 'focus' && r.status === 'completed')
);

const rangeData = computed(() => {
    const list = focusRecords.value.filter(filterByRange);
    const pomodoros = list.length;
    const minutes = list.reduce((sum, r) => sum + Math.round(r.duration / 60), 0);
    const days = new Set(list.map(r => r.date)).size;
    return { pomodoros, minutes, days };
});

const weekData = computed(() => {
    const days = [];
    const labels = ['日', '一', '二', '三', '四', '五', '六'];
    const today = new Date();
    let max = 1;
    const counts = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const count = focusRecords.value.filter(r => r.date === dateStr).length;
        counts.push(count);
        if (count > max) max = count;
        days.push({ date: dateStr, label: labels[d.getDay()], count });
    }

    return days.map((d, i) => ({
        ...d,
        pct: max ? Math.round((counts[i] / max) * 100) : 0,
    }));
});

const recordList = computed(() => {
    const list = records.value.filter(filterByRange);
    return list.slice(0, 20);
});

const switchRange = (key) => {
    state.range = key;
};

onShow(() => {
    records.value = storage.getRecords();
});
</script>

<style scoped lang="scss">
.stats-wrap {
    padding: 0 40rpx 80rpx;
    box-sizing: border-box;

    .range-tabs {
        display: flex;
        justify-content: space-between;
        padding: 8rpx;
        margin-bottom: 30rpx;
        background: rgba(255, 255, 255, 0.85);
        border-radius: 44rpx;
        box-shadow: var(--box-shadow);

        .range-item {
            flex: 1;
            padding: 14rpx 0;
            text-align: center;
            font-size: 28rpx;
            color: var(--text-light);
            border-radius: 36rpx;
            transition: all 0.2s;

            &.active {
                color: #FFFFFF;
                font-weight: 600;
                background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
            }
        }
    }

    .metric-cards {
        display: flex;
        justify-content: space-between;

        .metric-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 30%;
            padding: 40rpx 0;
            background: #FFFFFF;
            border-radius: 20rpx;
            box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);

            .num {
                font-size: 48rpx;
                font-weight: 700;
                color: var(--text-dark);
            }

            .label {
                margin-top: 10rpx;
                font-size: 24rpx;
                color: var(--text-light);
            }
        }
    }

    .chart-card {
        padding: 30rpx;
        margin-top: 30rpx;
        background: #FFFFFF;
        border-radius: 20rpx;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);

        .chart-title {
            font-size: 28rpx;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 30rpx;
        }

        .chart {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            height: 280rpx;

            .bar-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                height: 100%;

                .bar-wrap {
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    width: 100%;
                    height: 240rpx;

                    .bar {
                        position: relative;
                        width: 40rpx;
                        min-height: 8rpx;
                        background: linear-gradient(180deg, var(--right-linear), var(--left-linear));
                        border-radius: 8rpx 8rpx 0 0;

                        .bar-value {
                            position: absolute;
                            top: -32rpx;
                            left: 50%;
                            transform: translateX(-50%);
                            font-size: 20rpx;
                            color: var(--text-light);
                        }
                    }
                }

                .bar-label {
                    margin-top: 10rpx;
                    font-size: 22rpx;
                    color: var(--text-light);
                }
            }
        }
    }

    .record-section {
        margin-top: 30rpx;

        .record-title {
            font-size: 30rpx;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 20rpx;
        }

        .record-empty {
            padding: 60rpx 0;
            text-align: center;

            .empty-text {
                font-size: 26rpx;
                color: var(--text-light);
            }
        }

        .record-list {
            .record-item {
                display: flex;
                align-items: center;
                padding: 26rpx 30rpx;
                margin-bottom: 16rpx;
                background: #FFFFFF;
                border-radius: 16rpx;
                box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

                .record-dot {
                    width: 16rpx;
                    height: 16rpx;
                    margin-right: 20rpx;
                    border-radius: 50%;

                    &.ok {
                        background: #34D399;
                    }

                    &.interrupted {
                        background: #FFB199;
                    }
                }

                .record-main {
                    flex: 1;
                    overflow: hidden;

                    .record-name {
                        font-size: 28rpx;
                        color: var(--text-dark);
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }

                    .record-time {
                        margin-top: 8rpx;
                        font-size: 22rpx;
                        color: var(--text-light);
                    }
                }

                .record-right {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;

                    .record-duration {
                        font-size: 26rpx;
                        font-weight: 600;
                        color: var(--text-dark);
                    }

                    .record-status {
                        margin-top: 6rpx;
                        font-size: 22rpx;

                        &.ok-text {
                            color: #059669;
                        }

                        &.interrupted-text {
                            color: #FF7E5F;
                        }
                    }
                }
            }
        }
    }
}
</style>