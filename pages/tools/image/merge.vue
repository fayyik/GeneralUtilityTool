<template>
    <view class="page-container" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <view class="merge-wrap">
            <!-- 模式切换 -->
            <view class="mode-bar">
                <view
                    v-for="m in modes"
                    :key="m.value"
                    class="mode-item"
                    :class="{ active: state.mode === m.value }"
                    @click="switchMode(m.value)"
                >
                    <view class="mode-name">{{ m.label }}</view>
                    <view class="mode-desc">{{ m.desc }}</view>
                </view>
            </view>

            <!-- 图片选择 -->
            <view class="section-title">选择图片 <text class="tip">（长按拖动排序，最多 10 张）</text></view>
            <view class="pick-area">
                <view
                    class="thumb"
                    v-for="(img, i) in state.images"
                    :key="i"
                    :style="dragIndex === i ? dragStyle() : ''"
                    @longpress="startDrag(i, $event)"
                    @touchmove.stop.prevent="onDragMove"
                    @touchend="endDrag"
                    @touchcancel="endDrag"
                >
                    <image :src="img.path" mode="aspectFill"></image>
                    <view class="del" @click.stop="removeImage(i)">
                        <uv-icon name="close" size="16" color="#FFFFFF"></uv-icon>
                    </view>
                    <view class="idx">{{ i + 1 }}</view>
                </view>
                <view class="add" v-if="state.images.length < 16" @click="chooseImage">
                    <uv-icon name="plus" size="40" color="#CCCCCC"></uv-icon>
                    <view class="add-text">添加</view>
                </view>
            </view>

            <!-- 操作 -->
            <view class="opts">
                <view class="btn primary" @click="doMerge">
                    拼接生成
                </view>
                <view class="btn outline" v-if="state.mode === 'random' && state.images.length > 1" @click="doMerge">
                    重新随机
                </view>
            </view>

            <!-- 预览 -->
            <view class="preview" v-if="merged">
                <view class="section-title">预览（共 {{ previewImgs.length }} 张）</view>
                <scroll-view scroll-x class="hscroll" v-if="state.mode === 'horizontal'">
                    <view class="hscroll-inner">
                        <image v-for="(p, i) in previewImgs" :key="i" :src="p" class="preview-img" :style="canvasStyle" mode="aspectFill"></image>
                    </view>
                </scroll-view>
                <view v-else class="vscroll">
                    <image v-for="(p, i) in previewImgs" :key="i" :src="p" class="preview-img" :style="canvasStyle" mode="widthFix"></image>
                </view>
                <view class="btn save" @click="saveAll">
                    <uv-icon name="download" size="18" color="#FFFFFF"></uv-icon>
                    保存全部到相册（{{ previewImgs.length }} 张）
                </view>
            </view>
        </view>

        <!-- 离屏 canvas，用于绘制 -->
        <canvas id="mergeCanvas" type="2d" class="share-canvas"></canvas>
    </view>
</template>

<script setup>
import { ref, reactive, computed, getCurrentInstance, onMounted, nextTick } from 'vue';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

import Navbar from '@/components/Navbar.vue';

const instance = getCurrentInstance();

const modes = [
    { value: 'vertical', label: '纵向拼接', desc: '长图' },
    { value: 'horizontal', label: '横向拼接', desc: '长图' },
    { value: 'random', label: '随机拼贴', desc: '正方形模板' },
];

const state = reactive({
    mode: 'vertical',
    images: [],
});

const merged = ref(false);
const previewImgs = ref([]);

const canvasOut = ref(null); // { width, height } 输出像素
const sysInfo = uni.getSystemInfoSync();
const canvasStyle = computed(() => {
    if (!canvasOut.value) return { width: '300px', height: '400px' };
    const outW = canvasOut.value.width;
    const outH = canvasOut.value.height;
    const availW = sysInfo.windowWidth - (40 / 750) * sysInfo.windowWidth * 2;
    if (state.mode === 'horizontal') {
        // 横向：高度 = 可用宽，总宽度按实际比例叠加（超出屏幕横向滚动查看）
        const w = Math.round((availW * outW) / outH);
        return { width: `${w}px`, height: `${availW}px` };
    }
    // 纵向/随机：只固定宽度，高度由 widthFix 按图片比例自适应（完整显示不裁剪）
    return { width: `${availW}px` };
});

const switchMode = (mode) => {
    state.mode = mode;
    merged.value = false;
    previewImgs.value = [];
    canvasOut.value = null;
};

const loadInfo = (path) =>
    new Promise((resolve) => {
        uni.getImageInfo({
            src: path,
            success: (res) => resolve({ path, width: res.width, height: res.height }),
            fail: () => resolve({ path, width: 1, height: 1 }),
        });
    });

const chooseImage = () => {
    const count = 16 - state.images.length;
    uni.chooseMedia({
        count,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
            const files = (res.tempFiles || []).map(f => f.tempFilePath);
            const infos = await Promise.all(files.map(loadInfo));
            state.images.push(...infos);
            merged.value = false;
            previewImgs.value = [];
            canvasOut.value = null;
        },
        fail: (err) => {
            // 兼容旧基础库
            if (String(err.errMsg || '').includes('chooseMedia')) {
                uni.chooseImage({
                    count,
                    success: async (r) => {
                        const infos = await Promise.all(r.tempFilePaths.map(loadInfo));
                        state.images.push(...infos);
                        merged.value = false;
                        previewImgs.value = [];
                        canvasOut.value = null;
                    },
                });
            }
        },
    });
};

const removeImage = (i) => {
    state.images.splice(i, 1);
    merged.value = false;
    previewImgs.value = [];
    canvasOut.value = null;
};

// ---- 长按拖动排序 ----
const dragIndex = ref(-1);
const dragPos = ref({ x: 0, y: 0 });
const dragOffset = ref({ x: 0, y: 0 });
const areaRect = ref(null);

const THUMB_W = (200 / 750) * sysInfo.windowWidth;
const THUMB_GAP = (20 / 750) * sysInfo.windowWidth;
const COLS = 3;

const getAreaRect = () => {
    uni.createSelectorQuery()
        .in(instance.proxy)
        .select('.pick-area')
        .boundingClientRect((r) => { areaRect.value = r; })
        .exec();
};

const startDrag = (i, e) => {
    if (!areaRect.value) getAreaRect();
    const touch = e.touches && e.touches[0];
    if (!touch || !areaRect.value) return;
    const x = touch.pageX - areaRect.value.left;
    const y = touch.pageY - areaRect.value.top;
    const elLeft = (i % COLS) * (THUMB_W + THUMB_GAP);
    const elTop = Math.floor(i / COLS) * (THUMB_W + THUMB_GAP);
    dragOffset.value = { x: x - elLeft - THUMB_W / 2, y: y - elTop - THUMB_W / 2 };
    dragPos.value = { x: touch.pageX, y: touch.pageY };
    dragIndex.value = i;
};

const onDragMove = (e) => {
    if (dragIndex.value < 0 || !areaRect.value) return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    dragPos.value = { x: touch.pageX, y: touch.pageY };
    const x = touch.pageX - areaRect.value.left;
    const y = touch.pageY - areaRect.value.top;
    const col = Math.floor(x / (THUMB_W + THUMB_GAP));
    const row = Math.floor(y / (THUMB_W + THUMB_GAP));
    let target = row * COLS + col;
    if (target >= state.images.length) target = state.images.length - 1;
    if (target < 0) target = 0;
    if (target !== dragIndex.value) {
        const arr = state.images.slice();
        const [moved] = arr.splice(dragIndex.value, 1);
        arr.splice(target, 0, moved);
        state.images.splice(0, state.images.length, ...arr);
        dragIndex.value = target;
    }
};

const endDrag = () => {
    dragIndex.value = -1;
    merged.value = false;
    previewImgs.value = [];
    canvasOut.value = null;
};

const dragStyle = () => {
    const off = dragOffset.value;
    const pos = dragPos.value;
    return {
        position: 'fixed',
        left: `${pos.x - off.x}px`,
        top: `${pos.y - off.y}px`,
        zIndex: 999,
        opacity: 0.9,
        boxShadow: '0 16rpx 40rpx rgba(0, 0, 0, 0.25)',
    };
};

onMounted(() => {
    nextTick(() => getAreaRect());
});

const loadNode = (retry = 0) =>
    new Promise((resolve) => {
        uni.createSelectorQuery()
            .in(instance.proxy)
            .select('#mergeCanvas')
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
        // 微信端用 canvas.createImage()，H5 端用 new Image()
        const img = canvas.createImage ? canvas.createImage() : new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });

const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// cover 填充绘制（origW/origH 为真实像素尺寸）
const drawCover = (ctx, img, origW, origH, x, y, w, h) => {
    const ir = origW / origH;
    const br = w / h;
    let sw = origW;
    let sh = origH;
    let sx = 0;
    let sy = 0;
    if (ir > br) {
        sw = origH * br;
        sx = (origW - sw) / 2;
    } else {
        sh = origW / br;
        sy = (origH - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
};

// 纵向拼接：宽度=基准宽(默认屏幕宽)，高度按各图比例自然累加，不限制
const layoutVertical = (imgs, baseW = 720) => {
    const W = baseW;
    let y = 0;
    const items = imgs.map(({ img, origW, origH }) => {
        const h = (W * origH) / origW;
        const item = { img, origW, origH, x: 0, y, w: W, h };
        y += h;
        return item;
    });
    return { width: W, height: y, items };
};

// 横向拼接：高度=基准高(默认屏幕宽)，各图宽按比例计算，总宽不限制
const layoutHorizontal = (imgs, baseH = 1080) => {
    const H = baseH;
    let x = 0;
    const items = imgs.map(({ img, origW, origH }) => {
        const w = (H * origW) / origH;
        const item = { img, origW, origH, x, y: 0, w, h: H };
        x += w;
        return item;
    });
    return { width: x, height: H, items };
};

// 正方形随机拼贴模板：网格大小根据图片数量自适应
const layoutRandom = (imgs) => {
    const SIZE = 1080;
    // 根据图片数量决定网格：2张→2x2，4张→2x2，9张→3x3，16张→4x4
    const GRID = Math.max(1, Math.ceil(Math.sqrt(imgs.length)));
    const cell = SIZE / GRID;
    // 单图直接铺满
    if (imgs.length === 1) {
        return {
            width: SIZE,
            height: SIZE,
            items: [{ img: imgs[0].img, origW: imgs[0].origW, origH: imgs[0].origH, x: 0, y: 0, w: SIZE, h: SIZE }],
        };
    }
    const maxSpan = Math.min(2, GRID);
    // 放置图片：span 为 2 时每张随机占 1~2 格，为 1 时全部 1 格（保证放下）
    const placeGrid = (span) => {
        const g = Array.from({ length: GRID }, () => Array(GRID).fill(false));
        const placed = [];
        const canPlace = (r, c, gw, gh) => {
            for (let i = r; i < r + gh; i++) {
                for (let j = c; j < c + gw; j++) {
                    if (g[i][j]) return false;
                }
            }
            return true;
        };
        const mark = (r, c, gw, gh) => {
            for (let i = r; i < r + gh; i++) {
                for (let j = c; j < c + gw; j++) {
                    g[i][j] = true;
                }
            }
        };
        const findPlace = (gw, gh) => {
            for (let attempt = 0; attempt < 300; attempt++) {
                const c = Math.floor(Math.random() * (GRID - gw + 1));
                const r = Math.floor(Math.random() * (GRID - gh + 1));
                if (canPlace(r, c, gw, gh)) return { r, c };
            }
            return null;
        };
        const tryPlace = (img, gw, gh) => {
            const p = findPlace(gw, gh);
            if (p) {
                mark(p.r, p.c, gw, gh);
                placed.push({ img: img.img, origW: img.origW, origH: img.origH, x: p.c * cell, y: p.r * cell, w: gw * cell, h: gh * cell });
                return true;
            }
            return false;
        };
        shuffle(imgs).forEach((img) => {
            const gw = span > 1 ? 1 + Math.floor(Math.random() * span) : 1;
            const gh = span > 1 ? 1 + Math.floor(Math.random() * span) : 1;
            if (!tryPlace(img, gw, gh)) {
                if (!tryPlace(img, 1, 1)) {
                    // 兜底：顺序找第一个空格
                    outer:
                    for (let r = 0; r < GRID; r++) {
                        for (let c = 0; c < GRID; c++) {
                            if (!g[r][c]) {
                                g[r][c] = true;
                                placed.push({ img: img.img, origW: img.origW, origH: img.origH, x: c * cell, y: r * cell, w: cell, h: cell });
                                break outer;
                            }
                        }
                    }
                }
            }
        });
        return placed;
    };
    let items = placeGrid(maxSpan);
    // 跨度随机可能导致放不下，退回全部 1 格重新放置
    if (items.length < imgs.length) items = placeGrid(1);
    return { width: SIZE, height: SIZE, items };
};

const doMerge = async () => {
    if (!state.images.length) {
        uni.showToast({ title: '请先选择图片', icon: 'none' });
        return;
    }
    uni.showLoading({ title: '拼接中' });
    const nodeInfo = await loadNode();
    if (!nodeInfo || !nodeInfo.node) {
        uni.hideLoading();
        uni.showToast({ title: '初始化失败', icon: 'none' });
        return;
    }
    const canvas = nodeInfo.node;
    const ctx = canvas.getContext('2d');
    const imgs = await Promise.all(state.images.map(src => loadImage(canvas, src.path)));
    if (imgs.some(i => !i)) {
        uni.hideLoading();
        uni.showToast({ title: '图片加载失败', icon: 'none' });
        return;
    }
    // 用 getImageInfo 的真实宽高做布局，canvas 图片对象只用于绘制
    const meta = state.images.map((info, i) => ({ img: imgs[i], origW: info.width, origH: info.height }));
    let layout;
    if (state.mode === 'horizontal') layout = layoutHorizontal(meta);
    else if (state.mode === 'random') layout = layoutRandom(meta);
    else layout = layoutVertical(meta);

    const dpr = uni.getSystemInfoSync().pixelRatio || 2;
    // 探测设备 canvas 实际上限（不再硬编码，新机型可达 16384+）
    let limit = 32768;
    try {
        canvas.width = 32768;
        canvas.height = 32768;
        limit = Math.max(1, Math.min(canvas.width, canvas.height));
    } catch (e) {
        limit = 8192;
    }

    const exportCanvas = () =>
        new Promise((resolve, reject) => {
            uni.canvasToTempFilePath({ canvas, success: (res) => resolve(res.tempFilePath), fail: reject });
        });

    // 单张拼接：整幅图按设备上限等比缩放（不切段），尽量放大保证清晰
    const coef = dpr;
    let pxW = Math.round(layout.width * coef);
    let pxH = Math.round(layout.height * coef);
    const s = Math.min(1, limit / Math.max(pxW, pxH));
    pxW = Math.round(pxW * s);
    pxH = Math.round(pxH * s);
    canvas.width = pxW;
    canvas.height = pxH;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(coef * s, coef * s);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, layout.width, layout.height);
    layout.items.forEach((item) => drawCover(ctx, item.img, item.origW, item.origH, item.x, item.y, item.w, item.h));

    let tempPath;
    try {
        tempPath = await exportCanvas();
    } catch (e) {
        uni.hideLoading();
        uni.showToast({ title: '生成失败', icon: 'none' });
        return;
    }
    canvasOut.value = { width: canvas.width, height: canvas.height };
    previewImgs.value = [tempPath];
    merged.value = true;
    uni.hideLoading();
};

const saveAll = async () => {
    if (!previewImgs.value.length) {
        uni.showToast({ title: '请先生成拼接图', icon: 'none' });
        return;
    }
    uni.showLoading({ title: '保存中 0/' + previewImgs.value.length });
    for (let i = 0; i < previewImgs.value.length; i++) {
        await new Promise((resolve) => {
            uni.saveImageToPhotosAlbum({
                filePath: previewImgs.value[i],
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
.merge-wrap {
    padding: 0 40rpx 160rpx;
    box-sizing: border-box;

    .mode-bar {
        display: flex;
        gap: 20rpx;
        margin: 30rpx 0 40rpx;

        .mode-item {
            flex: 1;
            padding: 26rpx 0;
            text-align: center;
            background: #F5F6FA;
            border-radius: 20rpx;
            border: 2rpx solid transparent;

            &.active {
                background: rgba(78, 140, 255, 0.1);
                border-color: var(--main-color);

                .mode-name {
                    color: var(--main-color);
                }
            }

            .mode-name {
                font-size: 28rpx;
                font-weight: 600;
                color: var(--text-dark);
            }

            .mode-desc {
                margin-top: 6rpx;
                font-size: 20rpx;
                color: var(--text-light);
            }
        }
    }

    .section-title {
        margin: 10rpx 0 24rpx;
        font-size: 30rpx;
        font-weight: 700;
        color: var(--text-dark);

        .tip {
            margin-left: 12rpx;
            font-size: 22rpx;
            font-weight: 400;
            color: var(--text-light);
        }
    }

    .pick-area {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;

        .thumb {
            position: relative;
            width: 200rpx;
            height: 200rpx;

            image {
                width: 100%;
                height: 100%;
                border-radius: 16rpx;
                background: #F5F6FA;
            }

            .del {
                position: absolute;
                top: -10rpx;
                right: -10rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 44rpx;
                height: 44rpx;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.6);
            }

            .idx {
                position: absolute;
                bottom: 8rpx;
                left: 12rpx;
                padding: 2rpx 12rpx;
                font-size: 20rpx;
                color: #FFFFFF;
                background: rgba(0, 0, 0, 0.4);
                border-radius: 12rpx;
            }
        }

        .add {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 200rpx;
            height: 200rpx;
            border: 2rpx dashed #D0D3DD;
            border-radius: 16rpx;
            box-sizing: border-box;

            .add-text {
                margin-top: 8rpx;
                font-size: 22rpx;
                color: #AAAAAA;
            }
        }
    }

    .opts {
        display: flex;
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
                flex: 1;
                color: #FFFFFF;
                background: linear-gradient(135deg, var(--left-linear), var(--right-linear));
            }

            &.outline {
                flex: 1;
                color: var(--main-color);
                background: #FFFFFF;
                border: 2rpx solid var(--main-color);
            }
        }
    }

    .preview {
        margin-top: 40rpx;

        .hscroll {
            width: 100%;
            white-space: nowrap;

            .hscroll-inner {
                display: inline-flex;
            }

            .preview-img {
                display: inline-block;
                vertical-align: top;
                flex-shrink: 0;
            }
        }

        .vscroll {
            .preview-img {
                margin-bottom: 20rpx;
            }
        }

        .preview-img {
            display: block;
            margin: 0 auto;
            border-radius: 16rpx;
            box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.1);
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