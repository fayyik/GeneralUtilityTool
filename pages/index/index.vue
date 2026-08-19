<template>
    <view class="container" :class="[`${themeInfo.theme}-theme`]">
        <view class="home-wrap" :style="{ 'padding-top': `${state.navHeight}px` }">
            <view class="header">
                <view class="title">万能工具箱</view>
                <view class="subtitle">效率 · 时间 · 图片 · 计算</view>
            </view>

            <view class="section" v-for="(group, gIndex) in toolGroups" :key="gIndex">
                <view class="section-title">
                    <view class="section-left">
                        <view class="bar"></view>
                        <view class="name">{{ group.name }}</view>
                    </view>
                    <view class="desc">{{ group.desc }}</view>
                </view>
                <view class="tool-grid">
                    <view class="tool-item" v-for="(tool, tIndex) in group.tools" :key="tIndex" @click="openTool(tool)">
                        <view class="icon-wrap" :style="{ background: tool.bg }">
                            <uv-icon :name="tool.icon" :color="tool.color" :size="30"></uv-icon>
                        </view>
                        <view class="tool-name">{{ tool.name }}</view>
                        <view class="tool-desc">{{ tool.desc }}</view>
                    </view>
                </view>
            </view>
        </view>
        <CustomTabBar :selected="0"></CustomTabBar>
    </view>
</template>

<script setup>
import { reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { navbarHeightAndStatusBarHeight } from '@/utils/common';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import CustomTabBar from '@/components/CustomTabbar.vue';

const state = reactive({
    navHeight: 0,
});

const toolGroups = [
    {
        name: '效率工具',
        desc: '专注 · 记录',
        tools: [
            { name: '番茄时钟', desc: '25min 专注', icon: 'clock-fill', color: '#FFFFFF', bg: 'linear-gradient(135deg, #4E8CFF, #2E9BFF)', url: '/pages/tools/pomodoro/index', implemented: true },
            { name: '专注任务', desc: '任务清单', icon: 'list-dot', color: '#FFFFFF', bg: 'linear-gradient(135deg, #34D399, #059669)', url: '/pages/tools/pomodoro/task', implemented: true },
            { name: '专注统计', desc: '数据趋势', icon: 'grid-fill', color: '#FFFFFF', bg: 'linear-gradient(135deg, #8B7CF6, #6C5CE7)', url: '/pages/tools/pomodoro/stats', implemented: true },
        ],
    },
    {
        name: '时间工具',
        desc: '日历 · 倒计时',
        tools: [
            { name: '节假日日历', desc: '放假安排', icon: 'calendar', color: '#FFFFFF', bg: 'linear-gradient(135deg, #FFB199, #FF7E5F)', url: '/pages/tools/calendar/index', implemented: true },
            { name: '倒数纪念日', desc: '纪念日倒计时', icon: 'pushpin-fill', color: '#FFFFFF', bg: 'linear-gradient(135deg, #A18CD1, #8E6CC4)', url: '/pages/tools/calendar/events', implemented: true },
        ],
    },
    {
        name: '图片工具',
        desc: '拼接 · 切图',
        tools: [
            { name: '图片拼接', desc: '多图拼接', icon: 'photo-fill', color: '#FFFFFF', bg: 'linear-gradient(135deg, #FFD08A, #FFA94D)', url: '/pages/tools/image/merge', implemented: true },
            { name: '九宫格切图', desc: '朋友圈九图', icon: 'grid', color: '#FFFFFF', bg: 'linear-gradient(135deg, #FFA3B1, #FF6B81)', url: '/pages/tools/image/grid', implemented: true },
        ],
    },
    {
        name: '计算工具',
        desc: '换算 · 健康',
        tools: [
            { name: '单位换算', desc: '长度重量温度', icon: 'sort', color: '#FFFFFF', bg: 'linear-gradient(135deg, #5CC8FF, #2E9BFF)', url: '/pages/tools/calc/unit', implemented: true },
            { name: '汇率换算', desc: '汇率查询', icon: 'red-packet', color: '#FFFFFF', bg: 'linear-gradient(135deg, #FFD08A, #FFA94D)', url: '/pages/tools/calc/rate', implemented: true },
            { name: 'BMI 计算', desc: '体质指数', icon: 'heart-fill', color: '#FFFFFF', bg: 'linear-gradient(135deg, #FF8FB1, #FF5E88)', url: '/pages/tools/calc/bmi', implemented: true },
            { name: '健康指标', desc: '体重标准', icon: 'fire-fill', color: '#FFFFFF', bg: 'linear-gradient(135deg, #34D399, #059669)', url: '/pages/tools/calc/health', implemented: true },
        ],
    },
    {
        name: '趣味娱乐',
        desc: '随机 · 游戏',
        tools: [
            { name: '抽签随机', desc: '随机决定', icon: 'refresh', color: '#FFFFFF', bg: 'linear-gradient(135deg, #A18CD1, #8E6CC4)', url: '/pages/tools/fun/draw', implemented: false },
            { name: '骰子', desc: '摇骰子', icon: 'more-dot-fill', color: '#FFFFFF', bg: 'linear-gradient(135deg, #FFB199, #FF7E5F)', url: '/pages/tools/fun/dice', implemented: false },
            { name: '亲戚称呼', desc: '称呼计算器', icon: 'account-fill', color: '#FFFFFF', bg: 'linear-gradient(135deg, #5CC8FF, #2E9BFF)', url: '/pages/tools/fun/relation', implemented: false },
            { name: '斗地主记牌', desc: '记牌器', icon: 'coupon', color: '#FFFFFF', bg: 'linear-gradient(135deg, #8B7CF6, #6C5CE7)', url: '/pages/tools/fun/card', implemented: false },
        ],
    },
];

const openTool = (tool) => {
    if (tool.implemented) {
        uni.navigateTo({
            url: tool.url,
        });
    } else {
        uni.showToast({
            title: '开发中，敬请期待',
            icon: 'none',
        });
    }
}

onLoad(() => {
    state.navHeight = navbarHeightAndStatusBarHeight().navbarHeight;
});
</script>

<style scoped lang="scss">
.home-wrap {
    position: relative;
    width: 100%;
    min-height: 100vh;
    padding: 0 40rpx 200rpx;
    box-sizing: border-box;
    background: linear-gradient(180deg,
            rgba(var(--rgb-color-left), 0.3),
            rgba(var(--rgb-color-right), 0.3) 40%,
            #F6F9F8 70%);

    .header {
        padding: 40rpx 0 30rpx;

        .title {
            font-size: 56rpx;
            font-weight: 700;
            color: var(--text-dark);
        }

        .subtitle {
            margin-top: 12rpx;
            font-size: 26rpx;
            color: var(--text-light);
            letter-spacing: 2rpx;
        }
    }

    .section {
        margin-top: 40rpx;

        .section-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24rpx;

            .section-left {
                display: flex;
                align-items: center;

                .bar {
                    width: 8rpx;
                    height: 32rpx;
                    margin-right: 16rpx;
                    border-radius: 8rpx;
                    background: linear-gradient(180deg, var(--left-linear), var(--right-linear));
                }

                .name {
                    font-size: 34rpx;
                    font-weight: 600;
                    color: var(--text-dark);
                }
            }

            .desc {
                font-size: 24rpx;
                color: var(--text-light);
            }
        }

        .tool-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24rpx;

            .tool-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 30rpx 0;
                background: #FFFFFF;
                border-radius: 24rpx;
                box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);

                .icon-wrap {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 96rpx;
                    height: 96rpx;
                    border-radius: 28rpx;
                    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
                }

                .tool-name {
                    margin-top: 20rpx;
                    font-size: 28rpx;
                    font-weight: 600;
                    color: var(--text-dark);
                }

                .tool-desc {
                    margin-top: 8rpx;
                    font-size: 22rpx;
                    color: var(--text-light);
                }
            }
        }
    }
}
</style>