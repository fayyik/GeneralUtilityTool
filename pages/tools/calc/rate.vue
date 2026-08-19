<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="page-wrap">
            <!-- 金额与基准货币 -->
            <view class="card">
                <view class="input-row">
                    <input
                        class="num-input"
                        type="digit"
                        v-model="state.amount"
                        placeholder="输入金额"
                        placeholder-class="ph"
                    />
                    <view class="input-unit">{{ state.base }}</view>
                </view>
                <scroll-view scroll-x class="coin-scroll" :show-scrollbar="false">
                    <view class="coin-row">
                        <view
                            v-for="c in coins"
                            :key="c"
                            class="coin-item"
                            :class="{ active: state.base === c }"
                            @click="state.base = c"
                        >
                            {{ c }}
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- 换算结果 -->
            <view class="card">
                <view class="card-title">换算结果</view>
                <view class="result-list">
                    <view class="result-item" v-for="c in coins" :key="c">
                        <view class="r-coin">{{ c }}</view>
                        <view class="r-val">{{ resultOf(c) }}</view>
                    </view>
                </view>
            </view>

            <!-- 汇率表 -->
            <view class="card">
                <view class="card-title">
                    <view>汇率表（兑 1 元人民币）</view>
                    <view class="reset-btn" @click="resetRates">恢复默认</view>
                </view>
                <view class="tip">可点击汇率数字按实时行情修改</view>
                <view class="rate-list">
                    <view class="rate-item" v-for="c in coins" :key="c">
                        <view class="r-coin">{{ c }}</view>
                        <input
                            class="rate-input"
                            type="digit"
                            :value="rates[c]"
                            @blur="onRateBlur(c, $event)"
                        />
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { reactive, computed } from 'vue';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import Navbar from '@/components/Navbar.vue';

const DEFAULT_RATES = {
    CNY: 1,
    USD: 7.13,
    EUR: 7.79,
    JPY: 0.048,
    GBP: 9.05,
    HKD: 0.914,
    KRW: 0.0052,
    SGD: 5.33,
    AUD: 4.72,
    CAD: 5.23,
    CHF: 8.12,
    THB: 0.2,
};

const state = reactive({
    amount: '',
    base: 'CNY',
    rates: { ...DEFAULT_RATES },
});

const coins = computed(() => Object.keys(DEFAULT_RATES));

const rates = computed(() => state.rates);

const amountNum = computed(() => parseFloat(state.amount));

const resultOf = (c) => {
    const n = amountNum.value;
    const baseRate = rates.value[state.base];
    const rate = rates.value[c];
    if (isNaN(n) || !baseRate || !rate) return '-';
    return fmt(n * baseRate / rate);
};

const fmt = (n) => {
    if (!isFinite(n)) return '-';
    const s = parseFloat(n.toPrecision(8)).toString();
    return s;
};

const onRateBlur = (c, e) => {
    const v = parseFloat(e.detail.value);
    if (!isNaN(v) && v > 0) {
        state.rates[c] = v;
    } else {
        state.rates[c] = DEFAULT_RATES[c];
    }
};

const resetRates = () => {
    state.rates = { ...DEFAULT_RATES };
    uni.showToast({ title: '已恢复默认', icon: 'success' });
};
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
                font-size: 32rpx;
                color: var(--main-color);
                font-weight: 700;
            }
        }

        .coin-scroll {
            margin-top: 24rpx;
            white-space: nowrap;

            .coin-row {
                display: inline-flex;
                gap: 16rpx;

                .coin-item {
                    padding: 14rpx 28rpx;
                    font-size: 26rpx;
                    font-weight: 600;
                    color: var(--text-dark);
                    background: #F5F6FA;
                    border-radius: 32rpx;
                    border: 2rpx solid transparent;

                    &.active {
                        color: #FFFFFF;
                        background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
                        border-color: transparent;
                    }
                }
            }
        }

        .card-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 30rpx;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 20rpx;

            .reset-btn {
                font-size: 24rpx;
                font-weight: 500;
                color: var(--main-color);
            }
        }

        .tip {
            font-size: 22rpx;
            color: var(--text-light);
            margin-bottom: 20rpx;
        }

        .result-list {
            display: flex;
            flex-wrap: wrap;
            gap: 16rpx;

            .result-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 48%;
                padding: 20rpx 22rpx;
                background: #F5F6FA;
                border-radius: 14rpx;
                box-sizing: border-box;

                .r-coin {
                    font-size: 26rpx;
                    font-weight: 600;
                    color: var(--text-light);
                }

                .r-val {
                    font-size: 30rpx;
                    font-weight: 700;
                    color: var(--text-dark);
                }
            }
        }

        .rate-list {
            .rate-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16rpx 0;
                border-bottom: 2rpx solid #F0F1F5;

                &:last-child {
                    border-bottom: none;
                }

                .r-coin {
                    font-size: 28rpx;
                    font-weight: 600;
                    color: var(--text-dark);
                }

                .rate-input {
                    width: 220rpx;
                    height: 60rpx;
                    text-align: center;
                    font-size: 28rpx;
                    color: var(--main-color);
                    font-weight: 600;
                    background: #F5F6FA;
                    border-radius: 12rpx;
                }
            }
        }
    }
}
</style>