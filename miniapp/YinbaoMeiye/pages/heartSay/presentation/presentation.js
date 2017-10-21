// pages/heartSay/presentation/presentation.js
Page({

  data: {
    giftImgPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/heart1.png',
    giftName: '礼品卡名称',
    isAddPhoto: true,
  },


  onLoad: function (options) {

  },

  onReady: function () {

  },


  onShow: function () {

  },

  bindAddPhoto: function () {
    var isAddPhoto = this.data.isAddPhoto

    this.setData({
      isAddPhoto: !isAddPhoto

    })
  }
})