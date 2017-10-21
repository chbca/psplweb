const app = getApp();

// pages/order/shop/shop.js
Page({
  data: {
    shopHeadImg: 'http://imgw.pospal.cn/we/mini/order/img/etc/head1.png',
    shopName: 'SO HAIR连锁品牌',
    shopAddress: '厦门市思明区中航紫金广场a塔36层银豹中心',
    shopList: [
      {
        name: 'SO HAIR连锁品牌SM城市广场店',
        address: '厦门市思明区湖里大道和成功路交叉口165号',
        distance: '300m',
      },
      {
        name: 'SO HAIR连锁品牌SM城市广场店',
        address: '厦门市思明区湖里大道和成功路交叉口165号',
        distance: '300m',
      },
      {
        name: 'SO HAIR连锁品牌SM城市广场店',
        address: '厦门市思明区湖里大道和成功路交叉口165号',
        distance: '300m',
      },

    ],

  },


  onLoad: function (options) {
  
  },

  onReady: function () {

  },

  onShow: function () {

  },

  goHome: function () {
    wx.navigateTo({
      url: '/pages/order/home/home',
    })
  },

})