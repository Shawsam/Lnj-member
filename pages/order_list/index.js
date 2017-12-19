//index.js
//获取应用实例
import { formatTime } from '../../utils/util.js'

var isInitSelfShow = true;

var app = getApp()
Page({
  data:{
    orderList:[],
    loaderhide:true,
    jumpLock:false,
    moreDisabled:false
  },
  onLoad: function() {
     var _this = this;
     //获取全局数据，初始化当前页面
     app.getUserInfo(function(userInfo){
      //用户信息
      _this.setData({
        userInfo:userInfo
      })
     })
   
    _this.setData({ loaderhide:false });


    //请求门店信息
    var param = { mini:'mini',
                  shopId:app.globalData.shopId,
                  openId:app.globalData.openId };
    wx.request({
        url: app.globalData.host+'/shop/shopInfo',  
        data: param,
        success: function (res) {
           if(res.data.errcode == -1){
             _this.setData({ moreDisabled:true })
           }

           wx.request({
                  url: app.globalData.host+"/orderQuery/orderList",
                  data:{
                     mini:'mini',
                     shopId:app.globalData.shopId,
                     openId:app.globalData.openId,
                     deskNo:app.globalData.deskNo
                  },
                  success: function(res) {
                    //服务器返回数据
                    console.log(res);
                    _this.setData({ loaderhide:true });
                    if(res.data.errcode == 0){
                        var orderList = res.data.data,
                            _orderList = [];
                        
                        for(var i in orderList){
                          var singleData = {};
                          singleData.orderId = orderList[i].orderId;
                          singleData.slide = false;
                          singleData.dinnerNo = orderList[i].dinnerNo;
                          singleData.statusDesc = orderList[i].statusDesc;
                          singleData.status = orderList[i].status;
                          singleData.userFee = (orderList[i].userFee/100).toFixed(2); 
                          singleData.totalFee = (orderList[i].totalFee/100).toFixed(2); 
                          singleData.orderTime = formatTime(orderList[i].orderTime);
                          singleData.subscribeTime = orderList[i].subscribeTime;

                          var dcOrderGoodsList = []; 
                          for(var j in orderList[i].dcOrderGoodsList){
                              orderList[i].dcOrderGoodsList[j].price = (orderList[i].dcOrderGoodsList[j].price/100).toFixed(2);
                              if(orderList[i].dcOrderGoodsList[j].type != 2){
                                 dcOrderGoodsList.push(orderList[i].dcOrderGoodsList[j]);
                              }
                          }
                          singleData.dcOrderGoodsList = dcOrderGoodsList;
                          _orderList.push(singleData);
                          // console.log(_orderList);
                        }

                        _this.setData({
                             orderList:_orderList
                        }); 
                    }else{
                         wx.showModal({
                              content:res.data.msg,
                              showCancel: false
                          });
                    }
                  }
              })

        }
    })

  },

  onShow:function(){
    if (isInitSelfShow) return;
    this.onLoad();
  },

  onHide() {
      isInitSelfShow = false;
  },

  slideFun:function(e){
    var param = e.currentTarget.dataset.param,
        orderList = this.data.orderList;
    orderList[param].slide = !orderList[param].slide;
    this.setData({
         orderList:orderList
    }); 

  },

  infoTap:function(e){

     var _this = this;

     //跳转锁定
     var jumpLock = _this.data.jumpLock;
     if(jumpLock) return;
     _this.setData({jumpLock:true});

     var orderId = e.currentTarget.dataset.param;
     wx.navigateTo({
          url: '../order_info/index?orderId='+orderId,
          success:function(){
          setTimeout(function(){
             _this.setData({jumpLock:false});
          },500)
        }
     })
  },
  moreTap:function(){
     var _this = this;
     if(this.data.moreDisabled) return;

     //跳转锁定
     var jumpLock = _this.data.jumpLock;
     if(jumpLock) return;
     _this.setData({jumpLock:true});

     wx.setStorageSync('items','');
     wx.navigateTo({
        url: '../order/index',
        success:function(){
          setTimeout(function(){
             _this.setData({jumpLock:false});
          },500)
        }
     })
  }
})
