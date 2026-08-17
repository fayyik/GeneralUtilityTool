<template>
    <view class="page-container pomodoro-page" :class="[`${themeInfo.theme}-theme`, modeClass]">
        <Navbar></Navbar>
        <view class="pomodoro-wrap">
            <!-- 模式切换 + 设置 -->
            <view class="mode-row">
                <view class="mode-tabs">
                    <view class="mode-item" v-for="m in modeList" :key="m.key"
                        :class="{ active: state.mode === m.key }" @click="switchMode(m.key)">
                        {{ m.label }}
                    </view>
                </view>
                <view class="top-right" @click="goSettings">
                    <uv-icon name="setting" size="22" color="#4E8CFF"></uv-icon>
                </view>
            </view>

            <!-- 计时圆环 -->
            <view class="timer-ring" :style="ringStyle">
                <view class="timer-inner">
                    <view class="timer-time">{{ timeText }}</view>
                    <view class="timer-status">{{ runningText }}</view>
                </view>
            </view>

            <!-- 当前任务 -->
            <view class="task-bar" @click="chooseTask">
                <view class="task-label">当前任务</view>
                <view class="task-name">{{ currentTask?.name || '未选择任务' }}</view>
                <uv-icon name="arrow-right" color="#B6C2D7" :size="12"></uv-icon>
            </view>

            <!-- 控制按钮 -->
            <view class="controls">
                <view class="ctrl-btn" @click="handleReset">
                    <uv-icon name="reload" size="22" color="#4E8CFF"></uv-icon>
                </view>
                <view class="main-btn" @click="handleToggle">
                    <uv-icon :name="state.running ? 'pause' : 'play-circle-fill'" size="34"
                        color="#FFFFFF"></uv-icon>
                </view>
                <view class="ctrl-btn" @click="handleSkip">
                    <uv-icon name="skip-forward-right" size="22" color="#4E8CFF"></uv-icon>
                </view>
            </view>

            <!-- 今日统计 -->
            <view class="today-stats">
                <view class="stat-item">
                    <view class="stat-num">{{ todayStat.completed }}</view>
                    <view class="stat-label">今日专注</view>
                </view>
                <view class="stat-item">
                    <view class="stat-num">{{ todayStat.minutes }}</view>
                    <view class="stat-label">专注分钟</view>
                </view>
                <view class="stat-item">
                    <view class="stat-num">{{ totalPomodoros }}</view>
                    <view class="stat-label">累计专注</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { onHide, onShow } from '@dcloudio/uni-app';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import Navbar from '@/components/Navbar.vue';
import storage from '@/utils/storage';
import { formatDate, formatTime } from '@/utils/common';

const modeList = [
    { key: 'focus', label: '专注', color: '#4E8CFF' },
    { key: 'short', label: '短休息', color: '#34D399' },
    { key: 'long', label: '长休息', color: '#8B7CF6' },
];

const state = reactive({
    mode: 'focus',
    duration: 25 * 60,
    remaining: 25 * 60,
    running: false,
    startTime: 0,
    focusCount: 0,
    taskId: '',
});

let timer = null;
let tasks = [];
const currentTask = computed(() => tasks.find(t => t.id === state.taskId) || null);

const timeText = computed(() => {
    const m = Math.floor(state.remaining / 60);
    const s = state.remaining % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const modeClass = computed(() => `mode-${state.mode}`);

const runningText = computed(() => {
    if (!state.running) return '已暂停';
    return state.mode === 'focus' ? '专注中' : '休息中';
});

const ringStyle = computed(() => {
    const total = state.duration || 1;
    const pct = ((total - state.remaining) / total) * 100;
    const color = modeList.find(m => m.key === state.mode)?.color || '#4E8CFF';
    return {
        background: `conic-gradient(${color} ${pct}%, rgba(0,0,0,0.06) ${pct}%)`,
    };
});

const todayStat = computed(() => {
    const today = formatDate();
    const records = storage.getRecords();
    const todayRecords = records.filter(r => r.mode === 'focus' && r.status === 'completed' && r.date === today);
    const minutes = todayRecords.reduce((sum, r) => sum + Math.round(r.duration / 60), 0);
    return {
        completed: todayRecords.length,
        minutes,
    };
});

const totalPomodoros = computed(() => {
    const records = storage.getRecords();
    return records.filter(r => r.mode === 'focus' && r.status === 'completed').length;
});

const loadSettings = () => {
    const settings = storage.getSettings();
    const durationKey = state.mode === 'short' ? 'shortBreakDuration'
        : state.mode === 'long' ? 'longBreakDuration' : 'focusDuration';
    state.duration = settings[durationKey] * 60;
    state.remaining = state.duration;
};

const switchMode = (mode) => {
    if (state.mode === mode) return;
    stopTimer();
    state.mode = mode;
    loadSettings();
};

const startTimer = () => {
    state.running = true;
    state.startTime = Date.now();
    timer = setInterval(tick, 500);
};

const stopTimer = () => {
    state.running = false;
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
};

const tick = () => {
    const now = Date.now();
    let remain = Math.round(state.duration - (now - state.startTime) / 1000);
    if (remain <= 0) {
        remain = 0;
        state.remaining = 0;
        completeTimer();
    } else {
        state.remaining = remain;
    }
};

const handleToggle = () => {
    if (state.running) {
        // 暂停
        state.duration = state.remaining;
        stopTimer();
    } else {
        startTimer();
    }
};

const handleReset = () => {
    stopTimer();
    state.remaining = state.duration;
};

const handleSkip = () => {
    stopTimer();
    if (state.mode === 'focus') {
        addRecord('interrupted');
    }
    nextMode();
};

const completeTimer = () => {
    stopTimer();
    if (state.mode === 'focus') {
        addRecord('completed');
        state.focusCount++;
        const settings = storage.getSettings();
        const isLongBreak = state.focusCount % settings.longBreakInterval === 0;
        state.mode = isLongBreak ? 'long' : 'short';
    } else {
        state.mode = 'focus';
    }
    loadSettings();
    notify();
    uni.showToast({
        title: state.mode === 'focus' ? '休息结束，开始专注' : '本轮完成，休息一下',
        icon: 'none',
    });
    const settings = storage.getSettings();
    if (settings.autoNext) {
        startTimer();
    }
};

// 结束提醒：震动
const notify = () => {
    const settings = storage.getSettings();
    if (settings.vibrate !== false) {
        uni.vibrateLong();
    }
};

// 打开设置页
const goSettings = () => {
    uni.navigateTo({
        url: '/pages/tools/pomodoro/settings',
    });
};

const nextMode = () => {
    if (state.mode === 'focus') {
        state.mode = 'short';
    } else {
        state.mode = 'focus';
    }
    loadSettings();
};

const addRecord = (status) => {
    const record = {
        id: Date.now(),
        taskId: state.taskId,
        taskName: currentTask.value?.name || '未命名任务',
        mode: state.mode,
        duration: Math.round(state.duration),
        date: formatDate(),
        startTime: formatTime(),
        endTime: formatTime(),
        status,
    };
    const records = storage.getRecords();
    records.unshift(record);
    storage.setRecords(records);

    // 更新任务进度
    if (state.taskId && status === 'completed') {
        const task = tasks.find(t => t.id === state.taskId);
        if (task) {
            task.completed = (task.completed || 0) + 1;
            storage.setTasks(tasks);
        }
    }
};

const chooseTask = () => {
    uni.navigateTo({
        url: '/pages/tools/pomodoro/task?select=1',
    });
};

const loadTasks = () => {
    tasks = storage.getTasks();
};

const saveState = () => {
    storage.set('pomodoro_current', {
        mode: state.mode,
        duration: state.duration,
        remaining: state.remaining,
        running: state.running,
        startTime: state.startTime,
        focusCount: state.focusCount,
        taskId: state.taskId,
    });
};

const restoreState = () => {
    const saved = storage.get('pomodoro_current');
    if (saved && saved.running && saved.startTime) {
        // 正在计时：恢复并继续
        state.mode = saved.mode || 'focus';
        state.focusCount = saved.focusCount || 0;
        state.taskId = saved.taskId || '';
        state.duration = saved.duration || state.duration;
        state.remaining = saved.remaining || state.duration;
        const expectedEnd = saved.startTime + saved.duration * 1000;
        if (Date.now() >= expectedEnd) {
            // 后台期间计时已结束，补记完成
            state.remaining = 0;
            completeTimer();
            return;
        }
        state.startTime = Date.now();
        startTimer();
    } else if (saved) {
        // 未在计时：保留模式/任务，应用最新设置
        state.mode = saved.mode || 'focus';
        state.focusCount = saved.focusCount || 0;
        state.taskId = saved.taskId || '';
        loadSettings();
    } else {
        loadSettings();
    }
};

onShow(() => {
    loadTasks();
    restoreState();
});

onHide(() => {
    // 不清除 running 状态，仅停表，便于 onShow 恢复计时
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    saveState();
});

onUnmounted(() => {
    stopTimer();
    saveState();
});
</script>

<style scoped lang="scss">
.pomodoro-page {
    &.mode-focus {
        --mode-color: #4E8CFF;
    }

    &.mode-short {
        --mode-color: #34D399;
    }

    &.mode-long {
        --mode-color: #8B7CF6;
    }
}

.pomodoro-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 40rpx 60rpx;

    .top-right {
        position: absolute;
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60rpx;
        height: 60rpx;
        margin-left: 20rpx;
        border-radius: 50%;
        background: #FFFFFF;
        box-shadow: var(--box-shadow);
    }

    .mode-row {
        position: relative;
        display: flex;
        justify-content: center;
        margin-bottom: 60rpx;
    }

    .mode-tabs {
        display: flex;
        padding: 8rpx;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 44rpx;
        box-shadow: var(--box-shadow);

        .mode-item {
            padding: 14rpx 40rpx;
            font-size: 28rpx;
            color: var(--text-light);
            border-radius: 36rpx;
            transition: all 0.2s;

            &.active {
                color: #FFFFFF;
                font-weight: 600;
                background: var(--mode-color);
            }
        }
    }

    .timer-ring {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 440rpx;
        height: 440rpx;
        border-radius: 50%;
        box-shadow: 0 20rpx 50rpx rgba(78, 140, 255, 0.25);

        .timer-inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 380rpx;
            height: 380rpx;
            border-radius: 50%;
            background: #FFFFFF;

            .timer-time {
                font-size: 96rpx;
                font-weight: 700;
                color: var(--text-dark);
                font-variant-numeric: tabular-nums;
            }

            .timer-status {
                margin-top: 16rpx;
                font-size: 26rpx;
                color: var(--text-light);
            }
        }
    }

    .task-bar {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 30rpx;
        margin-top: 50rpx;
        box-sizing: border-box;
        background: #FFFFFF;
        border-radius: 20rpx;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);

        .task-label {
            padding: 6rpx 20rpx;
            margin-right: 20rpx;
            font-size: 24rpx;
            color: #FFFFFF;
            background: var(--mode-color);
            border-radius: 20rpx;
        }

        .task-name {
            flex: 1;
            font-size: 28rpx;
            color: var(--text-dark);
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }

    .controls {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 60rpx;

        .ctrl-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100rpx;
            height: 100rpx;
            margin: 0 50rpx;
            border-radius: 50%;
            background: #FFFFFF;
            box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
        }

        .main-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 140rpx;
            height: 140rpx;
            margin: 0 20rpx;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
            box-shadow: 0 16rpx 40rpx rgba(78, 140, 255, 0.35);
        }
    }

    .today-stats {
        display: flex;
        justify-content: space-around;
        width: 100%;
        padding: 36rpx 0;
        margin-top: 70rpx;
        background: #FFFFFF;
        border-radius: 20rpx;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);

        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;

            .stat-num {
                font-size: 44rpx;
                font-weight: 700;
                color: var(--text-dark);
            }

            .stat-label {
                margin-top: 10rpx;
                font-size: 24rpx;
                color: var(--text-light);
            }
        }
    }
}
</style>