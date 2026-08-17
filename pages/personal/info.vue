<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="info-wrap">
            <view class="info-card">
                <view class="avatar-wrap">
                    <image class="avatar" mode="aspectFit" :src="state.userInfo.avatar">
                    </image>
                    <uv-button open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
                    </uv-button>
                </view>
                <view class="info-row">
                    <text class="label">姓名</text>
                    <uv-input v-model="state.userInfo.name" type="nickname" border="none"
                        :placeholder="$t('common.nickname')" @blur="getNickName" />
                </view>

                <view class="info-row" @click="openPicker('sex')">
                    <text class="label">性别</text>
                    <view class="select-wrap">
                        {{ state.sexText || '未知' }}
                        <uv-icon class="arrow" name="arrow-down-fill" color="#000000" size="14"></uv-icon>
                    </view>
                </view>

                <view class="info-row" @click="openPicker('birthDate')">
                    <text class="label">出生年月</text>
                    <text class="value">{{ state.userInfo.year }}</text>
                </view>

                <view class="info-row">
                    <text class="label">个人介绍</text>
                    <uv-textarea v-model="state.userInfo.desc" border="none" placeholder="个人介绍..."></uv-textarea>
                </view>

                <view class="info-row column">
                    <text class="label">自评标签</text>

                    <view class="tag-container">
                        <view class="tag-item" v-for="(item, index) in state.evaluateTagList" :key="index" :class="{ active: state.userInfo.selfEvaluate.includes(item) }" @click="toggleEvaluateTag(item)">
                            {{ item }}
                        </view>

                        <view class="tag-add">
                            <input v-model="state.newEvaluateTag" placeholder="自定义" confirm-type="done"
                                @confirm="addEvaluateTag" />
                            <view class="add-btn" @click="addEvaluateTag">+</view>
                        </view>
                    </view>
                </view>
            </view>

            <view class="btn-edit" @click="editUserInfo">修改资料</view>
        </view>

        <uv-picker ref="sexPicker" :confirmText="$t('common.confirm')" :cancelText="$t('common.cancel')"
            :columns="state.sexColumns" keyName="label" @confirm="handleSelect('sex', $event)"></uv-picker>
        <uv-calendars ref="calendars" :color="themeInfo.activeColor" @confirm="handleSelect('birthDate', $event)" />
    </view>
</template>

<script setup>
import { ref, reactive, watchEffect, onMounted } from 'vue';

import { useMainStore } from '@/store/index';
const { themeInfo, storeState, getUserInfo } = useMainStore();

import { getPublicApi } from '@/api/public.js';
const publicApi = getPublicApi();
import { getCustomerApi } from '@/api/customer.js';
const customerApi = getCustomerApi();

import Navbar from '@/components/Navbar.vue';

const state = reactive({
    userInfo: {
        name: '',
        avatar: '',
        desc: '',
        sex: 0,
        year: '',
        selfEvaluate: []
    },
    sexText: '',
    sexColumns: [
        [
            { id: 1, label: '男' },
            { id: 2, label: '女' },
        ]
    ],
    evaluateTagList: ['中羽一级', '中羽二级', '中羽三级', '中羽四级',],
    newEvaluateTag: ''
});

const sexPicker = ref(null);
const calendars = ref(null);

onMounted(() => {
    const userInfo = storeState.userInfo;
    state.userInfo = {
        customerId: userInfo.id,
        name: userInfo.name,
        avatar: userInfo.avatar,
        desc: userInfo.desc,
        sex: userInfo.sex,
        year: 1025,
        isShowHis: userInfo.isShowHis,
        selfEvaluate: userInfo.selfEvaluate,
        playPosition: userInfo.playPosition
    }
    userInfo?.selfEvaluate.forEach(tag => {
        if (!state.evaluateTagList.includes(tag)) {
            state.evaluateTagList.push(tag);
        }
    });
});

watchEffect(() => {
    state.sexText = state.sexColumns[0].find(item => item.id == state.userInfo.sex)?.label;
});

const openPicker = (type) => {
    if (type === 'sex') {
        sexPicker.value?.open();
    } else if (type === 'birthDate') {
        calendars.value?.open();
    }
}

const handleSelect = (type, e) => {
    console.log(e);
    if (type == 'sex') {
        state.userInfo.sex = e.value[0].id;
    } else if (type == 'birthDate') {
        state.userInfo.year = e.fulldate;
    }
}

const getNickName = (e) => {
    if (e) state.userInfo.name = e;
}

const onChooseAvatar = async (e) => {
    const url = await UploaderImage(e.avatarUrl);
    state.userInfo.avatar = url;
}

const UploaderImage = async (url) => {
    return 'https://q5.itc.cn/q_70/images03/20240817/48e9a1755ca046b588fb94404ce83e16.jpeg';
    let imgUrl = '';
    try {
        uni.showLoading();
        const { code, data } = await publicApi.UploaderImage({ filePath: url });
        if (code === 200) {
            imgUrl = saveImageUrl(data.url);
        }
        uni.hideLoading();
    } catch (error) {
        uni.hideLoading();
    }
    return imgUrl;
}

const editUserInfo = () => {
    uni.showLoading({
        mask: true
    });
    customerApi.UpdateCustomer({
        ...state.userInfo,
        selfEvaluate: state.userInfo.selfEvaluate?.length ? state.userInfo.selfEvaluate.join(',') : ''
    }).then(res => {
        if (res.code == 200) {
            uni.showToast({
                title: '修改成功',
                icon: 'none'
            });
            getUserInfo();
        }
    }).finally(() => {
        uni.hideLoading();
    });
}

const toggleEvaluateTag = (tag) => {
    const index = state.userInfo.selfEvaluate.indexOf(tag);
    if (index > -1) {
        state.userInfo.selfEvaluate.splice(index, 1);
    } else {
        state.userInfo.selfEvaluate.push(tag);
    }
}

// 新增自定义标签
const addEvaluateTag = () => {
    const tag = state.newEvaluateTag.trim();
    if (!tag) return;

    if (!state.evaluateTagList.includes(tag)) {
        state.evaluateTagList.push(tag);
    }

    if (!state.userInfo.selfEvaluate.includes(tag)) {
        state.userInfo.selfEvaluate.push(tag);
    }

    state.newEvaluateTag = '';
}
</script>

<style scoped lang="scss">
.info-wrap {
    position: relative;
    padding: 0 var(--padding-size);

    .info-card {
        display: flex;
        align-items: center;
        flex-direction: column;
        padding: 60rpx 0;
        width: 100%;
        border-radius: 16rpx;
        box-shadow: var(--box-shadow);
        background-color: #FFFFFF;
        overflow: hidden;

        .avatar-wrap {
            position: relative;

            .avatar {
                width: 180rpx;
                height: 180rpx;
                border-radius: 32rpx;
                box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.12);
                background: #FFFFFF;
            }

            :deep(.uv-button-wrapper) {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;

                .uv-button {
                    width: 100%;
                    height: 100%;
                }
            }
        }

        .info-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding: 32rpx 40rpx;
            width: 100%;
            box-sizing: border-box;
            border-bottom: 1rpx solid var(--border-color);

            &:last-child {
                border-bottom: none;
            }

            .label {
                font-size: 32rpx;
                color: var(--text-dark);
                font-weight: 500;
                width: 180rpx;
                flex-shrink: 0;
            }

            .value {
                flex: 1;
                font-size: 32rpx;
                color: var(--text-dark);
                text-align: right;
            }

            .select-wrap {
                display: flex;
                align-items: center;
                gap: 10rpx;
                width: fit-content;
                font-size: 32rpx;
            }

            &.column {
                flex-direction: column;
                align-items: flex-start;
            }

            .tag-container {
                display: flex;
                flex-wrap: wrap;
                gap: 16rpx;
                margin-top: 20rpx;

                .tag-item {
                    padding: 12rpx 24rpx;
                    border-radius: 32rpx;
                    font-size: 26rpx;
                    background-color: #f5f5f5;
                    color: #333;

                    &.active {
                        background: var(--left-linear);
                        color: #FFFFFF;
                    }
                }

                .tag-add {
                    display: flex;
                    align-items: center;
                    height: 56rpx;
                    padding: 0 16rpx;
                    border: 1rpx dashed #CCCCCC;
                    border-radius: 32rpx;

                    input {
                        width: 120rpx;
                        font-size: 26rpx;
                    }

                    .add-btn {
                        margin-left: 8rpx;
                        font-size: 32rpx;
                        color: var(--right-linear);
                    }
                }
            }
        }

        :deep(.uv-input) {
            input {
                font-size: 16px !important;
                text-align: right !important;
            }
        }

        :deep(.uv-textarea) {
            padding: 0;

            textarea {
                font-size: 16px !important;
                text-align: right !important;
            }
        }
    }

    .btn-edit {
        margin: 50rpx auto;
        width: 100%;
        height: 90rpx;
        line-height: 90rpx;
        text-align: center;
        font-size: 34rpx;
        font-weight: bold;
        border-radius: 80rpx;
        box-shadow: var(--box-shadow);
        color: var(--text-btn);
        background: linear-gradient(to right, var(--left-linear), var(--right-linear));
    }
}
</style>
