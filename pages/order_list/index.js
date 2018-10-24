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
    moreDisabled:false,
    indexPage:false
  },
  onLoad: function() {

    if(getCurrentPages().length==1){
      this.setData({indexPage:true})
    }

     var _this = this;
     //获取全局数据，初始化当前页面
     app.globalData.userInfo = null;
     app.getUserInfo(function(userInfo){
      //用户信息
      _this.setData({
        userInfo:userInfo
      })
      console.log(app.globalData)
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

               _this.showDialog("该门店已关店");
               // wx.showModal({
               //      content:"该门店已关店",
               //      showCancel: false
               // });
             }

             var param = {
                       mini:'mini',
                       shopId:app.globalData.shopId,
                       openId:app.globalData.openId,
                       userId:app.globalData.userId,
                       deskNo:app.globalData.deskNo
             }
             if(app.globalData.userId == undefined ){
                 delete param.userId;
             }
             
             wx.request({
                    url: app.globalData.host+"/orderQuery/orderList",
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
                            singleData.slide = false;
                            singleData.dinnerNo = orderList[i].dinnerNo;
                            singleData.shopName = orderList[i].shopName;
                            singleData.statusDesc = orderList[i].statusDesc;
                            singleData.status = orderList[i].status;
                            singleData.userFee = (orderList[i].userFee/100).toFixed(2); 
                            singleData.totalFee = (orderList[i].totalFee/100).toFixed(2); 
                            singleData.orderTime = formatTime(orderList[i].orderTime);
                            singleData.subscribeTime = orderList[i].subscribeTime;
                            singleData.isSubscribe = orderList[i].isSubscribe;
                            singleData.dinnerType = orderList[i].dinnerType;

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
                            // console.log(_orderList);
                          }

                          _this.setData({
                               orderList:_orderList
                          }); 
                      }else{
                           _this.showDialog(res.data.msg);
                           // wx.showModal({
                           //      content:res.data.msg,
                           //      showCancel: false
                           //  });
                      }
                    }
                })

          }
      })

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
  },

  Return:function(){
    wx.redirectTo({url:'../../pages/homepage/index'});
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
