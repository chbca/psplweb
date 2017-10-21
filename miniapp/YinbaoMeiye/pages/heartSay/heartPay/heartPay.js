// pages/heartSay/heartPay/heartPay.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    carImgs:[
      {
        imgPath:'http://imgw.pospal.cn/we/mini/heart/img/etc/item1_1.png',
      },
      {
        imgPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item1_2.png',
      },
      {
        imgPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item1_1.png',
      },
      {
        imgPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item1_1.png',
      },
      {
        imgPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item1_1.png',
      },
      {
        imgPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item1_1.png',
      },
    ],

    gifts:[
      {
        name:'流沙蛋黄月饼',
        price: 99,
      },
      {
        name: '流沙蛋黄月饼礼盒',
        price: 299,
      },
      {
        name: '流沙蛋黄月饼礼盒2',
        price: 299,
      },
      {
        name: '流沙蛋黄月饼礼盒3',
        price: 299,
      },
      {
        name: '流沙蛋黄月饼',
        price: 99,
      },
      {
        name: '流沙蛋黄月饼礼盒',
        price: 299,
      },
      {
        name: '流沙蛋黄月饼礼盒2',
        price: 299,
      },
      {
        name: '流沙蛋黄月饼礼盒3',
        price: 299,
      },
    ],

    heartImgPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/heart1.png',
  },


  onLoad: function (options) {
  
  },

  onReady: function () {
  
  },

  onShow: function () {
  
  },
  clickPhoto: function(e) {
    var index = e.currentTarget.dataset.index
    var path = this.data.carImgs[index]
    this.setData({
      heartImgPath: path.imgPath,
    })
  },

  gotoDetails:function() {

    wx.navigateTo({
      url: "/pages/heartSay/giftDetails/giftDetails",
    })
  },
  gotoPresentation: function () {
    wx.navigateTo({
      url: "/pages/heartSay/presentation/presentation",
    })
  },
})