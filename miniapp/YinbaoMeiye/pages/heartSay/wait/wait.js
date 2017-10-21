// pages/heartSay/wait/wait.js
Page({


  data: {
    backgroundPath:'http://imgw.pospal.cn/we/mini/heart/img/etc/bag1.png',
    headImgPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/head.png', 
    useName: '木木三',
    blessing: '祝福语祝福语祝福语祝福语祝福语祝福语',
    giftImgPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/heart1.png',
    giftName: '星情月饼礼',
    giftPrice: '50.00',
    show: false,
  },


  onLoad: function (options) {
  
  },

  onReady: function () {
  
  },


  onShow: function () {
  
  },

  showFoot: function () {
    var show = this.data.show
    this.setData({
      show: !show,

    })
  }
})