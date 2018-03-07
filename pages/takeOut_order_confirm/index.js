//index.js
import { formatTime } from '../../utils/util.js'

//获取应用实例
var app = getApp()
Page({
  data:{
      userInfo:null,
      cardNo:'',
      shopName:'',
      cart_items:[],
      totalFee:0, 
      totalFeeVal:'0.00',                
      userFee:0,
      userFeeVal:'0.00',
      discountFee:0,
      discountFeeVal:'0.00',
      totalBoxNum:0,
      totalBoxFee:0,
      dinnerType:1,     //用餐方式
      paytype:1,        //支付方式
      phone:'',         //联系方式
      phoneInput:'', 
      caution:'',
      needs:'',         //更多需求
      tip_panel:false,
      tradeInfo:'',
      phoneSlide:false,
      needsSlide:false,
      loaderhide:true,
      loaderhide1:true,
      textComplete:true,
      array:[1,2,3,4,5,6,7,8,9,10],
      indexNum:0
  },
  
  onLoad: function (option) {
    var _this = this;

    //获取全局数据，初始化当前页面
    app.getUserInfo(function(userInfo){
      //用户信息
      _this.setData({
        userInfo:userInfo
      })
    })

    //点餐页面传递的参数
    // console.log(option);
    var cart_items = option.cart_items,
        detail_items = option.detail_items;
    //读取缓存地址
    var chooseAddr = wx.getStorageSync('chooseAddr');
    var distanceTime = app.globalData.distanceTime?app.globalData.distanceTime:40;
    var currentTime = new Date().getTime();
    var arrivalTimeStamp = formatTime(currentTime + distanceTime*60*1000);
    var arrivalTime = arrivalTimeStamp.substr(10,6);

    console.log(cart_items);
    _this.setData({
       shopName:app.globalData.shopName,
       distanceTime:distanceTime,
       arrivalTime:arrivalTime,
       arrivalTimeStamp:arrivalTimeStamp,
       cardNo:app.globalData.cardNo,
       phone:app.globalData.mobile,
       phoneInput:app.globalData.mobile,
       cart_items:JSON.parse(cart_items),
       detail_items:JSON.parse(detail_items),
       chooseAddr:JSON.parse(chooseAddr)
    })

    console.log(this.data.detail_items);

    
    //请求订单计算接口
    var param = {
        mini:'mini',
        storeid:app.globalData.shopId,
        goodsDetail:JSON.stringify(this.data.detail_items),
    }
    _this.setData({ loaderhide:false });
    wx.request({
        url: app.globalData.host+'/waimai/goods/jsOrderPrice', 
        data:param,
        header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
        method:'POST',
        success: function (res) {
            //服务器返回的结果
            console.log(res);
            _this.setData({ loaderhide:true });
            if (res.data.errcode == 0) {
                var resdata = res.data;
                _this.setData({
                  totalFee:resdata.totalFee,                 
                  userFee:resdata.userFee,
                  discountFee:resdata.discountFee,
                  totalBoxNum:resdata.totalBoxNum,
                  totalBoxFee:resdata.totalBoxFee,
                  deliveryFee:resdata.deliveryFee,
                  deliveryFeeVal:(resdata.deliveryFee).toFixed(2),
                  totalFeeVal:(resdata.totalFee).toFixed(2),
                  userFeeVal:(resdata.userFee).toFixed(2),
                  discountFee:resdata.discountFee,
                  discountFeeVal:(resdata.discountFee).toFixed(2),
                  totalBoxFeeVal:(resdata.totalBoxFee).toFixed(2)
                })
   
            } else {
                wx.showModal({
                    content:res.data.msg,
                    showCancel: false
               });
            }
        },
        fail: function () {
            console.log('系统错误')
        }
    })
  },

  onShow: function(){
    var _this = this;
    wx.getStorage({
      key:'paytype',
      success: function(res) {
          var data = res.data;
          _this.setData({
              paytype:data
          })
      } 
    })
  },

   bindPickerChange: function(e) {
    this.setData({
      indexNum: e.detail.value
    })
  },

  //更多需求
  needsSlideTap:function(){
       this.setData({
           needsSlide:!this.data.needsSlide,
           textComplete:!this.data.textComplete
       })
  },
  
  //跳转到 账户选择
  openAccount:function(){
     if(!app.globalData.cardNo) return;
     wx.navigateTo({
        url: '../account/index?type='+this.data.paytype
     })
  },
  
  // demandInput:function(e){
  //     this.setData({
  //        caution: e.detail.value
  //     })
  // },
  demandFocus:function(e){
    console.log(1);
    this.setData({
      textComplete:false
    })
  },

  demandBlur:function(e){
    console.log(2);
    this.setData({
      caution: e.detail.value,
      textComplete:true
    })
  },
 

  //表单校验，提交数据
  orderSubmit:function(){
    var phone = this.data.phoneInput;
      if(phone==''){
        wx.showModal({
              content:"请输入手机号",
              showCancel: false
        });
        return;
      }
      if(!this.is_phone(phone)){
        wx.showModal({
              content:"请输入正确的手机号",
              showCancel: false
        });
        return;
      }
      this.setData({
         phone:phone,
         phoneSlide:false
      })
    
    console.log(this.data.chooseAddr.id);
    var _this = this,
    param= {
        mini:'mini',
        storeid:app.globalData.shopId,
        openId:app.globalData.openId,                
        userId:app.globalData.userId, 
        addressId:this.data.chooseAddr.id,                                                      
        payType:this.data.paytype,                                                                                               
        caution:this.data.caution,                       
        goodsDetail:JSON.stringify(this.data.detail_items),                      
        totalFee:this.data.totalFee,                 
        userFee:this.data.userFee,
        discountFee:this.data.discountFee,
        totalBoxNum:this.data.totalBoxNum,
        totalBoxFee:this.data.totalBoxFee,
        deliveryFee:this.data.deliveryFee,
        people:parseInt(this.data.indexNum)+1,
        arriveNendTime:this.data.distanceTime

    };
    
    wx.setStorageSync('clearCart',true);
    wx.setStorageSync('items','');
    wx.removeStorage({key:'paytype'});

    _this.setData({ loaderhide1:false });
    console.log(param);
    wx.request({
        url: app.globalData.host+"/waimai/goods/creatOrder",
        data: param,
        header: {  
          "Content-Type": "application/x-www-form-urlencoded"  
        }, 
        method:'POST',
        success: function(res) {
          _this.setData({ loaderhide1:true });
          var resdata = res.data;
          console.log(resdata);

          if(resdata.errcode == 0){                            //调用接口成功
              var orderId = resdata.data,
                  tradeInfo = resdata;
              console.log(tradeInfo);

              //============生成订单成功============//
              if(orderId){
                  //调微信支付
                  if(resdata.paySign){                            
                     wx.requestPayment({
                       'timeStamp': resdata.timeStamp,
                       'nonceStr': resdata.nonceStr,
                       'package': resdata.packages,
                       'signType': resdata.signType,
                       'paySign': resdata.paySign,
                       'success':function(res){
                           wx.redirectTo({
                             url: '../takeOut_order_info/index?orderId='+orderId
                           })
                        },
                       'fail':function(res){
                            wx.redirectTo({ url: '../takeOut_order_fail/index' })
                        }
                    }) 
                  }
                  //调用账户支付
                  else{
                    if(!tradeInfo.bala){
                        wx.redirectTo({
                           url: '../takeOut_order_info/index?orderId='+orderId
                        })
                        return;
                    }

                     tradeInfo.paytype = '亲情账户';
                     _this.setData({ 
                        tip_panel:true,
                        tradeInfo:tradeInfo
                     });

                  }
              }
              //============生成订单失败============//
              else{                                             
                    wx.showModal({                           
                            content:res.errMsg, 
                            showCancel: false,
                            success: function(res) {
                              if (res.confirm) {
                                wx.redirectTo({ url: '../takeOut_order_fail/index' })
                              }
                            }
                    })
              } 
          }else{
              var orderId = res.data.data;
              if(orderId){
                    wx.showModal({                           
                            content:res.data.msg, 
                            showCancel: false,
                            success: function(res) {
                              if (res.confirm) {
                                wx.redirectTo({ url: '../takeOut_order_fail/index' })
                              }
                            }
                    })
              }else{
                   wx.showModal({content:resdata.msg,showCancel: false})
              }
          }
        }
    })
  },

  confirmTrade:function(){
      var orderId = this.data.tradeInfo.data;
      this.setData({ tip_panel:false});

      wx.redirectTo({
         url: '../takeOut_order_info/index?orderId='+orderId
      })
  },
  is_phone:function(str){
    var reg=/^1\d{10}$/;
    if(reg.test(str))
      return true;
    else
      return false;
  },
  editAddr:function(){
    if(getCurrentPages()[getCurrentPages().length-2].route == "pages/takeOut_addr/index"){
         wx.navigateBack({delta: 3})
    }else{
         wx.navigateTo({ url:'../takeOut_addr/index'})
    }

  }

})