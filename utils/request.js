import { baseUrl, AppId } from "@/config/index.js";
import { useMainStore } from "@/store/index.js";
import i18n from "../locale/index";
const { t } = i18n.global;

const messageToIn18n = {
    "Promo code is incorrect or has expired": t("request.promoCodeError"),
};

const LOGIN_ERROR_CODE = [
    {
        code: 401,
        msg: "",
    },
]; //错误码
const WHITE_CODE_LIST = [
    {
        code: 200,
        msg: "",
    },
    {
        code: 210, // 无数据
        msg: "",
    },
    {
        code: 204,
        msg: "",
    },
    {
        code: 5006,
        msg: t("request.captchaError"),
    },
];
const failCode = [
    {
        code: 600001,
        msg: "网络异常,请检查网络是否联网",
    },
];
//白名单
// 需要token的 接口
const NEED_TOKEN_URL = [
    "/ClientOrder/AddOrder",
    "/ClientOrder/GetOrderById",
    "/ClientOrder/GetOrderList",
];
// 需要token的接口，但是不跳转登录页
const NEED_TOKEN_URL_NoGoLogin = [
    "/ClientCustomer/GetCustomerIndividualInfo",
    "/ClientCustomer/GetUserInfo", // 获取用户信息
    "/ClientMessages/GetCustomerMsgList",
];
// 报错不弹窗
const NOWARRING_URL = [
    "/ClientCustomer/GetActivitiesCode",
    "/ClientCustomer/GetOpenId",
    "/ClientOrder/GetInvoiceReceiptList",
];
// 官网跳转微信小程序 链接 https://elitesys.kingkongcang.com/Mini

function urlStringify(obj) {
    if (typeof obj !== "object" || obj === null) {
        return "";
    }

    const params = Object.keys(obj).map((key) => {
        const value = encodeURIComponent(obj[key]);
        return `${encodeURIComponent(key)}=${value}`;
    });

    return params.length ? "?" + params.join("&") : "";
}

class HttpRequest {
    constructor() {
        this.baseUrl = baseUrl;
        this.timeout = 60000;
        this.showModal = false; // 记录当前弹窗状态 避免多次弹窗 定时三秒重置弹窗状态 避免非正常关闭弹窗 导致app无法操作
        this.isShowUpDate = false; // 是否显示更新
    }
    // 设置弹窗
    setShowModal(showModal) {
        this.showModal = showModal;
        if (showModal) {
            setTimeout(() => {
                this.showModal = false;
            }, 3000);
        }
    }
    // 是否去登录窗口
    showLoginModal() {
        // 如果已经打开 就不重复打开
        if (this.showModal) return;
        // 设置弹窗状态
        this.setShowModal(true);
        uni.showModal({
            cancelText: t("request.cancel"),
            confirmText: t("request.confirm"),
            title: t("request.tip"),
            content: t("request.loginContent"),
            success: (e) => {
                if (e.confirm) {
                    uni.navigateTo({
                        url: "/pages/login/index",
                    });
                    uni.hideLoading();
                } else {
                    uni.hideLoading();
                }
            },
            fail: () => { },
            complete: () => {
                this.setShowModal(false);
            },
        });

        uni.hideLoading();
    }
    logOut() {
        const { logOut: logOutFunc } = useMainStore();
        logOutFunc();
    }
    getConfig(headerData) {
        const baseHeader = {
            Authorization: "Bearer " + uni.getStorageSync("token"),
            lang:
                uni.getStorageSync("yu-language") == "en" ? "en" : "zh",
            AppId,
        };
        return {
            url: this.baseUrl,
            timeout: this.timeout,
            header: headerData ? { ...baseHeader, ...headerData } : { ...baseHeader },
        };
    }

    getParams(payload) {
        const { method, data, url } = payload;
        payload.url = this.baseUrl + url;
        if (["post", "put", "patch", "delete"].indexOf(method) >= 0) {
            payload.data = data;
        } else {
            payload.url = payload.url + urlStringify(data);
            delete payload.data;
        }
        return payload;
    }

    checkStatus(status) {
        let errMessage = "";
        switch (status) {
            case 400:
                errMessage = "error";
                break;
            case 401:
                errMessage = "Unauthorized, please log in again";
                break;
            case 403:
                errMessage = "Access denied";
                break;
            case 404:
                errMessage = "Request error, the resource was not found";
                break;
            case 405:
                errMessage = "Request method not allowed";
                break;
            case 408:
                errMessage = "Request timeout";
                break;
            case 500:
                errMessage = "Server side error";
                break;
            case 501:
                errMessage = "The network is not implemented";
                break;
            case 502:
                errMessage = "Network error";
                break;
            case 503:
                errMessage = "Service is not available";
                break;
            case 504:
                errMessage = "Network timeout";
                break;
            case 505:
                errMessage = "The request is not supported by the http version";
                break;
            default:
                errMessage = "Connection error";
        }
        return errMessage;
    }

    // 拦截处理
    setInterceptors(config, setOptions) {
        const token = uni.getStorageSync("token");
        const that = this;
        const isNeeTokenNoGoLogin = NEED_TOKEN_URL_NoGoLogin.every(
            (item) => setOptions.url.indexOf(item) === -1
        );
        if (!isNeeTokenNoGoLogin) {
            // 检查是否存在token 没有就return
            if (!token) {
                uni.hideLoading();
                Promise.reject("Need login");
            }
        }
        const isNeeToken = NEED_TOKEN_URL.every(
            (item) => setOptions.url.indexOf(item) === -1
        );
        if (!isNeeToken) {
            // 检查是否存在token 没有直接跳转
            if (!token) {
                this.showLoginModal();
                return Promise.reject("Need login");
            }
        }
        // 请求拦截
        // config.requestInterceptor = options => {
        //   if (!navigator.onLine) {
        //     uni.showToast({
        //       title: 'Please check that your network is normal.',
        //       icon: 'none',
        //       duration: 3000
        //     });
        //     return Promise.reject(new Error('Please check that your network is normal.'));
        //   }
        //   const token = 'Bearer ' + uni.getStorageSync('token');
        //   if (token) {
        //     options.header.Authorization = token;
        //   }
        //   return options;
        // };

        // 响应拦截
        config.responseInterceptor = (response, setOptions) => {
            const result = response.data;
            const type = Object.prototype.toString.call(result);
            if (type === "[object Blob]" || type === "[object ArrayBuffer]") {
                return result;
            } else {
                let { code, msg } = result;
                const isErrorToken = LOGIN_ERROR_CODE.some((item) => item.code == code);
                const isWhiteCode = WHITE_CODE_LIST.some((item) => item.code == code);

                // if (code == 1005) {
                //     uni.navigateTo({
                //         url: '/pagesb/maskUser/index'
                //     });
                //     return result;
                // }

                if (isErrorToken) {
                    // if(code === 401) {
                    //   uni.removeStorageSync({
                    //     key: 'token',
                    //     success: function (res) {
                    //       uni.navigateTo({
                    //         url: '/pages/login/index'
                    //       });
                    //     }
                    //   })
                    // }
                    // 判断链接 需不需要跳转登录页
                    const isNeeTokenNoGoLogin = NEED_TOKEN_URL_NoGoLogin.some(
                        (item) => setOptions.url.indexOf(item) !== -1
                    );
                    if (!isNeeTokenNoGoLogin) {
                        this.logOut();
                        this.showLoginModal();
                    }
                    uni.hideLoading();
                    return response;
                } else if (!isWhiteCode) {
                    if (msg === "Request canceled by user") return result;
                    if (messageToIn18n[msg]) {
                        msg = t(messageToIn18n[msg]);
                    }
                    const isNOWARRING_URL = NOWARRING_URL.some(
                        (item) => setOptions.url.indexOf(item) !== -1
                    );
                    if (!isNOWARRING_URL) {
                        if (msg) {
                            uni.showModal({
                                title: t("common.tip"),
                                content: msg,
                                showCancel: false,
                                confirmText: t("request.confirm"),
                            });
                        } else {
                            uni.showToast({
                                title: t("request.error"),
                                icon: "none",
                                duration: 3000,
                            });
                        }
                    }
                    return response.data;
                } else {
                    return result;
                }
            }
        };

        config.responseInterceptorError = (error) => {
            if (
                (error.errMsg.indexOf("request:fail") > -1 && !this.isShowUpDate) ||
                (error.statusCode == 502 && !this.isShowUpDate)
            ) {
                this.isShowUpDate = true;
                // uni.request({
                //     url: devURL + '/app/GetIsProductionServerUpdating',
                //     success: response => {
                //         if (response?.data.data) {
                //             uni.showModal({
                //                 title: '系统更新时提示',
                //                 content: '系统更新中，预计耗时10分钟，请稍后再试!',
                //                 showCancel: false,
                //                 success: (res) => {
                //                     this.isShowUpDate = false
                //                 }
                //             });
                //         } else {
                //             this.isShowUpDate = false
                //         }
                //     },
                //     fail: error => {
                //         this.isShowUpDate = false
                //     }
                // });
                uni.showModal({
                    title: t("common.tip"),
                    content: 'failed to connect to server, please try again later',
                    showCancel: false,
                    success: () => {
                        this.isShowUpDate = false;
                    },
                });
                setTimeout(() => {
                    this.isShowUpDate = false;
                }, 2000);
            }

            if (error && error.response) {
                error.message = that.checkStatus(error.response.status);
            }
            const isTimeout = error.errMsg.indexOf("timeout") > -1;
            if (error.errMsg === "Request canceled by user") return error.errMsg;
            const msg =
                failCode.find((item) => item.code == error.errno)?.msg || error.errMsg;
            uni.showToast({
                title: isTimeout ? t("request.timeout") : msg || t("request.noConnect"),
                icon: "none",
                duration: 2000,
            });
            return error;
        };
    }

    request(options) {
        const config = this.getConfig(options.header);
        const setOptions = this.getParams(options);
        this.setInterceptors(config, setOptions);
        return new Promise((resolve, reject) => {
            uni.request({
                ...config,
                ...setOptions,
                success: (response) => {
                    if (response.statusCode === 502) {
                        try {
                            const err = config.responseInterceptorError(response);
                            reject(err);
                        } catch (error) {
                            console.log("Error in response interceptor:", response);
                            reject(error);
                        }
                    }
                    const result = config.responseInterceptor(response, setOptions);
                    resolve(result);
                },
                fail: (error) => {
                    try {
                        const err = config.responseInterceptorError(error);
                        reject(err);
                    } catch (catchErr) {
                        console.log("Error in response interceptor:", catchErr);
                        reject(catchErr);
                    }
                },
            });
        });
    }
    async uploadFile(options) {
        const config = this.getConfig(options.header);
        const setOptions = this.getParams(options);
        this.setInterceptors(options, setOptions);

        return new Promise((resolve, reject) => {
            uni.uploadFile({
                ...config,
                ...setOptions,
                filePath: options.data.filePath,
                name: "file",
                formData: options.data.formData,
                success: (response) => {
                    response.data = JSON.parse(response.data);
                    const result = options.responseInterceptor(response);
                    resolve(result);
                },
                fail: (error) => {
                    const err = options.responseInterceptorError(error);
                    console.log(err);
                    reject(err);
                },
            });
        });
    }
}

const request = new HttpRequest();
export default request;
