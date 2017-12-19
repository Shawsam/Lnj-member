//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
     userInfo:null,
     loaderhide:true,
     jumpLock:false
  },
  onLoad:function(){
	  var _this = this;
	  //获取全局数据，初始化当前页面
    // console.log(app.globalData.userInfo);
	  app.getUserInfo(function(userInfo){
	     //用户信息
	     _this.setData({
	       userInfo:userInfo
	     })
	  })
  },

  //解析二维码数据
  codeToInfo:function(a){
      var _this = this;
      var param = { 
           mini:'mini',
           openId:app.globalData.openId,
           a:a
      };

      wx.setStorageSync('items',null)
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
                     wx.redirectTo({
                        url: '../order_list/index',
                        success:function(){
                                setTimeout(function(){
                                       _this.setData({jumpLock:false});
                                },500)
                         }
                     })
                 }else{
                     wx.redirectTo({
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

  //1、打包预订
  packReserve:function(){

     var _this = this;
     //跳转锁定
     var jumpLock = _this.data.jumpLock;
     if(jumpLock) return;
     _this.setData({jumpLock:true});

      app.globalData.fromType = 1;
      wx.getLocation({
        type: 'wgs84',
        success: (res) => {
           setTimeout(function(){
              _this.setData({jumpLock:false});
           },500)

          var latitude = res.latitude,
              longitude = res.longitude;
          wx.redirectTo({url:'../shop_around/index?latitude='+latitude+'&longitude='+longitude});
        },
        fail: (res)=>{
           setTimeout(function(){
              _this.setData({jumpLock:false});
           },500)

          wx.showModal({content:'获取位置信息失败',showCancel:false})
        }
      })
  },
  //2、自助点餐
  selfOrder:function(){
     var _this = this;
     //跳转锁定
     var jumpLock = _this.data.jumpLock;
     if(jumpLock) return;
     _this.setData({jumpLock:true});

     app.globalData.fromType = 2;

     wx.scanCode({
        onlyFromCamera: true,
        success: (res) => {           
           var a = res.result.split('a=')[1];                             //二维码参数
           a && _this.codeToInfo(a);
        },
        fail: (res) =>{
           setTimeout(function(){
              _this.setData({jumpLock:false});
           },500)
        }
    })
  },
  //3、外卖送餐
  takeAway:function(){
      app.globalData.fromType = 3;
      // wx.showModal({content:'敬请期待...',showCancel:false})
      // return;
      wx.switchTab({url: '/pages/takeOut_index/index'})
  }
})
