<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="page-wrap">
            <!-- 输入 -->
            <view class="card">
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
            </view>

            <!-- 结果 -->
            <view class="card" v-if="bmi !== null">
                <view class="result-head">
                    <view class="bmi-num" :style="{ color: level.color }">{{ bmi }}</view>
                    <view class="bmi-tag" :style="{ background: level.color }">{{ level.label }}</view>
                </view>

                <view class="info-row">
                    <view class="info-item">
                        <view class="info-val">{{ range.min }} - {{ range.max }}</view>
                        <view class="info-label">正常体重范围 (kg)</view>
                    </view>
                    <view class="info-item">
                        <view class="info-val">{{ state.height }} cm</view>
                        <view class="info-label">身高</view>
                    </view>
                </view>

                <view class="level-desc">
                    <view class="level-line" v-for="(l, i) in levels" :key="i">
                        <view class="dot" :style="{ background: l.color }"></view>
                        <view class="line-text">
                            <text class="line-range">{{ l.range }}</text>
                            {{ l.label }}
                        </view>
                        <view class="line-mark" v-if="l.key === level.key">当前</view>
                    </view>
                </view>

                <view class="advice">{{ advice }}</view>
            </view>

            <view class="tip" v-else>输入身高和体重后自动计算</view>
        </view>
    </view>
</template>

<script setup>
import { reactive, computed } from 'vue';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import Navbar from '@/components/Navbar.vue';

const state = reactive({
    height: '',
    weight: '',
});

const heightNum = computed(() => parseFloat(state.height));
const weightNum = computed(() => parseFloat(state.weight));

const bmi = computed(() => {
    const h = heightNum.value;
    const w = weightNum.value;
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) return null;
    return (w / (h / 100) ** 2).toFixed(1);
});

const levels = [
    { key: 'low', range: '<18.5', label: '偏瘦', color: '#5CC8FF', advice: '注意营养补充，适当增加蛋白质摄入，保持规律作息。' },
    { key: 'normal', range: '18.5~23.9', label: '正常', color: '#34D399', advice: '体重正常，继续保持良好的饮食和运动习惯。' },
    { key: 'over', range: '24~27.9', label: '超重', color: '#FFB199', advice: '建议控制热量摄入，增加有氧运动，逐步减重。' },
    { key: 'fat', range: '≥28', label: '肥胖', color: '#FF6B81', advice: '肥胖影响健康，建议合理饮食并咨询专业医生制定减重计划。' },
];

const level = computed(() => {
    const b = parseFloat(bmi.value);
    if (b === null || isNaN(b)) return levels[0];
    if (b < 18.5) return levels[0];
    if (b < 24) return levels[1];
    if (b < 28) return levels[2];
    return levels[3];
});

const range = computed(() => {
    const h = heightNum.value;
    if (isNaN(h) || h <= 0) return { min: '-', max: '-' };
    const m = h / 100;
    return {
        min: (18.5 * m * m).toFixed(1),
        max: (23.9 * m * m).toFixed(1),
    };
});

const advice = computed(() => level.value.advice);
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

        .field {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20rpx 0;
            border-bottom: 2rpx solid #F0F1F5;

            &:last-child {
                border-bottom: none;
            }

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

        .result-head {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24rpx;
            padding: 20rpx 0 30rpx;

            .bmi-num {
                font-size: 88rpx;
                font-weight: 800;
                line-height: 1;
            }

            .bmi-tag {
                padding: 12rpx 28rpx;
                font-size: 30rpx;
                font-weight: 600;
                color: #FFFFFF;
                border-radius: 34rpx;
            }
        }

        .info-row {
            display: flex;
            gap: 20rpx;

            .info-item {
                flex: 1;
                padding: 24rpx;
                text-align: center;
                background: #F5F6FA;
                border-radius: 16rpx;

                .info-val {
                    font-size: 34rpx;
                    font-weight: 700;
                    color: var(--text-dark);
                }

                .info-label {
                    margin-top: 8rpx;
                    font-size: 22rpx;
                    color: var(--text-light);
                }
            }
        }

        .level-desc {
            margin-top: 30rpx;

            .level-line {
                display: flex;
                align-items: center;
                padding: 14rpx 0;

                .dot {
                    width: 16rpx;
                    height: 16rpx;
                    border-radius: 50%;
                    margin-right: 14rpx;
                }

                .line-text {
                    flex: 1;
                    font-size: 26rpx;
                    color: var(--text-dark);

                    .line-range {
                        color: var(--text-light);
                        margin-right: 12rpx;
                    }
                }

                .line-mark {
                    font-size: 22rpx;
                    color: #FFFFFF;
                    background: var(--main-color);
                    padding: 4rpx 16rpx;
                    border-radius: 20rpx;
                }
            }
        }

        .advice {
            margin-top: 24rpx;
            padding: 24rpx;
            font-size: 26rpx;
            color: var(--text-dark);
            background: rgba(78, 140, 255, 0.06);
            border-radius: 16rpx;
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