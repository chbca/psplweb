/**
 * 转换地址数据
 * */ 
function replacePhone(arr,isreplace){
  var newAddr =[]
  for(let i = 0 ; i < arr.length; i++){
    if(isreplace){
      let phone = arr[i].phone
      arr[i].phone = phone.replace(phone.substring(3,7),'****')
    }
    newAddr[i] = arr[i].name + ' ' + arr[i].phone + '\n' + arr[i].province + arr[i].city + arr[i].addr
  }
  
  return newAddr
}

module.exports = {
  replacePhone : replacePhone
}
