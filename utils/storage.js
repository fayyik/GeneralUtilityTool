// 本地存储工具封装
const KEYS = {
    POMODORO_TASKS: 'pomodoro_tasks',
    POMODORO_RECORDS: 'pomodoro_records',
    POMODORO_SETTINGS: 'pomodoro_settings',
    CALENDAR_EVENTS: 'calendar_events',
};

export const get = (key, defaultValue = null) => {
    try {
        const value = uni.getStorageSync(key);
        if (value === '' || value === undefined || value === null) {
            return defaultValue;
        }
        return value;
    } catch (e) {
        return defaultValue;
    }
};

export const set = (key, value) => {
    uni.setStorageSync(key, value);
};

export const remove = (key) => {
    uni.removeStorageSync(key);
};

// 番茄任务
export const getTasks = () => get(KEYS.POMODORO_TASKS, []);
export const setTasks = (tasks) => set(KEYS.POMODORO_TASKS, tasks);

// 番茄记录
export const getRecords = () => get(KEYS.POMODORO_RECORDS, []);
export const setRecords = (records) => set(KEYS.POMODORO_RECORDS, records);

// 番茄设置
export const getSettings = () => get(KEYS.POMODORO_SETTINGS, {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    vibrate: true,
    autoNext: false,
});
export const setSettings = (settings) => set(KEYS.POMODORO_SETTINGS, settings);

// 日历事件（纪念日/大事）
export const getEvents = () => get(KEYS.CALENDAR_EVENTS, []);
export const setEvents = (events) => set(KEYS.CALENDAR_EVENTS, events);

export default {
    KEYS,
    get,
    set,
    remove,
    getTasks,
    setTasks,
    getRecords,
    setRecords,
    getSettings,
    setSettings,
    getEvents,
    setEvents,
};
