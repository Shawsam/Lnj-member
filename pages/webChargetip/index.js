var app = getApp()
Page({
  data:{
  	webUrl:''
  },
  onLoad:function(){
      this.setData({webUrl:app.globalData.webUrl})
  }
})