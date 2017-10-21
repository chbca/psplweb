//app.js

//本地开发环境
// var _defaultStoreId = 172654;
// var _storeId = 172654;
// var _defaultStoreId = 27414;
// var _storeId = 27414;
// const SERVER_BASE = "http://localhost:29429/"

//测试环境, 用户帐号 adasun101, 密码123123
// var _defaultStoreId = 27414;
// var _storeId = 27414;
// const SERVER_BASE = "https://wxservice-dev.pospal.cn/"

// Staging/正式环境
//wxchengxu
// var _defaultStoreId = 3146913;
// var _storeId = 3146913;
//qhyuyue

var _defaultStoreId = 3203541;
var _storeId = 3203541;
const SERVER_BASE = "https://wxservice-stg.pospal.cn/"

var _storeInfo = null;
var _customer = null
var _token = null
var _debug = false;
var _hasOpenid = null;
var _storeSelected = false;
var _appointment = {};

App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', null);  
    //reset user info
    //wx.setStorageSync('userInfo', {});  

    this.loadSessionToken();
    this.loadUserInfo();
  },

  checkOpenid: function (callback, isForce) {
    if (isForce === true || _hasOpenid === null) {
      this.renewOpenid(callback);
      return;
    }

    if (callback) {
      callback();
    }
  },

  renewOpenid: function (callback) {
    var that = this;
    wx.login({
      success: function (result) {
        if (result.code) {
          //发起网络请求

          that.authRequest("/wxapi/customeraccount/Auth",
            {
              storeId: that.storeId(),
              code: result.code,

            },
            (res) => {
              //console.log(res);
              that.saveVisitorInfo({ hasOpenid: res.hasOpenid, token: res.accessToken });
              
              if (callback) {
                callback(res);
              }
            });
        } else {
          //console.log('获取用户登录态失败！' + res.errMsg);
          wx.showModal({
            content: '无法获取用户信息，不能进行预约!',
            showCancel: false
          });

          if (callback) {
            callback();
          }
        }
      },
      fail: function () {
        wx.showModal({
          content: '无法获取用户信息，不能进行预约!',
          showCancel: false
        });
        if (callback) {
          callback();
        }
      }
    });
  },

  setToast: function (title) {
    this.toastMessage = { title: title }
  },

  resetToast: function (title) {
    this.toastMessage = { title: '' }
  },

  showToast: function () {
    let that = this;

    if (that.toastMessage && that.toastMessage.title) {
      wx.showToast({
        title: that.toastMessage.title,
        icon: 'success',
        complete: function (res) {
          that.resetToast();
        }
      })
    }
  },

  needRefresh: function () {
    return this.appState.needRefresh === true;
  },

  setRefresh: function () {
    this.appState.needRefresh = true;
  },

  resetRefresh: function () {
    this.appState.needRefresh = false;
  },

  getBaseUrl: function () {
    return SERVER_BASE;
  },

  loadUserInfo: function () {
    var userInfo = wx.getStorageSync('userInfo') || {}

    if (userInfo.hasOpenid) {
      _hasOpenid = true;
    }

    return true;
  },

  setSessionToken(token) {
    _token = token;
    wx.setStorage({
      key: 'SESSIONTOKEN',
      data: token,
      success: function (res) {
      }
    });
  },

  loadSessionToken: function () {
    var token = wx.getStorageSync('SESSIONTOKEN') || null

    if (token) {
      _token = token;
    }
  },

  saveVisitorInfo: function (visitorInfo, callback) {
    _hasOpenid = visitorInfo.hasOpenid;

    var userInfo = wx.getStorageSync('userInfo') || {};
    userInfo.hasOpenid = _hasOpenid;

    wx.setStorage({
      key: 'userInfo',
      data: userInfo,
      success: function (res) {
        if (callback && typeof callback == 'function') {
          callback(res)
        }
      }
    });
  },

  saveUserInfo: function (userInfo, callback) {
    _customer = userInfo.customer;

    if (userInfo.token) {
      this.setSessionToken(userInfo.token);
    }

    var oldInfo = wx.getStorageSync('userInfo') || {};
    userInfo.hasOpenid = null;

    wx.setStorage({
      key: 'userInfo',
      data: userInfo,
      success: function (res) {
        if (callback && typeof callback == 'function') {
          callback(res)
        }
      }
    });
  },

  logout: function () {
    this.authRequest('wxapi/customeraccount/logoff',
      {
      },
      (res) => {
        this.doLogout();
      },
      (res) => {
        this.doLogout();
      }
      , "正在退出..."
    )
  },

  doLogout: function () {
    _customer = null;
    _token = null;
    wx.clearStorage();

    wx.redirectTo({
      url: '/pages/signon/signon'
    })
  },

  getCustomer: function () {
    return _customer;
  },

  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },

  setStoreId: function (storeId, callback) {
    if (storeId) {
      if (storeId !== _storeId) {
        _storeInfo = null;
        _storeId = storeId;
        _hasOpenid = null;
      }

      _storeSelected = true;
    }
  },

  getStoreInfo: function (callback, refresh, autoSwitch) {
    var needRefresh = _storeInfo == null || !!refresh;

    if (!needRefresh) {
      if (callback) {
        callback(_storeInfo);
      }

      return;
    }

    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        var latitude = res.latitude;
        var longitude = res.longitude;
        this.authRequest('wxapi/store/GetStoreDataFast',
          {
            storeId: this.storeId(),
            latitude: latitude,
            longitude: longitude,
            autoSelect: autoSwitch === true
          },
          (res) => {
            if (res.successed) {
              var result = res.result;

              var distance = result.distanceInMeter;
              if (distance > 0) {
                distance = (distance / 1000).toFixed(1);
              }

              var storeInfo = {
                distance: distance,
                storeLogo: result.logoUrl,
                storeName: result.storeName,
                address: result.address,
                tel: result.tel,
                banners: result.Banners,
                isCustomer: result.IsCustomer,
                isOutBizTime: result.IsOutBizTime,
                isBizClosed: result.IsBizClosed
              }

              if (autoSwitch === true && result.storeUserId > 0) {
                //console.log("storeId from server" + result.storeUserId);
                _storeId = result.storeUserId;
              }

              _storeInfo = storeInfo;

              if (callback) {
                callback(storeInfo);
              }
            }
          },
          (err) => {
          },
          null
        );
      },
      fail: (res) => {
        var that = this;
        wx.showModal({
          content: '无法使用你的位置信息选择门店。',
          showCancel: false,
          complete: function (resPos) {
            that.authRequest('wxapi/store/GetStoreDataFast',
              {
                storeId: that.storeId(),
              },
              (res) => {
                if (res.successed) {
                  var result = res.result;

                  var storeInfo = {
                    distance: 0,
                    storeLogo: result.logoUrl,
                    storeName: result.storeName,
                    address: result.address,
                    tel: result.tel,
                    allowance: result.allowance
                  }

                  _storeInfo = storeInfo;

                  if (callback) {
                    callback(storeInfo);
                  }
                }
              },
              (err) => {
              },
              null
            );
          }
        })
      }
    })
  },

  globalData: {
    userInfo: null
  },

  toastMessage: {
    title: ''
  },

  listeners: [],

  appState: {
    needRefresh: false,
  },

  storeId: function () {
    return _storeId;
  },

  dispatch() {
    this.listeners.forEach(listener => listener());
  },

  getState() {
    return this.appState;
  },

  setState(nextState) {
    this.appState = nextState;
    this.dispatch();
  },

  subscribe(listener) {
    var that = this;
    that.listeners.push(listener);
    return function unsubcribe() {
      let listeners = that.listeners;
      listeners.splice(listeners.indexOf(listener), 1);
    };
  },

  authRequest: function (actionPath, data, callback, callbackError, message) {
    if (message !== null) {
      wx.showToast({
        title: message || '加载中',
        icon: 'loading',
        duration: 60000
      })
    }
    var that = this;
    wx.request({
      url: SERVER_BASE + actionPath,
      method: 'POST',
      data: data,
      success: function (res) {
        if (_debug) {
          console.log(res);
        }

        if (!(res.statusCode >= 200 && res.statusCode < 300)) {
          if (callbackError && typeof callbackError === 'function') {
            callbackError(res)
          }
          else {
            that.showError();
          }
        }

        if (res.header && res.header.VISITORSESSION) {
          console.log("VISITORSESSION from header");
          that.setSessionToken(res.header.VISITORSESSION);
        }
        else if (res.data && res.data.VISITORSESSION) {
          console.log("VISITORSESSION from data");
          that.setSessionToken(res.data.VISITORSESSION);
        }

        if (res.data && res.data.NOAUTHORIZED) {
          wx.redirectTo({
            url: '/pages/signon/signon'
          });
          return;
        }

        if (callback && typeof callback === 'function') {
          callback(res.data)
        }
      },
      header: {
        'PSPLVISITORID': _token || "",
        'STOREID': data.storeId || that.storeId(),
        'PSPLVISITORAUTO': 'API',
        'POSPALSTOREMODE': 'PickedUp|7'
      },
      fail: function (res) {
        //console.log(res);
        that.showError();

        if (callbackError && typeof callbackError === 'function') {
          callbackError(res)
        }
      },
      complete: function () {
        if (message !== null) {
          wx.hideToast();
        }
      }
    })
  },

  request: function (actionPath, data, callback, callbackError, message) {
    if (message !== null) {
      wx.showToast({
        title: message || '加载中',
        icon: 'loading',
        duration: 10000
      })
    }
    var that = this;
    wx.request({
      url: SERVER_BASE + actionPath,
      method: 'POST',
      data: data,
      success: function (res) {
        if (_debug) {
          console.log(res);
        }

        if (callback && typeof callback === 'function') {
          callback(res.data)
        }
      },
      fail: function (res) {
        // console.log(res);
        that.showError();

        if (callbackError && typeof callbackError === 'function') {
          callbackError(res)
        }
      },
      complete: function () {
        if (message !== null) {
          wx.hideToast();
        }
      }
    })
  },

  showError(error) {
    wx.showModal({
      title: error ? error : '网络错误，请稍后再试试',
      showCancel: false
    });
  }
})