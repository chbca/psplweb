// pages/order/staff/staff.js
const app = getApp();
var defaultStaffPhoto = 'http://imgw.pospal.cn/we/mini/store/staff.png';

Page({
  data: {
    loaded:false,
    staff: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var staffUid = options.uid;    
    this.loadStaffServices(staffUid);
  },

  loadStaffServices: function(uid) {
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

    app.authRequest('wxapi/store/FindGuiderServices',
      {
        storeId: app.storeId(),
        id: uid
      },
      (res) => {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        else {
          wx.hideToast()
        }

        if (res.successed) {
          var staff = res.result;

          staff.PhotoPath = staff.PhotoPath || defaultStaffPhoto;
          staff.Tags = staff.TagNames.join('; ');

          this.setData({
            staff: staff
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

  goAppt: function (e) {    
    wx.navigateBack({      
    });
  },
})