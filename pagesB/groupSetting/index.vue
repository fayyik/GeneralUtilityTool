<template>
    <view class="setting-wrap">
        <view class="setting-item" v-for="item in state.settingList" :key="item.key" @click="clickSetting(item)">
            <view class="item-name">{{ item.name }}</view>
            <view class="item-icon">
                <uv-icon name="arrow-right" size="24rpx"></uv-icon>
            </view>
        </view>

        <!-- 收款设置 -->
        <uv-popup ref="accountRef" mode="bottom">
            <view class="account-modal">
                <view class="account-item" @click="changeAccountType('manager')">
                    <view class="item-wrap">
                        <view class="name">主理人收款</view>
                        <view class="select-wrap" :class="{ 'selected': state.accountType === 'manager' }">
                            <uv-icon name="checkmark" color="#FFFFFF" size="22rpx"
                                v-if="state.accountType === 'manager'"></uv-icon>
                        </view>
                    </view>
                    <view class="tip">在线支付的活动费用统一收到俱乐部主理人的账户中</view>
                </view>
                <view class="account-item" @click="changeAccountType('publisher')">
                    <view class="item-wrap">
                        <view class="name">发布者收款</view>
                        <view class="select-wrap" :class="{ 'selected': state.accountType === 'publisher' }">
                            <uv-icon name="checkmark" color="#FFFFFF" size="22rpx"
                                v-if="state.accountType === 'publisher'"></uv-icon>
                        </view>
                    </view>
                    <view class="tip">谁发布的活动，就进入谁的账户</view>
                </view>
                <view class="cancel-btn" @click="closeAccountModal">取消</view>
            </view>
        </uv-popup>
        <!-- 审核设置 -->
        <uv-popup ref="joinRef" mode="bottom">
            <view class="account-modal">
                <view class="account-item" @click="changeJoinType('auto')">
                    <view class="item-wrap">
                        <view class="name">无需审核</view>
                        <view class="select-wrap" :class="{ 'selected': state.joinType === 'auto' }">
                            <uv-icon name="checkmark" color="#FFFFFF" size="22rpx"
                                v-if="state.joinType === 'auto'"></uv-icon>
                        </view>
                    </view>
                    <view class="tip">用户可以点击加入或者直接报名活动</view>
                </view>
                <view class="account-item" @click="changeJoinType('manual')">
                    <view class="item-wrap">
                        <view class="name">手动审核</view>
                        <view class="select-wrap" :class="{ 'selected': state.joinType === 'manual' }">
                            <uv-icon name="checkmark" color="#FFFFFF" size="22rpx"
                                v-if="state.joinType === 'manual'"></uv-icon>
                        </view>
                    </view>
                    <view class="tip">开启手动审核，用户点击申请加入后，需组织者在平台内“我的-通知”处进行审核</view>
                </view>
                <view class="cancel-btn" @click="closeJoinModal">取消</view>
            </view>
        </uv-popup>
        <!-- 解散 -->
        <uv-modal ref="dismissRef" title="提示" :show-cancel-button="true" confirmColor="#40EDF0"
            @confirm="handleDismiss">
            <view>
                <view>是否确定解散俱乐部<text style="color: #40EDF0; font-weight: bold; margin: 0 2px;">天天开心</text>？</view>
                <view>（解散后不可恢复，请谨慎操作）</view>
            </view>
        </uv-modal>
    </view>
</template>

<script setup>
import { ref, reactive } from 'vue';

const accountRef = ref(null);
const joinRef = ref(null);
const dismissRef = ref(null);
const state = reactive({
    accountType: 'publisher',    // manager, publisher
    joinType: 'auto',   // auto, manual
    settingList: [
        { name: '编辑俱乐部信息', key: 'edit' },
        { name: '收款账户设置', key: 'account' },
        { name: '成员加入管理', key: 'join' },
        { name: '俱乐部转让', key: 'transfer' },
        { name: '解散俱乐部', key: 'dismiss' },
    ]
});

const clickSetting = (item) => {
    switch (item.key) {
        case 'edit':
            uni.navigateTo({
                url: '/pages/group/create?id=1'
            });
            break;
        case 'account':
            accountRef.value?.open();
            break;
        case 'join':
            joinRef.value?.open();
            break;
        case 'transfer':
            uni.navigateTo({
                url: '/pagesB/groupSetting/transfer'
            });
            break;
        case 'dismiss':
            dismissRef.value?.open();
            break;
        default:
            break;
    }
}

const closeAccountModal = () => {
    accountRef.value?.close();
}

const changeAccountType = (type) => {
    state.accountType = type;
    closeAccountModal();
}

const closeJoinModal = () => {
    joinRef.value?.close();
}

const changeJoinType = (type) => {
    state.joinType = type;
    closeJoinModal();
}

const handleDismiss = () => { }
</script>

<style lang="scss" scoped>
.setting-wrap {
    .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx 50rpx;
        border-bottom: 1rpx solid #f5f5f5;

        .item-name {
            font-size: 28rpx;
            color: #333;
        }
    }
}

.account-modal {
    padding: 30rpx 0;
    background-color: #fff;

    .account-item {
        padding: 30rpx 40rpx;
        border-bottom: 1rpx solid #f5f5f5;

        .item-wrap {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .name {
                font-size: 28rpx;
                color: #333;
            }
        }

        .tip {
            margin-top: 20rpx;
            font-size: 24rpx;
            color: #999;
        }

        .select-wrap {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30rpx;
            height: 30rpx;
            border-radius: 50%;
            border: 1px solid #999;

            &.selected {
                border-color: #40EDF0;
                background-color: #40EDF0;
            }
        }
    }

    .cancel-btn {
        margin: 40rpx 40rpx 0;
        padding: 30rpx 0;
        text-align: center;
        border-radius: 20rpx;
        font-size: 28rpx;
        color: #FFFFFF;
        background-color: #40EDF0;
    }
}
</style>
