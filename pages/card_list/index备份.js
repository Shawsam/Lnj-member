//index.js
//获取应用实例
var zunxiangShare
var cart_items,cart_coupon_items,pinleiCoupon,pinleiMap=new Map(),shareCouponNum=0,unshareCouponNum=0
var app = getApp()
Page({
  data:{
     userInfo:null,
     shopName:'',
     emptyall:false,
     taoCanNum:0,
     items:[],
     ableCouponSlide:true,
     disableCouponSlide:true
  },

  onLoad: function (option) {
     var _this = this;
     //初始化全局变量
      cart_items = JSON.parse(option.cart_items);
      cart_coupon_items = [];
      pinleiCoupon = [];
      shareCouponNum = 0;
      unshareCouponNum = 0;
      pinleiMap.clear()

     //取出所选商品中能使用品类券的商品及数量
     for(var i in cart_items){
          var categoryNo = cart_items[i].categoryNo
          if(cart_items[i].categoryNo){
                cart_coupon_items.push(cart_items[i])
                if(pinleiMap.has(categoryNo+'maxNum')){
                   var maxNum = pinleiMap.get(categoryNo+'maxNum')
                   pinleiMap.set(categoryNo+'maxNum',maxNum+cart_items[i].count);
                }else{
                   pinleiMap.set(categoryNo+'maxNum',cart_items[i].count);
                   pinleiMap.set(categoryNo+'choosedNum',0);  
                }
          }
          if(cart_items[i].categoryId==0){               //是否存在可共享尊享券
              zunxiangShare = true
          }else{
              zunxiangShare = false
          }
     }

      //获取全局数据，初始化当前页面
      app.getUserInfo(function(userInfo){
        //用户信息
        _this.setData({
          userInfo:userInfo,
          shopName:app.globalData.shopName
        })
      })

      //优惠券数量   优惠券信息
      var param = {
        mini:'mini',
        shopId:app.globalData.shopId,
        openId:app.globalData.openId,
        taoCanNum:option.taoCanNum,
        goodsId:option.goodsId,
        totalFee:option.totalFee       //餐盒不参与优惠券满减
      }

      _this.setData({loaderhide:false})
      wx.request({
          url: app.globalData.host+'/coupon/couponList', 
          data:param, 
          success: function (res) {
              //服务器返回的结果
              console.log(res);
              if (res.data.errcode == 0) {
                     //优惠券
                     var items = [],
                         couponsChoosed,                                //已选优惠券
                         couponsData = res.data,                        //所有优惠券
                         taoCanNum = option.taoCanNum;                  //所点套餐数量
                     

                     //不可用列表
                     var unitems = []
                     var  uncouponsData = [couponsData.unFeiTaoCanList,couponsData.unOtherList]
                     for(var i in uncouponsData){
                          var singledata = {}
                          singledata.data = uncouponsData[i];
                          singledata.slide = true;
                          unitems[i] = singledata;
                     }
                     console.log(unitems)
                     _this.setData({unitems:unitems})

                      var feiTaoCanList = couponsData.feiTaoCanList 
                      var map = {}
                      for(var i in feiTaoCanList){
                          if(feiTaoCanList[i].type.category==6){         //品类券
                                var item = feiTaoCanList[i];
                                if(!map[item.goodsId]){
                                    pinleiCoupon.push({
                                        goodsId: item.goodsId,
                                        data: [item],
                                        num:1
                                    });
                                    map[item.goodsId] = item;
                                }else{
                                    for(var j in pinleiCoupon){
                                        var dj = pinleiCoupon[j];
                                        if(dj.goodsId == item.goodsId){
                                            dj.data.push(item);
                                            dj.num = dj.num + 1;
                                            break;
                                        }
                                    }
                                }
                          }
                      } 
                      console.log('品类券数据：')
                      console.log(pinleiCoupon)
                      console.log('品类券选择数据：')
                      console.log(pinleiMap)

                      _this.setData({
                         couponsData:couponsData,
                         taoCanNum:taoCanNum
                      })
                      wx.getStorage({
                        key:'choosed_card',
                        complete: function(res) {
                           couponsChoosed = res.data; 
                           couponsData = [couponsData.taoCanList,couponsData.feiTaoCanList,couponsData.otherList];
                           console.log('全部优惠券数据')
                           console.log(couponsData);
                           console.log('已选优惠券数据')
                           console.log(couponsChoosed)
                           
                            //初始数据
                            for(var i in couponsData){
                              var singledata = {};
                              if(zunxiangShare){
                                for(var j in couponsData[i]){ 
                                  if(!couponsData[i][j].type.isShare){
                                    couponsData[i][j].disabledTag = true;
                                  }
                                }
                              }
                              singledata.data = couponsData[i];
                              singledata.slide = true;
                              items[i] = singledata;
                            }
                            _this.setData({ items:items })
                           
                           //勾选之前选中的券
                           for(var i in couponsData){
                              if(couponsChoosed){           
                                var couponsChoose = JSON.parse(couponsChoosed);
                                for(var j in couponsData[i]){ 
                                    for(var m in couponsChoose){
                                        if(couponsData[i][j].couponNo == couponsChoose[m].couponNo){
                                            _this.chooseTap(null,i,j)
                                        }
                                    }
                                }
                              }
                            }
                            _this.setData({loaderhide:true})    //隐藏加载
                         } 
                      })
                  
              } else {
                 wx.showModal({content:res.data.msg, showCancel: false});
              }

          },
          fail: function () {
              console.log('系统错误')
          }
      })
  },
  slideTap:function(e){
    var _this = this,  
        items = this.data.items,
        param = e.currentTarget.dataset.param;
    items[param].slide = !items[param].slide;
    _this.setData({ items:items })   

  },
  unslideTap:function(e){
    var _this = this,  
        unitems = this.data.unitems,
        param = e.currentTarget.dataset.param;
    unitems[param].slide = !unitems[param].slide;
    _this.setData({ unitems:unitems })   

  },
  slideCoupon:function(){
      this.setData({ableCouponSlide:!this.data.ableCouponSlide})
  },
  slideDisabledCoupon:function(){
      console.log('tap')
      this.setData({disableCouponSlide:!this.data.disableCouponSlide})
  },
  //选择
  chooseTap:function(e,a,b){          
    //item[0]  套餐  item[1]  非套餐（领用+品类） item[2] otherList                       
    var items = this.data.items,
        taoCanNum = this.data.taoCanNum,
        parama = e?e.currentTarget.dataset.parama:a,
        paramb = e?e.currentTarget.dataset.paramb:b;
    
    if(items[parama].data[paramb].disabledTag) return;
    if(items[parama].data[paramb].disabled) return;
    
    console.log(items[parama].data[paramb])                      //点击的券信息
    var useNumber = items[parama].data[paramb].type.useNumber    //当前券可用最大张数
    var isShare = items[parama].data[paramb].type.isShare;       //点击的券是否共享
    var couponTypeId = items[parama].data[paramb].couponTypeId;  //点击的券的类型Id

    if(items[parama].data[paramb].active){                       //取消选择当前券
        if(isShare){
            shareCouponNum--;
            console.log('共享券') 
            console.log('共享券数量'+shareCouponNum)  
            if(shareCouponNum==0){
                for(var i in items[1].data){        
                    items[1].data[i].disabled = false   
                    items[1].data[i].unshared = false 
                }
                for(var i in items[2].data){
                    items[2].data[i].disabled = false    
                    items[2].data[i].unshared = false 
                }
            }
        }else{
            unshareCouponNum--;
            console.log('不共享券') 
            console.log('不共享券数量'+unshareCouponNum)  
            if(unshareCouponNum==0){
              for(var i in items[1].data){        
                  items[1].data[i].disabled = false    
                  items[1].data[i].unshared = false 
              }
              for(var i in items[2].data){
                  items[2].data[i].disabled = false 
                  items[2].data[i].unshared = false    
              }
            }
        }
    }else{                                                       //选择当前券
        if(isShare){
            shareCouponNum++;
            console.log('共享券') 
            console.log('共享券数量'+shareCouponNum)                  
            for(var i in items[1].data){
               if(!items[1].data[i].type.isShare){
                   items[1].data[i].disabled = true         //不共享券变为不可选
                   items[1].data[i].unshared = true
               }
               // else{
               //     items[1].data[i].disabled = false    
               // }
            }
            for(var i in items[2].data){
               if(!items[2].data[i].type.isShare){
                   items[2].data[i].disabled = true         //不共享券变为不可选
                   items[2].data[i].unshared = true
               }
               // else{
               //     items[2].data[i].disabled = false    
               // }
            }
        }else{
            unshareCouponNum++;
            console.log('不共享券')  
            console.log('不共享券数量'+unshareCouponNum)             
            for(var i in items[1].data){
                  if(items[1].data[i].couponTypeId == couponTypeId){
                       items[1].data[i].disabled = false;
                       items[1].data[i].unshared = false
                  }else{
                       items[1].data[i].disabled = true           //所有其他券都变为不可选
                       items[1].data[i].unshared = true
                       items[1].data[i].active = false
                  }
            }
            for(var i in items[2].data){                              
                  if(items[2].data[i].couponTypeId == couponTypeId){
                       items[2].data[i].disabled = false;
                  }else{
                       items[2].data[i].disabled = true           //所有其他券都变为不可选
                       items[2].data[i].unshared = true 
                       items[2].data[i].active = false    
                  }      

               
            }
        }
        items[parama].data[paramb].disabled = false;
    }


    //抵用券
    if(parama == 2){
        items[parama].data[paramb].active = !items[parama].data[paramb].active;
    }
    
    //选 领用券 跟 品类券的逻辑
    else{
        var goodsId =  items[parama].data[paramb].goodsId;                          //点击的券goodId
        console.log(items[parama].data[paramb])                                     //点击的券信息                                        
        //=====================================================================
        //如果所点商品有品类券商品
        if(cart_coupon_items.length){             
            if(items[parama].data[paramb].type.category == 6){                      //选择的券是品类券
                console.log('品类券')
                console.log('对应品类'+goodsId)
                var choosedNum =  pinleiMap.get(goodsId+'choosedNum');
                var maxNum = pinleiMap.get(goodsId+'maxNum');
                if(items[parama].data[paramb].active){
                    choosedNum--;
                }else{
                    choosedNum++;
                }
                items[parama].data[paramb].active = !items[parama].data[paramb].active;
                pinleiMap.set(goodsId+'choosedNum',choosedNum);
                console.log(goodsId+'总共已选'+choosedNum)
                console.log(goodsId+'总共可选'+maxNum)
                if(choosedNum>=maxNum){
                    // wx.showModal({content:'不能再选了', showCancel: false});
                    for(var i in items[1].data){
                        if(!items[1].data[i].active){
                            for(var j in cart_coupon_items){ 
                                 if(cart_coupon_items[j].crmGoodsNo == items[1].data[i].goodsId){
                                       console.log(cart_coupon_items[j].categoryNo)
                                       if(cart_coupon_items[j].categoryNo == goodsId){
                                          items[1].data[i].disabled = true
                                          items[1].data[i].overMax = true
                                       }  
                                 }
                            }
                            if(items[1].data[i].goodsId == goodsId){
                              items[1].data[i].disabled = true
                              items[1].data[i].overMax = true
                            }
                        }
                    }
                 }
                 else{
                    if(unshareCouponNum==0 && shareCouponNum>0){
                      console.log('没有不共享券且共享商品券大于0')
                      for(var i in items[1].data){
                          if(items[1].data[i].disabled && items[1].data[i].type.isShare){
                              // 取消其他券不可选状态
                              console.log(items[1].data[i])
                              for(var j in cart_coupon_items){ 
                                   if(cart_coupon_items[j].crmGoodsNo == items[1].data[i].goodsId){
                                         console.log(cart_coupon_items[j].categoryNo)
                                         if(cart_coupon_items[j].categoryNo == goodsId){
                                              var _useNumber = items[1].data[i].type.useNumber
                                              var _couponTypeId = items[1].data[i].couponTypeId
                                              var num = 0
                                              for(var ii in items[1].data){
                                                  if(items[1].data[ii].couponTypeId == _couponTypeId && items[1].data[ii].active){
                                                     num++;
                                                  }
                                              }
                                              console.log(_couponTypeId+'已用'+num,'可用'+_useNumber)
                                              console.log(items[1].data[i])
                                              if(_useNumber > num){
                                                 items[1].data[i].disabled = false
                                                 items[1].data[i].overMax = false
                                                 items[1].data[i].overMax = true
                                              }
                                         }  
                                   }
                              }
                              if(items[1].data[i].goodsId == goodsId){
                                    var _useNumber = items[1].data[i].type.useNumber
                                    var _couponTypeId = items[1].data[i].couponTypeId
                                    var num = 0
                                    for(var ii in items[1].data){
                                        if(items[1].data[ii].couponTypeId == _couponTypeId && items[1].data[ii].active){
                                           num++;
                                        }
                                    }
                                    console.log(_couponTypeId+'已用'+num,'可用'+_useNumber)
                                    console.log(items[1].data[i])
                                    if(_useNumber > num){
                                          items[1].data[i].disabled = false
                                          items[1].data[i].overMax = false
                                    }
                              }
                          }
                      }
                    }
                 }
            }else{                                                                   //选中的券是针对某商品的券
                console.log('商品券')
                for(var i in cart_coupon_items){ 
                    if(cart_coupon_items[i].crmGoodsNo==goodsId){                    //领用券对应商品
                        console.log('对应品类：'+cart_coupon_items[i].categoryNo)     //领用券对应商品的品类
                        var categoryNo = cart_coupon_items[i].categoryNo;
                        var choosedNum =  pinleiMap.get(categoryNo+'choosedNum');
                        var maxNum = pinleiMap.get(categoryNo+'maxNum');
                        if(items[parama].data[paramb].active){
                            choosedNum--;
                        }else{
                            choosedNum++;
                        }
                        items[parama].data[paramb].active = !items[parama].data[paramb].active;
                        pinleiMap.set(categoryNo+'choosedNum',choosedNum);
                        console.log(categoryNo+'总共已选'+choosedNum)
                        console.log(categoryNo+'总共可选'+maxNum)

                        if(choosedNum>=maxNum){
                          for(var i in items[1].data){
                              if(!items[1].data[i].active){
                                  if(items[1].data[i].goodsId == goodsId || items[1].data[i].goodsId == categoryNo){
                                       items[1].data[i].disabled = true
                                       items[1].data[i].overMax = true
                                  }
                              }
                          }
                        }
                        else{
                            if(unshareCouponNum==0 && shareCouponNum>0){
                              console.log('没有不共享券且共享商品券大于0')
                              for(var i in items[1].data){
                                  if(items[1].data[i].disabled && items[1].data[i].type.isShare){
                                      // 取消其他券不可选状态
                                      if(items[1].data[i].goodsId == goodsId || items[1].data[i].goodsId == categoryNo){
                                          var _useNumber = items[1].data[i].type.useNumber
                                          var _couponTypeId = items[1].data[i].couponTypeId
                                          var num = 0
                                          for(var ii in items[1].data){
                                              if(items[1].data[ii].couponTypeId == _couponTypeId && items[1].data[ii].active){
                                                 num++;
                                              }
                                          }
                                          console.log(_couponTypeId+'已用'+num,'可用'+_useNumber)
                                          console.log(items[1].data[i])
                                          if(_useNumber > num) {
                                              items[1].data[i].disabled = false
                                              items[1].data[i].overMax = false
                                          }
                                      }
                                  }
                              }
                            }
                        }
                    }              
                }
            }

        }else{
            items[parama].data[paramb].active = !items[parama].data[paramb].active;
        }
        
    }

    // 券本身数量限制
    var couponNum = 0       
    for(var ii in items[parama].data){
        if(items[parama].data[ii].couponTypeId == couponTypeId && items[parama].data[ii].active){
           couponNum++;
        }
    }
    console.log('最大可用数量'+useNumber+',已选数量'+couponNum)
    if(couponNum == useNumber){                                   
       for(var ii in items[parama].data){
            if(items[parama].data[ii].couponTypeId == couponTypeId && !items[parama].data[ii].active){
                console.log('设置其他同类型券不可选')
                items[parama].data[ii].disabled = true
                items[parama].data[ii].fulled = true
            }
        }
    }else{
       for(var ii in items[parama].data){
            if(items[parama].data[ii].couponTypeId == couponTypeId && items[parama].data[ii].disabled  && items[parama].data[ii].fulled == true){
                console.log('设置其他同类型券可选')
                items[parama].data[ii].disabled = false
                items[parama].data[ii].fulled = false
            }
        }
    }  

    this.setData({
      items:items,
      emptyall:false,
    })
  },
  //清空
  emptyAllTap:function(){
    var items = this.data.items;
    for(var i in items){
        for(var j in items[i].data){
           items[i].data[j].active = false;
           items[i].data[j].disabled = false;
           items[i].data[j].unshared = false;
           items[i].data[j].fulled = false;
        }
    }
    shareCouponNum = 0;
    unshareCouponNum = 0;
    pinleiMap.clear();
    for(var i in cart_coupon_items){
          var categoryNo = cart_coupon_items[i].categoryNo
          if(pinleiMap.has(categoryNo+'maxNum')){
             var maxNum = pinleiMap.get(categoryNo+'maxNum')
             pinleiMap.set(categoryNo+'maxNum',maxNum+cart_items[i].count);
          }else{
             pinleiMap.set(categoryNo+'maxNum',cart_items[i].count);
             pinleiMap.set(categoryNo+'choosedNum',0);  
          }        
    }
    this.setData({
      items:items,
      emptyall:true,
    })
  },
  //确认选择
  chooseConfirm:function(){
    var _this = this,
        choosed = [],
        items = this.data.items;

        console.log(items)

    for(var i in items){
      for( var j in items[i].data){
        if(items[i].data[j].active){
           var singledata = {};
           singledata.single = items[i].data[j].type.single;
           singledata.goodsId = items[i].data[j].goodsId;
           singledata.typeName = items[i].data[j].type.typeName;
           singledata.couponNo =items[i].data[j].couponNo;
           singledata.couponTypeId = items[i].data[j].couponTypeId;
           //2、商品领用券；3、套餐领用券  1、现金抵扣券  5、尊享券        非套餐包括 领用+品类
           if(i==0){                               
               singledata.type = 3;
           }else if(i==1){
            // singledata.type = 2;
               singledata.type = items[i].data[j].type.category + 1
           }else{
               // singledata.type = items[i].data[j].type.category + 1;
               singledata.type = 1;
           }
           choosed.push(singledata);
        }
      }
    }

    wx.setStorage({
      key:"choosed_card",
      data:JSON.stringify(choosed)
    })
    wx.navigateBack({
      delta: 1
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
  }
})