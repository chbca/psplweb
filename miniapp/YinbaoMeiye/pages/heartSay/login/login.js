// pages/heartSay/login/login.js
Page({

  data: {
    isPassword:true,
    isTimeout: true,
  },


  onLoad: function (options) {
  
  },


  onReady: function () {
  
  },

  onShow: function () {
  
  },
  tapView: function() {

    var isPassword = this.data.isPassword
    this.setData({
      isPassword: !isPassword,
    })
  },
  timeoutShow:function(){
    var isTimeout = this.data.isTimeout
    this.setData({
      isTimeout: !isTimeout,
    })
  }

})