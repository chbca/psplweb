// pages/heartSay/giftDetails/giftDetails.js
Page({


  data: {

    time: '2017.09.09-2017.09.3',
    price: '99.00',
    useText: '享受店内所有饮品8折优惠，活动商品不叠加折扣。会员生日当天门店消费享专属礼物。享受店内所有商品8折优惠，活动商品不叠加折扣。会员生日当天门店消费享专属礼物。享受店内所有商品8折优惠，活动商品不叠加折扣。会员生日当天门店消费享专属礼物。享受店内所有饮品8折优惠，活动商品不叠加折扣。会员生日当天门店消费享专属礼物。享受店内所有商品8折优惠，活动商品不叠加折扣。会员生日当天门店消费享专属礼物。享受店内所有商品8折优惠，活动商品不叠加折扣。会员生日当天门店消费享专属礼物。享受店内所有饮品8折优惠，活动商品不叠加折扣。',
    isShowPrice: true,
  },


  onLoad: function (options) {
    var isShowPrice = !options.isPrice
    this.setData({
      isShowPrice: isShowPrice,
    })
  },



  onReady: function () {

  },


  onShow: function () {


  },


})