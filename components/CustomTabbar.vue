<template>
    <uni-tabbar class="custom-tabbar uni-tabbar">
        <div class="tabbar-item" v-for="item in tabItems" :key="item.id" @click="handleTabItemTap(item)"
            :class="{ 'selected': selected === item.id }">
            <div class="tabbar-inner center-item" v-if="item.id == 2">
                <div class="circle-wrap font-bold">{{ item.label }}</div>
            </div>
            <div class="tabbar-inner" v-else>
                <div class="icon-wrap">
                    <uv-icon v-if="showIcon" :name="item.icon" custom-prefix="custom-icon" :size="item.size || 20"
                        :color="selected === item.id ? themeInfo.activeColor : themeInfo.iconColor"></uv-icon>
                </div>
                <div class="label-wrap font-bold">
                    {{ item.label }}
                </div>
            </div>
        </div>
    </uni-tabbar>
</template>

<script setup>
import { useMainStore } from "@/store/index.js";
const { themeInfo } = useMainStore();

const props = defineProps({
    showIcon: {
        type: Boolean,
        default: true,
    },
    selected: {
        type: Number,
        default: 0,
    },
});

const tabItems = [
    {
        id: 0,
        label: "首页",
        icon: "home1",
        pagePath: "pages/index/index",
    },
    {
        id: 1,
        label: "俱乐部",
        icon: "book",
        pagePath: "pages/group/index",
    },
    {
        id: 2,
        label: "开场",
        pagePath: "pages/activity/create",
    },
    {
        id: 3,
        label: "球局",
        icon: "unlock",
        pagePath: "pages/activity/index",
    },
    {
        id: 4,
        label: "我的",
        icon: "personal",
        pagePath: "pages/personal/index",
    },
];

const handleTabItemTap = (item) => {
    if (item.id == 2) {
        const token = uni.getStorageSync('token');
        if (!token) {
            uni.showModal({
                title: '提示',
                content: '是否前往登录 ',
                success: function (res) {
                    if (res.confirm) {
                        uni.navigateTo({
                            url: '/pages/login/index'
                        });
                    }
                }
            });
            return;
        }
    }
    uni.switchTab({
        url: `/${item.pagePath}`
    });
}
</script>

<style lang="scss" scoped>
.custom-tabbar {
    position: fixed;
    bottom: -1px;
    left: 0;
    display: flex;
    padding: 20rpx;
    width: 100%;
    height: 140rpx;
    box-sizing: border-box;
    background-color: #FFFFFF;
    border-top: 1px solid #E6E5E5;
    z-index: 999;

    .tabbar-item {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        flex: 1;
        font-size: 0;
        padding: 0;
        text-align: center;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    }

    .tabbar-inner {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        flex: 1;
        font-size: 0;
        text-align: center;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

        .icon-wrap {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30rpx;
            height: 30rpx;
        }

        .label-wrap {
            color: var(--text-dark);
            font-size: 20rpx;
            margin-top: 8px;
            font-weight: bold;
        }
    }

    .tabbar-item.selected {
        .label-wrap {
            color: var(--main-color);
        }

        &::before {
            content: '';
            position: absolute;
            top: -20rpx;
            left: 10%;
            width: 80%;
            height: 6px;
            background: var(--main-color);
            border-radius: 0 0 20px 20px;
        }
    }

    .tabbar-inner.center-item {
        position: relative;

        .circle-wrap {
            position: absolute;
            top: -80rpx;
            width: 120rpx;
            height: 120rpx;
            font-size: 32rpx;
            line-height: 120rpx;
            border-radius: 80rpx;
            text-align: center;
            color: var(--text-dark);
            font-weight: bold;
            background: var(--main-color);
        }
    }
}
</style>
