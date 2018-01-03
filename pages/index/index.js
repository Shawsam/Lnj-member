//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
     deskNo:'',
     shopName:'',
     shopAddr:'',
     userInfo:null,
     loaderhide:true,
     jumpLock:false
  },
  //事件处理函数
  orderTap: function() {

   var _this = this;

   //跳转锁定
   var jumpLock = _this.data.jumpLock;
   if(jumpLock) return;
   _this.setData({jumpLock:true});

    wx.redirectTo({
      url: '../order/index',
      success:function(){
          setTimeout(function(){
             _this.setData({jumpLock:false});
          },500)
      }
    })
  },
  onLoad: function () {

    var _this = this;
    //获取全局数据，初始化当前页面
    app.getUserInfo(function(userInfo){
      //用户信息
      _this.setData({
        userInfo:userInfo,
        deskNo:app.globalData.deskNo
      })
    })
    
    //请求门店信息
    var param = { mini:'mini',
                  shopId:app.globalData.shopId,
                  openId:app.globalData.openId };
    
    console.log(param);
    _this.setData({ loaderhide:false });
    wx.request({
        url: app.globalData.host+'/shop/shopInfo',  
        data: param,
        success: function (res) {
            //服务器返回的结果
            console.log(res);
            _this.setData({ loaderhide:true });
            if (res.data.errcode == 0) {
                var shopName = res.data.data.shopName,
                    provinceName = res.data.data.provinceName,
                    cityName = res.data.data.cityName,
                    zoneName = res.data.data.zoneName,
                    address = res.data.data.address;
                if(provinceName == cityName){
                  var shopAddr = cityName+ ' ' + zoneName +' '+ address;
                }else{
                  var shopAddr = provinceName+cityName+zoneName+address;
                }

                app.globalData.shopName = shopName;

                //店铺信息 回填页面
                _this.setData({
                   shopName:shopName,
                   shopAddr:shopAddr
                })

            } else {
                 wx.redirectTo({ url:'../view_state/index?error='+res.statusCode+'&errorMsg='+res.data.msg,
                                 success:function(){
                                    setTimeout(function(){
                                         _this.setData({jumpLock:false});
                                    },500)
                                 }
                 })
            }
        }
    })

  }
})
