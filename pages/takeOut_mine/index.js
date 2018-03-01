//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
     userInfo:null,
     addrData:[],
     loaderhide:true,
     jumpLock:false
  },
  onShow:function(){
     this.onLoad();
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
    this.setData({mobile:app.globalData.mobile})
  },
  openAddr:function(){
     var _this = this;
     //跳转锁定
     var jumpLock = _this.data.jumpLock;
     if(jumpLock) return;
     _this.setData({jumpLock:true});

     wx.navigateTo({
       url:'../takeOut_myaddr/index',
       success:function(){
          setTimeout(function(){
             _this.setData({jumpLock:false});
          },500)
       }
     })
  },
  openOrder:function(){
     var _this = this;
     //跳转锁定
     var jumpLock = _this.data.jumpLock;
     if(jumpLock) return;
     _this.setData({jumpLock:true});

     wx.switchTab({
       url:'../takeOut_order/index',
       success:function(){
          setTimeout(function(){
             _this.setData({jumpLock:false});
          },500)
       }
     })
  }
})
