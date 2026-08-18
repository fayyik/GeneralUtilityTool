// 中国法定节假日数据（仅供参考，以国务院办公厅公布为准）
// 如需新增年份，按相同结构添加即可
export const holidayData = [
    {
        year: 2022,
        holidays: [
            { name: '元旦', start: '2022-01-01', end: '2022-01-03', days: 3, note: '' },
            { name: '春节', start: '2022-01-31', end: '2022-02-06', days: 7, note: '1月29日、1月30日补班' },
            { name: '清明节', start: '2022-04-03', end: '2022-04-05', days: 3, note: '4月2日补班' },
            { name: '劳动节', start: '2022-04-30', end: '2022-05-04', days: 5, note: '4月24日、5月7日补班' },
            { name: '端午节', start: '2022-06-03', end: '2022-06-05', days: 3, note: '' },
            { name: '中秋节', start: '2022-09-10', end: '2022-09-12', days: 3, note: '' },
            { name: '国庆节', start: '2022-10-01', end: '2022-10-07', days: 7, note: '10月8日、10月9日补班' },
        ],
    },
    {
        year: 2023,
        holidays: [
            { name: '元旦', start: '2022-12-31', end: '2023-01-02', days: 3, note: '' },
            { name: '春节', start: '2023-01-21', end: '2023-01-27', days: 7, note: '1月28日、1月29日补班' },
            { name: '清明节', start: '2023-04-05', end: '2023-04-05', days: 1, note: '' },
            { name: '劳动节', start: '2023-04-29', end: '2023-05-03', days: 5, note: '4月23日、5月6日补班' },
            { name: '端午节', start: '2023-06-22', end: '2023-06-24', days: 3, note: '6月25日补班' },
            { name: '中秋节·国庆节', start: '2023-09-29', end: '2023-10-06', days: 8, note: '10月7日、10月8日补班' },
        ],
    },
    {
        year: 2024,
        holidays: [
            { name: '元旦', start: '2024-01-01', end: '2024-01-01', days: 1, note: '' },
            { name: '春节', start: '2024-02-10', end: '2024-02-17', days: 8, note: '2月4日、2月18日补班' },
            { name: '清明节', start: '2024-04-04', end: '2024-04-06', days: 3, note: '4月7日补班' },
            { name: '劳动节', start: '2024-05-01', end: '2024-05-05', days: 5, note: '4月28日、5月11日补班' },
            { name: '端午节', start: '2024-06-08', end: '2024-06-10', days: 3, note: '' },
            { name: '中秋节', start: '2024-09-15', end: '2024-09-17', days: 3, note: '9月14日补班' },
            { name: '国庆节', start: '2024-10-01', end: '2024-10-07', days: 7, note: '9月29日、10月12日补班' },
        ],
    },
    {
        year: 2025,
        holidays: [
            { name: '元旦', start: '2025-01-01', end: '2025-01-01', days: 1, note: '' },
            { name: '春节', start: '2025-01-28', end: '2025-02-04', days: 8, note: '1月26日、2月8日补班' },
            { name: '清明节', start: '2025-04-04', end: '2025-04-06', days: 3, note: '' },
            { name: '劳动节', start: '2025-05-01', end: '2025-05-05', days: 5, note: '4月27日补班' },
            { name: '端午节', start: '2025-05-31', end: '2025-06-02', days: 3, note: '' },
            { name: '国庆节·中秋节', start: '2025-10-01', end: '2025-10-08', days: 8, note: '9月28日、10月11日补班' },
        ],
    },
    {
        year: 2026,
        holidays: [
            { name: '元旦', start: '2026-01-01', end: '2026-01-03', days: 3, note: '1月4日补班' },
            { name: '春节', start: '2026-02-15', end: '2026-02-23', days: 9, note: '2月14日、2月28日补班' },
            { name: '清明节', start: '2026-04-04', end: '2026-04-06', days: 3, note: '' },
            { name: '劳动节', start: '2026-05-01', end: '2026-05-05', days: 5, note: '5月9日补班' },
            { name: '端午节', start: '2026-06-19', end: '2026-06-21', days: 3, note: '' },
            { name: '中秋节', start: '2026-09-25', end: '2026-09-27', days: 3, note: '9月20日补班' },
            { name: '国庆节', start: '2026-10-01', end: '2026-10-07', days: 7, note: '10月10日补班' },
        ],
    },
];

// 获取指定年份的假期数据
export const getHolidaysByYear = (year) => {
    const data = holidayData.find(item => item.year === year);
    return data?.holidays || [];
};

// 获取所有可用年份（用于年份切换）
export const getAvailableYears = () => holidayData.map(item => item.year).sort((a, b) => a - b);

// 计算距离下一个假期还有多少天（含今天为 0 天）
// 从 start 大于等于今天的假期中取最近的
export const getNextHoliday = (today = new Date()) => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayTime = new Date(todayStr).getTime();
    let next = null;
    for (const item of holidayData) {
        for (const holiday of item.holidays) {
            const startTime = new Date(holiday.start).getTime();
            const diffDays = Math.round((startTime - todayTime) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && (!next || diffDays < next.diffDays)) {
                next = { ...holiday, diffDays };
            }
        }
    }
    return next;
};