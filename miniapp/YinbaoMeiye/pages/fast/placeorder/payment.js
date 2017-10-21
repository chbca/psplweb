const app = getApp();
const cartService = require('../../../modules/services/cartService.js');
const shoppingCart = cartService.initCartService();

var _expireTimer = null;
var _reservationTime = null;

// pages/form/form.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeInfo: {},
    cartItems: [],
    totalInCart: 0,
    totalPrice: 0,
    commentLength: 0,
    comment: '',
    timeout: false,
    remainingTime: '--:--',
    formattedTime: '-',
    loaded: false,
    isPaying: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;

    if (wx.showLoading) {
      wx.showLoading({
        title: '正在提交',
      })
    }
    else {
      wx.showToast({
        title: '正在提交',
        icon: 'loading',
        duration: 5000
      })
    }

    app.getStoreInfo((storeInfo) => {
      self.setData({
        storeInfo: storeInfo
      });
      app.checkOpenid(() => {
        self.loadCart();
      }, true);
    });
  },

  loadCart: function () {
    var self = this;

    var hasCartItems = true;
    shoppingCart.checkout(function (result) {
      if (wx.hideLoading) {
        wx.hideLoading();
      }
      else {
        wx.hideToast()
      }

      if (result && result.data) {
        var data = result.data;

        var cartItems = data.CartOrderItems;
        var totalPrice = data.TotalMoney.toFixed(2);
        var totalInCart = data.TotalCount;

        for (var i in cartItems) {
          cartItems[i].subTotal = cartItems[i].subTotal.toFixed(2);
        }

        if (totalInCart == 0) {
          wx.showModal({
            content: '购物车为空，按确认退回商品选择界面。',
            showCancel: false,
            success: function (res) {
              wx.navigateBack();
            }
          });

          return;
        }

        self.setData({
          cartItems: cartItems,
          totalInCart: totalInCart,
          totalPrice: totalPrice,
          loaded: true
        });
      }
      else {
        wx.showModal({
          title: '提示',
          content: '网络错误，请稍候再试或联系客服。',
          showCancel: false
        });

        return;
      }
    });
  },

  onShow: function () {
    var self = this;

    wx.getStorage({
      key: 'FASTORDERTIME',
      success: function (res) {
        var orderTime = res.data;

        //console.log("orderTime", orderTime);
        var expireTime = null;

        if (orderTime && orderTime.expire) {
          expireTime = orderTime.expire;
        }

        _reservationTime = orderTime.reservationTime;
        self.setData({
          formattedTime: orderTime.formattedTime
        });

        self.startTimer(expireTime);
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (_expireTimer !== null) {
      clearInterval(_expireTimer);
      _expireTimer = null;
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (_expireTimer !== null) {
      clearInterval(_expireTimer);
      _expireTimer = null;
    }
  },

  bindCommentInput: function (e) {
    var comment = e.detail.value;

    this.setData({
      comment: e.detail.value,
      commentLength: comment.length
    })
  },

  payNow: function () {
    var self = this;

    if (!self.data.loaded || self.data.isPaying) {
      return;
    }

    self.setData({
      isPaying: true
    });

    if (self.data.orderNo) {
      self.startPay(self.data.orderNo);
      return;
    }

    var prevOrder = wx.getStorageSync('FASTORDERNO') || null

    //console.log("prevOrder", prevOrder);

    if (prevOrder && prevOrder.orderNo) {
      self.startPay(prevOrder.orderNo);
      return;
    }

    var timeSlot = wx.getStorageSync('FASTORDERTIME') || null

    if (timeSlot == null) {
      this.selectTimeAgain();
      return;
    }

    if (wx.showLoading) {
      wx.showLoading({
        title: '正在提交',
      })
    }
    else {
      wx.showToast({
        title: '正在提交',
        icon: 'loading',
        duration: 5000
      })
    }

    var comment = "预约：" + timeSlot.timeSlot;
    if (this.data.comment) {
      comment = comment + "，留言：" + this.data.comment;
    }

    app.authRequest('wxapi/order/placefast',
      {
        storeId: app.storeId(),
        comment: comment,
        reservationTime: _reservationTime,
        apptUid: timeSlot.uid
      },
      (res) => {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        else {
          wx.hideToast()
        }
        //console.log(res);

        if (res.successed) {
          var order = {
            orderNo: res.orderNo,
            orderTime: res.orderTime,
          };

          wx.setStorage({
            key: "FASTORDERNO",
            data: order,
            success: function (res) {
              self.startPay(order.orderNo);
            }
          });
        }
        else {
          self.setData({
            isPaying: false
          });

          if (res.errorCode == 10) {
            this.selectTimeAgain(10);
          }
          else if (res.errorCode == 11) {
            this.selectTimeAgain(11);
          }
          else {
            wx.showModal({
              title: '提示',
              content: res.message,
              showCancel: false
            });
          }
        }
      },
      (err) => {
        self.setData({
          isPaying: false
        });

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
      },
      null
    );
  },

  selectTimeAgain: function () {
    wx.showModal({
      content: '下单时间已经过期，请再次选择时间。',
      showCancel: false,
      success: function (res) {
        wx.setStorageSync("FASTORDERTIME", {});

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
  },

  startPay: function (orderNo) {
    var self = this;

    this.setData({
      orderNo: orderNo
    });

    var storeId = app.storeId();
    app.authRequest('wxapi/order/wxpay',
      {
        storeId: storeId,
        orderNo: orderNo
      },
      (res) => {

        if (wx.hideLoading) {
          wx.hideLoading();
        }
        else {
          wx.hideToast()
        }

        if (res.successed) {
          var payment = res.payment;

          wx.requestPayment(
            {
              'timeStamp': payment.timeStamp,
              'nonceStr': payment.nonceStr,
              'package': payment.package,
              'signType': 'MD5',
              'paySign': payment.paySign,
              'success': function (res) {
                var orderInfo = wx.getStorageSync('FASTORDERNO') || {};

                orderInfo.orderNo = orderNo;
                orderInfo.paid = true;
                orderInfo.payTime = new Date();
                orderInfo.totalFee = payment.totalFee;
                orderInfo.storeId = storeId;

                wx.setStorageSync("FASTORDERNO", orderInfo);

                var orderTime = wx.getStorageSync('FASTORDERTIME') || {};
                orderTime.used = true;
                wx.setStorageSync("FASTORDERTIME", orderTime);

                shoppingCart.clear();

                self.setData({
                  isPaying: false
                });

                wx.redirectTo({
                  url: '/pages/fast/orderhistory/order?orderno=' + orderNo
                })

                // wx.navigateTo({
                //   url: '/pages/fast/orderhistory/order?orderno=' + orderNo
                // });
              },
              'fail': function (res) {
                self.setData({
                  isPaying: false
                });
              },
              'complete': function (res) {
              },
            });
        }
        else {
          self.setData({
            isPaying: false
          });

          wx.showModal({
            title: '提示',
            content: res.message,
            showCancel: false
          });
        }
      },
      (err) => {
        self.setData({
          isPaying: false
        });

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
      },
      null
    );
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  pad: function (n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  },

  updateTime: function (time) {
    time = Math.floor(time);

    if (time <= 0) {
      clearInterval(_expireTimer);
      _expireTimer = null;
    }

    if (time <= 0) {
      this.setData({
        remainingTime: "--:--",
        timeout: true
      });

      this.selectTimeAgain();

      return;
    }

    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;

    this.setData({
      remainingTime: "" + this.pad(minutes, 2) + ":" + this.pad(seconds, 2)
    });
  },

  startTimer: function (expire) {
    if (_expireTimer !== null) {
      clearInterval(_expireTimer);
      _expireTimer = null;
    }

    var expireTime = null;

    if (expire !== null && expire.length > 18) {
      var parts = expire.split(' ');

      if (parts.length === 2) {
        var dateParts = parts[0].split('-');
        var timeParts = parts[1].split(':');
        //console.log("timeParts", dateParts, timeParts);
        expireTime = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10)
          , parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), parseInt(timeParts[2], 10))
      }
    }

    if (!expireTime) {
      expireTime = new Date();
    }

    //console.log("expireTime", expireTime);

    var self = this;

    _expireTimer = setInterval(function () {
      var timeNow = new Date();
      var seconds = (expireTime.getTime() - timeNow.getTime()) / 1000;
      self.updateTime(seconds);
    }, 1000);
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
})