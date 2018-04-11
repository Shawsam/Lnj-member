//index.js
import { formatTime } from '../../utils/util.js'

//获取应用实例
var app = getApp()
Page({
  data:{
      userInfo:null,
      shopName:'',
      detail_panel:false,
      type_panel:false,
      tip_panel:false,
      loaderhide:true,
      paytype:1
  },
  onLoad: function (option) {
       var _this = this;
       _this.setData({
          shopName:app.globalData.shopName
       })
      console.log(option);
      var orderId = option?option.orderId:this.data.orderId;
      this.setData({orderId:orderId});

      _this.setData({ loaderhide:false });
      wx.request({
          url: app.globalData.host+"/waimai/goods/getOrder",
          data:{
             mini:'mini',
             userId:app.globalData.userId,
             orderId:orderId
          },
          success: function(res) {
            //服务器返回数据
            console.log(res);
            _this.setData({ loaderhide:true });
            var resdata = res.data;
            if(resdata.errcode == 0){
              var order = resdata.data;  
              var totalFeeVal = order.totalFee.toFixed(2),
                  userFeeVal = order.userFee.toFixed(2),
                  discountFee = order.discountFee,
                  discountFeeVal = order.discountFee.toFixed(2),
                  packTotalFee = order.packTotalFee,
                  packTotalFeeVal = order.packTotalFee.toFixed(2),
                  deliverFee = order.deliverPay,
                  deliverFeeVal = order.deliverPay.toFixed(2),
                  items = order.items,
                  name = order.name,
                  address = order.address,
                  mobile = order.mobile,
                  orderNo = order.orderNo,
                  orderStatus = order.status,
                  arrive_Time = order.arriveTime,
                  goodsList = order.goodsList,
                  orderTime = order.orderTime,
                  payTime = order.payTime,
                  updateTime = order.updateTime,
                  shopDealTime = order.shopDealTime,
                  status = order.status,
                  applyBackOrderStatus = order.applyBackOrderStatus,
                  applyBackOrderTime = order.applyBackOrderTime,
                  riderName = order.riderName,
                  riderTel = order.riderTel,
                  payType = order.payType,
                  backOrderTime = order.backOrderTime,
                  axisList = order.axisList;
              
              //判断当前时间是否是支付后40分钟以内
              var currentTime = new Date().getTime();
              var fourtyTimeBelow = true;
              if(currentTime > payTime + 40*60*1000){
                 fourtyTimeBelow = false;
              }

              for(var i in axisList){
                axisList[i].createTimeVal = formatTime(axisList[i].createTime);
              }

              _this.setData({ 
                  totalFeeVal:totalFeeVal,
                  userFeeVal:userFeeVal,
                  discountFee:discountFee,
                  discountFeeVal:discountFeeVal,
                  packTotalFee:packTotalFee,
                  packTotalFeeVal:packTotalFeeVal,
                  deliverFee:deliverFee,
                  deliverFeeVal:deliverFeeVal,
                  items:items,
                  name:name,
                  address:address,
                  mobile:mobile,
                  orderNo:orderNo,
                  orderStatus:status,
                  arrive_Time:arrive_Time,
                  goodsList:goodsList,
                  orderTime:orderTime,
                  payTime:payTime,
                  shopDealTime:shopDealTime,
                  updateTime:updateTime,
                  orderTimeVal:formatTime(orderTime),
                  payTimeVal:formatTime(payTime),
                  applyBackOrderStatus:applyBackOrderStatus,
                  applyBackOrderTime:formatTime(applyBackOrderTime),
                  status:status,
                  payType:payType,
                  fourtyTimeBelow:fourtyTimeBelow,
                  axisList:axisList,
                  riderName:riderName,
                  riderTel:riderTel
              })
            }else{
              wx.showModal({
                    content:res.data.msg,
                    showCancel: false
              });
            }
 
          }
      })
  },
  backFun:function(){
    // console.log(getCurrentPages()[getCurrentPages().length-2])
    if(getCurrentPages()[getCurrentPages().length-2].route == "pages/takeOut_order/index"){
         wx.navigateBack();
    }else{
         wx.reLaunch({ url:'../takeOut_order/index'})
    }
  },
  openDetail:function(){
     this.setData({detail_panel:true})
  },
  closePanel:function(){
     this.setData({detail_panel:false})
  },
  closeReason:function(){
     this.setData({reason_panel:false})
  },
  //继续支付
  payFun:function(){
     this.setData({type_panel:true})    
  },
  coverTap:function(){
      this.setData({
        type_panel:false,
        detail_panel:false,
        reason_panel:false
      })
  },
  chooseTap:function(e){
     var type = e.currentTarget.dataset.type;
     this.setData({
       paytype:type
     })
  },

  confirmChoose:function(){
    var _this = this;
    _this.setData({ loaderhide:false });
    
    var param = {
           mini:'mini',
           userId:app.globalData.userId,
           openId:app.globalData.openId,
           orderId:this.data.orderId,
           payType:this.data.paytype
    };

    wx.request({
        url: app.globalData.host+"/waimai/goods/payOrder",
        data:param,
        method:'POST',
        header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
        success: function(res) {
          //服务器返回数据
          _this.setData({ 
            loaderhide:true,
            type_panel:false
          });

          if(res.data.errcode == 0){         //支付成功状态 生成订单成功                            
              var tradeInfo = res.data;
              
              console.log(tradeInfo);
              //调微信支付
              if(tradeInfo.paySign){                            
                 wx.requestPayment({
                   'timeStamp': tradeInfo.timeStamp,
                   'nonceStr': tradeInfo.nonceStr,
                   'package': tradeInfo.packages,
                   'signType': tradeInfo.signType,
                   'paySign': tradeInfo.paySign,
                   'success':function(res){
                       wx.navigateBack();
                    },
                   'fail':function(res){
                       wx.redirectTo({ url: '../takeOut_order_fail/index' })
                   }
                }) 
              }
              //调用账户支付
              else{
                if(!tradeInfo.bala){
                    wx.navigateBack();
                    return;
                }

                 tradeInfo.paytype = '亲情账户';
                 _this.setData({ 
                    tip_panel:true,
                    tradeInfo:tradeInfo
                 });
              }
          }else{
               wx.showModal({                //其他错误
                    content:res.data.msg,
                    showCancel: false,
                    success: function(res) {
                      if (res.confirm) {
                          _this.onLoad();
                      }
                    }
               });

           }
        }
    })
  },

  confirmTrade:function(){
      this.setData({ tip_panel:false});
      wx.navigateBack();
  },

  //取消订单
  cancelFun:function(){
     this.setData({ reason_panel:true })
  },

  textFun:function(e){
      this.setData({
         reason: e.detail.value
      })
  },

  confirmReason:function(){
      var _this = this;
      _this.setData({ 
        loaderhide:false,
        reason_panel:false
      });

      var param = {
             mini:'mini',
             orderId:this.data.orderId,
             reason:this.data.reason
      };

      wx.request({
          url: app.globalData.host+"/waimai/goods/cancel",
          data:param,
          method:'POST',
          header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
          success: function(res) {
            //服务器返回数据
            _this.setData({ loaderhide:true });
            if(res.data.errcode == 0){   //申请退单 
                wx.showModal({
                  content:'申请退单成功',
                  showCancel: false,
                  success: function(res) {
                    if (res.confirm) {
                        _this.onLoad();
                    }
                  }
                })

            }else{
                wx.showModal({
                  content:'申请退单失败，请重试',
                  showCancel: false
                })
            }
          }
      })
  }

})
