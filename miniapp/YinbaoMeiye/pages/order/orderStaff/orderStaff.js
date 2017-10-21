// pages/order/orderStaff/orderStaff.js
const app = getApp();
var px2rpx = 2, windowWidth = 375, startX = -1, startTime = -1, aboutToScroll, itemWidth = 0.74;

var defaultStaffPhoto = 'http://imgw.pospal.cn/we/mini/store/staff.png';
const appointmentService = require('../../../modules/services/appointmentService.js');
const utilDate = require('../../../utils/utilDate.js');
var serviceUid = null;

Page({

  data: {
    staffLoaded: false,
    isShowStaffList: true,
    staffs: [],
    dates: [],
    startOfDate: null,
    endOfDate: null,
    timeRanges: [],
    timeSlotsLoaded: false,

    scrollCategoryLeft: 0,
    scrollDetailsLeft: 0,
    toDetailsView: '',
    detailsIndex: 0,

    selectedDate: null,
    timeTapIdx: 0,
    timeIndex: 0,
    hasTimeSlots: false,
    hasStaffs: false,
  },

  onLoad: function (options) {
    windowWidth = wx.getSystemInfoSync().windowWidth;

    if (options.storeid) {
      app.setStoreId(options.storeid);
    }

    if (options.product) {
      serviceUid = options.product;
    }

    this.loadStaffs();

    var today = new Date();
    var endOfDate = new Date();
    endOfDate.setDate(endOfDate.getDate() + 7);

    var timeRanges = this.createDateRange(today, 3, true);
    this.setData({
      startOfDate: today,
      endOfDate: endOfDate,
      timeRanges: timeRanges
    });

    this.loadTimeSlots(timeRanges[0]);
  },


  loadStaffs: function () {
    app.authRequest('wxapi/appointment/FindStaffs',
      {
        storeId: app.storeId(),
        serviceUid: serviceUid
      },
      (res) => {
        if (res.successed) {

          if (res.staffs.length == 0) {
            this.setData({
              staffLoaded: true,
              hasStaffs: false,
            });
            
            return;
          }

          res.staffs.forEach(function (staff) {
            staff.PhotoPath = staff.PhotoPath || defaultStaffPhoto;
            staff.Tags = staff.TagNames.join('; ');
          });

          this.setData({
            staffLoaded: true,
            hasStaffs: true,
            staffs: res.staffs
          });
        }
        else {
          wx.showModal({
            title: '提示',
            content: '网络错误，请稍候再试或联系客服。',
            showCancel: false
          });
        }
      }
    );
  },

  toTimeSlots: function (res) {
    var timeSlots = [];

    for (var i in res.times) {
      timeSlots.push(res.times[i]);
    }

    return timeSlots
  },

  loadTimeSlots: function (selectedRange) {
    let storeId = app.storeId();

    app.authRequest('wxapi/appointment/FindServiceTimes',
      {
        storeId: storeId,
        day: selectedRange.dateFormat,
        serviceUid: serviceUid
      },
      (res) => {
        if (res.successed) {
          //console.log(res);
          var timeSlots = this.toTimeSlots(res);
          var newTimeRanges = [];
          //console.log(timeSlots);
          var hasTimeSlots = false;

          for (var i in timeSlots) {
            if (timeSlots[i].available) {
              hasTimeSlots = true;
              break;
            }
          }

          this.data.timeRanges.forEach(function (timeRange) {
            //console.log(timeRange, selectedRange);

            if (timeRange.dateFormat === selectedRange.dateFormat) {
              timeRange.timeSlots = timeSlots;
              timeRange.loaded = true;
            }

            newTimeRanges.push(timeRange);
          });

          //console.log(newTimeRanges);

          this.setData({
            timeRanges: newTimeRanges,
            timeSlotsLoaded: true,
            hasTimeSlots: hasTimeSlots
          });
        }
        else {
          wx.showModal({
            title: '提示',
            content: '网络错误，请稍候再试或联系客服。',
            showCancel: false
          });
        }
      },
      (err) => {
        wx.showModal({
          title: '提示',
          content: '网络错误，请稍候再试或联系客服。',
          showCancel: false
        });
      },
      null
    );
  },

  createDateRange: function (dateStart, numOfDays, isToday = false) {
    var arr = []

    for (var i = 0; i < numOfDays; i++) {
      var b = new Date(dateStart)
      b.setDate(b.getDate() + i);
      arr.push(b);
    }

    var dates = [
      {
        dateFormat: utilDate.formatDate(arr[0]),
        shortFormat: utilDate.formatMonthDate(arr[0]),
        loaded: false,
        timeSlots: [],
        localName: isToday ? '今天' : ""
      },
      {
        dateFormat: utilDate.formatDate(arr[1]),
        shortFormat: utilDate.formatMonthDate(arr[1]),
        loaded: false,
        timeSlots: [],
        localName: isToday ? '明天' : ""
      },
      {
        dateFormat: utilDate.formatDate(arr[2]),
        shortFormat: utilDate.formatMonthDate(arr[2]),
        loaded: false,
        timeSlots: [],
        localName: isToday ? '后天' : ""
      },
    ]

    return dates
  },

  onShow: function () {

  },

  updateScrollPosition: function (index) {
    if (aboutToScroll !== null) {
      clearTimeout(aboutToScroll);
      aboutToScroll = null;
    }

    var self = this;
    aboutToScroll = setTimeout(function () {
      self.setData({
        scrollDetailsLeft: index * windowWidth * itemWidth,
        detailsIndex: index
      })
    }, 100);
  },

  touchDetailsStart: function (e) {
    var touch = e.changedTouches[0];
    //console.log('touchDetailsStart', touch)
    startX = touch.pageX;
    startTime = e.timeStamp;
  },

  touchDetailsMove: function (e) {
    // console.log("touchDetailsMove", e);

    var touch = e.changedTouches[0];
    var deltaX = touch.pageX - startX;
    var index = this.data.detailsIndex;
    var left = index * windowWidth * itemWidth - deltaX;

    this.setData({
      scrollDetailsLeft: left > 0 ? left : 0,
    })
  },

  touchDetailsEnd: function (e) {
    //console.log("touchDetailsEnd", e);

    var touch = e.changedTouches[0];
    var deltaX = touch.pageX - startX;
    var deltaTime = e.timeStamp - startTime;

    //console.log("touch end", deltaX, deltaTime)    

    if (deltaX > 20) {
      var index = this.data.detailsIndex - 1;

      if (index < 0) {
        index = 0;
      }

      //console.log("move right", index);
      this.updateScrollPosition(index);
    }
    else if (deltaX < - 20) {
      var index = this.data.detailsIndex + 1;

      if (index >= this.data.staffs.length) {
        index = this.data.staffs.length - 1;
      }

      //console.log("move left", index);
      this.updateScrollPosition(index);
    }
    else {
      console.log("move small", index, e.target.dataset);
      this.updateScrollPosition(this.data.detailsIndex);
      
      if (e.target.dataset.uid) {
        //console.log("touch add", e.target.dataset.productid);
        wx.navigateTo({
          url: '/pages/order/staff/staff?uid=' + e.target.dataset.uid,
        })
      }      
    }
    //console.log("touchDetailsEnd", deltaX, this.data.detailsIndex, this.data.scrollDetailsLeft);
  },

  bindShowStaffList: function () {
    var isShowStaffList = this.data.isShowStaffList
    this.setData({
      isShowStaffList: !isShowStaffList
    })
  },

  bindDateChange: function (e) {
    // log(e.detail.value)
    var selectedDate = new Date(e.detail.value)
    var timeRanges = this.createDateRange(selectedDate, 3, false);

    this.setData({
      timeRanges: timeRanges
    })

    this.loadTimeSlots(timeRanges[0]);
  },

  bindSelectData: function (e) {
    // log(e.currentTarget.dataset.timetapidx)
    var index = e.currentTarget.dataset.timetapidx

    if (typeof index !== "undefined") {
      var timeRange = this.data.timeRanges[index];

      if (timeRange.loaded) {
        this.setData({
          timeTapIdx: index,
          timeIndex: 0
        })
      }
      else {
        this.setData({
          timeTapIdx: index,
          timeIndex: 0,
          timeSlotsLoaded: false,
        });

        this.loadTimeSlots(timeRange);
      }
    }
  },

  bindStaff: function (e) {
    // log(e.currentTarget.dataset.index)
    var index = e.currentTarget.dataset.index
    this.setData({
      detailsIndex: index
    })
  },

  bindSelectTime: function (e) {
    //console.log(e.currentTarget.dataset.timeindex)
    var index = e.currentTarget.dataset.timeindex

    if (typeof index !== "undefined") {
      this.setData({
        timeIndex: index,
      })
    }
  },

  bindShowProductDetails: function () {
  },

  goVerifyPay: function () {
    if (this.data.timeSlotsLoaded) {
      var validated = true;
      var appt = appointmentService.getPendingAppointment();

      if (validated) {
        var staff = this.data.staffs[this.data.detailsIndex];

        if (typeof staff === "undefined") {
          validated = false;
        }
        else {
          appt.staff = staff;
        }
      }

      if (!validated) {
        wx.showModal({
          title: '提示',
          content: '请选择技师',
          showCancel: false
        });

        return;
      }

      var timeRange = this.data.timeRanges[this.data.timeTapIdx];
      if (typeof timeRange === "undefined") {
        validated = false;
      }
      else {
        appt.timeRange = timeRange.dateFormat;
      }

      if (validated) {
        var timeSlot = timeRange.timeSlots[this.data.timeIndex];
        if (typeof timeSlot === "undefined") {
          validated = false;
        }
        else {
          appt.timeSlot = timeSlot.name;
        }
      }

      if (!validated) {
        wx.showModal({
          title: '提示',
          content: '请选择预约时间',
          showCancel: false
        });

        return;
      }      

      appointmentService.setPendingAppointment(appt);      

      wx.navigateTo({
        url: '/pages/order/verifyPay/verifyPay',
      });
    }
  },

  goStaff: function (e) {
    var uid = e.currentTarget.dataset.uid;

    wx.navigateTo({
      url: '/pages/order/staff/staff?uid=' + uid,
    })
  },
})