<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="info-wrap">
            <view class="info-card">
                <view class="avatar-wrap" @click="chooseAvatar">
                    <image class="avatar" v-if="state.userInfo.avatar" mode="aspectFill" :src="state.userInfo.avatar"></image>
                    <view class="avatar-default" v-else>
                        <uv-icon name="account-fill" size="60" color="#FFFFFF"></uv-icon>
                    </view>
                    <view class="avatar-tip">点击更换头像</view>
                </view>

                <view class="info-row">
                    <text class="label">昵称</text>
                    <input class="value" v-model="state.userInfo.nickname" placeholder="请输入昵称" />
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
                    <text class="value">{{ state.userInfo.birthDate || '未设置' }}</text>
                </view>

                <view class="info-row column">
                    <text class="label">个人介绍</text>
                    <uv-textarea v-model="state.userInfo.desc" border="none" placeholder="个人介绍..."></uv-textarea>
                </view>
            </view>

            <view class="btn-edit" @click="saveUserInfo">保存</view>
        </view>

        <uv-picker ref="sexPicker" :confirmText="'确定'" :cancelText="'取消'"
            :columns="state.sexColumns" keyName="label" @confirm="handleSelect('sex', $event)"></uv-picker>
        <uv-calendars ref="calendars" :color="themeInfo.activeColor" @confirm="handleSelect('birthDate', $event)" />
    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

import { useMainStore } from '@/store/index';
const { themeInfo, getUserInfo, setUserInfo } = useMainStore();

import Navbar from '@/components/Navbar.vue';

const state = reactive({
    userInfo: {
        nickname: '',
        avatar: '',
        desc: '',
        sex: 0,
        birthDate: '',
    },
    sexText: '',
    sexColumns: [
        [
            { id: 1, label: '男' },
            { id: 2, label: '女' },
        ]
    ],
});

const sexPicker = ref(null);
const calendars = ref(null);

onMounted(() => {
    const userInfo = getUserInfo();
    state.userInfo = {
        nickname: userInfo.nickname || '',
        avatar: userInfo.avatar || '',
        desc: userInfo.desc || '',
        sex: userInfo.sex || 0,
        birthDate: userInfo.birthDate || '',
    };
});

const openPicker = (type) => {
    if (type === 'sex') {
        sexPicker.value?.open();
    } else if (type === 'birthDate') {
        calendars.value?.open();
    }
}

const handleSelect = (type, e) => {
    if (type == 'sex') {
        state.userInfo.sex = e.value[0].id;
    } else if (type == 'birthDate') {
        state.userInfo.birthDate = e.fulldate;
    }
}

const chooseAvatar = () => {
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        success: (res) => {
            state.userInfo.avatar = res.tempFilePaths[0];
        },
    });
}

const saveUserInfo = () => {
    const userInfo = {
        ...getUserInfo(),
        ...state.userInfo,
    };
    setUserInfo(userInfo);
    uni.showToast({
        title: '保存成功',
        icon: 'none'
    });
    setTimeout(() => {
        uni.navigateBack();
    }, 500);
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
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20rpx;

            .avatar,
            .avatar-default {
                width: 180rpx;
                height: 180rpx;
                border-radius: 50%;
                box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.12);
                background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
            }

            .avatar-default {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .avatar-tip {
                margin-top: 16rpx;
                font-size: 24rpx;
                color: var(--text-light);
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
        }

        :deep(.uv-textarea) {
            padding: 0;
            margin-top: 20rpx;

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