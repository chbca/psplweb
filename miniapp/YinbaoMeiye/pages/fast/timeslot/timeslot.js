const app = getApp();
const utilDate = require('../../../utils/utilDate.js')

var windowWidth = 375, startX = -1, startTime = -1, aboutToScroll, itemWidth = 1;

function initHours(startOfHours) {
  var timeRanges = [];

  for (var i = startOfHours; i <= 23; i++) {
    var part1 = (i < 10 ? '0' : '') + i + ':00'
    var part2 = (i < 9 ? '0' : '') + (i + 1) + ':00'

    timeRanges.push(part1 + '-' + part2);
  }

  return timeRanges;
}

var formateTime = function (timeSlotTime) {
  var str1 = ''
  var str2 = ''

  var h = timeSlotTime.getHours()
  var m = timeSlotTime.getMinutes()

  if (h < 10) {
    str1 = '0' + h
  } else {
    str1 = h
  }

  if (m < 10) {
    str2 = '0' + m
  } else {

    str2 = m
  }

  return str1 + ":" + str2;
}

//Empty 节点数据。
function makeTimesAll(startOfHours, timeRanges) {
  var sul = [], date = new Date();

  for (var i = startOfHours; i <= 23; i++) {
    date.setMinutes(0);
    date.setHours(i + 1);
    var range2 = formateTime(date);
    date.setHours(i);
    var range1 = formateTime(date);

    var times = [];
    for (var j = 0; j < 6; j++) {
      date.setMinutes(j * 10);
      var minute1 = formateTime(date);

      date.setMinutes((j + 1) * 10);
      var minute2 = formateTime(date);

      times.push({
        range: range1 + '-' + range2,
        name: minute1 + '-' + minute2,
        available: -1,
        total: 2,
        count: 0,
      })
    }

    sul.push({
      loaded: false,
      timeSlots: times,
      name: timeRanges[i]
    })
  }

  return sul;
}

var prevSlide = 0;

Page({
  data: {
    loading: true,
    loaded: false,
    timeRanges: [],
    hasData: true,
    allTimes: [],
    selectedRange: 0,
    timeSlots: [],
    selectedSlot: '',
    toRangeView: null,
    isTryBooking: false,
    storeInfo: {}
  },

  onLoad: function (options) {
    console.log("timeslot onLoad");
    var that = this;

    var startOfHours = (new Date()).getHours();

    if (startOfHours < 4) {
      startOfHours = 4;
    }

    var timeRanges = [];
    var timeRanges = initHours(startOfHours);
    var allTimes = makeTimesAll(startOfHours, timeRanges);

    that.setData({
      timeRanges: timeRanges,
      allTimes: allTimes,
    });

    //app.setStoreId(3150397);
    var autoSwitch = true;

    if (options.storeid) {
      app.setStoreId(options.storeid);
      autoSwitch = false;
    }

    app.checkOpenid(function () {
      app.getStoreInfo((storeInfo) => {
        //console.log("storeInfo.distanceInMeter", storeInfo.distance)

        if (parseInt(storeInfo.distance, 10) > 10) {
          wx.showModal({
            content: '当前距离门店过远，请注意',
            showCancel: false,
            success: function (res) {
            }
          });
        }

        that.setData({
          storeInfo: storeInfo
        });

        that.moveToRange(0);
      }, false, autoSwitch);
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("timeslot onShow");
    var that = this;
    var shallCheckOrderTime = true;

    if (shallCheckOrderTime) {
      wx.getStorage({
        key: 'FASTORDERTIME',
        success: function (res) {
          var prevTimeSlot = res.data;

          if (prevTimeSlot && prevTimeSlot.createTime && !prevTimeSlot.used) {

            app.authRequest('wxapi/appointment/CancelSlot',
              {
                storeId: app.storeId(),
                uid: prevTimeSlot.uid
              }
            );

            // var preApptDateTime = new Date(prevTimeSlot.createTime);
            // //10 minutes 
            // preApptDateTime.setTime(preApptDateTime.getTime() + 10 * 60000);

            // if (preApptDateTime > new Date()) {
            //   setTimeout(function () {
            //     wx.showModal({
            //       content: '返回将失去名额，确定不要这个名额了吗？',
            //       success: function (res) {
            //         if (res.confirm) {
            //           wx.setStorageSync("FASTORDERTIME", {});

            //           app.authRequest('wxapi/appointment/CancelSlot',
            //             {
            //               storeId: app.storeId(),
            //               uid: prevTimeSlot.uid
            //             }
            //           );

            //           if (wx.reLaunch) {
            //             wx.reLaunch({
            //               url: '/pages/fast/timeslot/timeslot'
            //             })
            //           }
            //           else {
            //             wx.redirectTo({
            //               url: '/pages/fast/timeslot/timeslot'
            //             })
            //           }

            //         } else {
            //           wx.navigateTo({
            //             url: '/pages/fast/shopping/fast'
            //           });
            //         }
            //       }
            //     });
            //   }, 500);
            //   return;
            // }
          }
        }
      });
    }
  },

  toTimeSlots: function (res) {
    var timeSlots = [];

    for (var i in res.times) {
      timeSlots.push(res.times[i]);
    }

    return timeSlots
  },

  findFirstAvailable: function (timeSlots) {
    var selectedSlot = '';

    var count = 0;
    for (var i in timeSlots) {
      if (timeSlots[i].available) {
        selectedSlot = timeSlots[i].name;
        break;
      }

      count++;
    }

    return selectedSlot;
  },

  loadTimeSlots: function (selectedRange) {
    let storeId = app.storeId();

    this.setData({
      loading: true,
      selectedRange: selectedRange,
    });

    app.authRequest('wxapi/appointment/findtimeslots',
      { storeId: storeId, range: this.data.timeRanges[selectedRange] },
      (res) => {
        if (res.successed) {
          //console.log(res);
          var timeSlots = this.toTimeSlots(res);
          var selectedSlot = this.findFirstAvailable(timeSlots);

          var allTimes = this.data.allTimes;
          allTimes[selectedRange].timeSlots = timeSlots;

          this.setData({
            loading: false,
            loaded: true,
            allTimes: allTimes,
            selectedSlot: selectedSlot
          });
        }
        else {
          this.setData({
            loading: false,
          });

          wx.showModal({
            title: '提示',
            content: '网络错误，请稍候再试或联系客服。',
            showCancel: false
          });
        }
      },
      (err) => {
        this.setData({
          loading: false,
        });

        wx.showModal({
          title: '提示',
          content: '网络错误，请稍候再试或联系客服。',
          showCancel: false
        });
      },
      null
    );
  },

  makeAppointment() {
    let that = this;

    var slot = this.data.selectedSlot;
    //wx.setStorageSync("FASTORDERNO", {});

    if (!slot) {
      wx.showModal({
        content: '请选择个时间段',
        showCancel: false,
        confirmText: '好',
        confirmColor: '#5a5a5a',
        success: function (res) {
        }
      });

      return;
    }

    this.setData({ isTryBooking: true });
    let remarks = [];
    remarks.push("项目: 限量预约");

    app.authRequest('wxapi/appointment/takeslot',
      {
        storeId: app.storeId(),
        timeSlot: slot,
        remarks: remarks.join("; ")
      },
      (res) => {
        if (res.successed) {
          that.setData({
            isTryBooking: false
          });

          var fastOrderTime = {
            timeSlot: res.timeSlot,
            uid: res.uid,
            reservationTime: res.reservationTime,
            formattedTime: res.formattedTime,
            expire: res.expire,
            createTime: new Date()
          };

          wx.setStorage({
            key: "FASTORDERTIME",
            data: fastOrderTime,
            success: function (res) {
              wx.navigateTo({
                url: '/pages/fast/shopping/fast'
              });
            }
          });
        }
        else {
          if (res.times) {
            var timeSlots = this.toTimeSlots(res);
            var selectedSlot = this.findFirstAvailable(timeSlots);

            var allTimes = this.data.allTimes;
            allTimes[this.data.selectedRange].timeSlots = timeSlots;

            this.setData({
              loading: false,
              isTryBooking: false,
              allTimes: allTimes,
              selectedSlot: selectedSlot
            });
          }
          else {
            that.setData({
              isTryBooking: false
            });
          }

          wx.showModal({
            title: '名额被抢光啦',
            content: '请换个时间段再试',
            showCancel: false,
            confirmText: '好',
            confirmColor: '#5a5a5a',
            success: function (res) {
            }
          })
        }
      },
      (err) => {
        this.setData({
          isTryBooking: false,
        })

        app.showError(err.message);
      }
      , null
    );
  },

  tapTimeRange: function (e) {
    //console.log(e);

    var rangeid = e.target.dataset.rangeid;
    this.moveToRange(rangeid);
  },

  moveToRange: function (rangeid) {
    var targetId;

    if (rangeid < 0) {
      rangeid = 0;
    }

    if (rangeid >= this.data.timeRanges.length) {
      rangeid = this.data.timeRanges.length - 1;
    }

    if (rangeid < 0) {
      this.setData({ loaded: true, hasData: false })
      return;
    }

    if (rangeid > 0 && rangeid < this.data.timeRanges.length) {
      targetId = 't' + (rangeid - 1);
    }
    else {
      targetId = 't' + targetId;
    }

    this.setData({
      toRangeView: targetId,
      selectedRange: rangeid
    })

    this.loadTimeSlots(rangeid);
  },

  confirmAppt: function (event) {
    this.makeAppointment();
  },

  selectTimeSlot: function (event) {
    var timeSlotId = event.currentTarget.dataset.slotid;
    var rangeId = event.currentTarget.dataset.rangeid;

    var timeSlot = this.data.allTimes[rangeId].timeSlots[timeSlotId];

    if (!timeSlot.available) {
      return;
    }

    this.setData({ selectedSlot: timeSlot.name });
  },

  swipeTimes: function (e) {
    var current = e.detail.current;
    this.moveToRange(current);
  },

  touchDetailsStart: function (e) {
    var touch = e.changedTouches[0];
    startX = touch.pageX;
    startTime = e.timeStamp;
  },

  touchDetailsMove: function (e) {
    //console.log("touchDetailsMove", e);

    var touch = e.changedTouches[0];
    var deltaX = touch.pageX - startX;
    var index = this.data.detailsIndex;
    var left = index * windowWidth * itemWidth - deltaX;
  },

  touchDetailsEnd: function (e) {
    //console.log("touchDetailsEnd", e);

    var touch = e.changedTouches[0];
    var deltaX = touch.pageX - startX;
    var deltaTime = e.timeStamp - startTime;

    if (deltaX > 20) {
      this.moveToRange(this.data.selectedRange - 1);
    }
    else if (deltaX < - 20) {
      this.moveToRange(this.data.selectedRange + 1);
    }
    else {

    }
  },

  onShareAppMessage: function (res) {
    return {
      title: '银豹收银演示',
      path: '/pages/fast/timeslot/timeslot',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
});
