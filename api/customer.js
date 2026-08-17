import request from '/utils/request.js';

export function getCustomerApi() {
    return {
        AuthorizedLogin: (data) => {
            return request.request({
                url: '/CustomerAuth/AuthorizedLogin',
                method: 'post',
                data
            });
        },
        UpdateCustomer: (data) => {
            return request.request({
                url: '/Customer/UpdateCustomer',
                method: 'post',
                data
            });
        },
        GetCustomerInfoByToken: () => {
            return request.request({
                url: '/Customer/GetCustomerInfoByToken',
                method: 'get'
            });
        },
        GetCustomerInfo: (customerId) => {
            return request.request({
                url: '/Customer/GetCustomerInfo',
                method: 'get',
                data: {
                    customerId
                }
            });
        },
        GetGameList: (customerId) => {
            return request.request({
                url: '/Customer/GetMyGameList',
                method: 'get',
                data: {
                    customerId
                }
            });
        },
        LikeCustomer: (toCustomerId) => {
            return request.request({
                url: '/Customer/LikeCustomer',
                method: 'post',
                data: {
                    toCustomerId
                }
            });
        },
        UnlikeCustomer: (toCustomerId) => {
            return request.request({
                url: '/Customer/UnlikeCustomer',
                method: 'post',
                data: {
                    toCustomerId
                }
            });
        }
    };
}