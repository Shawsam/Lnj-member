//app.js
var host = "https://weixin.chinauff.com/lnj-weixin/console/dc";
var host_dev = "https://demo.i-manji.com/lnj-weixin/console/dc";

App({
  globalData: {
     host:host_dev,
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
                  console.log(res.userInfo)
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
