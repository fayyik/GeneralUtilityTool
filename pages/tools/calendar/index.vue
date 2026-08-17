<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="calendar-wrap">
            <!-- 年份切换 -->
            <view class="year-row">
                <view class="year-btn" :class="{ disabled: !canPrev }" @click="canPrev && prevYear()">
                    <uv-icon name="arrow-left" size="18" :color="canPrev ? '#4E8CFF' : '#CCCCCC'"></uv-icon>
                </view>
                <view class="year-text">{{ state.year }} 年</view>
                <view class="year-btn" :class="{ disabled: !canNext }" @click="canNext && nextYear()">
                    <uv-icon name="arrow-right" size="18" :color="canNext ? '#4E8CFF' : '#CCCCCC'"></uv-icon>
                </view>
            </view>

            <!-- 下一个假期 -->
            <view class="next-card" v-if="nextHoliday">
                <view class="next-left">
                    <view class="next-label">距离下一个假期</view>
                    <view class="next-days">{{ nextHoliday.diffDays }}</view>
                    <view class="next-unit">天</view>
                </view>
                <view class="next-info">
                    <view class="next-name">{{ nextHoliday.name }}</view>
                    <view class="next-date">{{ nextHoliday.start }} ~ {{ nextHoliday.end }}</view>
                    <view class="next-note" v-if="nextHoliday.note">{{ nextHoliday.note }}</view>
                </view>
            </view>

            <!-- 假期列表 -->
            <view class="holiday-list">
                <view class="holiday-card" v-for="(holiday, index) in holidayList" :key="index">
                    <view class="holiday-top">
                        <view class="holiday-name">{{ holiday.name }}</view>
                        <view class="holiday-days">放假 {{ holiday.days }} 天</view>
                    </view>
                    <view class="holiday-date">{{ holiday.start }} ~ {{ holiday.end }}</view>
                    <view class="holiday-note" v-if="holiday.note">{{ holiday.note }}</view>
                </view>
                <view class="empty" v-if="holidayList.length === 0">
                    <view class="empty-text">该年份暂无假期数据</view>
                </view>
            </view>

            <view class="source-tip">数据仅供参考，以国务院办公厅公布为准</view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import Navbar from '@/components/Navbar.vue';
import { getHolidaysByYear, getAvailableYears, getNextHoliday } from '@/config/holidays';

const state = reactive({
    year: new Date().getFullYear(),
});

const holidayList = computed(() => getHolidaysByYear(state.year));

const nextHoliday = computed(() => getNextHoliday());

const availableYears = getAvailableYears();

const yearIndex = computed(() => availableYears.indexOf(state.year));
const canPrev = computed(() => yearIndex.value > 0);
const canNext = computed(() => yearIndex.value < availableYears.length - 1);

const prevYear = () => {
    const index = availableYears.indexOf(state.year);
    if (index > 0) {
        state.year = availableYears[index - 1];
    }
};

const nextYear = () => {
    const index = availableYears.indexOf(state.year);
    if (index < availableYears.length - 1) {
        state.year = availableYears[index + 1];
    }
};

onLoad(() => {
    // 若当前年份不在数据中，回退到最近年份
    if (!availableYears.includes(state.year) && availableYears.length) {
        const current = new Date().getFullYear();
        const closest = availableYears.reduce((prev, cur) =>
            Math.abs(cur - current) < Math.abs(prev - current) ? cur : prev
        );
        state.year = closest;
    }
});
</script>

<style scoped lang="scss">
.calendar-wrap {
    padding: 0 40rpx 80rpx;
    box-sizing: border-box;

    .year-row {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 30rpx;

        .year-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 64rpx;
            height: 64rpx;
            border-radius: 50%;
            background: #FFFFFF;
            box-shadow: var(--box-shadow);

            &.disabled {
                opacity: 0.5;
                background: #F0F1F5;
                box-shadow: none;
            }
        }

        .year-text {
            margin: 0 40rpx;
            font-size: 36rpx;
            font-weight: 700;
            color: var(--text-dark);
        }
    }

    .next-card {
        display: flex;
        align-items: center;
        padding: 40rpx;
        margin-bottom: 30rpx;
        background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
        border-radius: 24rpx;
        box-shadow: 0 16rpx 40rpx rgba(78, 140, 255, 0.25);

        .next-left {
            display: flex;
            align-items: baseline;
            padding-right: 40rpx;
            margin-right: 40rpx;
            border-right: 1px solid rgba(255, 255, 255, 0.4);

            .next-label {
                font-size: 22rpx;
                color: rgba(255, 255, 255, 0.9);
                margin-right: 12rpx;
            }

            .next-days {
                font-size: 64rpx;
                font-weight: 700;
                color: #FFFFFF;
                font-variant-numeric: tabular-nums;
            }

            .next-unit {
                font-size: 24rpx;
                color: rgba(255, 255, 255, 0.9);
                margin-left: 6rpx;
            }
        }

        .next-info {
            flex: 1;

            .next-name {
                font-size: 36rpx;
                font-weight: 700;
                color: #FFFFFF;
            }

            .next-date {
                margin-top: 12rpx;
                font-size: 24rpx;
                color: rgba(255, 255, 255, 0.9);
            }

            .next-note {
                margin-top: 8rpx;
                font-size: 22rpx;
                color: rgba(255, 255, 255, 0.8);
            }
        }
    }

    .holiday-list {
        .holiday-card {
            padding: 30rpx;
            margin-bottom: 24rpx;
            background: #FFFFFF;
            border-radius: 20rpx;
            box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);

            .holiday-top {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .holiday-name {
                    font-size: 32rpx;
                    font-weight: 600;
                    color: var(--text-dark);
                }

                .holiday-days {
                    padding: 6rpx 18rpx;
                    font-size: 22rpx;
                    color: var(--main-color);
                    background: rgba(78, 140, 255, 0.1);
                    border-radius: 20rpx;
                }
            }

            .holiday-date {
                margin-top: 16rpx;
                font-size: 26rpx;
                color: var(--text-light);
            }

            .holiday-note {
                margin-top: 10rpx;
                font-size: 22rpx;
                color: #FF7E5F;
            }
        }

        .empty {
            padding: 80rpx 0;
            text-align: center;

            .empty-text {
                font-size: 26rpx;
                color: var(--text-light);
            }
        }
    }

    .source-tip {
        margin-top: 30rpx;
        text-align: center;
        font-size: 22rpx;
        color: var(--text-light);
    }
}
</style>