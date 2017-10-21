// pages/heartSay/joinvip/joinvip.js
Page({

  data: {
    giftImgPath:'http://imgw.pospal.cn/we/mini/heart/img/etc/heart1.png',
    texts: [
      {
        iconPath:'http://imgw.pospal.cn/we/mini/heart/img/icon/joinIcon_v1.png',
        text:'Vip.1 获得积分资格',
      },
      {
        iconPath: 'http://imgw.pospal.cn/we/mini/heart/img/icon/joinIcon_v2.png',
        text: 'Vip.2 可享受店内冷萃茶系列95折',
      },
      {
        iconPath: 'http://imgw.pospal.cn/we/mini/heart/img/icon/joinIcon_v3.png',
        text: 'Vip.3 可享受店内冷萃茶系列95折',
      },
      {
        iconPath: 'http://imgw.pospal.cn/we/mini/heart/img/icon/joinIcon_v4.png',
        text: 'Vip.4 可享受店内冷萃茶系列95折',
      },
      {
        iconPath: 'http://imgw.pospal.cn/we/mini/heart/img/icon/joinIcon_v5.png',
        text: 'Vip.5 可享受店内冷萃茶系列95折',
      },
    ]
  },


  onLoad: function (options) {
  
  },


  onReady: function () {
  
  },


  onShow: function () {
  
  },

  gotoLogin:function () {
    
      wx.navigateTo({
        url: "/pages/heartSay/login/login",
      })
 
  },
})