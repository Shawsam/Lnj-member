//index.js
//获取应用实例
var app = getApp()
Page({
    data: {
        bala:0,
        amount:0,
        clickLock:false
    },
    onLoad:function(option){
       this.setData({  bala:option.bala,
                       userId:option.userId,
                       mobile:option.mobile
                     })
       app.globalData.userId = option.userId
       app.globalData.mobile = option.mobile
       console.log(option)
    },
    chooseVal:function(e){
       var currentVal = e.currentTarget.dataset.param
       this.setData({amount:currentVal})
  },
  chargeFun:function(){
      if(this.data.clickLock) return;
      this.setData({clickLock:true})

      var _this = this
      var amount = this.data.amount
      if(amount==0){
         wx.showModal({content:'请选择充值金额',showCancel:false })
         _this.setData({clickLock:false})
         return;
      }
      var param = { mini:'mini',
                    openId:app.globalData.openId,
                    userId:this.data.userId,
                    mobile:this.data.mobile,
                    amount:this.data.amount
                  };
      wx.request({
          url: app.globalData.host+'/recharge/addBill',  
          data: param,
          method:'POST',
          header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
          success: function (res) {
              //服务器返回的结果
              console.log(res);
              var resdata = res.data
              if(resdata.errcode == 0){     
                  //============调微信支付============//
                  wx.requestPayment({
                       'timeStamp': resdata.timeStamp,
                       'nonceStr': resdata.nonceStr,
                       'package': resdata.packages,
                       'signType': resdata.signType,
                       'paySign': resdata.paySign,
                       'success':function(res){
                             _this.setData({clickLock:false})
                             wx.navigateTo({
                               url: '../webChargesuccess/index?amount='+resdata.amount
                             })
                        },
                       'fail':function(res){
                            _this.setData({clickLock:false})
                            if(res.errMsg == 'requestPayment:fail cancel'){
                               wx.showModal({content:'支付已取消',showCancel:false })
                            }else{
                               wx.navigateTo({
                                 url: '../webChargefail/index?bala='+resdata.amount
                               })
                           }
                            
                        }
                 }) 
               }else{
                    wx.showModal({
                       content:'生成订单失败',
                       showCancel:false
                    })
                    _this.setData({clickLock:false})
               }
           }
      })
  },
  recordFun:function(){
    wx.navigateTo({ url: '../webChargelog/index' })
  },
  instructFun:function(){
    wx.navigateTo({ url: '../webChargetip/index' })
  }
})
