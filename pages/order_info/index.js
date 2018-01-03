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
     loaderhide:true,
     paytype:1,
     type_panel:false,
     tip_panel:false,
     tradeInfo:'' 
   },

   onLoad: function (option) {
       var _this = this;
       _this.setData({
          deskNo:app.globalData.deskNo,
          shopName:app.globalData.shopName,
          shopInfo:app.globalData.shopInfo
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
              order.userFee = (order.userFee/100).toFixed(2);
              order.totalFee = (order.totalFee/100).toFixed(2);
              order.discountFeeVal = (order.discountFee/100).toFixed(2);
              order.packTotalFeeVal = (order.packTotalFee/100).toFixed(2);
              order.orderTime = formatTime(order.orderTime);
              order.payTime = formatTime(order.payTime); 
              order.coupons = JSON.parse(order.coupons);
              order.activity = JSON.parse(order.activity);
               
              var items=[],
                  orderData =  order.dcOrderGoodsList;

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
                    singleItem.Data = orderData[i];
                    singleItem.subData = subData;
                    items.push(singleItem);
                 }
               }

              _this.setData({ 
                  loaderhide:true,
                  order:order,
                  paytype:order.payType,
                  items:items
              })
            }else{
                 _this.showDialog(res.data.msg);
                 // wx.showModal({
                 //      content:res.data.msg,
                 //      showCancel: false
                 //  });
            }
 
          }
      })
  },
  backFun:function(){
    // console.log(getCurrentPages()[getCurrentPages().length-2])
    if(getCurrentPages()[getCurrentPages().length-2].route == "pages/order_list/index"){
         wx.navigateBack();
    }else{
         wx.reLaunch({ url:'../order_list/index'})
    }
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

    wx.request({
        url: app.globalData.host+"/orderQuery/payOrder",
        method:'POST',
        header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
        data:{
           mini:'mini',
           userId:app.globalData.userId,
           openId:app.globalData.openId,
           orderId:this.data.order.orderId,
           payType:this.data.paytype
        },
        success: function(res) {
          //服务器返回数据
          // console.log(res);
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
                       wx.navigateBack();
                    },
                   'fail':function(res){
                       wx.redirectTo({ url: '../order_fail/index' })
                   }
                }) 
              }
              //调用账户支付
              else{
                if(!tradeInfo.bala){
                    wx.navigateBack();
                    return;
                }

                 tradeInfo.paytype = '会员卡';
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
      wx.navigateBack();
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
  },




})
