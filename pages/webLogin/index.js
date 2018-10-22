var app = getApp()
Page({
  data:{
  	webUrl:''
  },
  onLoad:function(option){
  	  var deskNo =  option.deskNo||'';
  	  var shopId =  option.shopId||'';
      this.setData({
      	webUrl:app.globalData.webUrl,
      	deskNo:deskNo,
      	shopId:shopId
      })
      console.log(app.globalData.webUrl+'/lnj-weixin/console/weixin/page/loginPage?mini=mini&channel2=15&callback2=0&deskNo='+deskNo+'&shopId='+shopId)
  }
})