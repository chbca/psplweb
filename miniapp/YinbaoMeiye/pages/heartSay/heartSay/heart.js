// pages/heartSay/heart.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    gifts:[
      {
        imgsPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item1.png',
        name:'诚心诚意',
      },
      {
        imgsPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item2.png',
        name: '诚心诚意',
      },
    ],

    gifts2: [
      {
        imgsPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item1.png',
        name: '诚心诚意',
      },
      {
        imgsPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item2.png',
        name: '诚心诚意',
      },
      {
        imgsPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item3.png',
        name: '诚心诚意',
      },
      {
        imgsPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item4.png',
        name: '诚心诚意',
      },
      {
        imgsPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item5.png',
        name: '诚心诚意',
      },
      {
        imgsPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item1.png',
        name: '诚心诚意',
      },
      {
        imgsPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item2.png',
        name: '诚心诚意',
      },
      {
        imgsPath: 'http://imgw.pospal.cn/we/mini/heart/img/etc/item3.png',
        name: '诚心诚意',
      },
    ],

    heartImgUrl:'http://imgw.pospal.cn/we/mini/heart/img/etc/heart1.png',
    isGift: true,

  },

  onLoad: function (options) {
  
  },

  onReady: function () {
  
  },

  
  onShow: function () {
  
  },

  gotoPresentation: function() {
    wx.navigateTo({
      url: "/pages/heartSay/presentation/presentation",
    })
  },
  gotoGiftPay: function() {
    
    wx.navigateTo({
      url: "/pages/heartSay/heartPay/heartPay",
    })
  },
  
  gotoJoinVip: function() {
    wx.navigateTo({
      url: "/pages/heartSay/joinvip/joinvip",
    })
  },
  gotoHistory: function () {
    wx.navigateTo({
      url: "/pages/heartSay/history/history",
    })
  },
  
  gotomy: function() {
    wx.navigateTo({
      url: "/pages/heartSay/myGift/myGift",
    })
  },
})