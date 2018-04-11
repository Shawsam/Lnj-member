//index.js
//获取应用实例
var app = getApp()
Page({
  data:{
      userInfo:null,
      cardNo:'',
      shopName:'',
      cart_items:[],
      detail_items:[],  //明细 
      dwCoupons:[],     //会员商品券对应商品
      activity:[],      //活动折扣信息
      coupons:[],       //选择的优惠券
      couponsNum:0,     //选择了多少张
      card_num:0,       //一共多少张
      goodsId:'',       //单品数据
      taoCanNum:'',     //套餐数据
      couponsData:[],
      totalFee:0,                 
      userFee:0,
      userFeeVal:'0.00',
      discountFee:0,
      discountFeeVal:'0.00',
      packNum:0,
      packPrice:0,
      packTotalFee:0,
      couponFee:0,
      dinnerType:1,     //用餐方式
      paytype:2,        //支付方式
      phone:'',         //联系方式
      phoneInput:'', 
      caution:'',
      needs:'',         //更多需求
      isMember:1,       //会员 有userid则是会员否则为非会员
      isInvoice:0,      //是否需要发票
      tip_panel:false,
      tradeInfo:'',
      phoneSlide:false,
      needsSlide:false,
      loaderhide:true,
      textComplete:true,
      subscribe:0,         //是否预约打包
      subscribeTime:'',    //预约打包时间
      currentTime:'',
      startTime:'10:00',
      endTime:'20:00'

  },
  
  Init:function(){
      //POST 参数   计算订单信息
      var _this = this;
      var param = {
          mini:'mini',
          shopId:app.globalData.shopId,
          openId:app.globalData.openId,
          goodsDetail:JSON.stringify(this.data.detail_items),
          coupons:JSON.stringify(this.data.coupons),
          dwCoupons:this.data.dwCoupons,
          dinnerType:this.data.dinnerType,
          subscribe:this.data.subscribe
      }
      if(this.data.subscribe==0){
         delete param.subscribe;
      }

      _this.setData({ loaderhide:false });

      wx.request({
          url: app.globalData.host+'/orderQuery/jsOrderPrice', 
          data:param,
          header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
          method:'POST',
          success: function (res) {
              //服务器返回的结果
              console.log(res);
              if (res.data.errcode == 0) {
                  var resdata = res.data,
                      activity = resdata.activity,
                      coupons = resdata.coupons;

                  if(activity){
                      activity = JSON.parse(activity);
                  }
                  if(coupons){
                      coupons = JSON.parse(coupons);
                  }
                  
                  _this.setData({
                        userFee:resdata.userFee,
                        packTotalFee:resdata.packageFee,
                        totalFee:resdata.totalOrderFee,                 
                        userFee:resdata.userFee,
                        userFeeVal:(resdata.userFee/100).toFixed(2),
                        discountFee:resdata.discountFee,
                        packNum:resdata.packageCount,
                        packPrice:resdata.packageFee,
                        packTotalFee:resdata.totalPackageFee,
                        packTotalFeeVal:(resdata.totalPackageFee/100).toFixed(2),
                        couponFee:resdata.couponFee,
                        // coupons:coupons,
                        activity:activity,
                        couponsNum:coupons.length
                  })
     
              } else {
                  _this.showDialog(res.data.msg);
                 //  wx.showModal({
                 //      content:res.data.msg,
                 //      showCancel: false
                 // });
              }

          },
          fail: function () {
              console.log('系统错误')
          }
      })


      //优惠券数量   优惠券信息
      var param = {
        mini:'min',
        shopId:app.globalData.shopId,
        openId:app.globalData.openId,
        taoCanNum:this.data.taoCanNum,
        goodsId:this.data.goodsId
      }

      wx.request({
          url: app.globalData.host+'/coupon/couponList', 
          data:param, 
          success: function (res) {
              //服务器返回的结果
              // console.log(res);
              _this.setData({ loaderhide:true });
              if (res.data.errcode == 0) {
                  var feiTaoCanList = res.data.feiTaoCanList,
                      taoCanList = res.data.taoCanList,
                      otherList = res.data.otherList,
                      a = feiTaoCanList?feiTaoCanList.length:0,
                      b = taoCanList?taoCanList.length:0,
                      c = otherList?otherList.length:0;

                      _this.setData({
                         couponsData:res.data,
                         card_num:a+b+c
                      })
                  
              } else {
                 _this.showDialog(res.data.msg);
                 // wx.showModal({
                 //      content:res.data.msg,
                 //      showCancel: false
                 // });
              }

          },
          fail: function () {
              console.log('系统错误')
          }
      })

      var param = {
        mini:'min',
        shopId:app.globalData.shopId,
        openId:app.globalData.openId
      }
      wx.request({
          url: app.globalData.host+'/shop/shopInfo2', 
          data:param, 
          success: function (res) {
              //服务器返回的结果
              if (res.data.errcode == 0) {
                var InvoiceEnable = res.data.shop.isInvoice;
                _this.setData({
                  InvoiceEnable:InvoiceEnable
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

  onLoad: function (option) {
    var _this = this;
    
    if(app.globalData.fromType == 1){
        var startTime,endTime,
            currentTime = new Date(),
            currentHours = currentTime.getHours(),
            currentTime = currentTime.getMinutes()<10?'0'+currentTime.getMinutes():currentTime.getMinutes();
        if(currentHours<10){
           startTime = '10:00';
           endTime = '20:00';
           _this.setData({currentTime:startTime})
           _this.setData({subscribeTime:startTime})
        }else if(currentHours>=20){
           _this.showDialog1('当前时间不提供预约打包服务')
           // wx.showModal({content:'当前时间不提供预约打包服务',
           //               showCancel: false,
           //               success: function(res) {
           //                        if (res.confirm) {
           //                          wx.navigateBack();
           //                        }
           //               }
           // });
        }else{
           startTime = currentHours+':'+currentTime;
           endTime = '20:00';
           _this.setData({currentTime:startTime})
           _this.setData({subscribeTime:startTime})
        }
    }

    //获取全局数据，初始化当前页面
    app.getUserInfo(function(userInfo){
      //用户信息
      _this.setData({
        userInfo:userInfo,
        startTime:startTime,
        endTime:endTime
      })
    })

    //点餐页面传递的参数
    // console.log(option.detail_items);
    var cart_items = option.cart_items,
        detail_items = option.detail_items,
        dwCoupons = option.dwCoupons,
        goodsId = option.goodsId,
        taoCanNum = option.taoCanNum;
   
    //附加参数
    var isMember= 1,
        // paytype = 1,
        subscribe = 0,
        dinnerType = 1;
    if(!app.globalData.cardNo){       //非会员
        isMember = 0;
        // paytype = 2;
    }
    if(app.globalData.fromType == 1){  //打包预订 只能外带
       subscribe = 1;
       dinnerType = 2;
    }
   

    var phone;
    if(app.globalData.mobile){
        phone = app.globalData.mobile;
    }else{
        console.log(wx.getStorageSync('phone'))
        phone = wx.getStorageSync('phone')?wx.getStorageSync('phone'):'';
    }
    
    console.log(subscribe);
    _this.setData({
       shopName:app.globalData.shopName,
       cardNo:app.globalData.cardNo,
       userId:app.globalData.userId,
       phone:phone,
       phoneInput:'',
       cart_items:JSON.parse(cart_items),
       detail_items:JSON.parse(detail_items),
       dwCoupons:dwCoupons,
       goodsId:goodsId,
       taoCanNum:taoCanNum,
       isMember:isMember,
       // paytype:paytype,
       subscribe:subscribe,
       dinnerType:dinnerType
    }) 
    _this.Init();
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

    
    wx.getStorage({
      key:'choosed_card',
      success: function(res) {
         // console.log(res.data);
         _this.setData({
            coupons:JSON.parse(res.data)
         });
         
         _this.Init();        
      } 
    })

  },

  //预约时间
  bindTimeChange:function(e){
     this.setData({subscribeTime:e.detail.value})
  },

  //用餐方式
  dinnerTypeTap:function(e){     
       if(app.globalData.fromType == 1) return;             
       var dinnerType = e.currentTarget.dataset.type;
       this.setData({
           dinnerType:dinnerType
       })
       this.Init();
  },
  
  //手机号码
  phoneSlideTap:function(){
       this.setData({
           phoneSlide:!this.data.phoneSlide
       })
  },
  phoneInput:function(e){
      this.setData({
         phoneInput: e.detail.value
      })
  },
  phoneConfirmTap:function(){
      var phone = this.data.phoneInput;
      if(phone==''){
        this.showDialog('请输入手机号码')
        // wx.showModal({
        //       content:"请输入手机号码",
        //       showCancel: false
        // });
        return;
      }
      if(!this.is_phone(phone)){
        this.showDialog('请输入正确的手机号码')
        // wx.showModal({
        //       content:"请输入正确的手机号码",
        //       showCancel: false
        // });
        return;
      }

      wx.setStorageSync('phone',phone);
      this.setData({
         phone:phone,
         phoneSlide:false
      })


  },
  is_phone:function(str){
    var reg=/^1\d{10}$/;
    if(reg.test(str))
      return true;
    else
      return false;
  },
  
  //更多需求
  needsSlideTap:function(){
       this.setData({
           needsSlide:!this.data.needsSlide
       })
  },
  
  //跳转到 优惠券选择
  openCardList:function(){
    var card_num = this.data.card_num,
        taoCanNum = this.data.taoCanNum,
        couponsData = JSON.stringify(this.data.couponsData);
    if(card_num == 0){
        this.showDialog('暂无可用优惠券')
        // wx.showModal({
        //       content:"暂无可用优惠券",
        //       showCancel: false
        // });
        return;
    }

    wx.navigateTo({
        url: '../card_list/index?couponsData='+couponsData+'&taoCanNum='+taoCanNum
    })
  },
  
  //跳转到 账户选择
  openAccount:function(){
     if(!app.globalData.cardNo) return;
     wx.navigateTo({
        url: '../account/index?type='+this.data.paytype
     })
  },
  
  //打开订单明细
  detailTap:function(){
      this.setData({
        detail_panel:true
      })
  },

  closeDetailTap:function(){
      this.setData({
        detail_panel:false
      })
  },
  
  coverTap:function(){
      this.setData({
        detail_panel:false
      })
  },

  // demandInput:function(e){
  //     this.setData({
  //        caution: e.detail.value
  //     })
  // },
  demandFocus:function(e){
    this.setData({
      textComplete:false
    })
  },

  demandBlur:function(e){
    this.setData({
      caution: e.detail.value,
      textComplete:true
    })
  },
  //是否需要发票
  chooseItem:function(e){
     var param = e.currentTarget.dataset.param;
     this.setData({
      isInvoice:param
     })
  },
 

  //表单校验，提交数据
  orderSubmit:function(){
    var subscribeTime = this.data.subscribeTime;

    if(app.globalData.fromType == 1){  //打包预订
      if(subscribeTime == ''){
          this.showDialog("请选择预订时间");
          // wx.showModal({
          //       content:"请选择预订时间",
          //       showCancel: false
          // });
          return;
      }
    }


    var phone = this.data.phone;
      if(phone==''){
        this.showDialog("请输入手机号");
        // wx.showModal({
        //       content:"请输入手机号",
        //       showCancel: false
        // });
        return;
      }
      if(!this.is_phone(phone)){
        this.showDialog("请输入正确的手机号");
        // wx.showModal({
        //       content:"请输入正确的手机号",
        //       showCancel: false
        // });
        return;
      }
      this.setData({
         phone:phone,
         phoneSlide:false
      })

    var _this = this,

    param= {
        mini:'mini',
        shopId:app.globalData.shopId,
        openId:app.globalData.openId,                
        userId:app.globalData.userId,                     
        deskNo:app.globalData.deskNo,                    
        cardNo:app.globalData.cardNo,                      
        mobile:this.data.phone,                       
        dinnerType:this.data.dinnerType,                   
        payType:this.data.paytype,                      
        isMember:this.data.isMember,                    
        coupons:JSON.stringify(this.data.coupons),                     
        caution:this.data.caution,
        isInvoice:this.data.isInvoice,                       
        goodsDetail:JSON.stringify(this.data.detail_items),                      
        totalFee:this.data.totalFee,                 
        userFee:this.data.userFee,
        discountFee:this.data.discountFee,
        packNum:this.data.packNum,
        packPrice:this.data.packPrice,
        packTotalFee:this.data.packTotalFee,
        dwCoupons:this.data.dwCoupons,
        subscribe:this.data.subscribe,
        subscribeTime:this.data.subscribeTime
    };

    if(this.data.subscribe==0){
         delete param.subscribe;
    }
    
    if(this.data.cardNo == undefined ){
         delete param.cardNo;
    }
    
    console.log(this.data.userId);
    if(this.data.userId == undefined ){
         delete param.userId;
    }
    
    
    
    wx.setStorageSync('clearCart',true);
    wx.setStorageSync('items','');


    _this.setData({ loaderhide:false });
    
    console.log(param);
    wx.request({
        url: app.globalData.host+"/orderQuery/creatOrder",
        data: param,
        header: {  
          "Content-Type": "application/x-www-form-urlencoded"  
        }, 
        method:'POST',
        success: function(res) {
          _this.setData({ loaderhide:true });
          var resdata = res.data;
          console.log(res);

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
                             url: '../order_info/index?orderId='+orderId
                           })
                        },
                       'fail':function(res){
                            wx.redirectTo({ url: '../order_fail/index' })
                        }
                    }) 
                  }
                  //调用账户支付
                  else{
                    if(!tradeInfo.bala){
                        wx.redirectTo({
                           url: '../order_info/index?orderId='+orderId
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
                    _this.showDialog2(res.data.msg)                                            
                    // wx.showModal({                           
                    //         content:res.errMsg, 
                    //         showCancel: false,
                    //         success: function(res) {
                    //           if (res.confirm) {
                    //             wx.redirectTo({ url: '../order_fail/index' })
                    //           }
                    //         }
                    // })
              } 
          }else{
              var orderId = res.data.data;
              if(orderId){
                     _this.showDialog2(res.data.msg)
                    // wx.showModal({                           
                    //         content:res.data.msg, 
                    //         showCancel: false,
                    //         success: function(res) {
                    //           if (res.confirm) {
                    //             wx.redirectTo({ url: '../order_fail/index' })
                    //           }
                    //         }
                    // })
              }else{
                   _this.showDialog(resdata.msg);
                   // wx.showModal({content:resdata.msg,showCancel: false})
              }
          }
        }
    })
  },

  confirmTrade:function(){
      var orderId = this.data.tradeInfo.data;
      this.setData({ tip_panel:false});

      wx.redirectTo({
         url: '../order_info/index?orderId='+orderId
      })
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

  showDialog2:function(msg){
      this.setData({
        dialogShow2:true,
        contentMsg:msg
      })
  },
  dialogConfirm2:function(){
      this.setData({
        dialogShow2:false
      })
      wx.redirectTo({ url: '../order_fail/index' })
  }


})
