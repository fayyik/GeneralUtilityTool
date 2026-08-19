<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="page-wrap">
            <!-- 输入 -->
            <view class="card">
                <view class="gender-bar">
                    <view
                        class="gender-item"
                        :class="{ active: state.gender === 'male' }"
                        @click="state.gender = 'male'"
                    >
                        男
                    </view>
                    <view
                        class="gender-item"
                        :class="{ active: state.gender === 'female' }"
                        @click="state.gender = 'female'"
                    >
                        女
                    </view>
                </view>

                <view class="field">
                    <view class="field-label">身高</view>
                    <view class="field-input">
                        <input class="num-input" type="digit" v-model="state.height" placeholder="请输入" placeholder-class="ph" />
                        <view class="field-unit">cm</view>
                    </view>
                </view>
                <view class="field">
                    <view class="field-label">体重</view>
                    <view class="field-input">
                        <input class="num-input" type="digit" v-model="state.weight" placeholder="请输入" placeholder-class="ph" />
                        <view class="field-unit">kg</view>
                    </view>
                </view>
                <view class="field">
                    <view class="field-label">年龄</view>
                    <view class="field-input">
                        <input class="num-input" type="number" v-model="state.age" placeholder="请输入" placeholder-class="ph" />
                        <view class="field-unit">岁</view>
                    </view>
                </view>
            </view>

            <!-- 结果 -->
            <view class="card" v-if="valid">
                <view class="card-title">身体数据</view>

                <view class="result-grid">
                    <view class="grid-item">
                        <view class="g-val">{{ standardWeight }}</view>
                        <view class="g-label">标准体重 (kg)</view>
                    </view>
                    <view class="grid-item">
                        <view class="g-val">{{ idealWeight }}</view>
                        <view class="g-label">理想体重 (kg)</view>
                    </view>
                    <view class="grid-item">
                        <view class="g-val">{{ bmi }}</view>
                        <view class="g-label">BMI（{{ bmiLabel }}）</view>
                    </view>
                    <view class="grid-item">
                        <view class="g-val">{{ bmr }}</view>
                        <view class="g-label">基础代谢 (kcal)</view>
                    </view>
                    <view class="grid-item">
                        <view class="g-val">{{ bodyFat }}%</view>
                        <view class="g-label">体脂率估算</view>
                    </view>
                </view>

                <view class="card-title sub">每日热量需求 (kcal)</view>
                <view class="cal-list">
                    <view class="cal-item" v-for="(a, i) in activities" :key="i">
                        <view class="cal-label">{{ a.label }}</view>
                        <view class="cal-val">{{ (bmr * a.coef).toFixed(0) }}</view>
                    </view>
                </view>

                <view class="disclaimer">体脂率与代谢为估算值，仅供参考，请以专业检测为准。</view>
            </view>

            <view class="tip" v-else>完善性别、身高、体重、年龄后自动计算</view>
        </view>
    </view>
</template>

<script setup>
import { reactive, computed } from 'vue';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import Navbar from '@/components/Navbar.vue';

const state = reactive({
    gender: 'male',
    height: '',
    weight: '',
    age: '',
});

const h = computed(() => parseFloat(state.height));
const w = computed(() => parseFloat(state.weight));
const age = computed(() => parseFloat(state.age));

const valid = computed(() =>
    !isNaN(h.value) && !isNaN(w.value) && !isNaN(age.value) &&
    h.value > 0 && w.value > 0 && age.value > 0 && age.value < 150
);

// 标准体重（世卫）
const standardWeight = computed(() => {
    if (!valid.value) return '-';
    const v = state.gender === 'male' ? (h.value - 80) * 0.7 : (h.value - 70) * 0.6;
    return v.toFixed(1);
});

// 理想体重（BMI 22）
const idealWeight = computed(() => {
    if (!valid.value) return '-';
    return (22 * (h.value / 100) ** 2).toFixed(1);
});

// BMI
const bmi = computed(() => {
    if (!valid.value) return '-';
    return (w.value / (h.value / 100) ** 2).toFixed(1);
});

const bmiLabel = computed(() => {
    if (!valid.value) return '';
    const b = parseFloat(bmi.value);
    if (b < 18.5) return '偏瘦';
    if (b < 24) return '正常';
    if (b < 28) return '超重';
    return '肥胖';
});

// 基础代谢（Mifflin-St Jeor）
const bmr = computed(() => {
    if (!valid.value) return '-';
    const base = 10 * w.value + 6.25 * h.value - 5 * age.value;
    const v = state.gender === 'male' ? base + 5 : base - 161;
    return v.toFixed(0);
});

// 体脂率估算（Deurenberg）
const bodyFat = computed(() => {
    if (!valid.value) return '-';
    const b = parseFloat(bmi.value);
    const v = state.gender === 'male' ? 1.2 * b + 0.23 * age.value - 16.2 : 1.2 * b + 0.23 * age.value - 5.4;
    return Math.max(3, v).toFixed(1);
});

const activities = [
    { label: '久坐（几乎不运动）', coef: 1.2 },
    { label: '轻度（每周 1-3 次）', coef: 1.375 },
    { label: '中度（每周 3-5 次）', coef: 1.55 },
    { label: '高强度（每周 6-7 次）', coef: 1.725 },
    { label: '极高（体力劳动/训练）', coef: 1.9 },
];
</script>

<style scoped lang="scss">
.page-wrap {
    padding: 0 40rpx 120rpx;

    .card {
        background: #FFFFFF;
        border-radius: 24rpx;
        padding: 30rpx;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
        margin-top: 24rpx;

        .gender-bar {
            display: flex;
            gap: 20rpx;
            padding-bottom: 24rpx;

            .gender-item {
                flex: 1;
                padding: 20rpx 0;
                text-align: center;
                font-size: 28rpx;
                font-weight: 600;
                color: var(--text-light);
                background: #F5F6FA;
                border-radius: 16rpx;
                border: 2rpx solid transparent;

                &.active {
                    color: #FFFFFF;
                    background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
                }
            }
        }

        .field {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20rpx 0;
            border-top: 2rpx solid #F0F1F5;

            .field-label {
                font-size: 30rpx;
                font-weight: 600;
                color: var(--text-dark);
            }

            .field-input {
                display: flex;
                align-items: center;

                .num-input {
                    width: 260rpx;
                    text-align: right;
                    font-size: 34rpx;
                    font-weight: 600;
                    color: var(--text-dark);
                }

                .ph {
                    color: #C0C4CC;
                }

                .field-unit {
                    margin-left: 14rpx;
                    font-size: 26rpx;
                    color: var(--text-light);
                }
            }
        }

        .card-title {
            font-size: 30rpx;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 24rpx;

            &.sub {
                margin-top: 36rpx;
            }
        }

        .result-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 18rpx;

            .grid-item {
                width: 48%;
                padding: 26rpx 20rpx;
                text-align: center;
                background: #F5F6FA;
                border-radius: 16rpx;
                box-sizing: border-box;

                .g-val {
                    font-size: 36rpx;
                    font-weight: 700;
                    color: var(--main-color);
                }

                .g-label {
                    margin-top: 10rpx;
                    font-size: 22rpx;
                    color: var(--text-light);
                }
            }
        }

        .cal-list {
            .cal-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 18rpx 0;
                border-bottom: 2rpx solid #F0F1F5;

                &:last-child {
                    border-bottom: none;
                }

                .cal-label {
                    font-size: 26rpx;
                    color: var(--text-dark);
                }

                .cal-val {
                    font-size: 30rpx;
                    font-weight: 700;
                    color: var(--main-color);
                }
            }
        }

        .disclaimer {
            margin-top: 26rpx;
            padding: 20rpx;
            font-size: 22rpx;
            color: var(--text-light);
            background: #F5F6FA;
            border-radius: 14rpx;
            line-height: 1.6;
        }
    }

    .tip {
        margin-top: 30rpx;
        text-align: center;
        font-size: 24rpx;
        color: var(--text-light);
    }
}
</style>