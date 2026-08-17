<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="club-detail-wrap">
            <view class="club-header">
                <uv-swiper :list="state.clubInfo?.pics" height="360rpx" radius="0" indicator />
                <view class="club-overlay">
                    <view class="club-info" @click="openDetailModal">
                        <image class="club-avatar"
                            src="https://pic.rmb.bdstatic.com/bjh/news/3fe6db1a8d291be39192f9a06c74ce99.png"
                            mode="aspectFill" />
                        <view class="club-main">
                            <view class="club-title">{{ state.clubInfo.name }}</view>
                            <view class="club-members" @click.stop="toMemberPage">
                                <view class="avatar-group">
                                    <image v-for="(item, index) in state.clubInfo?.memberAvatars.slice(0, 10)"
                                        :key="index" :src="item" class="member-avatar" mode="aspectFill" />
                                    <view class="member-avatar more" v-if="state.clubInfo?.memberAvatars?.length > 10">
                                        ...</view>
                                    <view class="member-total">{{ state.clubInfo?.memberCount }}人</view>
                                </view>
                            </view>
                            <view class="club-desc">
                                {{ state.clubInfo.desc }}
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <view class="status-card">
                <view class="status-sub">
                    <view class="value"><text class="number">0</text>次</view>
                    <view class="desc">本月活动</view>
                </view>
                <view class="status-sub">
                    <view class="value"><text class="number">0</text>次</view>
                    <view class="desc">本月参与</view>
                </view>
                <view class="status-sub">
                    <view class="value"><text class="number">0.00</text>元</view>
                    <view class="desc">我的余额</view>
                </view>
            </view>

            <view class="feature-card">
                <view class="feature-title">俱乐部功能</view>
                <view class="feature-grid">
                    <view class="feature-item" v-for="item in state.featureList" :key="item.key"
                        @click="clickFeature(item.key)">
                        {{ item.title }}
                    </view>
                </view>
            </view>

            <view class="tab-bar">
                <view class="tab-item" v-for="item in state.tabList" :key="item.key"
                    :class="{ active: state.currentTab === item.key }" @click="state.currentTab = item.key">
                    {{ item.title }}
                </view>
            </view>
            <view class="activity-content" v-if="state.currentTab === 'activity'">
                <view class="date-bar" @click="openCalendar">
                    <uv-icon name="calendar" :color="themeInfo.iconColor" size="40rpx" />
                    <view class="date-text">{{ activityData.selectedDate }}</view>
                </view>

                <view class="activity-list">
                    <view v-if="!activityData.list?.length" class="empty">
                        暂无活动
                    </view>
                    <template v-else>
                        <ActivityCard v-for="(item, index) in activityData.list" :key="index" :activity-data="item">
                        </ActivityCard>
                    </template>
                </view>
            </view>
            <view class="comment-content" v-if="state.currentTab === 'comment'">
                <view class="name">评价<text v-if="state.commentList?.length">({{ state.commentList?.length }})</text>
                </view>
                <view class="comment-list" v-if="state.commentList?.length">
                    <view class="comment-item" v-for="(item, index) in state.commentList" :key="index">
                        <view class="header">
                            <image class="avatar" :src="item.avatar" mode="aspectFill" />
                            <view class="name">{{ item.user }}</view>
                        </view>
                        <view class="main-content">
                            <view class="comment">{{ item.content }}</view>
                            <view class="time">{{ item.time }}</view>
                            <view class="activity-info">
                                <image v-if="item.pics?.length" class="activity-img" :src="item.pics[0]">
                                </image>
                                <view class="activity-name">{{ item.activity }}</view>
                                <uv-icon name="arrow-right"></uv-icon>
                            </view>
                        </view>
                    </view>
                </view>
                <view class="empty" v-else>暂无评价内容</view>
            </view>
        </view>

        <uv-calendars ref="calendarsRef" :date="activityData.selectedDate" @confirm="handleSelectDate" />

        <!-- 俱乐部信息弹窗 -->
        <uv-popup ref="detailModalRef" round="10">
            <view class="club-info-container">
                <view class="club-avatar">
                    <image class="avatar-img"
                        src="https://pic.rmb.bdstatic.com/bjh/news/3fe6db1a8d291be39192f9a06c74ce99.png"
                        mode="aspectFill" />
                </view>
                <view class="club-details">
                    <view class="club-name">{{ state.clubInfo.name }}</view>
                    <view class="club-desc">{{ state.clubInfo.desc }}</view>
                </view>
            </view>
        </uv-popup>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import dayjs from '@/uni_modules/uv-ui-tools/libs/util/dayjs.js';

import Navbar from '@/components/Navbar.vue';
import ActivityCard from '@/components/ActivityCard.vue';

import { useMainStore } from '@/store';
const { themeInfo } = useMainStore();

const detailModalRef = ref(null);

const state = reactive({
    currentTab: 'comment',
    featureList: [
        { key: 'attendance', title: '出勤榜' },
        { key: 'record', title: '活动记录' },
        { key: 'album', title: '活动影集' },
        { key: 'setting', title: '设置' }
    ],
    tabList: [
        { key: 'activity', title: '活动' },
        { key: 'comment', title: '评价' }
    ],
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
    commentList: [
        { user: '张三', content: '这个俱乐部很有趣，大家一起骑行，感觉很好。', time: '2023-10-01 09:00', avatar: 'https://inews.gtimg.com/om_bt/OLBqNKL6MzU-LPaJsFezkXFg3zzafG3X-aNd88oCNPgHMAA/641', pics: ['https://img0.baidu.com/it/u=1337068678,3064275007&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=750'], activity: '城市骑行活动城市骑行活动城市骑行活动城市骑行活动' },
        { user: '张三', content: '这个俱乐部很有趣，大家一起骑行，感觉很好。', time: '2023-10-01 09:00', avatar: 'https://inews.gtimg.com/om_bt/OLBqNKL6MzU-LPaJsFezkXFg3zzafG3X-aNd88oCNPgHMAA/641', pics: ['https://img0.baidu.com/it/u=1337068678,3064275007&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=750'], activity: '城市骑行活动' },
    ]
});

const clickFeature = (key) => {
    switch (key) {
        case 'attendance':
            uni.navigateTo({
                url: '/pagesB/groupSetting/attendance'
            });
            break;
        case 'record':
            uni.navigateTo({
                url: '/pagesB/groupSetting/activityRecord'
            });
            break;
        case 'album':
            uni.navigateTo({
                url: '/pagesB/groupSetting/activityAlbum'
            });
            break;
        case 'setting':
            uni.navigateTo({
                url: '/pagesB/groupSetting/index'
            });
            break;
    }
}

const calendarsRef = ref(null);
const activityData = reactive({
    selectedDate: dayjs().format('YYYY-MM-DD'),
    list: []
});

const handleSelectDate = (value) => {
    activityData.selectedDate = value.fulldate;
    fetchList();
}

const fetchList = () => {
    activityData.list = [
        {
            id: 1,
            title: '城市骑行活动',
            desc: '一起骑行，感受城市的风光。',
            time: '2023-10-01 09:00',
            address: '北京市朝阳区',
            remainingSlots: 0,
            startTime: '2023-10-01 09:00',
            endTime: '2023-10-01 12:00',
            playerCount: 2,
            picsList: ['https://inews.gtimg.com/om_bt/O6SG7dHjdG0kWNyWz6WPo2_3v6A6eAC9ThTazwlKPO1qMAA/641'],
            playerAvatars: ['https://inews.gtimg.com/om_bt/O6SG7dHjdG0kWNyWz6WPo2_3v6A6eAC9ThTazwlKPO1qMAA/641', 'https://inews.gtimg.com/om_bt/O6SG7dHjdG0kWNyWz6WPo2_3v6A6eAC9ThTazwlKPO1qMAA/641']
        }
    ];
}

const openCalendar = () => {
    calendarsRef.value?.open();
}

onMounted(() => {
    fetchList();
});

const openDetailModal = () => {
    detailModalRef.value?.open();
}

const toMemberPage = () => {
    uni.navigateTo({
        url: '/pages/group/member'
    });
}
</script>

<style scoped lang="scss">
.club-detail-wrap {
    padding: 0 var(--padding-size);

    .club-header {
        position: relative;
        height: 360rpx;
        border-radius: 28rpx;
        overflow: hidden;
        box-shadow: var(--box-shadow);

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

                    .club-members {
                        margin-top: 14rpx;

                        .avatar-group {
                            display: flex;
                            align-items: center;

                            .member-avatar {
                                width: 44rpx;
                                height: 44rpx;
                                margin-left: -12rpx;
                                border-radius: 50%;
                                border: 2rpx solid #FFFFFF;
                                background: #F3F3F3;

                                &:first-child {
                                    margin-left: 0;
                                }
                            }

                            .more {
                                color: #666;
                                border-color: #F3F3F3;
                                text-align: center;
                                line-height: 0.9;
                            }

                            .member-total {
                                margin-left: 12rpx;
                                font-size: 22rpx;
                                color: rgba(255, 255, 255, 0.85);
                            }
                        }
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

    .status-card {
        padding: 28rpx;
        margin: 40rpx 0;
        display: flex;
        border-radius: 20rpx;
        box-shadow: var(--box-shadow);
        color: #FFFFFF;
        background: linear-gradient(135deg,
                var(--left-linear),
                var(--right-linear));

        .status-sub {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;

            .value {
                font-size: 24rpx;

                .number {
                    font-size: 30rpx;
                    margin-right: 10rpx;
                }
            }

            .desc {
                margin-top: 8rpx;
                font-size: 24rpx;
            }
        }
    }

    .feature-card {
        .feature-title {
            font-size: 26rpx;
            font-weight: 600;
            margin-bottom: 20rpx;
        }

        .feature-grid {
            background: #FFFFFF;
            border-radius: 20rpx;
            box-shadow: var(--box-shadow);
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            overflow: hidden;

            .feature-item {
                padding: 28rpx 0;
                text-align: center;
                font-size: 24rpx;
                color: var(--text-dark);
                border-right: 1rpx solid var(--border-color);
                border-bottom: 1rpx solid var(--border-color);

                &:nth-child(2n) {
                    border-right: none;
                }

                &:nth-last-child(-n + 2) {
                    border-bottom: none;
                }
            }
        }
    }

    .tab-bar {
        margin-top: 40rpx;
        display: flex;
        background: #FFFFFF;
        border-radius: 16rpx;
        overflow: hidden;
        box-shadow: var(--box-shadow);

        .tab-item {
            flex: 1;
            text-align: center;
            padding: 20rpx 0;
            font-size: 26rpx;
            color: var(--text-light);

            &.active {
                color: var(--text-dark);
                font-weight: 600;
                background: var(--light-color2);
            }
        }
    }

    .activity-content {
        padding: 40rpx 0;
        text-align: center;
        color: var(--text-empty);
        font-size: 24rpx;

        .date-bar {
            display: inline-flex;
            align-items: center;
            gap: 12rpx;
            padding: 16rpx 24rpx;
            background: #FFFFFF;
            border-radius: 32rpx;

            .date-text {
                font-size: 32rpx;
                color: var(--text-dark);
            }
        }

        .activity-list {
            margin: 40rpx 0;

            .empty {
                text-align: center;
                color: var(--text-light);
                padding: 40rpx 0;
            }
        }
    }

    .comment-content {
        padding: 40rpx 0;

        .name {
            font-size: 36rpx;
            color: var(--text-dark);
        }

        .empty {
            text-align: center;
            color: var(--text-light);
            padding-top: 80rpx;
        }

        .comment-list {
            margin: 40rpx 0;

            .comment-item {
                padding: 20rpx 30rpx;
                margin-bottom: 30rpx;
                border-radius: 20rpx;
                background: #FFFFFF;

                .header {
                    display: flex;
                    align-items: center;

                    .avatar {
                        width: 68rpx;
                        height: 68rpx;
                        border-radius: 50%;
                    }

                    .name {
                        margin-left: 20rpx;
                        font-size: 32rpx;
                    }
                }

                .main-content {
                    margin-left: 88rpx;

                    .comment {
                        margin: 20rpx 0;
                        font-size: 32rpx;
                    }

                    .time {
                        font-size: 28rpx;
                        color: var(--text-light);
                    }

                    .activity-info {
                        display: flex;
                        align-items: center;
                        background: var(--light-color3);
                        margin: 30rpx 0 10rpx;
                        padding: 0 20rpx;
                        border-radius: 10rpx;

                        .activity-img {
                            width: 40rpx;
                            height: 40rpx;
                        }

                        .activity-name {
                            flex: 1;
                            padding: 20rpx;
                            font-size: 28rpx;
                            margin: 0 10rpx;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            white-space: nowrap;
                        }
                    }

                }
            }
        }
    }
}

.club-info-container {
    padding: 12px 8px;
    width: 680rpx;
    box-sizing: border-box;

    .club-avatar {
        text-align: center;
        margin: 40rpx 0;

        .avatar-img {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            object-fit: cover;
        }
    }

    .club-details {
        padding: 0 8px;

        .club-name {
            margin: 0 0 12px 0;
            font-size: 19px;
            font-weight: 600;
            color: #2C3E50;
            text-align: center;
            letter-spacing: 0.5px;
        }

        .club-desc {
            margin: 0;
            font-size: 15px;
            color: #6c7a89;
            line-height: 1.6;
            word-wrap: break-word;
            padding: 14px 16px;
            background-color: #f9fbfc;
            border-radius: 12px;
            border: 1px solid #eef2f5;
        }
    }
}
</style>
