<template>
    <view class="page" :class="[`${themeInfo.theme}-theme`]">
        <Navbar></Navbar>
        <!-- 地图 -->
        <map id="map" :latitude="latitude" :longitude="longitude" :scale="scale" :markers="markers" show-location
            @tap="onMapTap" style="width: 100%; height: 60vh;" />

        <view class="bottom-wrap">
            <!-- 当前选择 -->
            <view class="current">
                <text class="label">当前选择：</text>
                <text class="value">
                    {{ selectedInfo.address || selectedInfo.name || '未选择' }}
                </text>
            </view>

            <!-- 搜索 -->
            <uni-search-bar v-model="keyword" placeholder="搜索地点" cancel-button="none" @confirm="searchPlace"
                @input="onSearchInput" style="padding: 10px 0;" />

            <!-- 搜索结果 -->
            <scroll-view v-if="searchResults.length" scroll-y class="result-list">
                <view v-for="(item, index) in searchResults" :key="index" class="result-item"
                    @click="selectSearchResult(item)">
                    <view class="title">{{ item.title }}</view>
                    <view class="addr">{{ item.address }}</view>
                </view>
            </scroll-view>

            <!-- 按钮 -->
            <button class="confirm-btn" @click="confirm">确定</button>
        </view>

    </view>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

import Navbar from '@/components/Navbar.vue';

import { useMainStore } from '@/store/index';
const { themeInfo } = useMainStore();

/* ====== 腾讯地图 Key ====== */
const MAP_KEY = 'LIJBZ-GYOCH-ZORDK-WHWBN-26YNH-WRFK5';

/* ====== 地图状态 ====== */
const latitude = ref(39.90923);
const longitude = ref(116.397428);
const scale = ref(16);

const markers = ref([
    {
        id: 1,
        latitude: latitude.value,
        longitude: longitude.value,
        width: 20,
        height: 20,
        iconPath: '/static/images/marker.png'
    }
]);

const updateMarker = (lat, lng) => {
    markers.value[0] = {
        ...markers.value[0],
        latitude: lat,
        longitude: lng
    }
}

const selectedInfo = ref({
    latitude: null,
    longitude: null,
    city: '',
    district: '',
    nation: '',
    province: '',
    street: '',
    street_number: '',
    name: '',
    address: ''
});

const keyword = ref('')
const searchResults = ref([])
let searchTimer = null

onLoad(() => {
    nextTick(() => {
        initLocation()
    })
});

const initLocation = async () => {
  const cache = uni.getStorageSync('userLocation')

  if (cache && cache.latitude && cache.longitude) {
    latitude.value = cache.latitude
    longitude.value = cache.longitude
    updateMarker(cache.latitude, cache.longitude)
    selectedInfo.value = cache
    return
  }

  getUserLocation()
}

/* ====== 获取用户位置 ====== */
const getUserLocation = async () => {
    try {
        const res = await uni.getLocation({
            type: 'gcj02',
            isHighAccuracy: true
        })

        latitude.value = res.latitude
        longitude.value = res.longitude

        updateMarker(res.latitude, res.longitude)

        reverseGeocode(res.latitude, res.longitude)
    } catch (e) {
        uni.showToast({
            title: '定位失败，请手动选择',
            icon: 'none'
        })
    }
}

/* ====== 点击地图选点 ====== */
const onMapTap = (e) => {
    const lat = e.detail?.latitude || e.latitude
    const lng = e.detail?.longitude || e.longitude
    if (!lat || !lng) return

    latitude.value = lat
    longitude.value = lng
    updateMarker(lat, lng)

    // 地图点没有文字信息，需要逆地理编码
    reverseGeocode(lat, lng)
}

/* ====== 逆地理编码（仅地图点击用） ====== */
const reverseGeocode = async (lat, lng) => {
    try {
        const res = await uni.request({
            url: 'https://apis.map.qq.com/ws/geocoder/v1/',
            data: {
                location: `${lat},${lng}`,
                key: MAP_KEY
            }
        })

        console.log(lat, lng, '逆地理编码结果');
        console.log(res);

        if (res.data.status === 0) {
            selectedInfo.value = {
                latitude: lat,
                longitude: lng,
                name: res.data.result.formatted_addresses?.recommend || '',
                address: res.data.result.formatted_addresses?.standard_address || res.data.result.address,
                ...res.data.result.address_component
            }
        }
    } catch {
        selectedInfo.value = {
            latitude: lat,
            longitude: lng
        }
    }
}

/* ====== 搜索地点 ====== */
const searchPlace = async () => {
    if (!keyword.value) return

    const res = await uni.request({
        url: 'https://apis.map.qq.com/ws/place/v1/search',
        data: {
            keyword: keyword.value,
            boundary: 'region(全国,0)',
            page_size: 20,
            key: MAP_KEY
        }
    })

    if (res.data.status === 0) {
        searchResults.value = res.data.data.map(item => ({
            title: item.title,
            address: item.address,
            latitude: item.location.lat,
            longitude: item.location.lng
        }))
    }
}

/* ====== 搜索防抖 ====== */
const onSearchInput = () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(searchPlace, 500)
}

/* ====== 点击搜索结果 ====== */
const selectSearchResult = (item) => {
    keyword.value = ''
    searchResults.value = []

    latitude.value = item.latitude
    longitude.value = item.longitude
    scale.value = 16

    console.log(item);

    updateMarker(item.latitude, item.longitude)

    reverseGeocode(item.latitude, item.longitude)
}

/* ====== 确认 ====== */
const confirm = () => {
    if (!selectedInfo.value.latitude) {
        uni.showToast({ title: '请选择位置', icon: 'none' })
        return
    }

    uni.setStorageSync('userLocation', selectedInfo.value);
    uni.navigateBack()
}
</script>

<style scoped lang="scss">
.page {
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.bottom-wrap {
    flex: 1;
    padding: 20rpx;
    background: #FFFFFF;
}

.result-list {
    max-height: 300rpx;
    margin-bottom: 20rpx;

    .result-item {
        padding: 20rpx;
        border-bottom: 1px solid var(--border-color);
    }
    
    .title {
        font-size: 30rpx;
        color: var(--text-dark);
    }

    .addr {
        font-size: 24rpx;
        color: var(--text-light);
    }
}

.current {
    margin: 20rpx 0;
}

.confirm-btn {
    color: #FFFFFF;
    background-color: var(--main-color);
}
</style>
