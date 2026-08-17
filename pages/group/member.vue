<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="club-member-wrap">
            <view class="club-header">
                <uv-swiper :list="state.clubInfo?.pics" height="360rpx" radius="0" indicator />
                <view class="club-overlay">
                    <view class="club-info" @click="openDetailModal">
                        <image class="club-avatar"
                            src="https://pic.rmb.bdstatic.com/bjh/news/3fe6db1a8d291be39192f9a06c74ce99.png"
                            mode="aspectFill" />
                        <view class="club-main">
                            <view class="club-title">{{ state.clubInfo.name }}</view>
                            <view class="club-desc">
                                {{ state.clubInfo.desc }}
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <scroll-view class="member-list-wrap" scroll-y>
                <view class="member-item" v-for="(item, index) in state.memberList" :key="index">
                    <image class="member-avatar" :src="item.avatar" mode="widthFix"></image>
                    <view class="member-info">
                        <view class="name-gender">
                            <text class="member-name">{{ item.name }}</text>
                            <uv-icon name="man" v-if="item.sex == 1" color="#409EFF"></uv-icon>
                            <uv-icon name="woman" v-else color="#F56C6C"></uv-icon>
                        </view>
                        <view class="role-level">
                            <text class="member-role">{{ item.isOrganizer ? '组织者' : '成员' }}</text>
                            <text class="member-count">活动场次：<text class="number">{{ item.activityCount }}</text></text>
                        </view>
                    </view>
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script setup>
import { reactive, onMounted } from 'vue';

import Navbar from '@/components/Navbar.vue';

import { useMainStore } from '@/store';
const { themeInfo } = useMainStore();

const state = reactive({
    clubInfo: {
        name: '城市骑行俱乐部',
        desc: '骑行爱好者聚集地，一起畅游城市，感受风车和阳光。',
        avatar: 'https://pic.rmb.bdstatic.com/bjh/news/3fe6db1a8d291be39192f9a06c74ce99.png',
        pics: [
            'https://img0.baidu.com/it/u=1337068678,3064275007&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=750',
            'https://img0.baidu.com/it/u=1337068678,3064275007&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=750',
            'https://img0.baidu.com/it/u=1337068678,3064275007&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=750'
        ],
        memberAvatars: [
            'https://inews.gtimg.com/om_bt/OLBqNKL6MzU-LPaJsFezkXFg3zzafG3X-aNd88oCNPgHMAA/641',
            'https://inews.gtimg.com/om_bt/OLBqNKL6MzU-LPaJsFezkXFg3zzafG3X-aNd88oCNPgHMAA/641'
        ],
        memberCount: 128
    },
    memberList: []
});

const gerMemberList = () => {
    state.memberList = [
        { name: '组织者', avatar: 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/samantha/logo-icon-white-bg.png', sex: 2, isOrganizer: true, activityCount: 13 },
        { name: '成员一D豆豆豆', avatar: 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/samantha/logo-icon-white-bg.png', sex: 1, isOrganizer: false, activityCount: 4 },
        { name: '成员二\(￣︶￣*\))', avatar: 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/samantha/logo-icon-white-bg.png', sex: 2, isOrganizer: false, activityCount: 5 },
        { name: '成员三', avatar: 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/samantha/logo-icon-white-bg.png', sex: 1, isOrganizer: false, activityCount: 5 }
    ];
}

onMounted(() => {
    gerMemberList();
});
</script>

<style scoped lang="scss">
.club-member-wrap {
    padding: 0 var(--padding-size);

    .club-header {
        position: relative;
        height: 360rpx;
        border-radius: 28rpx;
        overflow: hidden;
        box-shadow: var(--box-shadow);
        margin-bottom: 20rpx;

        .club-overlay {
            position: absolute;
            inset: 0;
            padding: 28rpx;
            display: flex;
            align-items: flex-end;

            background: linear-gradient(to top,
                    rgba(0, 0, 0, 0.65),
                    rgba(0, 0, 0, 0.25),
                    rgba(0, 0, 0, 0));

            .club-info {
                display: flex;
                align-items: flex-start;
                width: 100%;
                color: #FFFFFF;

                .club-avatar {
                    width: 100rpx;
                    height: 100rpx;
                    border-radius: 20rpx;
                    margin-right: 20rpx;
                    border: 2rpx solid rgba(255, 255, 255, 0.9);
                    background: #FFFFFF;
                    flex-shrink: 0;
                }

                .club-main {
                    flex: 1;

                    .club-title {
                        font-size: 34rpx;
                        font-weight: 700;
                        line-height: 1.2;
                    }

                    .club-desc {
                        margin-top: 10rpx;
                        font-size: 22rpx;
                        opacity: 0.9;
                        max-width: 85%;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }
            }
        }
    }

    .member-list-wrap {
        height: calc(100vh - 640rpx);

        .member-item {
            display: flex;
            align-items: center;
            background-color: #FFFFFF;
            border-radius: 16rpx;
            padding: 20rpx;
            margin-top: 20rpx;

            .member-avatar {
                width: 80rpx;
                height: 80rpx;
                border-radius: 50%;
                margin-right: 20rpx;
            }

            .member-info {
                flex: 1;
                display: flex;
                flex-direction: column;

                .name-gender {
                    display: flex;
                    align-items: center;
                    margin-bottom: 16rpx;

                    .member-name {
                        font-size: 32rpx;
                        font-weight: 500;
                        margin-right: 10rpx;
                    }
                }

                .role-level {
                    display: flex;
                    align-items: center;

                    .member-role {
                        margin-right: 30rpx;
                        padding: 4rpx 16rpx 6rpx;
                        font-size: 22rpx;
                        border-radius: 20rpx;
                        color: var(--text-btn);
                        background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
                    }

                    .member-count {
                        font-size: 24rpx;
                        color: var(--text-light);

                        .number {
                            color: var(--text-dark);
                        }
                    }
                }
            }
        }
    }
}
</style>
