// pages/heartSay/myGift/myGift.js
Page({

  data: {
  
  },

  onLoad: function (options) {
  
  },

  onReady: function () {
  
  },

  onShow: function () {
  
  },
  bindall: function(e){
    var urls = [
      "/pages/heartSay/wait/wait",
      "/pages/heartSay/heartSay/heart",
      "/pages/heartSay/login/login",
      "/pages/heartSay/giftDetails/giftDetails",
      "/pages/heartSay/shop/shop",
      "/pages/heartSay/QRcodePay/QRcodePay",
    ]
   
    var index = parseInt(e.currentTarget.dataset.index, 10) 
    console.log(urls[index], index);
    if(index == 3){
      wx.navigateTo({
        url: urls[index] + '?isPrice=0',
      }) 
      return 
    }
    wx.navigateTo({
      url: urls[index],
    })
  },
})