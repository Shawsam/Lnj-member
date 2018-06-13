//app.js
var host = "https://weixin.chinauff.com/lnj-weixin/console/dc";
var host_dev = "https://demo.i-manji.com/lnj-weixin/console/dc";

App({
  globalData: {
     host:host,
     userId:'',           //用户userId
     openId:'',           //小程序openId
     _openId:'',          //公众号_openId
     unionId:0,          //unionId
     shopId:'',           //当前店铺id
     shopName:'',         //当前店铺名    
     orderNum:0,          //当前店铺订单数量
     deskNo:'',           //当前桌号
     cardNo:'',           //用户会员账户号
     mobile:'',           //用户手机号
     fromType:'',         //渠道区分  1、预约打包 2、自助点餐 3、外卖送餐
     userInfo:null        //微信登录接口获取的用户信息
  },
  getUserInfo: function(cb) {                           
      var _this = this
      if (this.globalData.userInfo) {           
        typeof cb == "function" && cb(this.globalData.userInfo)
      } else {
        // 查看是否授权
        wx.getSetting({
          success: function(res){
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称
              wx.getUserInfo({
                success: function(res) {
                  _this.globalData.userInfo = res.userInfo
                  cb(res.userInfo)
                }
              })

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
                              url: _this.globalData.host+'/getMiniOpen', 
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
                                     _this.globalData.openId = openId;
                                     _this.globalData._openId = _openId;
                                     _this.globalData.userId = userId;
                                     _this.globalData.unionId = unionId;
                                     _this.globalData.mobile = mobile;
                                     _this.globalData.cardNo = cardNo;
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

            }else{
              wx.redirectTo({url:"../authorize/index"})
            }
          }
        })
      }
  },
  onShow:function(scene){
    if(scene.path == "pages/takeOut_addr_add/index"){
        this.getUserInfo();
    }
  },
  onHide:function(){
    this.globalData.userInfo = null;            //会员状态的改变，用户进公众号再进入小程序
  }
})
