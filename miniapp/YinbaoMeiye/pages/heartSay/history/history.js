// pages/heartSay/history/history.js
Page({

  data: {
    gifts:[
      {
        giftImgPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/heart1.png',
        name: '星礼卡',
        time: '2017.08.08 00:36:10',
        price: '50.00',
        isPresen: true,
      },
      {
        giftImgPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/heart1.png',
        name: '星礼卡',
        time: '2017.08.08 00:36:10',
        price: '50.00',
        isPresen: false,
      },
      {
        giftImgPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/heart1.png',
        name: '星礼卡',
        time: '2017.08.08 00:36:10',
        price: '50.00',
        isPresen: true,
      },

    ]

  },


  onLoad: function (options) {
  
  },

  onReady: function () {
  
  },

  onShow: function () {
  
  },
  gotoPresentation: function () {
    wx.navigateTo({
      url: "/pages/heartSay/presentation/presentation",
    })
  },
})