const app = getApp();
Page({
  data: {
    loading: true,
    rawStores: [],
    viewStores: [],
    keyword: ''
  },

  onLoad: function (options) {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        app.authRequest('wxapi/store/NearbyStoreList',
          {
            storeId: app.storeId(),
            latitude: res.latitude,
            longitude: res.longitude
          },
          (res) => {
            if (res.successed) {
              //filter out 总部
              var allStores = res.data.stores.filter(s => s.StoreId !== 3152106);

              this.setData({
                loading: false,
                rawStores: allStores,
                viewStores: allStores.map(this.mapViewStore)
              });
            }
          },
          (err) => {
          },
          null
        );
      },
      fail: (res) => {
        wx.showModal({
          title: '提示',
          content: '不能获取你到门店的距离，请授权美业预约使用你的位置信息。',
          showCancel: false
        });
      }
    });
  },
  inputFilter: function(event){
    this.data.keyword = event.detail.value;
  },
  doFilter: function () {
    this.setData({
      viewStores: this.data.rawStores.filter(this.filterRawStore).map(this.mapViewStore)
    });
  },
  selectStore: function(event){
    app.setStoreId(event.currentTarget.dataset.storeid);
    wx.navigateTo({
      url: '/pages/order/home/home'
    });
  },
  filterRawStore: function(store){
    var keyword = this.data.keyword.trim().toLowerCase();
    if (keyword){
      return store.StoreName.toLowerCase().indexOf(keyword) >= 0;
    }
    else{
      return true
    }
  },
  mapViewStore: function(store){
    return {
      StoreId: store.StoreId,
      Name: store.StoreName,
      Address: store.Address,
      Distance: this.formatDistance(store.DistanceInMeters)
    }
  },
  formatDistance: function(distance){
    //distance is in KM already
    if (typeof distance === "undefined") {
      return ""
    }

    if(distance < 1){
      return Math.floor(distance * 1000) + 'm';
    }
    else{
      return distance + 'km';
    }
  }
});
