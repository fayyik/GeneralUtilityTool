import request from '/utils/request.js';

export function getGameInfoApi() {
    return {
        GetGameInfoList: () => {
            return request.request({
                url: '/GameInfo/GetGameInfoList',
                method: 'get'
            });
        },
        GetGameInfoDetail: (id) => {
            return request.request({
                url: '/GameInfo/GetGameInfoDetail',
                method: 'get',
                data: {
                    gameInfoId: id
                }
            });
        },
        CreateGameInfo: (data) => {
            return request.request({
                url: '/GameInfo/CreateGameInfo',
                method: 'post',
                data
            });
        },
        // 获取活动报名人信息
        GetGamePlayersDetail: (gameInfoId) => {
            return request.request({
                url: '/GameInfo/GetGamePlayersDetail',
                method: 'get',
                data: {
                    gameInfoId
                }
            });
        },
        // 加入球局
        JoinGame: (data) => {
            return request.request({
                url: '/GamePlayer/Join',
                method: 'post',
                data
            });
        },
        // 离开球局
        LeaveGame: (data) => {
            return request.request({
                url: '/GamePlayer/leave',
                method: 'post',
                data
            });
        },
        // 获取球场列表
        GetCourtList: () => {
            return request.request({
                url: '/Court/GetCourtList',
                method: 'get'
            });
        },
        // 根据位置id获取球场列表
        GetCourtsByLocation: (locationId) => {
            return request.request({
                url: '/Court/GetCourtsByLocation',
                method: 'get',
                data: {
                    locationId
                }
            });
        },
        AddCourt: (data) => {
            return request.request({
                url: '/Court/AddCourt',
                method: 'post',
                data
            });
        },
    };
}