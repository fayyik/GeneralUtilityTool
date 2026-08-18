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

            <!-- 纪念日列表（分类展示） -->
            <view class="event-list" v-else>
                <view class="event-group" v-for="group in groups" :key="group.key">
                    <view class="group-header">
                        <view class="group-title">{{ group.title }}</view>
                        <view class="group-desc">{{ group.desc }}</view>
                    </view>
                    <view class="event-card" v-for="event in group.list" :key="event.id" @click="openDetail(event)">
                        <view class="event-date" :style="dateBg(event)">
                            <view class="date-icon">{{ event.icon || '❤️' }}</view>
                            <view class="date-text">{{ dateShort(event) }}</view>
                        </view>
                        <view class="event-main">
                            <view class="event-row">
                                <view class="event-name">{{ event.name }}</view>
                                <view class="pin-tag" v-if="event.pinned">置顶</view>
                                <view class="event-tag" v-if="repeatLabel(event)">{{ repeatLabel(event) }}</view>
                            </view>
                            <view class="event-date-text">{{ nextDateStr(event) }}</view>
                            <view class="event-extra">
                                <text v-if="anniversaryText(event)">{{ anniversaryText(event) }}</text>
                                <text v-if="repeatOf(event) === 'none' && elapsedDays(event) > 0">· 已共度 {{ elapsedDays(event) }} 天</text>
                            </view>
                        </view>
                        <view class="event-countdown" :class="remainOf(event).cls">
                            {{ remainOf(event).text }}
                        </view>
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
                    <view class="form-item">
                        <view class="form-label">图标</view>
                        <view class="icon-options">
                            <view
                                v-for="icon in EVENT_ICONS"
                                :key="icon"
                                class="icon-option"
                                :class="{ active: state.form.icon === icon }"
                                @click="state.form.icon = icon"
                            >{{ icon }}</view>
                        </view>
                    </view>
                    <view class="form-item">
                        <view class="form-label">背景色</view>
                        <view class="color-options">
                            <view
                                v-for="c in EVENT_COLORS"
                                :key="c.id"
                                class="color-option"
                                :class="{ active: state.form.color === c.id }"
                                :style="colorDot(c)"
                                @click="state.form.color = c.id"
                            ></view>
                        </view>
                    </view>
                    <view class="form-item">
                        <view class="form-label">剩余时间格式</view>
                        <view class="repeat-options">
                            <view
                                v-for="f in EVENT_FORMATS"
                                :key="f.value"
                                class="repeat-option"
                                :class="{ active: state.form.format === f.value }"
                                @click="state.form.format = f.value"
                            >{{ f.label }}</view>
                        </view>
                    </view>
                    <view class="form-item row">
                        <view class="form-label">置顶显示</view>
                        <uv-switch v-model="state.form.pinned" :activeColor="themeInfo.activeColor" />
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
import { onShow, onHide, onUnload } from '@dcloudio/uni-app';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import Navbar from '@/components/Navbar.vue';
import storage from '@/utils/storage';
import {
    EVENT_ICONS,
    EVENT_COLORS,
    EVENT_FORMATS,
    repeatOf,
    repeatLabel,
    colorOf,
    calcDays,
    elapsedDays,
    anniversaryText,
    formatRemain,
    nextDateStr,
} from '@/utils/eventUtils';

const state = reactive({
    editing: null,
    form: {
        name: '',
        date: '',
        repeat: 'yearly',
        icon: '❤️',
        color: 'blue',
        format: 'day',
        pinned: false,
    },
});

const repeatOptions = [
    { value: 'none', label: '不重复' },
    { value: 'weekly', label: '每周' },
    { value: 'monthly', label: '每月' },
    { value: 'yearly', label: '每年' },
];

const popupRef = ref(null);

const eventList = ref([]);

// hms 格式实时刷新用
const tick = ref(0);
let timer = null;

const loadEvents = () => {
    const list = storage.getEvents();
    // 兼容旧数据
    list.forEach(e => {
        e.repeat = repeatOf(e);
        if (!e.icon) e.icon = '❤️';
        if (!e.color) e.color = 'blue';
        if (!e.format) e.format = 'day';
        if (!e.pinned) e.pinned = false;
    });
    // 置顶优先，其余按距下次天数升序
    list.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return calcDays(a) - calcDays(b);
    });
    eventList.value = list;
};

const dateShort = (event) => {
    const s = nextDateStr(event);
    return `${s.slice(5, 7)}月${s.slice(8, 10)}日`;
};

const dateBg = (event) => {
    const c = colorOf(event.color);
    return { background: `linear-gradient(135deg, ${c.from}, ${c.to})` };
};

const colorDot = (c) => ({ background: `linear-gradient(135deg, ${c.from}, ${c.to})` });

const remainOf = (event) => {
    tick.value;
    return formatRemain(event, new Date());
};

const comingCount = computed(() =>
    eventList.value.filter(e => calcDays(e) >= 0 && calcDays(e) <= 30).length
);

// 分类：重复 / 倒计时(不重复·未来) / 纪念日(不重复·过去)
const groups = computed(() => {
    const sort = (arr) => arr.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return calcDays(a) - calcDays(b);
    });
    const repeating = eventList.value.filter(e => repeatOf(e) !== 'none');
    const countdown = eventList.value.filter(e => repeatOf(e) === 'none' && calcDays(e) >= 0);
    const positive = eventList.value.filter(e => repeatOf(e) === 'none' && calcDays(e) < 0);
    return [
        { key: 'repeating', title: '重复纪念日', desc: '每年 / 每月 / 每周自动提醒', list: sort(repeating) },
        { key: 'countdown', title: '倒计时', desc: '即将到来的重要日子', list: sort(countdown) },
        { key: 'positive', title: '纪念日', desc: '已经过去的特别日子', list: sort(positive) },
    ].filter(g => g.list.length > 0);
});

const onDateChange = (e) => {
    state.form.date = e.detail.value;
};

const openCreate = () => {
    state.editing = null;
    state.form = {
        name: '',
        date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
        repeat: 'yearly',
        icon: '❤️',
        color: 'blue',
        format: 'day',
        pinned: false,
    };
    popupRef.value?.open();
};

const editEvent = (event) => {
    state.editing = event;
    state.form = {
        name: event.name,
        date: event.date,
        repeat: repeatOf(event),
        icon: event.icon || '❤️',
        color: event.color || 'blue',
        format: event.format || 'day',
        pinned: !!event.pinned,
    };
    popupRef.value?.open();
};

const editById = (id) => {
    const event = storage.getEvents().find(e => e.id === id);
    if (event) editEvent(event);
};

const openDetail = (event) => {
    uni.navigateTo({ url: `/pages/tools/calendar/detail?id=${event.id}` });
};

const closePopup = () => {
    popupRef.value?.close();
};

const saveEvent = () => {
    const name = state.form.name.trim();
    if (!name) {
        uni.showToast({ title: '请输入纪念日名称', icon: 'none' });
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
            icon: state.form.icon,
            color: state.form.color,
            format: state.form.format,
            pinned: state.form.pinned,
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
    uni.$off('editEvent');
    uni.$on('editEvent', editById);
    if (timer) clearInterval(timer);
    timer = setInterval(() => { tick.value++; }, 60000);
});

onHide(() => {
    if (timer) clearInterval(timer);
    timer = null;
});

onUnload(() => {
    uni.$off('editEvent');
    if (timer) clearInterval(timer);
    timer = null;
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
        .event-group {
            margin-bottom: 10rpx;

            .group-header {
                display: flex;
                align-items: baseline;
                margin: 30rpx 0 20rpx;

                .group-title {
                    font-size: 30rpx;
                    font-weight: 700;
                    color: var(--text-dark);
                }

                .group-desc {
                    margin-left: 16rpx;
                    font-size: 22rpx;
                    color: var(--text-light);
                }
            }
        }

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
                width: 110rpx;
                padding: 20rpx 0;
                margin-right: 24rpx;
                border-radius: 20rpx;
                color: #FFFFFF;
                flex-shrink: 0;

                .date-icon {
                    font-size: 44rpx;
                    line-height: 1.2;
                }

                .date-text {
                    margin-top: 8rpx;
                    font-size: 22rpx;
                    color: rgba(255, 255, 255, 0.95);
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

                    .pin-tag {
                        margin-left: 12rpx;
                        padding: 4rpx 12rpx;
                        font-size: 20rpx;
                        color: #FFFFFF;
                        background: #FF7E5F;
                        border-radius: 16rpx;
                        flex-shrink: 0;
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

            .icon-options {
                display: flex;
                flex-wrap: wrap;
                gap: 16rpx;

                .icon-option {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 76rpx;
                    height: 76rpx;
                    font-size: 40rpx;
                    background: #F5F6FA;
                    border-radius: 16rpx;
                    border: 3rpx solid transparent;

                    &.active {
                        background: rgba(78, 140, 255, 0.1);
                        border-color: var(--main-color);
                    }
                }
            }

            .color-options {
                display: flex;
                flex-wrap: wrap;
                gap: 20rpx;

                .color-option {
                    width: 64rpx;
                    height: 64rpx;
                    border-radius: 50%;
                    border: 4rpx solid transparent;

                    &.active {
                        border-color: #FFFFFF;
                        box-shadow: 0 0 0 4rpx var(--main-color);
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
