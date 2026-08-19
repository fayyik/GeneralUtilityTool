<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="page-wrap">
            <!-- 分类 -->
            <view class="cat-bar">
                <view
                    v-for="cat in cats"
                    :key="cat.value"
                    class="cat-item"
                    :class="{ active: state.cat === cat.value }"
                    @click="switchCat(cat.value)"
                >
                    {{ cat.label }}
                </view>
            </view>

            <!-- 输入 -->
            <view class="card">
                <view class="input-row">
                    <input
                        class="num-input"
                        type="digit"
                        v-model="state.value"
                        placeholder="输入数值"
                        placeholder-class="ph"
                    />
                    <view class="input-unit">{{ currentUnit.label }}</view>
                </view>
            </view>

            <!-- 单位选择 -->
            <view class="card">
                <view class="unit-list">
                    <view
                        v-for="(u, i) in units"
                        :key="i"
                        class="unit-item"
                        :class="{ active: i === state.unitIndex }"
                        @click="state.unitIndex = i"
                    >
                        <view class="unit-label">{{ u.label }}</view>
                        <view class="unit-val" v-if="results[i] !== null">{{ results[i] }}</view>
                    </view>
                </view>
            </view>

            <view class="tip">以选中单位为基准，实时换算所有单位</view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import Navbar from '@/components/Navbar.vue';

const cats = [
    { value: 'length', label: '长度' },
    { value: 'weight', label: '重量' },
    { value: 'temp', label: '温度' },
];

// 长度/重量：相对基准单位（米 / 千克）的倍数
const UNIT_DATA = {
    length: [
        { label: '毫米', v: 0.001 },
        { label: '厘米', v: 0.01 },
        { label: '米', v: 1 },
        { label: '千米', v: 1000 },
        { label: '寸', v: 0.033333333 },
        { label: '尺', v: 0.333333333 },
        { label: '英寸', v: 0.0254 },
        { label: '英尺', v: 0.3048 },
        { label: '码', v: 0.9144 },
        { label: '英里', v: 1609.344 },
        { label: '海里', v: 1852 },
    ],
    weight: [
        { label: '毫克', v: 0.000001 },
        { label: '克', v: 0.001 },
        { label: '千克', v: 1 },
        { label: '吨', v: 1000 },
        { label: '两', v: 0.05 },
        { label: '斤', v: 0.5 },
        { label: '磅', v: 0.45359237 },
        { label: '盎司', v: 0.028349523125 },
        { label: '克拉', v: 0.0002 },
    ],
    temp: [
        { label: '摄氏度 ℃', toC: (v) => v, fromC: (c) => c },
        { label: '华氏度 ℉', toC: (v) => (v - 32) * 5 / 9, fromC: (c) => c * 9 / 5 + 32 },
        { label: '开尔文 K', toC: (v) => v - 273.15, fromC: (c) => c + 273.15 },
    ],
};

const state = reactive({
    cat: 'length',
    value: '',
    unitIndex: 0,
});

const switchCat = (cat) => {
    state.cat = cat;
    state.unitIndex = 0;
};

const units = computed(() => UNIT_DATA[state.cat]);

const currentUnit = computed(() => units.value[state.unitIndex]);

const num = computed(() => parseFloat(state.value));

const results = computed(() => {
    const n = num.value;
    if (isNaN(n)) return units.value.map(() => null);
    const base = currentUnit.value;
    if (state.cat === 'temp') {
        const celsius = base.toC(n);
        return units.value.map((u) => fmt(u.fromC(celsius)));
    }
    return units.value.map((u) => fmt(n * base.v / u.v));
});

const fmt = (n) => {
    if (!isFinite(n)) return '-';
    if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-9 && n !== 0)) return n.toExponential(4);
    const s = parseFloat(n.toPrecision(10)).toString();
    return s;
};
</script>

<style scoped lang="scss">
.page-wrap {
    padding: 0 40rpx 120rpx;

    .cat-bar {
        display: flex;
        gap: 20rpx;
        margin: 30rpx 0;

        .cat-item {
            flex: 1;
            padding: 22rpx 0;
            text-align: center;
            font-size: 28rpx;
            font-weight: 600;
            color: var(--text-light);
            background: #F5F6FA;
            border-radius: 18rpx;
            border: 2rpx solid transparent;

            &.active {
                color: var(--main-color);
                background: rgba(78, 140, 255, 0.1);
                border-color: var(--main-color);
            }
        }
    }

    .card {
        background: #FFFFFF;
        border-radius: 24rpx;
        padding: 30rpx;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
        margin-bottom: 24rpx;

        .input-row {
            display: flex;
            align-items: center;

            .num-input {
                flex: 1;
                font-size: 44rpx;
                font-weight: 700;
                color: var(--text-dark);
            }

            .ph {
                color: #C0C4CC;
            }

            .input-unit {
                margin-left: 20rpx;
                font-size: 28rpx;
                color: var(--main-color);
                font-weight: 600;
            }
        }

        .unit-list {
            display: flex;
            flex-wrap: wrap;
            gap: 18rpx;

            .unit-item {
                width: 48%;
                padding: 24rpx 20rpx;
                background: #F5F6FA;
                border-radius: 16rpx;
                border: 2rpx solid transparent;
                box-sizing: border-box;

                &.active {
                    background: rgba(78, 140, 255, 0.1);
                    border-color: var(--main-color);
                }

                .unit-label {
                    font-size: 26rpx;
                    font-weight: 600;
                    color: var(--text-dark);
                }

                .unit-val {
                    margin-top: 10rpx;
                    font-size: 30rpx;
                    color: var(--main-color);
                    font-weight: 700;
                    word-break: break-all;
                }
            }
        }
    }

    .tip {
        margin-top: 10rpx;
        text-align: center;
        font-size: 22rpx;
        color: var(--text-light);
    }
}
</style>