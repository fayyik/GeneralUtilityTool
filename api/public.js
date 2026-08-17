import request from '/utils/request.js';

export function getPublicApi() {
    return {
        UploaderImage: (data) => {
            return request.uploadFile({
                url: '/Common/UploadFile',
                method: 'post',
                data,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        AddLocation: (data) => {
            return request.request({
                url: '/Location/Add',
                method: 'post',
                data: {
                    "parentType": 1,
                    "province": "string",
                    "city": "string",
                    "district": "string",
                    "street": "string",
                    "streetNumber": "string",
                    "fullAddress": "string",
                    "longitude": 0,
                    "latitude": 0,
                    "zoomLevel": 0,
                    "title": "string",
                    ...data
                }
            });
        }
    }
}