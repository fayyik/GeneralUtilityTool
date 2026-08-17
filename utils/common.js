import { baseImageUrl } from '@/config/index'
import i18n from "../locale/index";
const { t } = i18n.global;

// 导出导航栏高度
export const navbarHeightAndStatusBarHeight = () => {
    let navbarHeight = 0;
    let statusBarHeight = 0;

    navbarHeight = getApp().globalData.navbarHeight;
    statusBarHeight = getApp().globalData.statusBarHeight;

    // if (navbarHeight === 0 || statusBarHeight === 0) {
    //     // #ifdef MP-WEIXIN
    //     const wxStatusBarHeight = uni.getSystemInfoSync().statusBarHeight;
    //     const wxMenuBtn = uni.getMenuButtonBoundingClientRect();
    //     const barHeight =
    //         wxMenuBtn.height + (wxMenuBtn.top - wxStatusBarHeight) * 2;
    //     navbarHeight = (barHeight || 40) + wxStatusBarHeight;
    //     statusBarHeight = wxStatusBarHeight || 20;
    //     // #endif
    // }

    return {
        navbarHeight,
        statusBarHeight,
    };
}

// tab列
const pagePathList = [
    "/pages/index/index",
    "/pages/group/index",
    "/pages/activity/create",
    "/pages/order/index",
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

// onshow 判断有没token 没有就不去请求 有的话就去请求
export const onShowRerequestByIsLogin = (callBack, errCallBack) => {
    // 检查是否存在token 没有直接跳转
    const token = uni.getStorageSync("token");
    if (token) {
        callBack();
    } else {
        errCallBack && errCallBack();
    }
};
// 登陆完 是否可以返回到登录前的页面
export const isToHome = () => {
    let routes = getCurrentPages();
    let isNeeToHome = false;
    // 登录后返回原来页面的路由
    let refreshPage = [
        "pages/unlock/index",
        "pages/setOrder/index",
        "pages/site/index",
        "pages/orderdetail/index",
        "pages/orderdetail/door",
        "pages/orderdetail/lock",
        "pagesb/reserve/index",
    ];
    let preRoute = routes[routes.length - 2]?.route;
    if (preRoute && refreshPage.includes(preRoute)) {
        isNeeToHome = false;
    } else {
        isNeeToHome = true;
    }
    if (isNeeToHome) {
        uni.reLaunch({
            url: "/pages/index/index",
        });
    } else {
        navigateBack();
    }
};

// 将角度转换为弧度常量
const RADIANS_PER_DEGREE = Math.PI / 180.0;
// 通过经纬度计算两点之间距离
export const getDistance = (lat1, lng1, lat2, lng2) => {
    const radLat1 = lat1 * RADIANS_PER_DEGREE;
    const radLat2 = lat2 * RADIANS_PER_DEGREE;
    const deltaLat = radLat1 - radLat2;
    const deltaLng = lng1 * RADIANS_PER_DEGREE - lng2 * RADIANS_PER_DEGREE;
    let distance =
        2 *
        Math.asin(
            Math.sqrt(
                Math.sin(deltaLat / 2) ** 2 +
                Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLng / 2) ** 2
            )
        );
    distance = distance * 6378.137; // 地球半径
    distance = Math.round(distance * 10) / 10;
    if (distance > 99) {
        return { distance: ">99", number: distance };
    }
    return { distance, number: distance };
};

// 去掉小数点后两位
export const removeTrailingZeros = (num) => {
    // Check if input is a valid number
    if (isNaN(num) || num === null || num === undefined) {
        return num;
    }
    // Convert to float and then to string to remove trailing zeros
    return parseFloat(num).toString();
};

// 分享页的参数
export const shareParam = {
    title: "you",
    path: "/pages/index/index",
};

export const saveImageUrl = (url) => {
	if (!url) return '';
	return url.replace(baseImageUrl, '');
}

// export const showImage = (isOpen, url) => {
// 	if (isOpen) {
// 		if (!url) return;
// 		if (url.indexOf('http') !== -1 || url.indexOf('https') !== -1) {
// 			uni.previewImage({
// 				urls: [url],
// 			});
// 		} else {
// 			uni.previewImage({
// 				urls: [baseImageUrl + url],
// 			});
// 		}
// 	} else {
// 		if (!url) return '';
// 		if (url.indexOf('http') !== -1 || url.indexOf('https') !== -1) {
// 			return url;
// 		} else {
// 			return baseImageUrl + url;
// 		}
// 	}
// }

export const numberToChinese = (num) => {
    num = Number(num);
    if (num < 0 || num > 100) {
        return "超出范围（0-100）";
    }

    if (num === 0) return "零";
    if (num === 100) return "一百";

    const digits = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

    let result = "";
    const numStr = num.toString();

    if (numStr.length === 2) {
        const ten = parseInt(numStr[0]);
        const one = parseInt(numStr[1]);

        if (ten === 1) {
            result += "十";
        } else {
            result += digits[ten] + "十";
        }

        if (one !== 0) {
            result += digits[one];
        }
    } else {
        result = digits[num];
    }

    return result;
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
