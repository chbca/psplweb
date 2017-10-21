function formatDateTime(date) {
   return formatDate(date) + ' ' + formatTime(date);
}

function formatDate(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return [year, month, day].map(formatNumber).join('-');
}

function formatMonthDate(date) {
  var month = date.getMonth() + 1
  var day = date.getDate()

  return month + "." + day;
}

function formatTime(date) {
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [hour, minute, second].map(formatNumber).join(':')
}

function formatTimeHHMM(date) {
  var hour = date.getHours()
  var minute = date.getMinutes()
  return [hour, minute].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function addMinutes(date, minutes) {
   var result = new Date(date);
   result.setTime(result.getTime() + (minutes*60*1000)); 
   return result;   
}

function addHours(date, hours) {
   var result = new Date(date);
   result.setTime(result.getTime() + (hours*60*60*1000)); 
   return result;   
}

function beginOfDate(date){
  var result = new Date(date);
  result.setMinutes(0);
  result.setHours(0);
  return result;   
}

function hourRange(timeStart, timeEnd, interval) {
  var hourList = [];  

  var count = 0;

  for (var i = timeStart; i<=timeEnd; i=addMinutes(i)) {
    hourList.push(formatTimeHHMM(i));
    count++;
    
    if (count > 100) {
      break;
    }
  }

  return hourList;
}

function timeRanges(timeStart, timeEnd, interval) {
  var ranges = [];

  var count = 0;

  for (var i = timeStart; i < timeEnd; i = addMinutes(i, interval)) {
    ranges.push([formatTimeHHMM(i), formatTimeHHMM(addMinutes(i, interval))].join('-'));
    count++;

    if (count > 100) {
      break;
    }
  }

  return ranges;
}

module.exports = {
  formatDate: formatDate,
  formatMonthDate: formatMonthDate,
  formatTime: formatTime,
  formatTimeHHMM: formatTimeHHMM,
  formatDateTime: formatDateTime,
  addDays : addDays,
  addHours: addHours,
  addMinutes: addMinutes,
  beginOfDate: beginOfDate,
  hourRange: hourRange,
  timeRanges: timeRanges
}
