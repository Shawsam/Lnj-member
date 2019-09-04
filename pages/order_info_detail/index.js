//index.js
//获取应用实例
import { formatTime } from '../../utils/util.js'

var app = getApp()
Page({
   data:{
     deskNo:'',
     shopName:'',
     sendNo:'',
     order:{}, 
     items:[],
     isCard:1,
     cardFeeVal:'',
     balaVal:'',
     loaderhide:true,
     paytype:1,
     type_panel:false,
     tip_panel:false,
     tradeInfo:'',
     isMember:0 
   },

   onLoad: function (option) {
       var _this = this;
       _this.setData({
          deskNo:app.globalData.deskNo,
          shopName:app.globalData.shopName,
          shopInfo:app.globalData.shopInfo||'',
          isMember:app.globalData.userId?1:0
       })
      
      var orderId = option.orderId;
      _this.setData({ loaderhide:false });
      wx.request({
          url: app.globalData.host+"/orderQuery/getOrderDetail",
          data:{
             mini:'mini',
             openId:app.globalData.openId,
             orderId:orderId
          },
          success: function(res) {
            //服务器返回数据
            console.log(res);
            var resdata = res.data;
            if(resdata.errcode == 0){
              var order = resdata.order; 
              order.userFee = order.userFee;
              order.totalFee = order.totalFee;
              order.userFeeVal = (order.userFee/100).toFixed(2);
              order.totalFeeVal = (order.totalFee/100).toFixed(2);
              order.discountFeeVal = (order.discountFee/100).toFixed(2);
              order.packTotalFeeVal = (order.packTotalFee/100).toFixed(2);
              order.orderTime = formatTime(order.orderTime);
              order.payTime = formatTime(order.payTime); 
              order.coupons = JSON.parse(order.coupons);
              order.activity = JSON.parse(order.activity);
               
              var items=[],
                  orderData =  order.dcOrderGoodsList;
              
              console.log(orderData)
              for(var i in orderData){
                 var singleItem = {};
                 if(orderData[i].type != 2){
                    var subData = [];
                    for(var j=0; j<orderData.length; j++){
                      if(orderData[j].type ==2 && orderData[j].groups == orderData[i].groups){
                         if(orderData[j].price){
                           orderData[i].price = orderData[i].price + orderData[j].price;
                         }
                         subData.push(orderData[j]);
                      }
                    }
                    orderData[i].price = (orderData[i].price/100).toFixed(2);
                    orderData[i].totalPrice = (orderData[i].count * orderData[i].price).toFixed(2)
                    singleItem.Data = orderData[i];
                    singleItem.subData = subData;
                    items.push(singleItem);
                 }
               }

                _this.setData({ 
                    loaderhide:true,
                    order:order,
                    paytype:order.payType,
                    dcOrderPays:order.dcOrderPays,       // 1会员卡 2微信 4支付宝
                    items:items
                })

            }else{
                 wx.showModal({ content:res.data.msg, showCancel:false});
            }
 
          }
      })
  },

    payFun:function(){
    this.setData({type_panel:true})    
  },

  chooseTap:function(e){
     var type = e.currentTarget.dataset.type;
     this.setData({
      paytype:type
     })
  },

  coverTap:function(){
      this.setData({
        type_panel:false
      })
  },

  confirmChoose:function(){
    var _this = this;
    _this.setData({ loaderhide:false });

    var param = {
           mini:'mini',
           userId:app.globalData.userId,
           openId:app.globalData.openId,
           orderId:this.data.order.orderId,
           payType:this.data.paytype
    };

    if(param.userId == undefined ){
         delete param.userId;
    }
    if(this.data.paytype!=1){  //paytype = 1 会员卡支付
         delete param.isCard;
         delete param.bala;
         delete param.cardFee;
         delete param.thirdFee;
    }

    wx.request({
        url: app.globalData.host+"/orderQuery/payOrder",
        data:param,
        method:'POST',
        header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
       
        success: function(res) {
          //服务器返回数据
          _this.setData({ 
            loaderhide:true,
            type_panel:false
          });

          if(res.data.errcode == 100){       //errorcode = 100 已经支付
                _this.showDialog1('该订单已支付')
               // wx.showModal({    
               //      content:'该订单已支付',
               //      showCancel: false,
               //      success: function(res) {
               //         if (res.confirm) {
               //           wx.navigateBack();
               //         }
               //      }
               // });
          }else if(res.data.errcode == 0){   //支付成功状态 生成订单成功                            
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
                       wx.navigateBack({delta:2});
                    },
                   'fail':function(res){
                       wx.redirectTo({ url: '../order_fail/index' })
                   }
                }) 
              }
              //调用账户支付
              else{
                if(!tradeInfo.bala){
                    wx.navigateBack({delta:2});
                    return;
                }

                 tradeInfo.paytype = '舅粉钱包';
                 _this.setData({ 
                    tip_panel:true,
                    tradeInfo:tradeInfo
                 });

              }


          }else{
               _this.showDialog(res.data.msg);
               // wx.showModal({                //其他错误
               //      content:res.data.msg,
               //      showCancel: false
               // });

          }
        }
    })

  },

  confirmTrade:function(){
      this.setData({ tip_panel:false});
      wx.navigateBack({delta:2});
  },

  cancelFun:function(){
    var _this = this;
    var param = {
                   mini:'mini',
                   openId:app.globalData.openId,
                   orderId:this.data.order.orderId
            }
    wx.showModal({content:'确定要取消该订单吗?',
                  success: function (res) {
                    if (res.confirm) {
                        _this.setData({ loaderhide:false });
                        wx.request({
                            url: app.globalData.host+"/orderQuery/cancelByUser",
                            data:param,
                            method:'POST',
                            header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
                            success: function(res) {
                              //服务器返回数据
                              _this.setData({ loaderhide:true })
                              if(res.data.errcode == 0){
                                 wx.showToast({title:'订单已取消'});
                                 setTimeout(function(){
                                     wx.navigateBack({delta:2});
                                 },600)
                              }else{
                                 _this.showDialog(res.data.msg);
                              }
                            }
                        })
                    }
                  }
            })
  },
  backFun:function(){
    wx.navigateBack()
  },
  //=======提示框=========================================
  showDialog:function(msg){
      this.setData({
        dialogShow:true,
        contentMsg:msg
      })
  },
  dialogConfirm:function(){
      this.setData({
        dialogShow:false
      })
  },

  showDialog1:function(msg){
      this.setData({
        dialogShow1:true,
        contentMsg:msg
      })
  },
  dialogConfirm1:function(){
      this.setData({
        dialogShow1:false
      })
      wx.navigateBack();
  }

})
