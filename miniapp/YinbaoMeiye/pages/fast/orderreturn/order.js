// pages/order/order.js
var QR = require("../../../utils/qrcode.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    maskHidden: true,
    imagePath: '',
    orderNo: '',
    ticketSummary: '',
    formattedTime: '-'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var orderNo = options.orderno;

    if (!orderNo) {
      var prevOrder = wx.getStorageSync('FASTORDERNO') || {}
      orderNo = prevOrder.orderNo;
    }

    if (!orderNo) {
      if (wx.reLaunch) {
        wx.reLaunch({
          url: '/pages/fast/timeslot/timeslot'
        })
      }
      else {
        wx.redirectTo({
          url: '/pages/fast/timeslot/timeslot'
        })
      }

      return;
    }

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

    app.authRequest('wxapi/order/OrderDetails',
      {
        storeId: app.storeId(),
        orderNumber: orderNo
      },
      (res) => {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        else {
          wx.hideToast()
        }

        console.log(res);

        if (res.successed) {
          var orderSummary = res.orderSummary;
          var summary = '';

          for (var i in orderSummary.ticketItems) {
            var item = orderSummary.ticketItems[i];
            summary = item.name + "*" + item.quantity;
            break;
          }

          summary = summary + " ￥" + orderSummary.totalAmount;

          this.setData({
            orderNo: orderNo,
            daySeq: res.orderSummary.daySeq,
            ticketSummary: summary,
            formattedTime: res.formattedTime,
            loading: false
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
        wx.showModal({
          title: '提示',
          content: '网络错误，请稍候再试或联系客服。',
          showCancel: false
        });
      }
    );

  },

  requestForRefund: function() {
    // wx.showModal({
    //   title: "申请已提交",
    //   content: "请等待审核，1-5个工作日内原路退回",
    //   showCancel: false,
    //   success: function (res) {
    //     wx.setStorageSync("FASTORDERNO", {});

    //     wx.reLaunch({
    //       url: '/pages/fast/timeslot/timeslot'
    //     })
    //   }
    // });
    
    // return;

    var orderNo = this.data.orderNo;

    if (!orderNo) {
      return;
    }

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

    app.authRequest('wxapi/order/WXPayRefund',
      {
        storeId: app.storeId(),
        orderNumber: orderNo
      },
      (res) => {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        else {
          wx.hideToast()
        }

        console.log(res);

        if (res.successed) {         
          wx.showModal({
            content: "退款成功",
            showCancel: false,
            success: function (res) {
              wx.setStorageSync("FASTORDERNO", {});

              if (wx.reLaunch) {
                wx.reLaunch({
                  url: '/pages/fast/timeslot/timeslot'
                })
              }
              else {
                wx.redirectTo({
                  url: '/pages/fast/timeslot/timeslot'
                })
              }
            }            
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
        wx.showModal({
          title: '提示',
          content: '网络错误，请稍候再试或联系客服。',
          showCancel: false
        });
      }
    );


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var self = this;

    wx.getStorage({
      key: 'FASTORDERTIME',
      success: function (res) {
        var orderTime = res.data;
        self.setData({
          formattedTime: orderTime.formattedTime
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})