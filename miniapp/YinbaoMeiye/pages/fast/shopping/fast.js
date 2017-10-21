//logs.js
const app = getApp();
var px2rpx = 2, windowWidth = 375, startX = -1, startTime = -1, aboutToScroll, itemWidth = 0.66;

const cartService = require('../../../modules/services/cartService.js');
const shoppingCart = cartService.initCartService();

var _expireTimer = null;
var lookups = {};
var categoriesById = {};
Page({
  data: {
    loaded: false,
    storeInfo: {},
    logo: '/images/icon/store.png',

    scrollCategoryLeft: 0,
    scrollDetailsLeft: 0,

    toCategoryView: '',
    categories: [],
    categoryId: 0,
    maxCups: 99999,
    toMiniView: '',
    detailsIndex: 0,
    products: [],
    productsMini: [],
    product: {},
    scrollAnimation: true,
    showDetails: true,

    ifAttrSel: false,
    numOfProduct: 1,
    attrSelection: {},
    totalInCart: 0,
    totalPrice: 0,
    cartItems: {},
    cartVisible: false,
    timeout: false,
    remainingTime: '--:--',

    animationData: [], //动画数据
    animationDetaiList: [], 
  },

  onLoad: function (option) {
    console.log("shopping onLoad");
    //console.log(option);
    //let storeId = option.storeid;
    //let storeId = 27414

    wx.getStorage({
      key: 'FASTORDERNO',
      success: function (orderInfo) {
        var prevOrder = orderInfo.data;

        if (prevOrder && prevOrder.payTime) {
          if ((new Date(prevOrder.payTime)).setHours(0, 0, 0, 0) === (new Date()).setHours(0, 0, 0, 0)) {
            setTimeout(function () {
              app.authRequest('wxapi/order/OrderStatus',
                {
                  storeId: prevOrder.storeId || app.storeId(),
                  orderNumber: prevOrder.orderNo
                },
                (res) => {
                  if (res.successed) {
                    if (res.status < 40) {
                      wx.showModal({
                        content: '您有一单正在预约制作，点击可快速进入查看。',
                        showCancel: false,
                        complete: function (res) {                          
                          wx.redirectTo({
                            url: '/pages/fast/orderhistory/order'
                          });
                        }
                      });
                    }
                  }
                },
                (err) => {
                },
                null
              );
            }, 200);
          }
        }
      }
    });    

    wx.getSystemInfo({
      success: function (res) {
        windowWidth = res.windowWidth;
        px2rpx = 750 / windowWidth;
      }
    })
    
    app.getStoreInfo((storeInfo) => {
      this.setData({
        storeInfo: storeInfo,
        //maxCups: app.storeId() == 3150397 ? 1 :  3
      });
    });

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
          var count = 0;
          var allProducts = [];

          for (var i in res.categories) {
            var cat = res.categories[i];

            var p = cat.DisplayName.indexOf('-');
            if (p > 0) {
              cat.DisplayName = cat.DisplayName.substr(p + 1);
            }

            var categoryId = cat.CategoryId;
            categoriesById[categoryId] = { categoryIdx: i };

            var products = res.productsByCategory[categoryId];

            for (var j in products) {
              var item = products[j];

              if (item.defaultproductimage && item.defaultproductimage.imagepath) {
                item.defaultproductimage.mediumImage = item.defaultproductimage.imagepath.replace("_200x200", "_640x640");
              }

              allProducts.push(item);
              lookups[item.id] = { product: item, position: count };
              count++;
            }
          }

          var categoryId = res.categories[0].CategoryId;

          this.setData({
            loaded: true,
            categories: res.categories,
            categoryId: categoryId,
            products: allProducts,
            detailsIndex: 0
          });

          this.loadCart();
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

  onShow: function () {
    console.log("shopping onShow");
    var self = this;
    wx.getStorage({
      key: 'FASTORDERTIME',
      success: function (res) {
        var orderTime = res.data;

        //console.log("orderTime", orderTime);
        var expireTime = null;

        if (orderTime && orderTime.expire) {
          expireTime = orderTime.expire;
        }

        self.startTimer(expireTime);
      }
    });

    this.loadCart();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (_expireTimer !== null) {
      clearInterval(_expireTimer);
      _expireTimer = null;
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (_expireTimer !== null) {
      clearInterval(_expireTimer);
      _expireTimer = null;
    }
  },

  loadCart: function () {
    var that = this;
    shoppingCart.syncCart(function () {
      that.refreshCartData();
    });
  },

  upper: function (e) {
    //console.log(e)
  },

  lower: function (e) {
    //console.log(e)
  },

  scrollCategories: function (e) {
    //console.log(e)
  },

  tapCategory: function (e) {
    //console.log(e);

    var target = e.currentTarget;
    var categoryId = target.dataset.categoryid;

    this.moveToCategory(categoryId);
  },

  adjustViewPos: function (categoryId) {
    var categoryInfo = categoriesById[categoryId];
    var categoryIdx = parseInt(categoryInfo.categoryIdx, 10);
    categoryIdx = categoryIdx - 1;

    if (categoryIdx < 0) {
      categoryIdx = 0;
    }

    return 'c' + this.data.categories[categoryIdx].CategoryId;
  },

  moveToCategory: function (categoryId) {
    var categoryInfo = categoriesById[categoryId];
    var productIdx = categoryInfo.firstProductIdx;

    //console.log("firstProductIdx", productIdx, this.data.detailsIndex);

    var moveFirst;
    if (productIdx > this.data.detailsIndex) {
      moveFirst = productIdx - 1; 
    }
    else {
      moveFirst = productIdx + 1; 
    }

    if (moveFirst < 0) moveFirst = 0;

    this.setData({ scrollAnimation: false, showDetails: false})

    this.setData({
      scrollDetailsLeft: moveFirst * windowWidth * itemWidth
    })

    var self = this;
    setTimeout(function () {
      self.setData({ scrollAnimation: true, showDetails: true })
      self.updateScrollPosition(productIdx);
    }, 10);
  },

  findProducts: function (categoryUids) {
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

    app.authRequest('wxapi/product/listmulti',
      {
        storeId: app.storeId(),
        cUids: categoryUids,
        includeAttributes: true,
      },
      (res) => {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        else {
          wx.hideToast()
        }

        if (res.successed) {
          lookups = {};
          var products = res.data

          for (var i in products) {
            var item = products[i];
            lookups[item.id] = { product: item, position: i };
          }

          this.setData({
            loaded: true,
            products: products,
            product: products[0],
            detailsIndex: 0,
            numOfProduct: 1
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

  tapProduct: function (e) {
    var productId = e.currentTarget.dataset.productid;
    var lookup = lookups[productId];

    this.updateScrollView(lookup.position);
  },

  scrollDetails: function (e) {
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

    this.setData({
      scrollDetailsLeft: left > 0 ? left : 0,
    })
  },

  touchDetailsEnd: function (e) {
    //console.log("touchDetailsEnd", deltaX, this.data.detailsIndex, this.data.scrollDetailsLeft);

    if (e.target.dataset.productid) {
      //console.log("touch add", e.target.dataset.productid);
      var lookup = lookups[e.target.dataset.productid];
      var product = lookup.product;

      var packages = [];
      var attrMapping = {};

      for (var x in product.productattributepackages) {
        var pa = product.productattributepackages[x];
        var attrs = product.productattributes[pa.id];

        for (var y in attrs) {
          var attr = attrs[y];
          pa.attrs = attrs;
          packages.push(pa);
          attrMapping[attr.uid] = { attr: attr, package: pa };
        }
      }

      this.setData({
        ifAttrSel: true,
        product: lookup.product,
        numOfProduct: 1,
        packages: packages,
        attrMapping: attrMapping,
        attrSelection: {}
      });

      return;
    }

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
      this.updateScrollView(index);
      return;
    }
    else if (deltaX < - 20) {
      var index = this.data.detailsIndex + 1;

      if (index >= this.data.products.length) {
        index = this.data.products.length - 1;
      }

      //console.log("move left", index);
      this.updateScrollView(index);
      return;
    }
    else {
      //console.log("move small", index);
      this.updateScrollView(this.data.detailsIndex);
    }
  },

  updateScrollView: function (productIdx) {
    this.updateScrollPosition(productIdx);
  },

  adjustMiniViewPos: function (index) {
    index = index - 2;

    if (index < 0) {
      index = 0;
    }

    return 'p' + this.data.products[index].id;
  },

  updateScrollPosition: function (productIdx) {
    if (aboutToScroll !== null) {
      clearTimeout(aboutToScroll);
      aboutToScroll = null;
    }

    var self = this;
    aboutToScroll = setTimeout(function () {
      var categoryId = self.data.products[productIdx].category.id;
    
      self.setData({
        detailsIndex: productIdx,
        product: self.data.products[productIdx],
        toCategoryView: self.adjustViewPos(categoryId),
        categoryId: categoryId,
        toMiniView: self.adjustMiniViewPos(productIdx),
        productsMini: categoriesById[categoryId].products,        
        scrollDetailsLeft: productIdx * windowWidth * itemWidth,
        scrollAnimation: true        
      })
    }, 50);
  },

  tapCloseAttrSel: function () {
    this.setData({
      ifAttrSel: false
    });
  },

  tapAdd: function (e) {
    //console.log("tapAdd", e, this.data.numOfProduct);

    var numOfProduct = this.data.numOfProduct;

    if (numOfProduct < this.data.maxCups) {
      this.setData({
        numOfProduct: numOfProduct + 1
      });
    }
  },
  tapMinus: function () {
    var numOfProduct = this.data.numOfProduct;

    if (numOfProduct > 1) {
      this.setData({
        numOfProduct: numOfProduct - 1
      });
    }
  },

  tapCartAdd: function (e) {
    var idx = e.target.dataset.cartidx;

    var item = shoppingCart.findByIdx(idx);

    if (item && item.ProductNum < this.data.maxCups) {
      shoppingCart.addByCartIdx(idx);
      this.refreshCartData();
    }
    else {
    }
  },

  tapCartMinus: function (e) {
    var idx = e.target.dataset.cartidx;
    shoppingCart.minusByCartIdx(idx);
    this.refreshCartData();
  },

  clearCart: function () {
    console.log("clear");
    var that = this;
    shoppingCart.clear(function () {
      that.closeCart();
      that.refreshCartData();
    });
  },

  refreshCartData: function () {
    var summary = shoppingCart.summary();
    var cartItems = shoppingCart.find();
    //设置过渡动画。
    var animation1 = wx.createAnimation({
      duration: 350,
      timingFunction: "ease",
      delay: 0
    })
    var animation2 = wx.createAnimation({
      duration: 350,
      timingFunction: "ease",
      delay: 0
    })

    if (summary.quantity > 0) {
      animation1.height('94rpx').step();
      animation2.height('6rpx').step();
    }
    else {
      animation1.height(0).step();
      animation2.height('46rpx').step();
    }

    this.setData({
      totalInCart: summary.quantity,
      totalPrice: summary.amount,
      cartItems: [...cartItems],
      cartVisible: summary.quantity == 0 ? false : this.data.cartVisible,
      animationData: animation1.export(),
      animationDetaiList:animation2.export()
    });
  },

  selectAttr: function (e) {
    var packageId = e.currentTarget.dataset.package;
    var attrUid = e.currentTarget.dataset.attruid;

    //console.log("packageId, attrUid", e, packageId, attrUid);
    var attrSelection = Object.assign({}, this.data.attrSelection);

    var isSelected = !this.data.attrSelection[attrUid];
    attrSelection[attrUid] = isSelected;

    if (isSelected) {
      this.solveConflict(attrUid, attrSelection);
    }

    //console.log(attrSelection);

    this.setData({
      attrSelection: attrSelection
    });
  },

  confirmSelections: function () {
    var isMissing = false;

    for (var paIdx in this.data.packages) {
      var pa = this.data.packages[paIdx];
      if (!(pa.packageType == 1 || pa.packageType == 2)) {
        var selected = false;

        for (var attrIdx in pa.attrs) {
          if (this.data.attrSelection[pa.attrs[attrIdx].uid]) {
            selected = true;
            break;
          }
        }

        if (!selected) {
          isMissing = true;

          wx.showModal({
            content: '请选择“' + pa.packageName + "”选项",
            showCancel: false,
            confirmColor: '#5a5a5a',
            success: function (res) {
            }
          });

          break;
        }
      }
    }

    return !isMissing;
  },

  solveConflict: function (attrUid, attrSelection) {
    var attr = this.data.attrMapping[attrUid];

    if (!attr) {
      return false;
    }

    var t = attr.package.packageType;

    if (t == 1 || t == 3) {//多选
      return false;
    } else {
      var hasConflict = false;
      //console.log(attr.package.attrs, attrUid);
      for (var idx in attr.package.attrs) {
        var peerUid = attr.package.attrs[idx].uid;

        if (attrUid !== peerUid) {
          hasConflict = this.removeSelection(peerUid, attrSelection);
          if (hasConflict) {
            break;
          }
        }
      }

      //console.log("has conflict", hasConflict);
      return hasConflict;
    }
  },

  removeSelection: function (attrUid, attrSelection) {
    if (attrSelection.hasOwnProperty(attrUid)) {
      if (attrSelection[attrUid]) {
        attrSelection[attrUid] = false;
        return true;
      }
    }

    return false;
  },

  confirmCart: function () {
    var that = this;

    if (!this.confirmSelections()) {
      return;
    }

    if (wx.showLoading) {
      wx.showLoading({
        title: '添加到购物车',
      })
    }
    else {
      wx.showToast({
        title: '添加到购物车',
        icon: 'loading',
        duration: 5000
      })
    }

    var product = this.data.product;

    var shopItemAttrs = [];
    for (var attrUid in this.data.attrSelection) {
      var isSelected = this.data.attrSelection[attrUid];
      if (isSelected) {
        shopItemAttrs.push({ productAttributeUid: attrUid, txtproductAttributeUid: attrUid });
      }
    }

    var scItem = shoppingCart.find(product.id, shopItemAttrs);
    if (scItem) {
      var newNum = scItem.ProductNum + this.data.numOfProduct;

      if (newNum > this.data.maxCups) {
        newNum = this.data.maxCups;
      }

      scItem.ProductNum = newNum;
    }
    else {
      scItem = shoppingCart.add(product.id, "", product.sellPrice, shopItemAttrs, true);
      scItem.ProductNum = this.data.numOfProduct;
    }

    shoppingCart.syncCart(function (cartItems) {

      if (wx.hideLoading) {
        wx.hideLoading();
      }
      else {
        wx.hideToast()
      }

      if (cartItems === false) {
        wx.showModal({
          content: '加入购物车失败！',
          showCancel: false,
          confirmColor: '#5a5a5a',
          success: function (res) {
          }
        });
      }

      that.setData({
        ifAttrSel: false,
      });

      that.refreshCartData();
    });
  },

  confirmOrder: function () {
    var that = this;

    // if (wx.showLoading) {
    //   wx.showLoading({
    //     title: '正在下单',
    //   })
    // }
    // else {
    //   wx.showToast({
    //     title: '正在下单',
    //     icon: 'loading',
    //     duration: 5000
    //   })
    // }

    wx.setStorageSync("FASTORDERNO", {});

    // wx.navigateTo({
    //   url: '/pages/fast/placeorder/payment'
    // });

    wx.redirectTo({
      url: '/pages/fast/placeorder/payment'
    })

    // shoppingCart.syncCart(function (cartItems) {
    //   if (wx.hideLoading) {
    //     wx.hideLoading();
    //   }
    //   else {
    //     wx.hideToast()
    //   }

    //   wx.navigateTo({
    //     url: '/pages/fast/placeorder/payment?storeid=' + that.data.storeId
    //   });
    // });
  },

  showCart: function () {
    this.setData({
      cartVisible: !this.data.cartVisible
    })
  },

  closeCart: function () {
    this.setData({
      cartVisible: false
    })
  },

  pad: function (n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  },

  updateTime: function (time) {
    time = Math.floor(time);

    if (time <= 0) {
      clearInterval(_expireTimer);
      _expireTimer = null;
    }

    if (time <= 0) {
      this.setData({
        remainingTime: "--:--",
        timeout: true
      });

      this.selectTimeAgain();

      return;
    }

    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;

    this.setData({
      remainingTime: "" + this.pad(minutes, 2) + ":" + this.pad(seconds, 2)
    });
  },

  selectTimeAgain: function () {
    wx.showModal({
      content: '下单时间已经过期，请再次选择时间。',
      showCancel: false,
      success: function (res) {
        wx.setStorageSync("FASTORDERTIME", {});

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
      }
    });
  },

  startTimer: function (expire) {
    if (_expireTimer !== null) {
      clearInterval(_expireTimer);
      _expireTimer = null;
    }

    var expireTime = null;

    if (expire !== null && expire.length > 18) {
      var parts = expire.split(' ');

      if (parts.length === 2) {
        var dateParts = parts[0].split('-');
        var timeParts = parts[1].split(':');
        //console.log("timeParts", dateParts, timeParts);
        expireTime = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10)
          , parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), parseInt(timeParts[2], 10))
      }
    }

    if (!expireTime) {
      expireTime = new Date();
    }

    //console.log("expireTime", expireTime);

    var self = this;

    _expireTimer = setInterval(function () {
      var timeNow = new Date();
      var seconds = (expireTime.getTime() - timeNow.getTime()) / 1000;
      self.updateTime(seconds);
    }, 1000);
  },

  // gotoPets: function () {
  //   wx.navigateTo({
  //     url: '/pages/pet/pet?storeid=' + this.data.storeId
  //   })
  // },
  // gotoHistory: function () {
  //   wx.navigateTo({
  //     url: '/pages/history/history?storeid=' + this.data.storeId
  //   })
  // },
  // gotoPetGrooming: function () {
  //   wx.navigateTo({
  //     url: '/pages/pet/grooming/grooming?storeid=' + this.data.storeId
  //   })
  // },
  // gotoPetBoarding: function () {
  //   wx.navigateTo({
  //     url: '/pages/pet/boarding/boarding?storeid=' + this.data.storeId
  //   })
  // },
  gotoHome: function () {
    wx.navigateBack();
  },

  // onShareAppMessage: function (res) {
  //   return {
  //     title: '在线预约，快人一步，到店自取，告别排队',
  //     path: '/pages/fast/timeslot/timeslot',
  //     success: function (res) {
  //       // 转发成功
  //     },
  //     fail: function (res) {
  //       // 转发失败
  //     }
  //   }
  // }  
})
