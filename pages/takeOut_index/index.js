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
    
    // //请求菜单数据
    // var param = { mini:'mini'};
    // _this.setData({ loaderhide:false });
    // wx.request({
    //     url: app.globalData.host+'/waimai/goods/selectOrderPeopleCount',  
    //     data: param,
    //     method:'POST',
    //     header: {  "Content-Type": "application/x-www-form-urlencoded" },
    //     success: function (res) {
    //         //服务器返回的结果
    //         _this.setData({ loaderhide:true });
    //         if (res.data.errcode == 0) { 
    //             _this.setData({person:res.data.data})
    //         }else{
    //            _this.setData({person:15465})
    //         }
    //     }
    // })

  },
  Enter:function(){
     var _this = this;
     //跳转锁定
     var jumpLock = _this.data.jumpLock;
     if(jumpLock) return;
     _this.setData({jumpLock:true});

  	 wx.navigateTo({
        url:'../takeOut_addr/index',
        success:function(){
          setTimeout(function(){
             _this.setData({jumpLock:false});
          },500)
        }
    })
  },
  Return:function(){
      // if(app.globalData.pageFrom=='homepage'){
          wx.redirectTo({url:'../../pages/homepage/index'});
      // }else{
      //     wx.redirectTo({url:'../../pages/entrace/index'});
      // }      
  }
})
