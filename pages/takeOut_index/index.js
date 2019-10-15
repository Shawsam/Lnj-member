//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
     userInfo:null,
     loaderhide:true,
     jumpLock:false
  },
  onShow(){
    //查询用户是否登录,注册状态
    var param =  {  mini:'mini',
                    openid:app.globalData.openId,
                    unionid:app.globalData.unionId,
                    name:app.globalData.userInfo.nickName
                 };
    wx.request({
        url: app.globalData.host+'/member/userInfo', 
        method:'GET',
        header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
        data: param,
        success: function (res) {
            let { errcode } = res.data;
            if(errcode==0){
                app.globalData.userId = res.data.data.userId;
            }else if(errcode==1001241){
                //用户已注册或用户已登出
                wx.showModal({
                  title:'您的登录信息失效，请重新登录',
                  success:(res)=>{
                    if(res.confirm){
                      wx.navigateToMiniProgram({
                          appId: 'wxbe8426115715a0c7',
                          path: 'pages/index/index',
                          success:(res)=>{
                            console.log(res)
                          },
                          fail:(err)=>{
                            this.onShow();
                          }
                      })
                    }else{
                      wx.reLaunch({ url:'../homepage/index'})
                    }
                  }
                })
            }else if(errcode==100124){
                //用户不存在
                wx.showModal({
                  title:'您还不是会员，请注册',
                  success:(res)=>{
                    if(res.confirm){
                      wx.navigateToMiniProgram({
                          appId: 'wxbe8426115715a0c7',
                          path: 'pages/index/index',
                          success:(res)=>{
                            console.log(res)
                          },
                          fail:(err)=>{
                            this.onShow();
                          }
                      })
                    }else{
                      wx.reLaunch({ url:'../homepage/index'})
                    }
                  }
                })         
            }else if(errcode==100130){
                wx.hideLoading();
                wx.showToast({ 
                                title:'您的账户已被禁用',
                                icon:'none'
                             });
            }else{
                wx.hideLoading();
                wx.showToast({ 
                                title:'网络异常，请重试',
                                icon:'none'
                             });
            }
        },
        fail:()=>{
            wx.hideLoading();
            wx.showToast({ 
                            title:'网络异常，请重试',
                            icon:'none'
                         });
        }
    })                  
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
