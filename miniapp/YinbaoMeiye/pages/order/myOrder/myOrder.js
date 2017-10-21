// pages/order/myOrder/myOrder.js
const app = getApp();

var defaultStaffPhoto = 'http://imgw.pospal.cn/we/mini/store/staff.png';

Page({
  data: {
    loaded: false,    
    appointments: []
  },

  onLoad: function (options) {
    // app.checkOpenid(() => {
    //   this.loadHistory();
    // }, true);  
    this.loadHistory();  
  },

  loadHistory: function() {
    var that = this;
    app.authRequest('wxapi/appointment/loadappointments',
      {
      },
      (res) => {
        if (res.successed) {
          var apointments = res.appointments;

          if (apointments.length == 0) {
            wx.showModal({
              title: '没有找到记录',
              showCancel: false
            });            
          }
          else {
            apointments.forEach(function(appt){
              appt.StatusText = appt.Status == -1 ? "已取消" : appt.Status == 1 ? "已到店" : "已预约";
              appt.StaffPhoto = appt.StaffPhoto || defaultStaffPhoto;
            });
          }

          that.setData({
            loaded: true,
            appointments: apointments
          })
        }
        else {
          that.setData({
            loaded: true
          })          

          if (res.message) {
            app.showError(res.message);
          }
        }
      },
      (res) => {
        that.setData({
          loaded: true
        }) 

        app.showError(res.message);
      },
      null
    );
  },

  loadCustomerinfo: function() {
    app.authRequest('wxapi/customeraccount/RenewCustomerInfo',
      {
      },
      (res) => {
          console.log("customerInfo", res);
      },
      (res) => {
        app.showError(res.message);
      },
      null
    );
  },

  onReady: function () {

  },


  onShow: function () {

  },

  goHistory: function (e) {
    var uid = e.currentTarget.dataset.uid;

    wx.navigateTo({
      url: '/pages/order/history/history?apptuid=' + uid,
    })
  },
})