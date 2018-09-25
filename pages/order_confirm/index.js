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
      noticeClosed:true,
      subscribe:0,         //是否预约打包
      subscribeTime:'',    //预约打包时间
      currentTime:'',
      startTime:'6:30',
      endTime:'20:00',
      isCard:1

  },
  switchChange:function(e){
      var state = e.detail.value
      if(state){
         this.setData({isCard:1})
      }else{
         this.setData({isCard:0})
      }
      this.Init()
  },
  Init:function(){
      //POST 参数   计算订单信息
      var _this = this;
      var param = {
          mini:'mini',
          userId:app.globalData.userId,
          shopId:app.globalData.shopId,
          openId:app.globalData.openId,
          goodsDetail:JSON.stringify(this.data.detail_items),
          coupons:JSON.stringify(this.data.coupons),
          dinnerType:this.data.dinnerType,
          subscribe:this.data.subscribe,
          dwCoupons:this.data.dwCoupons,
          type:this.data.type,
          isCard:this.data.isCard
      }
      if(this.data.subscribe==0){
         delete param.subscribe
      }
      
      if(!app.globalData.userId){
         delete param.userId
      }

      if(this.data.type){
         delete param.type
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
                      coupons = _this.data.coupons,
                      dkCoupons = resdata.dkCoupons

                  if(activity){
                      activity = JSON.parse(activity);
                  }

                  if(dkCoupons){
                      dkCoupons = JSON.parse(dkCoupons)
                  }
                  
                  _this.setData({
                        cardFee:resdata.cardFee,
                        thirdFee:resdata.thirdFee,
                        bala:resdata.bala,
                        cardFeeVal:(resdata.cardFee/100).toFixed(2),
                        thirdFeeVal:(resdata.thirdFee/100).toFixed(2),
                        balaVal:(resdata.bala/100).toFixed(2),
                        userFee:resdata.userFee,
                        packList:resdata.packList||[],
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
                        //coupons:coupons,
                        activity:activity,
                        couponsNum:dkCoupons?dkCoupons.length:coupons.length,
                        dkCoupons:dkCoupons||null
                  })
                  
                  console.log(coupons.length)
                  if(coupons.length){
                    wx.setStorage({
                       key:"choosed_card",
                       data:JSON.stringify(coupons)
                    })
                  }else{
                    wx.setStorage({
                       key:"choosed_card",
                       data:JSON.stringify(dkCoupons)
                    })
                  }

                       
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
        mini:'mini',
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
        mini:'mini',
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
                var shopCode = res.data.shop.shopCode
                _this.setData({
                  InvoiceEnable:InvoiceEnable,
                  shopCode:shopCode
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
            currentMinutes = currentTime.getMinutes()<10?'0'+currentTime.getMinutes():currentTime.getMinutes();
        
        console.log(currentHours+':'+currentMinutes)
        if(currentHours<7 && currentMinutes<30){
           startTime = '6:30';
           endTime = '20:00';
           _this.setData({currentTime:currentHours+':'+currentMinutes})
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
           startTime = currentHours+':'+currentMinutes;
           endTime = '20:00';
           _this.setData({startTime:startTime})
           _this.setData({currentTime:startTime})
           _this.setData({subscribeTime:startTime})
        }
    }

    //获取全局数据，初始化当前页面
    app.getUserInfo(function(userInfo){
      //用户信息
      _this.setData({
        userInfo:userInfo,
        // startTime:startTime,
        // endTime:endTime
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
       cardNo:app.globalData.cardNo||'',
       userId:app.globalData.userId||'',
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
         console.log(res.data);
         _this.setData({
            coupons:JSON.parse(res.data),
            type:0
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

       if(dinnerType==2){
            //餐盒收费提示
            var noticeDate = new Date('2018-10-01').getTime()
            var currentDate = new Date().getTime()
            if(currentDate >= noticeDate) return
            var shopCode = this.data.shopCode
            var shopArray = ['210910010317','210910010064','210910010326','210910010332','210910010102','210910010314','210910010315','210910010167','210910010041','210910010154','210910010186','210910010195','210910010200','210910010201','210910010052','210910010334','210910010335']
            if(shopArray.indexOf(shopCode)>-1){
               this.setData({noticeClosed:true})
            }else{
               this.setData({noticeClosed:false})
            }
       }

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
        this.showDialog3('请输入手机号码')
        return;
      }
      if(!this.is_phone(phone)){
        this.showDialog3('请输入正确的手机号码')
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

  noticeClose:function(){
     this.setData({noticeClosed:true})
  },

  coverTap:function(){
      this.noticeClose()
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
        this.showDialog3("请输入手机号");
        // wx.showModal({
        //       content:"请输入手机号",
        //       showCancel: false
        // });
        return;
      }
      if(!this.is_phone(phone)){
        this.showDialog3("请输入正确的手机号");
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
        coupons:this.data.dkCoupons?JSON.stringify(this.data.dkCoupons):JSON.stringify(this.data.coupons),                     
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
        subscribeTime:this.data.subscribeTime,
        isCard:this.data.isCard,
        bala:this.data.bala,
        cardFee:this.data.cardFee,
        thirdFee:this.data.thirdFee
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
  },

  showDialog3:function(msg){
      this.setData({
        dialogShow3:true,
        contentMsg:msg
      })
  },
  dialogConfirm3:function(){

      var phoneInit = this.data.phone
      var phone = this.data.phoneInput2||''
      if(phoneInit){
          this.setData({
            phoneInput:phone,
            phoneInput2:'',
            dialogShow3:false
          })
      }
      else{
          if(phone==''){
            this.showDialog('没有输入任何手机号')
            this.setData({
              dialogShow3:false
            })
            return;
          }
          if(!this.is_phone(phone)){
            this.showDialog('输入的手机号不正确')   
            this.setData({
              phoneInput2:'',
              dialogShow3:false
            })
            return;
          }

          wx.setStorageSync('phone',phone);
          this.setData({
             phone:phone,
             phoneInput2:'',
             phoneSlide:false,
             dialogShow3:false
          })
    }
  },
  phoneInput2:function(e){
      this.setData({
         phoneInput2: e.detail.value
      })
  }


})
