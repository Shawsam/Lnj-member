//index.js
//获取应用实例
var app = getApp()
Page({
   data:{
     deskNo:'',
     shopInfo:{},
     orderInfo:{}
   },
   onLoad: function (option) {
       var _this = this;
       _this.setData({
          shopInfo:app.globalData.shopInfo
       })
   },
   backFun:function(){
    // console.log(getCurrentPages()[getCurrentPages().length-2])
    if(getCurrentPages()[getCurrentPages().length-2].route == "pages/order_list/index"){
         wx.navigateBack();
    }else{
         wx.reLaunch({ url:'../order_list/index'})
    }
  }
})
