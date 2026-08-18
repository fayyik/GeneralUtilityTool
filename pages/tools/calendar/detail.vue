<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="detail-wrap" v-if="event">
            <view class="hero" :style="bgStyle">
                <view class="hero-icon">{{ event.icon || '❤️' }}</view>
                <view class="hero-name">{{ event.name }}</view>
                <view class="hero-date">
                    {{ nextDate }}
                    <text class="hero-tag" v-if="repeatLabel">{{ repeatLabel }}</text>
                    <text class="hero-tag" v-if="event.pinned">置顶</text>
                </view>
                <view class="hero-count" :class="remain.cls">{{ remain.text }}</view>
                <view class="hero-extra" v-if="extraText">{{ extraText }}</view>
            </view>

            <view class="info-card">
                <view class="info-item">
                    <text class="k">纪念日期</text>
                    <text class="v">{{ event.date }}</text>
                </view>
                <view class="info-item">
                    <text class="k">下次日期</text>
                    <text class="v">{{ nextDate }}</text>
                </view>
                <view class="info-item">
                    <text class="k">重复类型</text>
                    <text class="v">{{ repeatLabel || '不重复' }}</text>
                </view>
                <view class="info-item" v-if="repeatOf(event) === 'none' && elapsed > 0">
                    <text class="k">已共度</text>
                    <text class="v">{{ elapsed }} 天</text>
                </view>
                <view class="info-item">
                    <text class="k">时间格式</text>
                    <text class="v">{{ formatLabel }}</text>
                </view>
            </view>

            <view class="btns">
                <view class="btn primary" @click="saveImage">
                    <uv-icon name="download" size="18" color="#FFFFFF"></uv-icon>
                    保存图片
                </view>
                <view class="btn outline" @click="onEdit">
                    <uv-icon name="edit-pen" size="18" color="#4E8CFF"></uv-icon>
                    编辑
                </view>
                <view class="btn danger" @click="onDelete">
                    <uv-icon name="trash" size="18" color="#FF6B81"></uv-icon>
                    删除
                </view>
            </view>
        </view>

        <canvas id="shareCanvas" type="2d" class="share-canvas"></canvas>
    </view>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue';
import { onShow, onHide } from '@dcloudio/uni-app';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import Navbar from '@/components/Navbar.vue';
import storage from '@/utils/storage';
import {
    repeatOf,
    repeatLabel as repeatLabelOf,
    colorOf,
    calcDays,
    elapsedDays,
    anniversaryText,
    formatRemain,
    nextDateStr,
    EVENT_FORMATS,
} from '@/utils/eventUtils';

const instance = getCurrentInstance();

const event = ref(null);

// hms 实时刷新
const tick = ref(0);
let timer = null;

const bgStyle = computed(() => {
    if (!event.value) return {};
    const c = colorOf(event.value.color);
    return { background: `linear-gradient(135deg, ${c.from}, ${c.to})` };
});

const repeatLabel = computed(() => event.value ? repeatLabelOf(event.value) : '');

const nextDate = computed(() => event.value ? nextDateStr(event.value) : '');

const formatLabel = computed(() => {
    if (!event.value) return '';
    const f = EVENT_FORMATS.find(i => i.value === event.value.format) || EVENT_FORMATS[0];
    return f.label;
});

const remain = computed(() => {
    tick.value;
    return event.value ? formatRemain(event.value, new Date()) : { text: '', cls: '' };
});

const elapsed = computed(() => event.value ? elapsedDays(event.value) : 0);

const extraText = computed(() => {
    if (!event.value) return '';
    const parts = [];
    const a = anniversaryText(event.value);
    if (a) parts.push(a);
    if (repeatOf(event.value) === 'none' && elapsed.value > 0) parts.push(`已共度 ${elapsed.value} 天`);
    return parts.join(' · ');
});

const loadEvent = () => {
    const pages = getCurrentPages();
    const page = pages[pages.length - 1];
    const id = page?.options?.id;
    const found = storage.getEvents().find(e => e.id === Number(id));
    if (found) {
        found.repeat = repeatOf(found);
        if (!found.icon) found.icon = '❤️';
        if (!found.color) found.color = 'blue';
        if (!found.format) found.format = 'day';
        event.value = found;
    }
};

const onEdit = () => {
    if (!event.value) return;
    uni.$emit('editEvent', event.value.id);
    uni.navigateBack();
};

const onDelete = () => {
    if (!event.value) return;
    uni.showModal({
        title: '提示',
        content: `确定删除「${event.value.name}」吗？`,
        confirmColor: '#FF6B81',
        success: (res) => {
            if (res.confirm) {
                const events = storage.getEvents().filter(e => e.id !== event.value.id);
                storage.setEvents(events);
                uni.showToast({ title: '已删除', icon: 'none' });
                setTimeout(() => uni.navigateBack(), 400);
            }
        },
    });
};

const drawShare = (canvas, ctx, width, height) => {
    const e = event.value;
    const c = colorOf(e.color);

    // 背景
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, c.from);
    grad.addColorStop(1, c.to);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 顶部圆角装饰
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.arc(width - 40, 40, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(30, height - 60, 90, 0, Math.PI * 2);
    ctx.fill();

    // 图标
    ctx.font = '90px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(e.icon || '❤️', width / 2, 150);

    // 名称
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(e.name, width / 2, 270);

    // 日期
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '24px sans-serif';
    ctx.fillText(e.date, width / 2, 320);

    // 剩余时间
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText(remain.value.text, width / 2, 395);

    // 副信息
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '20px sans-serif';
    const sub = extraText.value || repeatLabel.value;
    if (sub) ctx.fillText(sub, width / 2, 440);

    // 水印
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '18px sans-serif';
    ctx.fillText('万能工具箱 · 倒数纪念日', width / 2, 500);
};

const saveImage = () => {
    uni.showLoading({ title: '生成中' });
    const query = uni.createSelectorQuery().in(instance.proxy);
    query.select('#shareCanvas').fields({ node: true, size: true }).exec((res) => {
        if (!res[0] || !res[0].node) {
            uni.hideLoading();
            uni.showToast({ title: '生成失败', icon: 'none' });
            return;
        }
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = uni.getSystemInfoSync().pixelRatio || 2;
        const width = res[0].width;
        const height = res[0].height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        drawShare(canvas, ctx, width, height);
        uni.canvasToTempFilePath({
            canvas,
            success: (temp) => {
                uni.saveImageToPhotosAlbum({
                    filePath: temp.tempFilePath,
                    success: () => {
                        uni.hideLoading();
                        uni.showToast({ title: '已保存到相册', icon: 'success' });
                    },
                    fail: (err) => {
                        uni.hideLoading();
                        if (String(err.errMsg || '').includes('auth')) {
                            uni.showModal({
                                title: '提示',
                                content: '需要相册权限才能保存图片，请在设置中开启',
                                confirmText: '去设置',
                                success: (r) => {
                                    if (r.confirm) uni.openSetting();
                                },
                            });
                        } else {
                            uni.showToast({ title: '保存失败', icon: 'none' });
                        }
                    },
                });
            },
            fail: () => {
                uni.hideLoading();
                uni.showToast({ title: '生成失败', icon: 'none' });
            },
        });
    });
};

onShow(() => {
    loadEvent();
    if (timer) clearInterval(timer);
    timer = setInterval(() => { tick.value++; }, 60000);
});

onHide(() => {
    if (timer) clearInterval(timer);
    timer = null;
});
</script>

<style scoped lang="scss">
.detail-wrap {
    padding: 0 40rpx 160rpx;
    box-sizing: border-box;

    .hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 80rpx 40rpx 60rpx;
        border-radius: 32rpx;
        color: #FFFFFF;
        box-shadow: 0 24rpx 60rpx rgba(0, 0, 0, 0.12);

        .hero-icon {
            font-size: 120rpx;
            line-height: 1.3;
        }

        .hero-name {
            margin-top: 24rpx;
            font-size: 40rpx;
            font-weight: 700;
        }

        .hero-date {
            margin-top: 16rpx;
            font-size: 26rpx;
            color: rgba(255, 255, 255, 0.9);

            .hero-tag {
                margin-left: 12rpx;
                padding: 4rpx 16rpx;
                font-size: 20rpx;
                background: rgba(255, 255, 255, 0.25);
                border-radius: 20rpx;
            }
        }

        .hero-count {
            margin-top: 40rpx;
            font-size: 56rpx;
            font-weight: 800;

            &.coming {
                color: #FFFFFF;
            }

            &.passed {
                color: rgba(255, 255, 255, 0.85);
            }

            &.today {
                color: #FFE9A8;
            }
        }

        .hero-extra {
            margin-top: 20rpx;
            font-size: 26rpx;
            color: rgba(255, 255, 255, 0.9);
        }
    }

    .info-card {
        margin-top: 30rpx;
        padding: 10rpx 30rpx;
        background: #FFFFFF;
        border-radius: 24rpx;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);

        .info-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 28rpx 0;
            border-bottom: 1rpx solid #F0F1F5;

            &:last-child {
                border-bottom: none;
            }

            .k {
                font-size: 28rpx;
                color: var(--text-light);
            }

            .v {
                font-size: 28rpx;
                font-weight: 600;
                color: var(--text-dark);
            }
        }
    }

    .btns {
        display: flex;
        flex-direction: column;
        gap: 24rpx;
        margin-top: 40rpx;

        .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12rpx;
            height: 96rpx;
            border-radius: 48rpx;
            font-size: 30rpx;
            font-weight: 600;

            &.primary {
                color: #FFFFFF;
                background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
            }

            &.outline {
                color: var(--main-color);
                background: #FFFFFF;
                border: 2rpx solid var(--main-color);
            }

            &.danger {
                color: #FF6B81;
                background: #FFF1F2;
            }
        }
    }
}

.share-canvas {
    position: fixed;
    left: -9999px;
    top: -9999px;
    width: 320px;
    height: 500px;
}
</style>
