// 导出导航栏高度
export const navbarHeightAndStatusBarHeight = () => {
    let navbarHeight = 0;
    let statusBarHeight = 0;

    navbarHeight = getApp().globalData.navbarHeight;
    statusBarHeight = getApp().globalData.statusBarHeight;

    return {
        navbarHeight,
        statusBarHeight,
    };
}

// tab列
const pagePathList = [
    "/pages/index/index",
    "/pages/personal/index",
];

export const navigateBack = (url) => {
    const pages = getCurrentPages();
    if (url) {
        if (pagePathList.includes(url)) {
            uni.switchTab({
                url,
            });
        } else {
            uni.navigateTo({
                url,
            });
        }
        return;
    }
    if (pages.length > 1) {
        uni.navigateBack(1);
    } else {
        uni.reLaunch({
            url: "/pages/index/index",
        });
    }
}

// 去掉小数点后两位
export const removeTrailingZeros = (num) => {
    if (isNaN(num) || num === null || num === undefined) {
        return num;
    }
    return parseFloat(num).toString();
};

// 分享页的参数
export const shareParam = {
    title: "万能工具箱",
    path: "/pages/index/index",
};

export const formatCurrency = (num, formatDecimal) => {
    if (num == undefined || num == null) return "";
    num = Number(num);
    if (formatDecimal) num = num.toFixed(2);
    const parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
};

export const validateEmail = (email) => {
    if (
        !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            email
        )
    ) {
        return false;
    } else {
        return true;
    }
};

// 把 url 的参数转换成对象
export const parseUrlParams = (url) => {
    const params = {};
    const queryString = url.split("?")[1];
    if (!queryString) return params;

    const pairs = queryString.split("&");
    for (const pair of pairs) {
        const [key, value] = pair.split("=");
        if (key) {
            params[key] = value || "";
        }
    }
    return params;
};

// 日期格式化 YYYY-MM-DD
export const formatDate = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// 时间格式化 HH:mm:ss
export const formatTime = (date = new Date()) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
};

// 计算两个日期相差天数
export const diffDays = (date1, date2 = new Date()) => {
    const d1 = new Date(date1).getTime();
    const d2 = new Date(date2).getTime();
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
};
