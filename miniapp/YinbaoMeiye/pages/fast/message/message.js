const app = getApp();

// pages/message/message.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    imagePath: '',
    orderNo: '',
    ticketSummary: '',
    formattedTime: '-'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var storeId = options.storeid;
    var orderNo = options.orderno;
    // var storeId = 27414;
    // var orderNo = '20170702223334088104';

    app.authRequest('wxapi/order/OrderDetails',
      {
        storeId: storeId || app.storeId(),
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

          this.setData({
            orderNo: orderNo,
            daySeq: res.orderSummary.daySeq,
            ticketSummary: summary,
            loading: false,
            storeId: storeId
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

  buyAgain: function() {
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
  },

  onShareAppMessage: function (res) {
    return {
      title: '在线预约，快人一步，到店自取，告别排队',
      path: '/pages/fast/timeslot/timeslot',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
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