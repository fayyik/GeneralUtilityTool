<template>
    <view class="container" :class="[`${themeInfo.theme}-theme`]">
        <view class="main-wrap" :style="{ 'padding-top': `${state.navHeight}px` }">
            <view class="search-box">
                <uv-search placeholder="搜索俱乐部" v-model="state.keyword" bgColor="#FFFFFF" @search="handleSearchClub"></uv-search>
            </view>

            <view class="tab-bar">
                <view class="tab-item" :class="{ active: state.activeTab === 'my' }" @click="state.activeTab = 'my'">
                    我的俱乐部</view>
                <view class="tab-item" :class="{ active: state.activeTab === 'all' }" @click="state.activeTab = 'all'">
                    全部俱乐部</view>
            </view>

            <view class="current-club-wrap" v-if="state.activeTab === 'my'">
                <view class="club-list" v-if="state.myClubs.length">
                    <view class="club-item" v-for="item in state.myClubs" :key="item.id" @click="toClubDetail">
                        <image class="club-avatar" :src="item.image" mode="aspectFill" />
                        <view class="club-info">
                            <view class="name">{{ item.name }}</view>
                            <view class="info">{{ item.location }}</view>
                            <view class="info">{{ item.people }}人 | 活动{{ item.games }}场</view>
                        </view>
                    </view>
                </view>

                <view class="empty-club" v-else>
                    <view class="empty-wrap">
                        <view class="empty-text">暂未加入俱乐部</view>
                        <view class="empty-text">
                            为您推荐以下俱乐部，或者创建一个俱乐部
                        </view>
                        <view class="create-btn" @click="toCreateClub">+ 创建俱乐部</view>
                    </view>
                    <view class="hot-club-list">
                        <view>热门俱乐部</view>
                        <WaterfallList :list="state.hotClubs"></WaterfallList>
                    </view>
                </view>
            </view>

            <view class="all-club-wrap" v-if="state.activeTab === 'all'">
                <WaterfallList :list="state.allClubs"></WaterfallList>
            </view>
        </view>

        <CustomTabBar :selected="1" />
    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { navbarHeightAndStatusBarHeight } from '@/utils/common';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import CustomTabBar from '@/components/CustomTabbar.vue';
import WaterfallList from '@/components/WaterfallList.vue';

const state = reactive({
    navHeight: 0,
    keyword: '',
    activeTab: 'my',
    myClubs: [],
    allClubs: [],
    hotClubs: []
});

onLoad(() => {
    state.navHeight = navbarHeightAndStatusBarHeight().navbarHeight;
});

onMounted(() => {
    const clubsList = [
        { id: '1', title: '羽毛球俱乐部', desc: '天河附近羽毛球爱好者，大家自由约球，锻炼身体，健康生活', image: 'https://pic.rmb.bdstatic.com/bjh/news/3fe6db1a8d291be39192f9a06c74ce99.png' },
        { id: '2', title: '梅花香自苦寒来', desc: '羽毛球爱好者，大家自由约球，锻炼身体，健康生活', image: 'https://inews.gtimg.com/om_bt/O6SG7dHjdG0kWNyWz6WPo2_3v6A6eAC9ThTazwlKPO1qMAA/641' },
        { id: '3', title: '羽毛球俱乐部', desc: '羽毛球爱好者，大家自由约球，锻炼身体，健康生活', image: 'https://img0.baidu.com/it/u=1337068678,3064275007&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=750' },
        { id: '4', title: '梅花香自苦寒来', desc: '羽毛球爱好者，大家自由约球，锻炼身体，健康生活', image: 'https://inews.gtimg.com/om_bt/OLBqNKL6MzU-LPaJsFezkXFg3zzafG3X-aNd88oCNPgHMAA/641' },
        { id: '5', title: '梅花香自苦寒来 俱乐部', desc: '羽毛球爱好者，大家自由约球，锻炼身体，健康生活，这是俱乐部简介', image: 'https://b0.bdstatic.com/ugc/zspwgJmuOJMt9n9V1L5Z8A8eef47accfe7ddfe8205a2cb521cbc9f.jpg@h_1280' },
    ];
    state.allClubs = clubsList;
    state.hotClubs = clubsList;

    state.myClubs = [
        {
            id: 1,
            name: '天天开心俱乐部',
            location: '广东省广州市天河区',
            image: 'https://img0.baidu.com/it/u=1337068678,3064275007&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=750',
            people: 2,
            games: 0
        }
    ];
});

const handleSearchClub = () => {
}

const toCreateClub = () => {
    uni.navigateTo({
        url: '/pages/group/create'
    });
}

const toClubDetail = () => {
    uni.navigateTo({
        url: '/pages/group/detail'
    });
}
</script>

<style scoped lang="scss">
.main-wrap {
    position: relative;
    width: 100%;
    min-height: 100vh;
    padding-bottom: 180rpx;
    color: var(--text-dark);
    box-sizing: border-box;
    background: linear-gradient(180deg,
            rgba(var(--rgb-color-left), 0.25),
            rgba(var(--rgb-color-right), 0.25) 40%,
            #F6F9F8 70%);

    .search-box {
        padding: 0 var(--padding-size);
    }

    .tab-bar {
        display: flex;
        padding: 24rpx var(--padding-size);

        .tab-item {
            position: relative;
            margin-right: 40rpx;
            font-size: 30rpx;

            &.active {
                color: var(--text-dark);
                font-weight: 600;

                &::after {
                    content: '';
                    position: absolute;
                    bottom: -8rpx;
                    left: 0;
                    width: 100%;
                    height: 8rpx;
                    border-radius: 8rpx;
                    background: var(--main-color);
                }
            }
        }
    }

    .current-club-wrap {
        .club-list {
            display: flex;
            flex-direction: column;
            margin: 20rpx 0 40rpx;
            padding: 0 40rpx;

            .club-item {
                display: flex;
                align-items: center;
                padding: 24rpx 30rpx;
                margin-bottom: 24rpx;
                background: #FFFFFF;
                border-radius: 16rpx;
                box-shadow: var(--box-shadow);

                .club-avatar {
                    width: 120rpx;
                    height: 120rpx;
                    margin-right: 40rpx;
                }

                .club-info {
                    flex: 1;
                    color: var(--text-dark);

                    .name {
                        font-size: 36rpx;
                        margin-bottom: 10rpx;
                    }

                    .info {
                        font-size: 32rpx;
                        line-height: 1.5;
                    }
                }
            }
        }

        .empty-club {
            .empty-wrap {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                height: 500rpx;
            }

            .empty-text {
                font-size: 28rpx;
                color: var(--text-light);
                line-height: 2;
            }

            .create-btn {
                display: inline-block;
                padding: 16rpx 60rpx;
                margin-top: 30rpx;
                border-radius: 40rpx;
                background: linear-gradient(to right,
                        var(--left-linear),
                        var(--right-linear));
                color: #FFFFFF;
                font-size: 32rpx;
            }
        }

        .hot-club-list {
            padding: 0 var(--padding-size);
        }
    }

    .all-club-wrap {
        padding: 0 var(--padding-size);

        .hot-title {
            font-size: 32rpx;
            font-weight: 600;
            margin-bottom: 24rpx;
        }

        .hot-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24rpx;
        }

        .add-card {
            display: flex;
            align-items: center;
            justify-content: center;

            .add-icon {
                position: absolute;
                font-size: 72rpx;
                color: var(--main-color);
            }
        }
    }
}
</style>
