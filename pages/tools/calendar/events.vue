<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="events-wrap">
            <!-- 统计卡 -->
            <view class="stats-bar">
                <view class="stat-box">
                    <view class="num">{{ eventList.length }}</view>
                    <view class="label">纪念日</view>
                </view>
                <view class="stat-box">
                    <view class="num">{{ comingCount }}</view>
                    <view class="label">30 天内</view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty" v-if="eventList.length === 0">
                <view class="empty-icon">
                    <uv-icon name="calendar" size="60" color="#CCCCCC"></uv-icon>
                </view>
                <view class="empty-text">还没有纪念日，点击下方按钮添加</view>
            </view>

            <!-- 纪念日列表 -->
            <view class="event-list" v-else>
                <view class="event-card" v-for="event in eventList" :key="event.id" @click="editEvent(event)">
                    <view class="event-date">
                        <view class="date-month">{{ dateMonth(event) }}</view>
                        <view class="date-day">{{ dateDay(event) }}</view>
                    </view>
                    <view class="event-main">
                        <view class="event-row">
                            <view class="event-name">{{ event.name }}</view>
                            <view class="event-tag" v-if="repeatLabel(event)">{{ repeatLabel(event) }}</view>
                        </view>
                        <view class="event-date-text">{{ event.date }}</view>
                        <view class="event-extra">
                            <text v-if="anniversaryText(event)">{{ anniversaryText(event) }}</text>
                            <text v-if="elapsedDays(event) > 0">· 已共度 {{ elapsedDays(event) }} 天</text>
                        </view>
                    </view>
                    <view class="event-countdown" :class="countClass(event)">
                        {{ countText(event) }}
                    </view>
                </view>
            </view>

            <!-- 添加按钮 -->
            <view class="fab" @click="openCreate">
                <uv-icon name="plus" size="26" color="#FFFFFF"></uv-icon>
            </view>

            <!-- 添加/编辑弹窗 -->
            <uv-popup ref="popupRef" mode="bottom" round="20">
                <view class="popup-body">
                    <view class="popup-title">{{ state.editing ? '编辑纪念日' : '添加纪念日' }}</view>
                    <view class="form-item">
                        <view class="form-label">纪念日名称</view>
                        <uv-input v-model="state.form.name" placeholder="如：我们在一起、妈妈生日、考试日" :clearable="true" />
                    </view>
                    <view class="form-item">
                        <view class="form-label">日期</view>
                        <picker mode="date" :value="state.form.date" @change="onDateChange">
                            <view class="date-picker">
                                {{ state.form.date }}
                                <uv-icon name="calendar" size="18" color="#4E8CFF"></uv-icon>
                            </view>
                        </picker>
                    </view>
                    <view class="form-item">
                        <view class="form-label">重复类型</view>
                        <view class="repeat-options">
                            <view
                                v-for="opt in repeatOptions"
                                :key="opt.value"
                                class="repeat-option"
                                :class="{ active: state.form.repeat === opt.value }"
                                @click="state.form.repeat = opt.value"
                            >{{ opt.label }}</view>
                        </view>
                    </view>
                    <view class="popup-btns">
                        <view class="btn cancel" @click="closePopup">取消</view>
                        <view class="btn save" @click="saveEvent">保存</view>
                    </view>
                </view>
            </uv-popup>
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

const state = reactive({
    editing: null,
    form: {
        name: '',
        date: '',
        repeat: 'yearly',
    },
});

const repeatOptions = [
    { value: 'none', label: '不重复' },
    { value: 'weekly', label: '每周' },
    { value: 'monthly', label: '每月' },
    { value: 'yearly', label: '每年' },
];

// 兼容旧数据：yearly 字段 -> repeat
const repeatOf = (event) => event.repeat || (event.yearly ? 'yearly' : 'none');

const repeatLabel = (event) => {
    const map = { weekly: '每周', monthly: '每月', yearly: '每年' };
    return map[repeatOf(event)] || '';
};

const popupRef = ref(null);

const eventList = ref([]);

const loadEvents = () => {
    const list = storage.getEvents();
    // 按距下次天数升序排序（即将到来的在前）
    list.sort((a, b) => calcDays(a) - calcDays(b));
    eventList.value = list;
};

// 计算距下次还有多少天（当天为 0；不重复事件已过则为负）
const calcDays = (event) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const repeat = repeatOf(event);
    if (repeat === 'yearly') {
        const month = Number(event.date.slice(5, 7)) - 1;
        const day = Number(event.date.slice(8, 10));
        let next = new Date(now.getFullYear(), month, day);
        if (next < today) {
            next = new Date(now.getFullYear() + 1, month, day);
        }
        return Math.round((next - today) / (1000 * 60 * 60 * 24));
    }
    if (repeat === 'monthly') {
        const day = Number(event.date.slice(8, 10));
        let year = now.getFullYear();
        let month = now.getMonth();
        let lastDay = new Date(year, month + 1, 0).getDate();
        let next = new Date(year, month, Math.min(day, lastDay));
        if (next < today) {
            month++;
            if (month === 12) { month = 0; year++; }
            lastDay = new Date(year, month + 1, 0).getDate();
            next = new Date(year, month, Math.min(day, lastDay));
        }
        return Math.round((next - today) / (1000 * 60 * 60 * 24));
    }
    if (repeat === 'weekly') {
        const start = new Date(event.date);
        return (start.getDay() - today.getDay() + 7) % 7;
    }
    const target = new Date(event.date);
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
};

const dateMonth = (event) => `${event.date.slice(5, 7)}月`;
const dateDay = (event) => event.date.slice(8, 10);

// 已共度天数（起始日期到今天）
const elapsedDays = (event) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(event.date);
    return Math.round((today - start) / (1000 * 60 * 60 * 24));
};

// 周年数（仅每年重复且起始日在过去）
const anniversaryText = (event) => {
    if (repeatOf(event) !== 'yearly') return '';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startYear = Number(event.date.slice(0, 4));
    const month = Number(event.date.slice(5, 7)) - 1;
    const day = Number(event.date.slice(8, 10));
    let years = now.getFullYear() - startYear;
    // 今年纪念日尚未到则少一周年
    if (new Date(now.getFullYear(), month, day) > today) {
        years--;
    }
    if (years <= 0) return '';
    return `第 ${years} 周年`;
};

const countText = (event) => {
    const days = calcDays(event);
    if (days === 0) return '就是今天';
    if (days > 0) return `还有 ${days} 天`;
    return `已过 ${Math.abs(days)} 天`;
};

const countClass = (event) => {
    const days = calcDays(event);
    if (days === 0) return 'today';
    if (days > 0) return 'coming';
    return 'passed';
};

const comingCount = computed(() =>
    eventList.value.filter(e => calcDays(e) >= 0 && calcDays(e) <= 30).length
);

const onDateChange = (e) => {
    state.form.date = e.detail.value;
};

const openCreate = () => {
    state.editing = null;
    state.form = {
        name: '',
        date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
        repeat: 'yearly',
    };
    popupRef.value?.open();
};

const editEvent = (event) => {
    state.editing = event;
    state.form = { name: event.name, date: event.date, repeat: repeatOf(event) };
    popupRef.value?.open();
};

const closePopup = () => {
    popupRef.value?.close();
};

const saveEvent = () => {
    const name = state.form.name.trim();
    if (!name) {
        uni.showToast({ title: '请输入事件名称', icon: 'none' });
        return;
    }
    if (!state.form.date) {
        uni.showToast({ title: '请选择日期', icon: 'none' });
        return;
    }
    const events = storage.getEvents();
    if (state.editing) {
        const index = events.findIndex(e => e.id === state.editing.id);
        if (index > -1) {
            events[index] = { ...events[index], ...state.form };
        }
    } else {
        events.push({
            id: Date.now(),
            name,
            date: state.form.date,
            repeat: state.form.repeat,
            createdAt: Date.now(),
        });
    }
    storage.setEvents(events);
    loadEvents();
    closePopup();
    uni.showToast({ title: '已保存', icon: 'none' });
};

const deleteEvent = () => {
    if (!state.editing) return;
    uni.showModal({
        title: '提示',
        content: `确定删除「${state.editing.name}」吗？`,
        confirmColor: '#FF6B81',
        success: (res) => {
            if (res.confirm) {
                const events = storage.getEvents().filter(e => e.id !== state.editing.id);
                storage.setEvents(events);
                loadEvents();
                uni.showToast({ title: '已删除', icon: 'none' });
            }
        },
    });
};

onShow(() => {
    loadEvents();
});
</script>

<style scoped lang="scss">
.events-wrap {
    position: relative;
    padding: 0 40rpx 160rpx;
    box-sizing: border-box;

    .stats-bar {
        display: flex;
        padding: 36rpx 0;
        margin-bottom: 30rpx;
        background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
        border-radius: 24rpx;
        box-shadow: 0 16rpx 40rpx rgba(78, 140, 255, 0.25);

        .stat-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;

            .num {
                font-size: 48rpx;
                font-weight: 700;
                color: #FFFFFF;
            }

            .label {
                margin-top: 8rpx;
                font-size: 24rpx;
                color: rgba(255, 255, 255, 0.85);
            }
        }
    }

    .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 120rpx 0;

        .empty-icon {
            width: 160rpx;
            height: 160rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #F5F6FA;
            border-radius: 50%;
        }

        .empty-text {
            margin-top: 30rpx;
            font-size: 26rpx;
            color: var(--text-light);
        }
    }

    .event-list {
        .event-card {
            display: flex;
            align-items: center;
            padding: 30rpx;
            margin-bottom: 24rpx;
            background: #FFFFFF;
            border-radius: 20rpx;
            box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);

            .event-date {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100rpx;
                padding: 16rpx 0;
                margin-right: 24rpx;
                border-radius: 16rpx;
                background: rgba(78, 140, 255, 0.08);

                .date-month {
                    font-size: 22rpx;
                    color: var(--main-color);
                }

                .date-day {
                    font-size: 40rpx;
                    font-weight: 700;
                    color: var(--main-color);
                }
            }

            .event-main {
                flex: 1;
                overflow: hidden;

                .event-row {
                    display: flex;
                    align-items: center;

                    .event-name {
                        font-size: 30rpx;
                        font-weight: 600;
                        color: var(--text-dark);
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }

                    .event-tag {
                        margin-left: 12rpx;
                        padding: 4rpx 12rpx;
                        font-size: 20rpx;
                        color: var(--main-color);
                        background: rgba(78, 140, 255, 0.1);
                        border-radius: 16rpx;
                        flex-shrink: 0;
                    }
                }

                .event-date-text {
                    margin-top: 10rpx;
                    font-size: 24rpx;
                    color: var(--text-light);
                }

                .event-extra {
                    margin-top: 8rpx;
                    font-size: 22rpx;
                    color: var(--main-color);
                }
            }

            .event-countdown {
                margin-left: 16rpx;
                font-size: 26rpx;
                font-weight: 600;
                white-space: nowrap;

                &.today {
                    color: #FF7E5F;
                }

                &.coming {
                    color: #059669;
                }

                &.passed {
                    color: var(--text-light);
                }
            }
        }
    }

    .fab {
        position: fixed;
        right: 40rpx;
        bottom: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 110rpx;
        height: 110rpx;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
        box-shadow: 0 16rpx 40rpx rgba(78, 140, 255, 0.4);
        z-index: 99;
    }

    .popup-body {
        padding: 40rpx;

        .popup-title {
            font-size: 34rpx;
            font-weight: 600;
            color: var(--text-dark);
            text-align: center;
            margin-bottom: 40rpx;
        }

        .form-item {
            margin-bottom: 40rpx;

            &.row {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .form-label {
                font-size: 28rpx;
                color: var(--text-dark);
                margin-bottom: 16rpx;

                .form-desc {
                    margin-top: 6rpx;
                    font-size: 22rpx;
                    color: var(--text-light);
                }
            }

            .date-picker {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 24rpx 30rpx;
                font-size: 30rpx;
                color: var(--text-dark);
                background: #F5F6FA;
                border-radius: 16rpx;
            }

            .repeat-options {
                display: flex;
                flex-wrap: wrap;
                gap: 16rpx;

                .repeat-option {
                    padding: 16rpx 36rpx;
                    font-size: 26rpx;
                    color: var(--text-dark);
                    background: #F5F6FA;
                    border-radius: 32rpx;
                    border: 2rpx solid transparent;

                    &.active {
                        color: #FFFFFF;
                        background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
                    }
                }
            }
        }

        .popup-btns {
            display: flex;
            gap: 24rpx;
            margin-top: 20rpx;

            .btn {
                flex: 1;
                height: 88rpx;
                line-height: 88rpx;
                text-align: center;
                font-size: 30rpx;
                border-radius: 44rpx;

                &.cancel {
                    color: var(--text-dark);
                    background: #F0F1F5;
                }

                &.save {
                    color: #FFFFFF;
                    font-weight: 600;
                    background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
                }
            }
        }
    }
}
</style>