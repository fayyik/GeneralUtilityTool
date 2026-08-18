<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="grid-wrap">
            <!-- 选择图片 -->
            <view class="section-title">选择图片</view>
            <view class="pick-area" @click="chooseImage">
                <image v-if="state.image" :src="state.image.path" mode="aspectFill" class="pick-img"></image>
                <view v-else class="pick-empty">
                    <uv-icon name="plus" size="48" color="#CCCCCC"></uv-icon>
                    <view class="pick-text">选择图片</view>
                </view>
            </view>

            <!-- 操作 -->
            <view class="opts">
                <view class="btn primary" @click="doCut">
                    开始切图
                </view>
            </view>

            <!-- 预览 -->
            <view class="preview" v-if="pieces.length">
                <view class="section-title">切图结果（共 {{ pieces.length }} 张）</view>
                <view class="grid3">
                    <view class="piece-box" v-for="p in pieces" :key="p.index">
                        <image :src="p.path" mode="aspectFill" class="piece" @click="previewBig(p.path)"></image>
                        <view class="piece-idx">{{ p.index }}</view>
                    </view>
                </view>
                <view class="btn save" @click="saveAll">
                    <uv-icon name="download" size="18" color="#FFFFFF"></uv-icon>
                    保存全部到相册
                </view>
            </view>
        </view>

        <!-- 离屏 canvas，用于切图 -->
        <canvas id="gridCanvas" type="2d" class="share-canvas"></canvas>
    </view>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import Navbar from '@/components/Navbar.vue';

const instance = getCurrentInstance();

const state = reactive({
    image: null, // { path, width, height }
});

const pieces = ref([]); // [{ path, index }]

const loadInfo = (path) =>
    new Promise((resolve) => {
        uni.getImageInfo({
            src: path,
            success: (res) => resolve({ path, width: res.width, height: res.height }),
            fail: () => resolve({ path, width: 1, height: 1 }),
        });
    });

const chooseImage = () => {
    uni.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
            const file = (res.tempFiles || [])[0];
            if (!file) return;
            const info = await loadInfo(file.tempFilePath);
            state.image = info;
            pieces.value = [];
        },
        fail: (err) => {
            if (String(err.errMsg || '').includes('chooseMedia')) {
                uni.chooseImage({
                    count: 1,
                    success: async (r) => {
                        const info = await loadInfo(r.tempFilePaths[0]);
                        state.image = info;
                        pieces.value = [];
                    },
                });
            }
        },
    });
};

const loadNode = (retry = 0) =>
    new Promise((resolve) => {
        uni.createSelectorQuery()
            .in(instance.proxy)
            .select('#gridCanvas')
            .fields({ node: true, size: true })
            .exec((res) => {
                if (res[0] && res[0].node) {
                    resolve(res[0]);
                } else if (retry < 5) {
                    setTimeout(() => resolve(loadNode(retry + 1)), 120);
                } else {
                    resolve(null);
                }
            });
    });

const loadImage = (canvas, src) =>
    new Promise((resolve) => {
        const img = canvas.createImage ? canvas.createImage() : new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });

const canvasToTemp = (canvas) =>
    new Promise((resolve, reject) => {
        uni.canvasToTempFilePath({
            canvas,
            success: (res) => resolve(res.tempFilePath),
            fail: reject,
        });
    });

const doCut = async () => {
    if (!state.image) {
        uni.showToast({ title: '请先选择图片', icon: 'none' });
        return;
    }
    uni.showLoading({ title: '切图中' });
    const nodeInfo = await loadNode();
    if (!nodeInfo || !nodeInfo.node) {
        uni.hideLoading();
        uni.showToast({ title: '初始化失败', icon: 'none' });
        return;
    }
    const canvas = nodeInfo.node;
    const ctx = canvas.getContext('2d');
    const img = await loadImage(canvas, state.image.path);
    if (!img) {
        uni.hideLoading();
        uni.showToast({ title: '图片加载失败', icon: 'none' });
        return;
    }
    const ow = state.image.width;
    const oh = state.image.height;

    // 居中裁最大正方形，再均分 3×3（不变形，拼回原图）
    const sq = Math.min(ow, oh);
    const cx = (ow - sq) / 2;
    const cy = (oh - sq) / 2;
    const cell = sq / 3;
    const piecesSrc = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            piecesSrc.push({ sx: cx + c * cell, sy: cy + r * cell, sw: cell, sh: cell, outW: cell, outH: cell });
        }
    }

    const temps = [];
    for (const p of piecesSrc) {
        canvas.width = Math.round(p.outW);
        canvas.height = Math.round(p.outH);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, p.sx, p.sy, p.sw, p.sh, 0, 0, canvas.width, canvas.height);
        try {
            const f = await canvasToTemp(canvas);
            temps.push(f);
        } catch (e) {
            uni.hideLoading();
            uni.showToast({ title: '切图失败', icon: 'none' });
            return;
        }
    }
    pieces.value = temps.map((f, i) => ({ path: f, index: i + 1 }));
    uni.hideLoading();
    uni.showToast({ title: '切图完成', icon: 'success' });
};

const previewBig = (path) => {
    uni.previewImage({
        urls: pieces.value.map(p => p.path),
        current: path,
    });
};

const saveAll = async () => {
    if (!pieces.value.length) {
        uni.showToast({ title: '请先切图', icon: 'none' });
        return;
    }
    uni.showLoading({ title: '保存中 0/' + pieces.value.length });
    for (let i = 0; i < pieces.value.length; i++) {
        await new Promise((resolve) => {
            uni.saveImageToPhotosAlbum({
                filePath: pieces.value[i].path,
                success: () => resolve(true),
                fail: (err) => {
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
                        uni.showToast({ title: `第 ${i + 1} 张保存失败`, icon: 'none' });
                    }
                    resolve(false);
                },
            });
        });
    }
    uni.hideLoading();
    uni.showToast({ title: '已全部保存', icon: 'success' });
};
</script>

<style scoped lang="scss">
.grid-wrap {
    padding: 0 40rpx 160rpx;
    box-sizing: border-box;

    .section-title {
        margin: 10rpx 0 24rpx;
        font-size: 30rpx;
        font-weight: 700;
        color: var(--text-dark);
    }

    .pick-area {
        .pick-img {
            width: 100%;
            height: 480rpx;
            border-radius: 20rpx;
            background: #F5F6FA;
        }

        .pick-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 360rpx;
            border: 2rpx dashed #D0D3DD;
            border-radius: 20rpx;
            box-sizing: border-box;

            .pick-text {
                margin-top: 12rpx;
                font-size: 24rpx;
                color: #AAAAAA;
            }
        }
    }

    .opts {
        margin-top: 40rpx;

        .btn.primary {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 96rpx;
            border-radius: 48rpx;
            font-size: 30rpx;
            font-weight: 600;
            color: #FFFFFF;
            background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
        }
    }

    .preview {
        margin-top: 40rpx;

        .grid3 {
            display: flex;
            flex-wrap: wrap;
            gap: 12rpx;

            .piece-box {
                position: relative;
                width: 210rpx;
                height: 210rpx;

                .piece {
                    width: 100%;
                    height: 100%;
                    border-radius: 12rpx;
                    background: #F5F6FA;
                }

                .piece-idx {
                    position: absolute;
                    top: 8rpx;
                    left: 12rpx;
                    padding: 2rpx 12rpx;
                    font-size: 20rpx;
                    color: #FFFFFF;
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 12rpx;
                }
            }
        }

        .btn.save {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12rpx;
            height: 96rpx;
            margin-top: 30rpx;
            border-radius: 48rpx;
            font-size: 30rpx;
            font-weight: 600;
            color: #FFFFFF;
            background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
        }
    }
}

.share-canvas {
    position: fixed;
    left: -9999px;
    top: -9999px;
}
</style>