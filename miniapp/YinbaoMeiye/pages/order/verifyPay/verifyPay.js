// pages/order/verifyPay/verifyPay.js
const app = getApp();

const appointmentService = require('../../../modules/services/appointmentService.js');
const utilDate = require('../../../utils/utilDate.js');

var _countDownTimer = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopName: '',
    appointmentTime: '',
    staffName: '',
    productName: '',
    productPrice: '',
    customer: null,
    customerLoaded: false,
    requiredCode: true,    
    customerName: '',
    customerTel: '',
    securityCode: '',
    isTimeDowm: false,
    time: 30,
    isPaying: false
  },

  onLoad: function (options) {
    var pendingAppt = appointmentService.getPendingAppointment();

    app.getStoreInfo((storeInfo) => {
      this.setData({
        shopName: storeInfo.storeName,
        appointmentTime: pendingAppt.timeRange + " " + pendingAppt.timeSlot,
        timeRange: pendingAppt.timeRange,
        timeSlot: pendingAppt.timeSlot,
        staffName: pendingAppt.staff.Name,
        staffUid: pendingAppt.staff.Uid,
        productName: pendingAppt.product.productDisplayName,
        productUid: pendingAppt.product.uid,
        productPrice: pendingAppt.product.sellPrice
      });
    });

    this.loadCustomerInfo();
  },

  loadCustomerInfo: function () {
    app.authRequest('wxapi/customeraccount/FindLoginInfo',
      {
        storeId: app.storeId()
      },
      (res) => {
        if (res.isLogin) {
          this.setData({
            customer: {
              customerTel: res.phone,
              customerName: res.name,
            },
            customerName: res.name,
            customerTel: res.phone,
            customerLoaded: true,
            requiredCode: false,
          });
        }
        else {
          this.setData({
            customer: null,
            customerLoaded: true,
            requiredCode: true,
          });
        }
      },
      (res) => {
        app.showError(res.message);
      },
      null
    );
  },

  formSubmit: function (e) {
    if (this.data.isRequesting) {
      return;
    }

    var customerName = this.data.customerName;
    var customerTel = this.data.customerTel;
    var securityCode = this.data.securityCode;

    var validation = true;

    if (customerName == '') {
      validation = false;
      wx.showModal({
        title: '请输入姓名',
        showCancel: false
      });

      return;
    }

    if (this.data.requiredCode) {
      if (customerTel == '') {
        validation = false;
      }

      if (securityCode == '') {
        validation = false;
      }

      if (!validation) {
        wx.showModal({
          title: '请输入电话和验证码',
          showCancel: false
        })

        return;
      }
    }

    this.submitToServer();
  },

  submitToServer() {
    let that = this;

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

    let extData = [];
    extData.push("项目: " + (this.data.productName));
    extData.push("人员: " + (this.data.staffName));

    let remarks = [];

    this.setData({
      isPaying: true
    });

    var customerTel = null;
    var securityCode = null;

    if (this.data.requiredCode) {
      customerTel = this.data.customerTel;
      securityCode = this.data.securityCode;
    }    

    app.authRequest('wxapi/appointment/BookService',
      {
        storeId: app.storeId(),
        DateStart: this.data.timeRange + ' ' + this.data.timeSlot + ':00',
        ServiceUid: this.data.productUid,
        StaffUid: this.data.staffUid,
        Remarks: remarks.join("; "),
        ExtData: extData.join("; "),
        CustomerName: this.data.customerName,
        CustomerTel: customerTel,
        securityCode: securityCode
      },
      (res) => {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        else {
          wx.hideToast()
        }

        if (res.successed) {
          var order = {
            orderNo: res.orderNo,
            orderTime: res.orderTime,
            appointmentUid: res.uid
          };

          wx.setStorage({
            key: "FASTORDERNO",
            data: order,
            success: () => {
              this.setData({
                isPaying: false
              });

              wx.redirectTo({
                url: '/pages/order/history/history?apptuid=' + res.uid
              })
            }
          });
        }
        else {
          this.setData({
            isPaying: false
          });

          if (res.errorCode === 1) {
            wx.showModal({
              title: '提示',
              content: "下单时间已经过期，请再次选择时间。",
              showCancel: false
            });
          }
          else {
            wx.showModal({
              title: '提示',
              content: res.message || "无法预约",
              showCancel: false
            });
          }
        }
      },
      (res) => {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        else {
          wx.hideToast()
        }

        this.setData({
          isPaying: false
        })

        app.showError(res.message);
      }
      , null
    );
  },

  bindNameInput: function (e) {
    this.setData({
      customerName: e.detail.value
    })
  },

  bindPhoneInput: function (e) {
    if (this.data.customer !== null) {
      if (e.detail.value !== this.data.customer.customerTel) {
        this.setData({
          customerTel: e.detail.value,
          requiredCode: true
        });   
      }
      else {
        this.setData({
          customerTel: e.detail.value,
          requiredCode: false
        });           
      }      
    }
    else {
      this.setData({
        customerTel: e.detail.value
      })
    }
  },

  bindPwdInput: function (e) {
    this.setData({
      securityCode: e.detail.value
    })
  },

  bindSendCode: function (e) {
    if (this.data.isTimeDowm) {
      wx.showModal({
        title: '不能重复发送注册验证码，请注意查收短信或请稍后重试',
        showCancel: false
      })

      return;
    }

    let customerTel = this.data.customerTel;

    if (customerTel == '') {
      wx.showModal({
        title: '请输入电话号码',
        showCancel: false
      })

      return;
    }

    if (wx.showLoading) {
      wx.showLoading({
      })
    }
    else {
      wx.showToast({
        icon: 'loading',
        duration: 5000
      })
    }

    app.authRequest('wxapi/customeraccount/SendSecurityCodeCode',
      {
        storeId: app.storeId(),
        customerTel: customerTel,
      },
      (res) => {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        else {
          wx.hideToast()
        }

        if (res.Success) {
          wx.showToast({
            title: "验证码已经发送，请注意查收",
            duration: 3000
          });
        }
        else {
          app.showError(res.Message);
        }
      },
      (res) => {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        else {
          wx.hideToast()
        }

        app.showError(res.Message);
      },
      null
    );

    this.timeDowm();
  },

  timeDowm: function () {
    var t = this.data.time
    var that = this

    this.countDown(t, function (time) {
      that.setData({
        isTimeDowm: true,
        time: time
      })
    }, function () {
      that.setData({
        isTimeDowm: false,
        time: t
      })
    })
  },

  countDown: function (time, showTime, overTime) {
    if (_countDownTimer !== null) {
      clearInterval(_countDownTimer);
    }

    var self = this;
    var max = time;

    _countDownTimer = setInterval(function () {
      max--;
      showTime(max);

      if (max <= 0) {
        overTime();
        clearInterval(_countDownTimer);
        _countDownTimer = null;
      }
    }, 1000);
  },

  goOrderErr: function () {
    wx.navigateTo({
      url: '/pages/order/orderErr/orderErr',
    })
  },
})