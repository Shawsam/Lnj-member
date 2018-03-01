//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
     userInfo:null,
     loaderhide:true,
     jumpLock:false
  },
  onLoad:function(option){
	  var _this = this;
	  //获取全局数据，初始化当前页面
	  app.getUserInfo(function(userInfo){
	     //用户信息
	     _this.setData({
	       userInfo:userInfo
	     })
	  })

    var latitude = option.lat,
        longitude = option.lon;
    //经纬度 => 请求店铺列表
    var param = { mini:'mini',
                  LATITUDE:latitude,
                  LONGITUDE:longitude,
                  PAGENO:1,
                  PAGECOUNT:9
                };

    _this.setData({ loaderhide:false });
    wx.request({
        url: app.globalData.host+'/waimai/address/nearShopList',  
        data: param,
        success: function (res) {
            //服务器返回的结果
            console.log(res);
            _this.setData({ loaderhide:true });
            if (res.data.errcode == 0) {
              var resdata = res.data.data;
              for(var i in resdata){
                // resdata[i].distanceTime = Math.ceil(resdata[i].distance)*10;
                var distance = resdata[i].distance;
                if(distance <=1 ){
                    resdata[i].distanceTime = 30;
                }else{
                    resdata[i].distanceTime = Math.ceil([30+(distance-1)*5]);
                }
              }
              _this.setData({ shopList:resdata });
            } else {
              console.log('服务器异常');
              wx.redirectTo({ url:'../view_state/index?error='+res.statusCode})
            }
        }
    })

  },
  enterShop:function(e){

      var _this = this;
      //跳转锁定
      var jumpLock = _this.data.jumpLock;
      if(jumpLock) return;
      _this.setData({jumpLock:true});

     var index = e.currentTarget.dataset.param;
     var shopList = _this.data.shopList;
     
     app.globalData.shopId = shopList[index].storeid;
     app.globalData.shopName = shopList[index].sname;
     app.globalData.distanceTime = shopList[index].distanceTime;
  	 wx.navigateTo({
      url:'../takeOut_menu/index',
      success:function(){
          setTimeout(function(){
             _this.setData({jumpLock:false});
          },500)
      }
     });
  }
})
