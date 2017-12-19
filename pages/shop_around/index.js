//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
     userInfo:null,
     items:[],
     searchResult:[],
     keyInput:'',
     loaderhide:true,
     jumpLock:false
  },
  onLoad: function (option) {

    var _this = this;
    //获取全局数据，初始化当前页面
    app.getUserInfo(function(userInfo){
      //用户信息
      _this.setData({
        userInfo:userInfo,
        deskNo:app.globalData.deskNo
      })
    })

    var latitude = option.latitude,
        longitude = option.longitude;
    //经纬度 => 请求店铺列表
    var param = { mini:'mini',
                  openId:app.globalData.openId,
                  latitudes:latitude,
                  longitudes:longitude,
                  pageNo:1,
                  pageCount:9
                };

    _this.setData({ loaderhide:false });
    wx.request({
        url: app.globalData.host+'/shop/nearShopList',  
        data: param,
        success: function (res) {
            //服务器返回的结果
            console.log(res);
            _this.setData({ loaderhide:true });
            if (res.data.errcode == 0) {
              var resdata = res.data.data,
                  items = [];

              for(var i in resdata){
                if(resdata[i].status==1 && resdata[i].isSub==0){
                    var shopName = resdata[i].shopName,
                        shopId = resdata[i].shopId,
                        provinceName = resdata[i].provinceName,
                        cityName = resdata[i].cityName,
                        zoneName = resdata[i].zoneName,
                        address = resdata[i].address;
                    if(provinceName == cityName){
                      var shopAddr = cityName+ ' ' + zoneName +' '+ address;
                    }else{
                      var shopAddr = provinceName+cityName+zoneName+address;
                    }
                    var singleData = {};
                        singleData.shopName = shopName;
                        singleData.shopAddr = shopAddr;
                        singleData.shopId = shopId;
                    items.push(singleData);
                }
              }
              _this.setData({items:items});
              _this.setData({searchResult:items});

            } else {
                console.log('服务器异常');
                wx.redirectTo({ url:'../view_state/index?error='+res.statusCode})
            }
        }
    })
  },
  searchFun: function(){
    var items = this.data.items,
        key = this.data.keyInput.replace(/(^\s*)|(\s*$)/g,""),
        _items = [];
    
    for(var i in items){
      if(key){
          var str = JSON.stringify(items[i]);
          if(str.indexOf(key)>0){
              _items.push(items[i]);
          }
        }else{
          _items.push(items[i]);
        }

    }
    this.setData({searchResult:_items})

  },
  keyInput: function(e){
      this.setData({
         keyInput: e.detail.value
      })
  },
  enterShop:function(e){
      var _this = this;
      //跳转锁定
      var jumpLock = _this.data.jumpLock;
      if(jumpLock) return;
      _this.setData({jumpLock:true});

      var shopId = e.currentTarget.dataset.param;   //当前门店shopId

      var param = { 
           mini:'mini',
           openId:app.globalData.openId,
           shopId:shopId
      };

      wx.request({
          url: app.globalData.host+'/getOrderCount', 
          method:'GET',
          data: param,
          success: function (res) {
              //服务器返回的结果
              console.log(res);
              if (res.data.errcode == 0) {
                 var shopId = res.data.shopId,
                     shopName = res.data.shopName,
                     deskNo = res.data.deskNo,
                     orderNum = res.data.data;
                 app.globalData.shopId = shopId;
                 app.globalData.shopName = shopName;
                 app.globalData.deskNo = deskNo;
                 app.globalData.orderNum = orderNum;

                 //跳转控制
                 if(orderNum){
                     wx.navigateTo({
                        url: '../order_list/index',
                        success:function(){
                                setTimeout(function(){
                                       _this.setData({jumpLock:false});
                                },500)
                         }
                     })
                 }else{
                     wx.navigateTo({
                        url: '../index/index',
                        success:function(){
                                setTimeout(function(){
                                       _this.setData({jumpLock:false});
                                },500)
                         }
                     })
                 }
              }else{
                 console.log('服务器异常');
                 wx.redirectTo({ url:'../view_state/index?error='+res.statusCode,
                                 success:function(){
                                  setTimeout(function(){
                                       _this.setData({jumpLock:false});
                                  },500)
                                 }
                 })
              }
          }
      })
  },
  onShow:function(){
     wx.clearStorageSync('items');
  }
})
