"use strict";
var defaults;
var cart;
var scT;

const app = getApp();

var ShoppingCart = function (config) {
  this.initConfig(config);
}

ShoppingCart.prototype = {
  initConfig: function (config) {
    var self = this;

    self.config = Object.assign({}, defaults, config);
    self.items = [];
    self.eventHandlers = [];
    self.needSync = true;
    self.loaded = false;
  },
  loadOnce: function (cb) {
    //console.log('load once', this.loaded);
    if (!this.loaded) {
      this.doLoad(cb);
    }
    else {
      this.notify("reload");
      if (cb) cb();
    }
  },
  load: function (cb) {
    //console.log('load', this.needSync);

    if (this.needSync) {
      this.doLoad(cb);
    }
    else {
      this.notify("reload");
      if (cb) cb();
    }
  },
  doLoad: function (cb) {
    var self = this;

    self.loaded = true;

    //force to sync
    //self.needSync = true;
    //self.items = [];

    this.syncCart(function () {
      self.notify("reload");
      if (cb) cb();
    });
  },
  subscribe: function (handler) {
    var index = this.eventHandlers.indexOf(handler);

    if (index < 0) {
      this.eventHandlers.push(handler);
    }
  },
  unsubscribe: function (handler) {
    var index = this.eventHandlers.indexOf(handler);
    if (index >= 0) {
      this.eventHandlers.splice(index, 1);
    }
  },
  notify: function (e, d) {
    this.eventHandlers.forEach(function (handler) {
      handler(this, e, d);
    }, this);
  },
  _add: function (productId, productName, sellPrice, shopItemAttrs) {
    if (!shopItemAttrs) {
      shopItemAttrs = [];
    }

    var item = {
      ProductId: productId,
      ProductName: productName,
      SellPrice: sellPrice,
      ProductNum: 1,
      CartItemAttributes: shopItemAttrs
    };
    
    item.CartIdx = this.items.length;
    item.ItemTotal = this.calculatePrice(item);

    this.items.push(item);
    this.needSync = true;

    return item;
  },
  calculatePrice(item) {
    var price = item.SellPrice;

    for (var i in item.CartItemAttributes) {
      var attr = item.CartItemAttributes[i];
      var additionalPrice = parseFloat(attr.attributeValue);
      console.log();
      if (additionalPrice && additionalPrice > 0) {
        price = price + additionalPrice;
      }      
    }

    return (price * item.ProductNum).toFixed(2);    
  },
  _updateNum: function (item, num) {
    if (num < 0) {
      num = 0;  
    }

    if (item && item.ProductNum != num) {
      item.ProductNum = num;
      item.ItemTotal = this.calculatePrice(item);
      this.needSync = true;
    }
  },

  _remove: function (item) {
    for (var i = this.items.length; i--;) {
      if (this.items[i] === item) {
        this.items.splice(i, 1);
        this.needSync = true;
      }
    }
  },
  removeById: function (productId, noSync, cb) {
    var scItems = this.findItemsById(productId);

    for (var i in scItems) {
      var scItem = scItems[i];

      if (scItem.ProductNum > 0) {
        scItem.ProductNum = 0;
        this.needSync = true;
      }
    }

    if (!noSync) {
      this.syncCart(cb, false);
    }
  },
  find: function (productId, shopItemAttrs) {
    if (!productId) {
      //find all
      return this.items;
    }

    for (var i = 0; i < this.items.length; i++) {
      var item = this.items[i];
      if (item.ProductId == productId) {
        var sameAttr = true;

        if (shopItemAttrs && shopItemAttrs.length > 0) {
          if (item.CartItemAttributes && item.CartItemAttributes.length == shopItemAttrs.length) {
            for (var j = 0; j < shopItemAttrs.length; j++) {
              if (shopItemAttrs[j].txtproductAttributeUid != item.CartItemAttributes[j].txtproductAttributeUid) {
                sameAttr = false;
                break;
              }
            }
          }
          else {
            sameAttr = false;
          }
        }

        if (sameAttr) {
          return item;
        }
      }
    }

    return null;
  },
  findItemsById: function (productId) {
    //console.log("shopItemAttrs", shopItemAttrs);
    var result = [];

    for (var i = 0; i < this.items.length; i++) {
      var item = this.items[i];
      if (item.ProductId == productId && item.ProductNum && item.ProductNum > 0) {
        result.push(item);
      }
    }

    return result;
  },
  add: function (productId, productName, sellPrice, shopItemAttrs, noSync, cb) {
    //console.log(productId, productName, sellPrice);

    var scItem = this.find(productId, shopItemAttrs);
    if (scItem) {
      this._updateNum(scItem, scItem.ProductNum + 1);
    } else {
      scItem = this._add(productId, productName, sellPrice, shopItemAttrs);
    }

    if (!noSync) {
      this.syncCart(cb, false);
    }
    else {
      if (cb) cb;
    }

    this.notify("add", scItem);

    return scItem;
  },
  addByCartIdx: function (idx) {
    var scItem = this.items[idx];

    if (scItem) {
      this._updateNum(scItem, scItem.ProductNum + 1);
    }

    return scItem;
  },    
  findByIdx: function(idx) {
    return this.items[idx];
  },
  minus: function (productId, noSync, cb) {
    var scItem = this.find(productId);

    if (scItem && scItem.ProductNum > 0) {
      this._updateNum(scItem, scItem.ProductNum - 1);

      if (!noSync) {
        this.syncCart(cb, false);
      }

      this.notify("minus", scItem);
    }

    return scItem;
  },
  minusByCartIdx: function (idx) {
    var scItem = this.items[idx];

    if (scItem) {
      this._updateNum(scItem, scItem.ProductNum - 1);      
    }

    return scItem;
  },  
  update: function (productId, num, productName, sellPrice, noSync, cb) {
    var scItem = this.find(productId);

    if (scItem) {
      this._updateNum(scItem, num);
    }
    else {
      scItem = this._add(productId, productName, sellPrice);
      this._updateNum(scItem, num);
    }

    if (!noSync) {
      this.syncCart(cb, false);
      this.notify("update", scItem);
    }
  },
  clear: function (cb) {
    this.items = [];
    this.needSync = true;
    this.syncCart(cb, false);
    this.notify("reload");
  },
  summary: function () {
    var ci, num = 0, amt = 0, c = 0;

    for (var i = 0; i < this.items.length; i++) {
      ci = this.items[i];
      num = ci.ProductNum;
      c += num;

      if (ci.ItemTotal) {
        amt = parseFloat(ci.ItemTotal) + amt;
      }
      else {
        amt = parseFloat(this.calculatePrice(ci)) + amt;
      }
    }

    amt = amt.toFixed(2);

    return { amount: amt, quantity: c };
  },
  
  syncCart: function (callback, isMerge, isForce) {
    var self = this;

    if (!self.needSync && !isForce) {
      if (callback) {
        callback(self.items);
      }

      return;
    }

    if (typeof isMerge === "undefined") {
      isMerge = true;
    }

    var shopcartItems = JSON.stringify(this.items);
    self.needSync = false;

    app.authRequest(self.config.syncUrl,
      {
        storeId: app.storeId(),
        isMerge: isMerge, 
        shopcartItems: shopcartItems
      },
      (data) => {
        if (data && data.Success) {
          self.items = JSON.parse(data.Result);

          for (var i = 0; i< self.items.length; i++){
            var item = self.items[i];
            item.CartIdx = i;
            item.ItemTotal = this.calculatePrice(item);
          }

          self.message = data.Message;
          //console.log("aftersync", self.items);
          if (self.message) {
            wx.showModal({
              content: self.message,
              showCancel: false,
              confirmColor: '#5a5a5a',
              success: function (res) {
              }
            })
          }

          if (callback) {
            callback(self.items, self.message);
          }
        }
        else {
          self.needSync = true;
          if (callback) {
            callback(false);
          }
        }
      },
      (err) => {
        self.needSync = true;
        if (callback) {
          callback(false);
        }

        app.showError(err.message);
      }
      , null
    );
  },

  checkout: function (callback) {
    var self = this;
    var  isMerge = true;
    var shopcartItems = JSON.stringify(this.items);
    self.needSync = false;

    app.authRequest(self.config.checkoutUrl,
      {
        storeId: app.storeId(),
        isMerge: isMerge,
        shopcartItems: shopcartItems
      },
      (data) => {
        //console.log(data);

        if (data.successed) {

          // for (var i = 0; i < self.items.length; i++) {
          //   var item = self.items[i];
          //   item.CartIdx = i;
          //   item.ItemTotal = (item.SellPrice * item.ProductNum).toFixed(2);
          // }
          //self.message = data.Message;

          //console.log("aftersync", self.items);
          // if (self.message) {
          //   wx.showModal({
          //     content: self.message,
          //     showCancel: false,
          //     confirmColor: '#5a5a5a',
          //     success: function (res) {
          //     }
          //   })
          // }

          if (callback) {
            callback(data);
          }
        }
        else {
          app.showError(data.message);

          self.needSync = true;
          if (callback) {
            callback(false);
          }
        }
      },
      (err) => {
        app.showError(err.message);

        self.needSync = true;
        if (callback) {
          callback(false);
        }
      }
      , null
    );
  }  
}

defaults = {
  syncUrl: '/wxapi/shopcart/syncshopcart',
  checkoutUrl: '/wxapi/shopcart/checkout',
}
var initCartService = function (config) {
  if (cart == null) {
    cart = new ShoppingCart(config);
  }  
  return cart;
}
module.exports = {
  initCartService: initCartService
}
