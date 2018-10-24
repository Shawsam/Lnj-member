//index.js
import { formatTime } from '../../utils/util.js'
//获取应用实例
var pageNo = 1;
var app = getApp()
Page({
  data: {
     userInfo:null,
     loaderhide:true,
     jumpLock:false,
     Lowerloading:false,
     Upperloading:false
  },
  onLoad:function(){
	  var _this = this;
    pageNo = 1;
	  //获取全局数据，初始化当前页面
	  app.getUserInfo(function(userInfo){
	     //用户信息
	     _this.setData({
	       userInfo:userInfo
	     })

        var _this = this;
        _this.setData({ shopName:app.globalData.shopName });
        _this.setData({loaderhide:false})
        _this.setData({Lowerloading:false,noMore:false})
        wx.request({
              url: app.globalData.host+"/waimai/goods/ordersList",
              data:{
                 mini:'mini',
                 userId:app.globalData.userId,
                 pageNo:pageNo,
                 pageSize:10
              },
              success: function(res) {
                //服务器返回数据
                console.log(res);
                _this.setData({ loaderhide:true });
                if(res.data.errcode == 0){
                     var orderList = res.data.data;
                     for(var i in orderList){
                       orderList[i].orderTime = formatTime(orderList[i].orderTime).substr(5,11);
                       var status = orderList[i].status,statusDesp;
                       switch(status){
                          case 1: statusDesp = '待支付';break;
                          case 2: statusDesp = '已支付';break;
                          case 3: statusDesp = '已出餐';break;
                          case 4: statusDesp = '已退单';break;
                          case 6: statusDesp = '已支付';break;
                          case 7: statusDesp = '接单失败';break;
                          case 8: statusDesp = '已完成';break;
                          case 9: statusDesp = '已取消';break;
                       }
                       orderList[i].statusDesp = statusDesp;
                     }
                     _this.setData({
                       orderList:orderList
                     })

                     setTimeout(function(){
                        _this.setData({
                           Upperloading:false,
                        })
                     },500)
                }
              }
        })
    
	  })
  },
  openDetails:function(e){
    var _this = this;
    var param = e.currentTarget.dataset.param;
    wx.navigateTo({
          url:'../takeOut_order_info/index?orderId='+param,
          success:function(){
             setTimeout(function(){
                _this.setData({jumpLock:false});
              },500)
          }
    })
  },
  oneMore:function(e){
      //跳转锁定
      var _this = this;
      var shopId = e.currentTarget.dataset.a;
      var shopName = e.currentTarget.dataset.b;
      var jumpLock = _this.data.jumpLock;
      if(jumpLock) return;
      _this.setData({jumpLock:true});

      wx.navigateTo({
          url:'../takeOut_menu/index?shopId='+shopId+'&shopName='+shopName,
          success:function(){
             setTimeout(function(){
                _this.setData({jumpLock:false});
              },500)
          }
      })
  },
  onShow:function(){
     //显示
     this.onLoad();
  },
  ScrollLower:function(){
    
    if(this.data.Lowerloading) return;
    this.setData({Lowerloading:true})

    pageNo = pageNo + 1;
    var _this = this;
    _this.setData({loaderhide:false});
    wx.request({
          url: app.globalData.host+"/waimai/goods/ordersList",
          data:{
             mini:'mini',
             userId:app.globalData.userId,
             pageNo:pageNo,
             pageSize:10
          },
          success: function(res) {
            //服务器返回数据
            console.log(res);
            _this.setData({ loaderhide:true });
            if(res.data.errcode == 0){
                 var orderList = res.data.data;
                 if(orderList.length == 0){ 
                    _this.setData({noMore:true});
                    return;
                 }

                 for(var i in orderList){
                   orderList[i].orderTime = formatTime(orderList[i].orderTime).substr(5,11);
                   var status = orderList[i].status,statusDesp;
                   switch(status){
                      case 1: statusDesp = '待支付';break;
                      case 2: statusDesp = '已支付';break;
                      case 3: statusDesp = '已支付';break;
                      case 4: statusDesp = '已退单';break;
                      case 6: statusDesp = '已支付';break;
                      case 7: statusDesp = '接单失败';break;
                      case 8: statusDesp = '已完成';break;
                      case 9: statusDesp = '已取消';break;
                   }
                   orderList[i].statusDesp = statusDesp;
                 }

                  var _orderList = _this.data.orderList;
                  orderList = _orderList.concat(orderList);
                  console.log(orderList);
                 _this.setData({
                     orderList:orderList,
                     Lowerloading:false
                 })
            }
          }
    })
  },
  ScrollUpper:function(){

    if(this.data.Upperloading) return;
    this.setData({Upperloading:true});
    this.onLoad();

  }
})
