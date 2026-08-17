<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="create-activity-wrap">
            <view class="form-item upload-wrap">
                <view class="label">* 活动封面</view>
                <uv-upload :fileList="formData.pics" multiple :maxCount="5" @afterRead="afterRead" @delete="deletePic">
                    <view class="upload-content">
                        <uv-icon name="camera" size="30px" :color="themeInfo.activeColor"></uv-icon>
                        <view class="text">点击上传封面</view>
                    </view>
                </uv-upload>
            </view>

            <view class="form-item input-wrap">
                <view class="label">* 活动名称</view>
                <uv-input v-model="formData.name" type="text" border="bottom" placeholder="请输入活动名称（如：周日羽毛球友谊赛）"
                    placeholder-class="placeholder-style" maxlength="50" />
            </view>

            <view class="form-item textarea-wrap">
                <view class="label">* 活动介绍</view>
                <uv-textarea v-model="formData.intro" placeholder="请输入活动详细介绍" placeholder-class="placeholder-style"
                    rows="5" maxlength="500"></uv-textarea>
            </view>

            <view class="form-item picker-wrap" @click="openPicker('startTime')">
                <view class="label">* 活动开始时间</view>
                <view class="picker-content">
                    <view class="value" :class="{ selected: formData.startTime }">{{ formData.startTime || '请选择开始时间' }}
                    </view>
                    <uv-icon name="arrow-right" size="24rpx"></uv-icon>
                </view>
            </view>

            <view class="form-item input-wrap">
                <view class="label">* 活动时长（分钟）</view>
                <uv-input v-model.number="formData.duration" type="number" border="bottom" placeholder="请输入活动时长"
                    placeholder-class="placeholder-style" min="30" />
            </view>


            <view class="form-item double-input-wrap">
                <view class="label">* 参与人数</view>
                <view class="input-group">
                    <view class="input-item">
                        <view class="sub-label">最少</view>
                        <uv-input v-model.number="formData.minPlayer" type="number" border="bottom" placeholder="0"
                            placeholder-class="placeholder-style" min="1" />
                    </view>
                    <view class="input-item">
                        <view class="sub-label">最多</view>
                        <uv-input v-model.number="formData.maxPlayer" type="number" border="bottom" placeholder="0"
                            placeholder-class="placeholder-style" min="2" />
                    </view>
                </view>
            </view>

            <view class="form-item input-wrap">
                <view class="label">* 报名截止提前（分钟）</view>
                <uv-input v-model.number="formData.deadlineMinutes" type="number" border="bottom"
                    placeholder="活动开始前多少分钟截止报名（如：30）" placeholder-class="placeholder-style" min="0" />
            </view>

            <view class="form-item picker-wrap" @click="openPicker('court')">
                <view class="label">* 所属场馆</view>
                <view class="picker-content">
                    <view class="value" :class="{ selected: state.courtName }">{{ state.courtName || '请选择场馆' }}</view>
                    <uv-icon name="arrow-right" size="24rpx"></uv-icon>
                </view>
            </view>

            <view class="form-item input-wrap">
                <view class="label">* 场地数量</view>
                <uv-input v-model.number="formData.courtCount" type="number" border="bottom" placeholder="请输入使用场地数量"
                    placeholder-class="placeholder-style" min="1" />
            </view>

            <view class="form-item input-wrap">
                <view class="label">* 场地号</view>
                <uv-input v-model="formData.courtNumber" type="text" border="bottom" placeholder="请输入场地号（如：1号场/2，3，4号场）"
                    placeholder-class="placeholder-style" />
            </view>

            <view class="form-item switch-wrap">
                <view class="label">启用候选排队</view>
                <uv-switch v-model="formData.enableQueue" active-color="#40EDF0"></uv-switch>
            </view>

            <view class="form-item picker-wrap" @click="openPicker('payType')">
                <view class="label">支付类型</view>
                <view class="picker-content">
                    <view class="value" :class="{ selected: state.payTypeName }">{{ state.payTypeName || '请选择支付类型' }}
                    </view>
                    <uv-icon name="arrow-right" size="24rpx"></uv-icon>
                </view>
            </view>

            <view class="form-item input-wrap">
                <view class="label">活动费用（元）</view>
                <uv-input v-model.number="formData.fee" type="number" border="bottom" placeholder="请输入费用金额"
                    placeholder-class="placeholder-style" min="0" />
            </view>

            <view class="submit-btn" @click="handleCreate">
                <view class="btn-text">发布活动</view>
            </view>
        </view>

        <uv-datetime-picker ref="datetimePicker" v-model="state.selectStartTime" mode="datetime"
            @confirm="confirmPicker('datetime', $event)">
        </uv-datetime-picker>
        <uv-picker ref="courtPicker" :columns="[state.courtList]" keyName="name"
            @confirm="confirmPicker('court', $event)"></uv-picker>
        <uv-picker ref="payTypePicker" :columns="[state.payTypeList]" keyName="label"
            @confirm="confirmPicker('payType', $event)"></uv-picker>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { timeFormat } from '@/uni_modules/uv-ui-tools/libs/function/index.js';
import dayjs from '@/uni_modules/uv-ui-tools/libs/util/dayjs.js';
import { navigateBack, saveImageUrl } from '@/utils/common.js';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import { getPublicApi } from '@/api/public.js';
const publicApi = getPublicApi();
import { getGameInfoApi } from '@/api/gameInfo.js';
const gameInfoApi = getGameInfoApi();

import Navbar from '@/components/Navbar.vue';

const state = reactive({
    courtName: '',
    payTypeName: '',
    selectStartTime: '',
    courtList: [],
    payTypeList: [
        { label: '预付', id: 1 },
        { label: '赛后支付', id: 2 }
    ]
});

const formData = reactive({
    pics: [],
    name: '',
    intro: '',
    courtId: '',
    startTime: '',
    duration: 30,
    courtCount: '',
    courtNumber: '',
    minPlayer: 1,
    maxPlayer: 10,
    deadlineMinutes: 30,
    enableQueue: true,
    payType: 0,
    fee: 0,
});

const datetimePicker = ref(null);
const courtPicker = ref(null);
const payTypePicker = ref(null);

onMounted(() => {
    getCourtList();
});

const getCourtList = () => {
    gameInfoApi.GetCourtList().then(res => {
        state.courtList = res.data;
    });
}

const deletePic = (event) => {
    formData.pics.splice(event.index, 1);
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
    // 当设置 multiple 为 true 时, file 为数组格式，否则为对象格式
    let lists = [].concat(event.file);
    let fileListLen = formData.pics.length;
    lists.map((item) => {
        formData.pics.push({
            ...item,
            status: 'uploading',
            message: '上传中'
        });
    });
    for (let i = 0; i < lists.length; i++) {
        const result = await UploaderImage(lists[i].url);
        let item = formData.pics[fileListLen];
        formData.pics.splice(fileListLen, 1, Object.assign(item, {
            status: 'success',
            message: '',
            url: result
        }));
        fileListLen++;
    }
}

const openPicker = (type) => {
    if (type === 'startTime') {
        if (!state.selectStartTime) state.selectStartTime = Number(new Date());
        datetimePicker.value?.open();
    } else if (type === 'court') {
        courtPicker.value?.open();
    } else if (type === 'payType') {
        payTypePicker.value?.open();
    }
}

const confirmPicker = (type, e) => {
    if (type === 'datetime') {
        const date = timeFormat(e.value, 'yyyy-mm-dd hh:MM');
        formData.startTime = date;
        // const isoTime = new Date(xxx).toISOString();
    } else if (type === 'court') {
        formData.courtId = e.value[0]?.courtId;
        state.courtName = e.value[0]?.name;
    } else if (type === 'payType') {
        formData.payType = e.value[0]?.id;
        state.payTypeName = e.value[0]?.label;
    }
}

// 表单验证
const validateForm = () => {
    if (!formData.pics?.length) {
        uni.showToast({ title: '请上传活动封面', icon: 'none' });
        return false;
    }
    if (!formData.name) {
        uni.showToast({ title: '请输入活动名称', icon: 'none' });
        return false;
    }
    if (!formData.intro) {
        uni.showToast({ title: '请输入活动介绍', icon: 'none' });
        return false;
    }
    if (!formData.startTime) {
        uni.showToast({ title: '请选择活动开始时间', icon: 'none' });
        return false;
    }
    if (!formData.duration || formData.duration < 30) {
        uni.showToast({ title: '请输入有效活动时长（≥30分钟）', icon: 'none' });
        return false;
    }
    if (!formData.minPlayer || !formData.maxPlayer) {
        uni.showToast({ title: '请输入参与人数', icon: 'none' });
        return false;
    }
    if (
        formData.minPlayer > formData.maxPlayer &&
        formData.maxPlayer !== 0
    ) {
        uni.showToast({ title: '最少参与人数不能大于最多参与人数', icon: 'none' });
        return false;
    }
    if (!formData.courtId) {
        uni.showToast({ title: '请选择所属场馆', icon: 'none' });
        return false;
    }
    if (!formData.courtCount) {
        uni.showToast({ title: '请输入场地数量', icon: 'none' });
        return false;
    }
    if (!formData.courtNumber) {
        uni.showToast({ title: '请输入场地号', icon: 'none' });
        return false;
    }
    const hasLoading = formData.pics.some((item) => item.status !== 'success');
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
        startTime: dayjs(formData.startTime).format('YYYY-MM-DDTHH:mm:ss[Z]')
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
    padding: 20rpx 30rpx 40rpx;

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

    .double-input-wrap {
        .input-group {
            display: flex;
            gap: 40rpx;

            .input-item {
                flex: 1;

                .sub-label {
                    font-size: 26rpx;
                    color: #666;
                    margin-bottom: 8rpx;
                }
            }
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

    .switch-wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .label {
            margin-bottom: 0;
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
