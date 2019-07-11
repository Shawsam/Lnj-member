//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
     userInfo:null,
     canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad:function(){
  	    //调用微信登录接口，获取code
        wx.login({
            success: function (r) {
                var code = r.code;        //登录凭证
                if (code) {
                    //请求服务器，解密用户信息 获取unionId等加密信息
                    var param = { mini:'mini',
                                  jsCode:code
                                };
                    wx.request({
                        url: app.globalData.host+'/getMiniOpen', 
                        method:'POST',
                        header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
                        data: param,
                        success: function (res) {
                            //服务器返回的结果
                            console.log('信息');
                            console.log(res);
                            if (res.data.errcode == 0) {
                               var openId = res.data.miniOpenId,
                                   _openId = res.data.openId,
                                   userId = res.data.userId,
                                   unionId = res.data.unionId,
                                   mobile = res.data.mobile,
                                   cardNo =  res.data.cardNo;
                               app.globalData.openId = openId;
                               app.globalData._openId = _openId;
                               app.globalData.userId = userId;
                               app.globalData.unionId = unionId;
                               app.globalData.mobile = mobile;
                               app.globalData.cardNo = cardNo;

                               // if (getCurrentPages().length != 0) {
                               //    getCurrentPages()[getCurrentPages().length - 1].onLoad()
                               // }
                               
                            } else {
                               console.log('服务器异常');
                               wx.redirectTo({ url:'../view_state/index?error='+res.statusCode+'&errorMsg=服务器异常'})
                            }

                        },
                        fail: function () {
                            console.log('网络错误，请重试')
                            wx.redirectTo({ url:'../view_state/index?errorMsg=网络错误，请重试'})
                        }
                    })
                } else {
                    console.log('获取用户登录态失败' + r.errMsg)
                    var errMsg = '获取用户登录态失败' + r.errMsg;
                    wx.redirectTo({ url:'../view_state/index?errorMsg='+errMsg })
                }
            },
            fail: function () {
                 console.log('登陆失败')
                 var errMsg = '登录失败';
                 wx.redirectTo({ url:'../view_state/index?errorMsg='+errMsg })
            }
        })
  },
  authorizeFun:function(res){
      app.globalData.userInfo = res.detail.userInfo
      this.setData({userInfo:res.detail.userInfo})
      var param =  { mini:'mini',
                     openId:app.globalData.openId,
                     iv:res.detail.iv,
                     encryptedData:res.detail.encryptedData
                   };
      wx.request({
        url: app.globalData.host+'/wxMini/encryptedData', 
        method:'POST',
        header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
        data: param,
        success: function (res) {
              console.log(res);
              if (res.data.errcode == 0) {
                  app.globalData.unionId = res.data.data.unionId;
                  wx.redirectTo({url:'../homepage/index'})
              }else{
                  var errMsg = 'unionId解密失败';
                  wx.redirectTo({ url:'../view_state/index?errorMsg='+errMsg })
              }
        }
      })
  }
})