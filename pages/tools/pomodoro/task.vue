<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="task-wrap">
            <!-- 统计头 -->
            <view class="header-stats">
                <view class="stat-box">
                    <view class="num">{{ taskList.length }}</view>
                    <view class="label">任务总数</view>
                </view>
                <view class="stat-box">
                    <view class="num">{{ doneCount }}</view>
                    <view class="label">已完成</view>
                </view>
                <view class="stat-box">
                    <view class="num">{{ totalFocus }}</view>
                    <view class="label">今日专注</view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty" v-if="taskList.length === 0">
                <view class="empty-icon">
                    <uv-icon name="list-dot" size="60" color="#CCCCCC"></uv-icon>
                </view>
                <view class="empty-text">暂无任务，点击下方按钮创建</view>
            </view>

            <!-- 任务列表 -->
            <view class="task-list" v-else>
                <view class="task-card" v-for="task in taskList" :key="task.id"
                    :class="{ active: task.id === state.selectedId }" @click="onTaskTap(task)">
                    <view class="task-main">
                        <view class="task-row">
                            <view class="task-name" :class="{ done: task.completed >= task.estimate }">{{ task.name }}</view>
                            <view class="task-status" v-if="task.completed >= task.estimate">已完成</view>
                        </view>
                        <view class="progress-row">
                            <view class="progress-bar">
                                <view class="progress-inner"
                                    :style="{ width: progressWidth(task) }"></view>
                            </view>
                            <view class="progress-text">{{ task.completed }}/{{ task.estimate }} 次</view>
                        </view>
                    </view>
                    <view class="task-actions">
                        <view class="action-btn" @click.stop="editTask(task)">
                            <uv-icon name="edit-pen" size="18" color="#4E8CFF"></uv-icon>
                        </view>
                        <view class="action-btn" @click.stop="deleteTask(task)">
                            <uv-icon name="trash" size="18" color="#FF6B81"></uv-icon>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 底部新建按钮 -->
            <view class="fab" @click="openCreate">
                <uv-icon name="plus" size="26" color="#FFFFFF"></uv-icon>
            </view>

            <!-- 新建/编辑弹窗 -->
            <uv-popup ref="popupRef" mode="bottom" round="20">
                <view class="popup-body">
                    <view class="popup-title">{{ state.editing ? '编辑任务' : '新建任务' }}</view>
                    <view class="form-item">
                        <view class="form-label">任务名称</view>
                        <uv-input v-model="state.form.name" placeholder="请输入任务名称" :clearable="true" />
                    </view>
                    <view class="form-item">
                        <view class="form-label">预计专注次数</view>
                        <uv-number-box v-model="state.form.estimate" :min="1" :max="99"></uv-number-box>
                    </view>
                    <view class="popup-btns">
                        <view class="btn cancel" @click="closePopup">取消</view>
                        <view class="btn save" @click="saveTask">保存</view>
                    </view>
                </view>
            </uv-popup>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import Navbar from '@/components/Navbar.vue';
import storage from '@/utils/storage';
import { formatDate } from '@/utils/common';

const state = reactive({
    selectMode: false,
    selectedId: '',
    editing: null,
    form: {
        name: '',
        estimate: 4,
    },
});

const popupRef = ref(null);

const taskList = ref([]);

const doneCount = computed(() => taskList.value.filter(t => t.completed >= t.estimate).length);

const totalFocus = computed(() => {
    const today = formatDate();
    return storage.getRecords().filter(r => r.mode === 'focus' && r.status === 'completed' && r.date === today).length;
});

const loadTasks = () => {
    taskList.value = storage.getTasks();
    if (state.selectMode) {
        const current = storage.get('pomodoro_current');
        state.selectedId = current?.taskId || '';
    }
};

const progressWidth = (task) => {
    const pct = Math.min((task.completed / (task.estimate || 1)) * 100, 100);
    return `${pct}%`;
};

const onTaskTap = (task) => {
    if (state.selectMode) {
        const current = storage.get('pomodoro_current') || {};
        current.taskId = task.id;
        storage.set('pomodoro_current', current);
        uni.navigateBack();
        return;
    }
    editTask(task);
};

const openCreate = () => {
    state.editing = null;
    state.form = { name: '', estimate: 4 };
    popupRef.value?.open();
};

const editTask = (task) => {
    state.editing = task;
    state.form = { name: task.name, estimate: task.estimate };
    popupRef.value?.open();
};

const closePopup = () => {
    popupRef.value?.close();
};

const saveTask = () => {
    const name = state.form.name.trim();
    if (!name) {
        uni.showToast({ title: '请输入任务名称', icon: 'none' });
        return;
    }
    const tasks = storage.getTasks();
    if (state.editing) {
        const index = tasks.findIndex(t => t.id === state.editing.id);
        if (index > -1) {
            tasks[index].name = name;
            tasks[index].estimate = Number(state.form.estimate) || 4;
        }
    } else {
        tasks.unshift({
            id: Date.now(),
            name,
            estimate: Number(state.form.estimate) || 4,
            completed: 0,
            createdAt: Date.now(),
        });
    }
    storage.setTasks(tasks);
    loadTasks();
    closePopup();
    uni.showToast({ title: '已保存', icon: 'none' });
};

const deleteTask = (task) => {
    uni.showModal({
        title: '提示',
        content: `确定删除任务「${task.name}」吗？`,
        confirmColor: '#FF6B81',
        success: (res) => {
            if (res.confirm) {
                const tasks = storage.getTasks().filter(t => t.id !== task.id);
                storage.setTasks(tasks);
                loadTasks();
                uni.showToast({ title: '已删除', icon: 'none' });
            }
        },
    });
};

onLoad((options) => {
    state.selectMode = options?.select === '1';
});

onShow(() => {
    loadTasks();
});
</script>

<style scoped lang="scss">
.task-wrap {
    position: relative;
    padding: 0 40rpx 160rpx;
    box-sizing: border-box;

    .header-stats {
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

    .task-list {
        .task-card {
            display: flex;
            align-items: center;
            padding: 30rpx;
            margin-bottom: 24rpx;
            background: #FFFFFF;
            border-radius: 20rpx;
            box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
            border: 2rpx solid transparent;

            &.active {
                border-color: var(--main-color);
            }

            .task-main {
                flex: 1;
                overflow: hidden;

                .task-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    .task-name {
                        font-size: 30rpx;
                        font-weight: 600;
                        color: var(--text-dark);
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;

                        &.done {
                            color: var(--text-light);
                            text-decoration: line-through;
                        }
                    }

                    .task-status {
                        padding: 4rpx 16rpx;
                        font-size: 22rpx;
                        color: #059669;
                        background: #E8FAF1;
                        border-radius: 16rpx;
                    }
                }

                .progress-row {
                    display: flex;
                    align-items: center;
                    margin-top: 20rpx;

                    .progress-bar {
                        flex: 1;
                        height: 12rpx;
                        margin-right: 20rpx;
                        background: #F0F1F5;
                        border-radius: 6rpx;
                        overflow: hidden;

                        .progress-inner {
                            height: 100%;
                            background: linear-gradient(90deg, var(--left-linear), var(--right-linear));
                            border-radius: 6rpx;
                            transition: width 0.3s;
                        }
                    }

                    .progress-text {
                        font-size: 22rpx;
                        color: var(--text-light);
                    }
                }
            }

            .task-actions {
                display: flex;
                margin-left: 20rpx;

                .action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 64rpx;
                    height: 64rpx;
                    margin-left: 8rpx;
                    border-radius: 50%;
                    background: #F5F6FA;
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

            .form-label {
                font-size: 28rpx;
                color: var(--text-dark);
                margin-bottom: 16rpx;
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