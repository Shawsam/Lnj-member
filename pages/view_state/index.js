//index.js
//获取应用实例
var app = getApp()
Page({
   data:{
      error:''
   },
   onLoad: function (option) {
       this.setData({
          error:option.error,
          errorMsg:option.errorMsg
       })
   },
   backFun:function(){
       wx.reLaunch({ url:'../entrace/index'})
   }
})
