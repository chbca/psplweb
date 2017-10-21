// pages/order/home/home.js
const app = getApp();

var lookups = {};
var categoriesById = {};
var productsByCategory = {};
const appointmentService = require('../../../modules/services/appointmentService.js');

var defaultBanners = [
  {
    Id: 1,
    ImagePath: 'http://imgw.pospal.cn/we/mini/order/img/etc/head2.png'
  },
  {
    Id: 2,
    ImagePath: 'http://imgw.pospal.cn/we/mini/order/img/etc/head3.png'
  },
  {
    Id: 3,
    ImagePath: 'http://imgw.pospal.cn/we/mini/order/img/etc/head1.png'
  }
]; 

Page({

  data: {
    storeInfo: {},    
    swiperData: {
      indicatorDots: true, //是否显示面板指示点
      autoplay: true, //自动播放
      duration: 500, //滑动动画时长	
      interval: 1500, //自动切换时间间隔
      indicatorColor: 'rgba(255,255,255,0.70)',  //指示点颜色
      indicatorActiveColor: '#FFFFFF',  //当前选中的指示点颜色
    },
    banners: [],
    categories: [],
    categoryId: 0,
    products: []
  },

  onLoad: function (options) {
    var that = this;
    var autoSwitch = true;

    if (options.storeid) {
      app.setStoreId(options.storeid);
      autoSwitch = false;
    }

    app.getStoreInfo((storeInfo) => {
      var banners = storeInfo.banners;
      if (!banners || banners.length === 0) {
        banners = defaultBanners;
      }

      this.setData({
        banners: banners,
      });
    });

    this.loadCategory();
  },

  onReady: function () {

  },

  onShow: function () {

  },

  loadCategory: function() {
    app.authRequest('wxapi/product/categories',
      {
        storeId: app.storeId(),
        includeAttributes: true,
        includeAllProducts: true
      },
      (res) => {
        if (res.successed) {

          if (res.categories.length == 0) {
            return;
          }

          lookups = {};
          categoriesById = {};
          productsByCategory = res.productsByCategory;
          var count = 0;

          for (var i in res.categories) {
            var cat = res.categories[i];

            var categoryId = cat.CategoryId;
            categoriesById[categoryId] = { categoryIdx: i };
          }

          var categoryId = res.categories[0].CategoryId;
          var products = res.productsByCategory[categoryId];          

          this.setData({
            loaded: true,
            categories: res.categories,
            categoryId: categoryId,
            products: products,
            detailsIndex: 0
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

  tapCategory: function (e) {
    //console.log(e);

    var target = e.currentTarget;
    var categoryId = target.dataset.categoryid;

    this.moveToCategory(categoryId);
  },

  moveToCategory: function (categoryId) {
    var products = productsByCategory[categoryId];  

    this.setData({
      categoryId: categoryId,
      products: products
    });
  },

  tapProduct: function (e) {
    var target = e.currentTarget;
    var productIndex = target.dataset.index;

    var product = this.data.products[productIndex];
    var appt = appointmentService.getPendingAppointment();
    appt.product = product;

    wx.navigateTo({
      url: '/pages/order/orderStaff/orderStaff?product=' + product.uid
    })
  },
  
  goMyOrder: function () {
    wx.navigateTo({
      url: '/pages/order/myOrder/myOrder',
    })
  },
})