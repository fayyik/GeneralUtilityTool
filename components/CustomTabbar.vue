<template>
    <uni-tabbar class="custom-tabbar uni-tabbar">
        <div class="tabbar-item" v-for="item in tabItems" :key="item.id" @click="handleTabItemTap(item)"
            :class="{ 'selected': selected === item.id }">
            <div class="tabbar-inner">
                <div class="icon-wrap">
                    <uv-icon :name="item.icon" :size="22"
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
    selected: {
        type: Number,
        default: 0,
    },
});

const tabItems = [
    {
        id: 0,
        label: "首页",
        icon: "home-fill",
        pagePath: "pages/index/index",
    },
    {
        id: 1,
        label: "我的",
        icon: "account-fill",
        pagePath: "pages/personal/index",
    },
];

const handleTabItemTap = (item) => {
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
    padding: 20rpx 0;
    padding-bottom: 30rpx;
    width: 100%;
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
            width: 40rpx;
            height: 40rpx;
        }

        .label-wrap {
            color: var(--text-light);
            font-size: 22rpx;
            margin-top: 6rpx;
            font-weight: bold;
        }
    }

    .tabbar-item.selected {
        .label-wrap {
            color: var(--main-color);
        }
    }
}
</style>