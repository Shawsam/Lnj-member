var app = getApp()
Page({
  data:{
    webUrl:''
  },
  onLoad:function(option){
      app.globalData.userInfo = null;
      var deskNo =  option.deskNo||'';
      var shopId =  option.shopId||'';
      var channel = 15;
      
      var webUrl = app.globalData.webUrl+'/lnj-weixin/console/weixin/page/loginPage?mini=mini';
      if(option.shopId) webUrl = app.globalData.webUrl+'/lnj-weixin/console/weixin/page/loginPage?channel2='+channel+'&callback2=0&deskNo='+deskNo+'&shopId='+shopId
      console.log(webUrl)
      this.setData({
        webUrl:webUrl,
      })
  }
})