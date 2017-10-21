const app = getApp();
const utilDate = require('../../utils/utilDate.js')
var apptConfigs = [];
var apptDefaultConfig = {
    startMinute: 9 * 60,
    endMinute: 17 * 60,
    slotMinutes: 10
};

var _pendingAppt = {};

function getPendingAppointment() {
  return _pendingAppt;
};

function setPendingAppointment(appt) {
  _pendingAppt = appt;
};

function loadConfig(options) {
    app.authRequest('wxapi/appointment/findapptconfigs',
        { storeId: app.storeId() }, (res) => {
            if (res.successed) {
                apptConfigs = res.ranges;
                options.success();
            }
            else {
                options.fail();
            }
        },
        (err) => {
            options.fail();
        }, null);
}
function makeTimeRangesOfDay(date, startMinute, labelPrefix = "") {
    var rangeConfigs = findApptConfig(date);

    var ranges = [];
    rangeConfigs.forEach(config => {
        var begin = utilDate.beginOfDate(date);
        var interval = config.slotMinutes > 60 ? config.slotMinutes : 60;
        ranges = ranges.concat(utilDate.timeRanges(utilDate.addMinutes(begin, Math.max(startMinute, config.startMinute)), utilDate.addMinutes(begin, config.endMinute), interval)
            .map(function (range) {
                return {
                    date: utilDate.formatDate(date),
                    range: range,
                    label: `${labelPrefix}${range}`,
                    slotMinutes: config.slotMinutes
                }
            }));
    });
    return ranges;
}
function findRangeOfDay(date){
    var rangeConfigs = findApptConfig(date);
    var startMinute = 60 * 24, endMinute = 0;
    rangeConfigs.forEach((range) => {
      startMinute = Math.min(startMinute, range.startMinute);
      endMinute = Math.max(endMinute, range.endMinute);
    });
    return {
        start: utilDate.addMinutes(utilDate.beginOfDate(date), startMinute),
        end: utilDate.addMinutes(utilDate.beginOfDate(date), endMinute)
    };
}
function findApptConfig(date) {
    var dayType = (((date.getDay()) + 6) % 7) + 1;
    var rangeConfigs = apptConfigs.filter(r => r.dayType == dayType);
    if (rangeConfigs.length == 0) {
        rangeConfigs = apptConfigs.filter(r => r.dayType == 0);
    }
    if (rangeConfigs.length == 0) {
        rangeConfigs.push(apptDefaultConfig);
    }
    else {
        rangeConfigs = rangeConfigs.sort((a, b) => a.startMinute - b.startMinute);
    }
    return rangeConfigs;
}
module.exports = {
    loadConfig,
    makeTimeRangesOfDay,
    findRangeOfDay,
    getPendingAppointment,
    setPendingAppointment   
}