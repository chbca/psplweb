// pages/order/order.js
var QR = require("../../../utils/qrcode.js");
const app = getApp();

var _expireTimer = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    storeInfo: {},
    maskHidden: true,
    imagePath: '',
    orderNo: '',
    ticketSummary: '',
    formattedTime: '-',
    showDetails: false,
    formattedTime_1: '-'
  },

  //适配不同屏幕大小的canvas
  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 400;//不同屏幕下canvas的适配比例；设计稿是750宽
      var width = res.windowWidth / scale;
      var height = width;//canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }

    return size;
  },

  createQrCode: function (url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    QR.qrApi.draw(url, canvasId, cavW, cavH);
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

    var size = this.setCanvasSize();//动态设置画布大小
    var initUrl = orderNo;
    this.createQrCode(initUrl, "mycanvas", size.w, size.h);

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

    if (options.storeid) {
      app.setStoreId(options.storeid);
    }

    app.getStoreInfo((storeInfo) => {
      this.setData({
        storeInfo: storeInfo
      });
    });

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

        //console.log(res);

        if (res.successed) {
          var orderSummary = res.orderSummary;
          var summaries = [];

          for (var i in orderSummary.ticketItems) {
            var item = orderSummary.ticketItems[i];

            if (summaries.length > 0) {
              // if (this.data.showDetails) {
              summaries.push('；');
              // }
              // else {
              //   summaries.push('...');
              //   break;
              // }
            }

            summaries.push(item.name + "*" + item.quantity);

            if (item.ticketItemAttributes) {
              for (var j in item.ticketItemAttributes) {
                summaries.push('[', item.ticketItemAttributes[j].attributeName, ']');
              }
            }
          }

          var summary = summaries.join('') + " ￥" + orderSummary.totalAmount;
          //剪切时间。
          var formattedTime = res.formattedTime.slice(11)

          this.setData({
            orderNo: orderNo,
            daySeq: res.orderSummary.daySeq,
            ticketSummary: summary,
            formattedTime: res.formattedTime,
            formattedTime_1: formattedTime,
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

  requestForRefund: function () {
    wx.navigateTo({
      url: '/pages/fast/orderreturn/order?orderno=' + this.data.orderNo
    });
  },

  shareProductOrder: function () {
    if (wx.showShareMenu) {
      console.log("share");

      wx.showShareMenu();
    }
  },
  tapJump: function () {
    wx.navigateTo({
      url: '/pages/fast/share/share'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  toggleDetails: function () {
    this.setData({
      showDetails: !this.data.showDetails
    });
  },

  onShow: function () {
    this.startTimer();
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

  startTimer: function (expire) {
    if (_expireTimer !== null) {
      clearInterval(_expireTimer);
      _expireTimer = null;
    }

    var self = this;
    _expireTimer = setInterval(function () {
      self.checkStatus();
    }, 2500);
  },

  checkStatus() {
    //console.log(this.data.orderNo);
    if (!this.data.orderNo) {
      return;
    }

    app.authRequest('wxapi/order/OrderStatus',
      {
        storeId: app.storeId(),
        orderNumber: this.data.orderNo
      },
      (res) => {
        if (res.successed) {
          if (res.status >= 40) {
            wx.showToast({
              duration: 1000
            })

            var url = '/pages/fast/message/message?orderno=' + this.data.orderNo;

            if (wx.reLaunch) {
              wx.reLaunch({
                url: url
              })
            }
            else {
              wx.redirectTo({
                url: url
              })
            }
          }
        }
      },
      (err) => {
      },
      null
    );
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
