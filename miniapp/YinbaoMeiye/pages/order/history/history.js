// pages/order/history/history.js
const app = getApp();

Page({
  data: {
    orderStatus: '',
    shopName: '',
    appointmentTime: '',
    staffName: '',
    productName: '',
    productPrice: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var apptuid = options.apptuid || "1506821175160765479";

    if (wx.showLoading) {
      wx.showLoading({
        title: '加载中',
      });
    }
    else {
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 5000
      });
    }

    app.getStoreInfo((storeInfo) => {
      this.loadAppointment(apptuid, storeInfo);
    });
  },

  loadAppointment: function (uid, storeInfo) {
    app.authRequest('wxapi/appointment/FindAppointment',
      {
        storeId: app.storeId(),
        uid: uid
      },
      (res) => {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        else {
          wx.hideToast()
        }

        if (res.successed) {
          var appt = res.result;
          this.setData({
            orderStatus: appt.Status === 0 ? '未到店消费' : (appt.Status === -1 ? "已经取消" : "已到店消费" ),
            shopName: storeInfo.storeName,
            appointmentTime: appt.DateStart,
            staffName: appt.StaffName,
            staffUid: appt.StaffUid,
            productName: appt.ServiceName,
            productUid: appt.ServiceUid,
            productPrice: appt.ServicePrice? appt.ServicePrice.toFixed(2) : ""
          });         
        }
        else {
          wx.showModal({
            title: '提示',
            content: res.message,
            showCancel: false
          });
        }
      },
      (err) => {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        else {
          wx.hideToast()
        }

        wx.showModal({
          title: '提示',
          content: '网络错误，请稍候再试或联系客服。',
          showCancel: false
        });
      }
    );

  },

  orderAgain: function () {
    if (wx.reLaunch) {
      wx.reLaunch({
        url: '/pages/order/nearstore/nearstore'
      })
    }
    else {
      wx.redirectTo({
        url: '/pages/order/nearstore/nearstore'
      })
    }
  },

})