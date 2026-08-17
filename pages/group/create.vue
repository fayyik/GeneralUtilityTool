<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="create-activity-wrap">
            <view class="form-item upload-wrap">
                <view class="label"><text class="required-text">*</text> 俱乐部封面图</view>
                <uv-upload :fileList="formData.pics" name="pics" multiple :maxCount="5" @afterRead="afterRead" @delete="deletePic">
                    <view class="upload-content">
                        <uv-icon name="camera" size="30px" :color="themeInfo.activeColor"></uv-icon>
                        <view class="text">点击上传封面</view>
                    </view>
                </uv-upload>
            </view>

            <view class="form-item logo-wrap">
                <view class="label"><text class="required-text">*</text> 俱乐部logo</view>
                <uv-upload :fileList="formData.logo" name="logo" multiple :maxCount="1" @afterRead="afterRead" @delete="deletePic"></uv-upload>
            </view>

            <view class="form-item">
                <view class="label"><text class="required-text">*</text> 俱乐部名称</view>
                <uv-input v-model="formData.name" type="text" border="bottom" placeholder="请输入俱乐部名称"
                    placeholder-class="placeholder-style" maxlength="50" />
            </view>

            <view class="form-item picker-wrap" @click="openLocation">
                <view class="label"><text class="required-text">*</text> 俱乐部地点</view>
                <view class="picker-content">
                    <view class="value" :class="{ selected: formData.location }">{{ formData.location || '请选择俱乐部地点' }}
                    </view>
                    <uv-icon name="arrow-right" size="24rpx"></uv-icon>
                </view>
            </view>

            <view class="form-item textarea-wrap">
                <view class="label"><text class="required-text">*</text> 俱乐部简介</view>
                <uv-textarea v-model="formData.intro" placeholder="请输入活动详细介绍" placeholder-class="placeholder-style"
                    rows="5" maxlength="500"></uv-textarea>
            </view>

            <view class="form-item">
                <view class="label"><text class="required-text">*</text> 联系人</view>
                <uv-input v-model="formData.contactName" type="text" border="bottom" placeholder="请输入联系人"
                    placeholder-class="placeholder-style" />
            </view>

            <view class="form-item">
                <view class="label"><text class="required-text">*</text> 联系电话</view>
                <uv-input v-model="formData.contactPhone" type="text" border="bottom" placeholder="请输入联系电话" />
            </view>

            <view class="submit-btn" @click="handleCreate">
                <view class="btn-text" v-if="formData.id">修改俱乐部信息</view>
                <view class="btn-text" v-else>创建俱乐部</view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { navigateBack, saveImageUrl } from '@/utils/common.js';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import { getPublicApi } from '@/api/public.js';
const publicApi = getPublicApi();
import { getGameInfoApi } from '@/api/gameInfo.js';
const gameInfoApi = getGameInfoApi();

import Navbar from '@/components/Navbar.vue';

const formData = reactive({
    id: '',
    pics: [],
    logo: [],
    name: '',
    location: '',
    intro: '',
    contactName: '',
    contactPhone: ''
});

onLoad((options) => {
    if (options.id) {
        formData.id = options.id;
        formData.name = '骑行俱乐部';
        formData.location = '俱乐部地点xxxx';
        formData.intro = '俱乐部地点介绍艾一艾一艾一';
        formData.contactName = 'xxx';
        formData.contactPhone = 'xxxxx';
        formData.pics = [
            {
                url: 'https://tiyu.nwpu.edu.cn/__local/E/3D/EB/F884B3EAC000ACD393B70E7427A_3B65AE5B_9BDCF.jpg',
                status: 'success'
            }
        ];
    }
});

const deletePic = (event) => {
    formData[event.name].splice(event.index, 1);
}

const UploaderImage = async (url) => {
    return 'https://tiyu.nwpu.edu.cn/__local/E/3D/EB/F884B3EAC000ACD393B70E7427A_3B65AE5B_9BDCF.jpg';
    let imgUrl = '';
    try {
        const { code, data } = await publicApi.UploaderImage({ filePath: url });
        if (code === 200) {
            imgUrl = saveImageUrl(data.url);
        }
    } catch (error) {
        console.error("UploaderImage error:", error);
    }
    return imgUrl;
}

// 新增图片
const afterRead = async (event) => {
    const listKey = event.name;
    if (!formData[listKey]) {
        formData[listKey] = [];
    }
    // 当设置 multiple 为 true 时, file 为数组格式，否则为对象格式
    let lists = [].concat(event.file);
    let fileListLen = formData[listKey].length;
    lists.map((item) => {
        formData[listKey].push({
            ...item,
            status: 'uploading',
            message: '上传中'
        });
    });
    for (let i = 0; i < lists.length; i++) {
        const result = await UploaderImage(lists[i].url);
        let item = formData[listKey][fileListLen];
        formData[listKey].splice(fileListLen, 1, Object.assign(item, {
            status: 'success',
            message: '',
            url: result
        }));
        fileListLen++;
    }
}

const openLocation = () => { }

// 表单验证
const validateForm = () => {
    if (!formData.pics?.length) {
        uni.showToast({ title: '请上传俱乐部封面图', icon: 'none' });
        return false;
    }
    if (!formData.logo?.length) {
        uni.showToast({ title: '请上传俱乐部logo', icon: 'none' });
        return false;
    }
    if (!formData.name) {
        uni.showToast({ title: '请输入俱乐部名称', icon: 'none' });
        return false;
    }
    if (!formData.location) {
        uni.showToast({ title: '请选择俱乐部地点', icon: 'none' });
        return false;
    }
    if (!formData.intro) {
        uni.showToast({ title: '请输入俱乐部简介', icon: 'none' });
        return false;
    }
    if (!formData.contactName) {
        uni.showToast({ title: '请输入联系人', icon: 'none' });
        return false;
    }
    if (!formData.contactPhone) {
        uni.showToast({ title: '请输入联系电话', icon: 'none' });
        return false;
    }
    let hasLoading = formData.pics.some((item) => item.status !== 'success');
    hasLoading = hasLoading || formData.logo.some((item) => item.status !== 'success');
    if (hasLoading) {
        uni.showToast({
            title: '图片正在上传中，请稍候',
            icon: 'none'
        });
        return false;
    }
    return true;
};

const handleCreate = async () => {
    if (!validateForm()) return;

    uni.showLoading({
        mask: true
    });
    let pics = formData.pics.map((item) => item.url);
    pics = pics.join(',');
    const submitData = {
        ...formData,
        pics,
        logo: formData.logo[0]?.url
    };

    const { code } = await gameInfoApi.CreateGameInfo(submitData);
    uni.hideLoading();
    if (code == 200) {
        uni.showToast({
            title: '创建成功',
            icon: 'none'
        });
        setTimeout(() => {
            navigateBack();
        }, 500);
    } else {
        uni.showToast({
            title: '创建失败',
            icon: 'none'
        });
    }
};
</script>

<style scoped lang="scss">
.create-activity-wrap {
    padding: 0 30rpx 40rpx;

    .form-item {
        background: #FFFFFF;
        border-radius: 12rpx;
        padding: 24rpx 30rpx;
        margin-bottom: 20rpx;

        .label {
            font-size: 30rpx;
            font-weight: 500;
            color: var(--text-dark);
            margin-bottom: 16rpx;

            .required-text {
                color: #F56C6C;
            }
        }

        :deep(.placeholder-style) {
            color: #999999;
            font-size: 28rpx;
        }
    }

    .upload-wrap {
        .upload-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 630rpx;
            height: 300rpx;
            border: 1px dashed var(--border-color);
            border-radius: 8rpx;

            .text {
                color: #999999;
                margin-top: 16rpx;
                font-size: 28rpx;
            }
        }
    }

    :deep(.uv-input) {
        padding-left: 0 !important;
        border-bottom: 1px dashed var(--border-color) !important;
    }

    .textarea-wrap {
        :deep(.uv-textarea) {
            border: 1px dashed var(--border-color) !important;
        }
    }

    .picker-wrap {
        .picker-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 28rpx;
            padding-bottom: 14rpx;

            .value {
                color: #999999;

                &.selected {
                    color: var(--text-dark);
                }
            }
        }
    }

    .logo-wrap {
        display: flex;
        align-items: center;

        :deep(.uv-upload__wrap) {
            align-self: flex-end;
        }
    }

    .submit-btn {
        margin-top: 40rpx;
        width: 100%;
        height: 88rpx;
        background: var(--main-color);
        border-radius: 44rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--box-shadow);

        .btn-text {
            font-size: 32rpx;
            color: #FFFFFF;
        }
    }
}
</style>
