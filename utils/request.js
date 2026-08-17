import { baseUrl } from "@/config/index.js";

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
    }

    logOut() {
        uni.removeStorageSync("token");
    }

    getConfig(headerData) {
        const baseHeader = {
            Authorization: "Bearer " + uni.getStorageSync("token"),
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
        // 响应拦截
        config.responseInterceptor = (response, setOptions) => {
            const result = response.data;
            const type = Object.prototype.toString.call(result);
            if (type === "[object Blob]" || type === "[object ArrayBuffer]") {
                return result;
            } else {
                let { code, msg } = result;
                if (code !== undefined && code !== 200) {
                    if (msg) {
                        uni.showModal({
                            title: "提示",
                            content: msg,
                            showCancel: false,
                            confirmText: "确定",
                        });
                    } else {
                        uni.showToast({
                            title: "请求失败",
                            icon: "none",
                            duration: 3000,
                        });
                    }
                    return response.data;
                } else {
                    return result;
                }
            }
        };

        config.responseInterceptorError = (error) => {
            if (error && error.response) {
                error.message = this.checkStatus(error.response.status);
            }
            const isTimeout = (error.errMsg || "").indexOf("timeout") > -1;
            uni.showToast({
                title: isTimeout ? "请求超时" : error.errMsg || "网络异常",
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
                    reject(err);
                },
            });
        });
    }
}

const request = new HttpRequest();
export default request;
