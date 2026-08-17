<template>
    <view class="transfer-wrap" :class="[`${themeInfo.theme}-theme`]">
        <view class="tip">选择一位成员，Ta将成为俱乐部的主理人，您将成为此俱乐部的普通成员</view>
        <view class="main-wrap">
            <view class="search">
                <uv-search placeholder="搜索成员" v-model="searchName" bgColor="#FFFFFF" borderColor="#9E9E9E"
                    @search="handleSearch"></uv-search>
            </view>
            <view class="member-wrap">
                <view class="member-item" v-for="item in memberList" :key="item.id" @click="selectMember(item)">
                    <view class="select">
                        <uv-radio-group v-model="selected">
                            <uv-radio :name="item.id" activeColor="#40EDF0"></uv-radio>
                        </uv-radio-group>
                    </view>
                    <view class="avatar">
                        <uv-avatar :size="40" :src="item.avatar"></uv-avatar>
                    </view>
                    <view class="info">
                        <view class="name-wrap">
                            <view class="name">{{ item.name }}</view>
                            <uv-icon name="man" v-if="item.gender == 1" color="#409EFF"></uv-icon>
                            <uv-icon name="woman" v-else color="#F56C6C"></uv-icon>
                        </view>
                        <view class="activity-count">活动场次：<text>{{ item.activityCount }} </text></view>
                    </view>
                </view>
            </view>
        </view>
        <view class="btn-wrap">确定转让</view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import { useMainStore } from '@/store';
const { themeInfo } = useMainStore();

const searchName = ref('');
const selected = ref('');
const allMemberList = ref([]);
const memberList = ref([]);

onMounted(() => {
    getMemberList();
});

const getMemberList = () => {
    allMemberList.value = [
        {
            id: 3,
            name: '张三',
            activityCount: 4,
            gender: 1,
            avatar: 'https://inews.gtimg.com/om_bt/OLBqNKL6MzU-LPaJsFezkXFg3zzafG3X-aNd88oCNPgHMAA/641',
        }
    ];
    memberList.value = allMemberList.value;
}

const selectMember = (item) => {
    selected.value = item.id;
}

const handleSearch = () => {
    if (searchName.value) {
        memberList.value = allMemberList.value.filter(item => item.name.indexOf(searchName.value) > -1);
    } else {
        memberList.value = allMemberList.value;
    }
}
</script>

<style lang="scss" scoped>
.transfer-wrap {
    .tip {
        padding: 20rpx;
        color: #9E9E9E;
        font-size: 24rpx;
        background-color: #F3F3F3;
    }

    .main-wrap {
        padding: 30rpx 0;

        .search {
            margin: 0 20rpx 20rpx;
        }

        .member-wrap {
            height: calc(100vh - 340rpx);
            overflow: auto;
        }

        .member-item {
            display: flex;
            align-items: center;
            padding: 20rpx;
            border-bottom: 1rpx solid var(--border-color);

            .select {
                margin-right: 20rpx;
            }

            .avatar {
                margin-right: 20rpx;
            }

            .info {
                .name-wrap {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10rpx;

                    .name {
                        margin-right: 4px;
                        font-size: 32rpx;
                        font-weight: bold;
                    }
                }

                .activity-count {
                    color: var(--text-light);
                    font-size: 28rpx;

                    text {
                        color: var(--text-dark);
                    }
                }
            }

            &:last-child {
                border: none;
            }
        }
    }

    .btn-wrap {
        position: fixed;
        bottom: 20rpx;
        left: 20rpx;
        width: calc(100% - 40rpx);
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        color: var(--text-dark);
        font-size: 30rpx;
        font-weight: 600;
        border-radius: 40rpx;
        background: var(--main-color);
    }
}
</style>
