// pages/order/successfulOrder/successfulOrder.js
Page({

  data: {
    orderNumber: '048',
    orderVerificationCode: '498220',
    orderQRcodeUrl: 'http://imgw.pospal.cn/we/mini/order/img/etc/QRcode.png',
    orderShopName: 'SO HAIR SM城市广场店',
    orderTime: '2017.09.23  16:00',
    orderTechniciansName: '造型师名字',
    orderItemsPrice: '¥699～¥999（实际价格以门店消费为准）',
    orderRemarks: '请在12:00时间段准时到店，如超过预约时间10分钟未到店消费，系统将自动取消此次预约。在预约到店时间4小时前，可取消预约，4小时内将无法取消。疑问请拨打12344咨询。',

    isDialog: true,
  },

  onLoad: function (options) {

  },

  onReady: function () {

  },


  onShow: function () {

  },
  bindDialog: function () {
    var isDialog = this.data.isDialog
    this.setData({
      isDialog: !isDialog,
    })
  },


  goCancelSucceed: function () {
    wx.navigateTo({
      url: '/pages/order/cancelSucceed/cancelSucceed',
    })
  },
  goCancelErr: function () {
    wx.navigateTo({
      url: '/pages/order/cancelErr/cancelErr',
    })
  },
  goHome: function () {
    w.reLaunch({
      url: '/pages/order/home/home',
    })
  },
})