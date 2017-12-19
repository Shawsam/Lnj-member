//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
     userInfo:null,
     addr:null,
     loaderhide:true,
     jumpLock:false
  },
  onLoad:function(){
	  var _this = this;
	  //获取全局数据，初始化当前页面
	  app.getUserInfo(function(userInfo){
	     //用户信息
	     _this.setData({
	       userInfo:userInfo
	     })
	  })
  },
  mapChoose:function(){
    var _this = this;
  	wx.chooseLocation({
      success:function(ret){
        _this.setData({addr:ret})
      }
    })
  }
})
