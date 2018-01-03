//index.js
//获取应用实例
var app = getApp()
Page({
  data:{
      userInfo:null,
      paytype:1
  },
  onLoad: function(option){
     var _this = this;

     //获取全局数据，初始化当前页面
     app.getUserInfo(function(userInfo){
      //用户信息
      _this.setData({
          userInfo:userInfo,
      })
     })
     //页面传递信息
     this.setData({
        paytype:option.type
     })
  },
  chooseTap:function(e){
     var type = e.currentTarget.dataset.type;
     this.setData({
     	paytype:type
     })
  },
  chooseConfirm:function(){
  	wx.setStorage({
      key:"paytype",
      data:this.data.paytype
    })
    wx.navigateBack({
      delta: 1
    })
  }

})

