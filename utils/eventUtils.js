// 纪念日事件工具函数

// 图标（emoji）
export const EVENT_ICONS = ['❤️', '🎂', '🎁', '🎓', '💍', '🌟', '📅', '🎉', '✈️', '🏠', '💼', '⚽', '🐱', '🍀'];

// 背景色方案
export const EVENT_COLORS = [
    { id: 'blue', from: '#4E8CFF', to: '#6FD3FF' },
    { id: 'pink', from: '#FF7E9D', to: '#FFB199' },
    { id: 'purple', from: '#A18CD1', to: '#8E6CC4' },
    { id: 'orange', from: '#FFA751', to: '#FFD200' },
    { id: 'green', from: '#43D97E', to: '#38F9D7' },
    { id: 'cyan', from: '#4DCAE9', to: '#6E8EF7' },
];

// 时间格式
export const EVENT_FORMATS = [
    { value: 'day', label: '天' },
    { value: 'ymd', label: '年/月/天' },
    { value: 'hms', label: '时分' },
];

// 兼容旧数据：yearly 字段 -> repeat
export const repeatOf = (event) => event.repeat || (event.yearly ? 'yearly' : 'none');

export const repeatLabel = (event) => {
    const map = { weekly: '每周', monthly: '每月', yearly: '每年' };
    return map[repeatOf(event)] || '';
};

export const colorOf = (id) => EVENT_COLORS.find(c => c.id === id) || EVENT_COLORS[0];

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// 下一次日期（重复事件为最近一次，不重复为目标日）
export const nextDate = (event, today = startOfDay(new Date())) => {
    const repeat = repeatOf(event);
    if (repeat === 'yearly') {
        const month = Number(event.date.slice(5, 7)) - 1;
        const day = Number(event.date.slice(8, 10));
        let next = new Date(today.getFullYear(), month, day);
        if (next < today) {
            next = new Date(today.getFullYear() + 1, month, day);
        }
        return next;
    }
    if (repeat === 'monthly') {
        const day = Number(event.date.slice(8, 10));
        let year = today.getFullYear();
        let month = today.getMonth();
        let lastDay = new Date(year, month + 1, 0).getDate();
        let next = new Date(year, month, Math.min(day, lastDay));
        if (next < today) {
            month++;
            if (month === 12) { month = 0; year++; }
            lastDay = new Date(year, month + 1, 0).getDate();
            next = new Date(year, month, Math.min(day, lastDay));
        }
        return next;
    }
    if (repeat === 'weekly') {
        const start = new Date(event.date);
        const diff = (start.getDay() - today.getDay() + 7) % 7;
        return new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
    }
    return new Date(event.date);
};

// 距下次天数（当天 0；不重复已过为负）
export const calcDays = (event, today = startOfDay(new Date())) => {
    return Math.round((nextDate(event, today) - today) / (1000 * 60 * 60 * 24));
};

// 下一次到期日字符串 YYYY-MM-DD
export const nextDateStr = (event, today = startOfDay(new Date())) => {
    const next = nextDate(event, today);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
};

// 两个日期间的差值（年/月/天），to 晚于 from
export const diffYMD = (from, to) => {
    let y = to.getFullYear() - from.getFullYear();
    let m = to.getMonth() - from.getMonth();
    let d = to.getDate() - from.getDate();
    if (d < 0) {
        m--;
        d += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    }
    if (m < 0) {
        y--;
        m += 12;
    }
    return { y, m, d };
};

const ymdText = ({ y, m, d }) => {
    let text = '';
    if (y) text += `${y} 年 `;
    if (m) text += `${m} 个月 `;
    if (d) text += `${d} 天`;
    return text.trim();
};

// 已共度天数
export const elapsedDays = (event, today = startOfDay(new Date())) => {
    return Math.round((today - new Date(event.date)) / (1000 * 60 * 60 * 24));
};

// 周年数（仅每年重复且起始日在过去）
export const anniversaryText = (event, today = startOfDay(new Date())) => {
    if (repeatOf(event) !== 'yearly') return '';
    const startYear = Number(event.date.slice(0, 4));
    const month = Number(event.date.slice(5, 7)) - 1;
    const day = Number(event.date.slice(8, 10));
    let years = today.getFullYear() - startYear;
    if (new Date(today.getFullYear(), month, day) > today) {
        years--;
    }
    if (years <= 0) return '';
    return `第 ${years} 周年`;
};

const todayStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// 剩余时间文案
// returns { text, cls, days }
export const formatRemain = (event, now = new Date()) => {
    const today = startOfDay(now);
    const repeat = repeatOf(event);
    const next = nextDate(event, today);
    const days = Math.round((next - today) / (1000 * 60 * 60 * 24));
    const format = event.format || 'day';
    const isToday = (repeat !== 'none' && next.getTime() === today.getTime()) || (repeat === 'none' && event.date === todayStr(now));
    if (isToday) {
        return { text: '就是今天', cls: 'today', days: 0 };
    }
    const passed = repeat === 'none' && days < 0;
    if (format === 'ymd') {
        const from = passed ? next : today;
        const to = passed ? today : next;
        const text = ymdText(diffYMD(from, to));
        return { text: passed ? `已经 ${text}` : `还有 ${text}`, cls: passed ? 'passed' : (days > 0 ? 'coming' : 'today'), days };
    }
    if (format === 'hms') {
        const diffMs = next.getTime() - now.getTime();
        const absMs = Math.abs(diffMs);
        const h = Math.floor(absMs / 3600000);
        const m = Math.floor((absMs % 3600000) / 60000);
        if (h >= 24) {
            const d = Math.floor(h / 24);
            const rh = h % 24;
            return { text: `${passed ? '已经' : '还有'} ${d} 天 ${rh} 小时`, cls: passed ? 'passed' : 'coming', days };
        }
        return { text: `${passed ? '已经' : '还有'} ${h} 小时 ${m} 分`, cls: passed ? 'passed' : 'coming', days };
    }
    if (days === 0) return { text: '就是今天', cls: 'today', days: 0 };
    if (days > 0) return { text: `还有 ${days} 天`, cls: 'coming', days };
    return { text: `已经 ${Math.abs(days)} 天`, cls: 'passed', days };
};
