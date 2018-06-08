//index.js
//获取应用实例
import { formatTime } from '../../utils/util.js'

var isInitSelfShow = true;
var pageNo = 1;
var app = getApp()
Page({
  data:{
    loaderhide:true,
    jumpLock:false,
    moreDisabled:false,
    Lowerloading:false,
    Upperloading:false
  },
  onLoad: function() {
     var _this = this;
     pageNo = 1;

     //获取全局数据，初始化当前页面
     app.getUserInfo(function(userInfo){
      //用户信息
      _this.setData({
        userInfo:userInfo
      })
     })
   
     _this.setData({ loaderhide:false });
     _this.setData({Lowerloading:false,noMore:false})

      //请求门店信息
      var param = { mini:'mini',
                    openId:app.globalData.openId,
                    userId:app.globalData.userId,
                    pageNo:pageNo,
                    pageSize:10
                  };
      if(param.userId == undefined) delete param.userId

      wx.request({
              url: app.globalData.host+"/orderQuery/orderPageList",
              data: param,
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
                      singleData.shopId = orderList[i].shopId;
                      singleData.deskId = orderList[i].deskId;
                      singleData.isSubscribe = orderList[i].isSubscribe;
                      singleData.dinnerType = orderList[i].dinnerType;

                      singleData.slide = false;
                      singleData.shopName = orderList[i].shopName;
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
                      // if(orderList[i].packTotalFee > 0){
                      //     var packItem = {};
                      //     packItem.goodsName = '餐盒费';
                      //     packItem.count = orderList[i].packNum;
                      //     packItem.price = (orderList[i].packTotalFee/100).toFixed(2);
                      //     dcOrderGoodsList.push(packItem);
                      // }
                      singleData.dcOrderGoodsList = dcOrderGoodsList;
                      _orderList.push(singleData);
                    }

                    _this.setData({
                         orderList:_orderList
                    }); 

                   setTimeout(function(){
                     _this.setData({
                       Upperloading:false,
                     })
                   },500)

                }else{
                     _this.showDialog(res.data.msg);
                }
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

     //店铺名 桌号写入
     var shopId = e.currentTarget.dataset.shopid;
     var deskId = e.currentTarget.dataset.deskid;

     app.globalData.shopId = shopId;
     app.globalData.deskNo = deskId;

    //请求门店信息
    var param = { mini:'mini',
                  shopId:shopId,
                  openId:app.globalData.openId };
    wx.request({
        url: app.globalData.host+'/shop/shopInfo',  
        data: param,
        success: function (res) {
            //服务器返回的结果
            if (res.data.errcode == 0) {
                 var shopName = res.data.data.shopName;
                 app.globalData.shopName = shopName;

                 var orderId = e.currentTarget.dataset.param;
                 wx.navigateTo({
                      url: '../order_info/index?orderId='+orderId,
                      success:function(){
                      setTimeout(function(){
                         _this.setData({jumpLock:false});
                      },500)
                    }
                 })
            }
        }
    })



  },

  JumpToEntrace:function(){
     var _this = this;

     //跳转锁定
     var jumpLock = _this.data.jumpLock;
     if(jumpLock) return;
     _this.setData({jumpLock:true});

     wx.navigateBack();
  },

  ScrollLower:function(){
  
    if(this.data.Lowerloading) return;
    this.setData({Lowerloading:true})

    pageNo = pageNo + 1;
    var _this = this;
    _this.setData({loaderhide:false});


    var param = { mini:'mini',
                  openId:app.globalData.openId,
                  userId:app.globalData.userId,
                  pageNo:pageNo,
                  pageSize:10
                };
    if(param.userId == undefined) delete param.userId

    wx.request({
            url: app.globalData.host+"/orderQuery/orderPageList",
            data: param,
            success: function(res) {
              //服务器返回数据
              _this.setData({ loaderhide:true });
              if(res.data.errcode == 0){

                  
                  var orderList = res.data.data,
                      _orderList = [];

                  if(orderList.length == 0){ 
                      _this.setData({noMore:true});
                      return;
                  }

                  for(var i in orderList){
                    var singleData = {};
                    singleData.orderId = orderList[i].orderId;

                    singleData.shopId = orderList[i].shopId;
                    singleData.deskId = orderList[i].deskId;
                    singleData.isSubscribe = orderList[i].isSubscribe;
                    singleData.dinnerType = orderList[i].dinnerType;

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
                    if(orderList[i].packTotalFee > 0){
                        var packItem = {};
                        packItem.goodsName = '餐盒费';
                        packItem.count = orderList[i].packNum;
                        packItem.price = (orderList[i].packTotalFee/100).toFixed(2);
                        dcOrderGoodsList.push(packItem);
                    }
                    singleData.dcOrderGoodsList = dcOrderGoodsList;
                    _orderList.push(singleData);
                  }

                  var NeworderList = _this.data.orderList;
                  NeworderList = NeworderList.concat(_orderList);
                  

                  console.log(NeworderList)
                  _this.setData({
                       orderList:NeworderList,
                       Lowerloading:false
                  }); 

                 setTimeout(function(){
                   _this.setData({
                     Upperloading:false,
                   })
                 },500)

              }else{
                   _this.showDialog(res.data.msg);
              }
            }
    })

  },

  ScrollUpper:function(){
    if(this.data.Upperloading) return;
    this.setData({Upperloading:true});
    this.onLoad();
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
  }
})
