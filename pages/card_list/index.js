//index.js
//获取应用实例
var cart_items,cart_coupon_items,pinleiMap,linyongMap,shareCouponNum=0,unshareCouponNum=0
var app = getApp()
Page({
  data:{
     userInfo:null,
     shopName:'',
     emptyall:false,
     taoCanNum:0,
     items:[]
  },

  onLoad: function (option) {
     var _this = this;
     cart_items = JSON.parse(option.cart_items);
     //取出所选商品中能使用品类券的商品及数量
     cart_coupon_items = []
     for(var i in cart_items){
          if(cart_items[i].categoryNo){
                cart_coupon_items.push(cart_items[i])
          }
     }
     console.log(cart_coupon_items)

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
        totalFee:option.totalFee   //餐盒不参与优惠券满减
      }

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


                      var feiTaoCanList = couponsData.feiTaoCanList 
                      var pinleiCoupon = [],linyongCoupon = []
                      var map = {}
                      for(var i in feiTaoCanList){
                          if(feiTaoCanList[i].type.category==6){         //品类券
                                var item = feiTaoCanList[i];
                                if(!map[item.goodsId]){
                                    pinleiCoupon.push({
                                        goodsId: item.goodsId,
                                        data: [item],
                                        num:1,
                                        choosedNum:0
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
                          }else{                                         //领用券
                              linyongCoupon.push(feiTaoCanList[i]);
                          }
                      } 
                      pinleiMap = pinleiCoupon
                      linyongMap = {}
                      linyongMap.coupon = linyongCoupon;
                      linyongMap.num = linyongCoupon.length; 
                      linyongMap.choosedNum = 0; 

                      console.log(pinleiMap)
                      console.log(linyongMap)

                      _this.setData({
                         couponsData:couponsData,
                         taoCanNum:taoCanNum
                      })
                      wx.getStorage({
                        key:'choosed_card',
                        complete: function(res) {
                           couponsChoosed = res.data; 
                           couponsData = [couponsData.taoCanList,couponsData.feiTaoCanList,couponsData.otherList];
                           // console.log(couponsData);
                           for(var i in couponsData){
                             var singledata = {};
                             if(couponsChoosed){
                               var couponsChoose = JSON.parse(couponsChoosed);
                               // console.log(couponsChoose);
                               for(var j in couponsData[i]){ 
                                  for(var m in couponsChoose)
                                      if(couponsData[i][j].couponNo == couponsChoose[m].couponNo){
                                         var isShare = couponsData[i][j].type.isShare;
                                         var _parama = i;
                                         var _paramb = j;
                                      }
                               }
                             }
                             singledata.data = couponsData[i];
                             singledata.slide = true;
                             items[i] = singledata;
                           }

                           if(isShare){
                                shareCouponNum++;
                                console.log('共享券')                  
                                for(var i in items[1].data){
                                   if(!items[1].data[i].type.isShare){      //不共享券变为不可选
                                       items[1].data[i].disabled = true         
                                   }
                                }
                                for(var i in items[2].data){
                                   if(!items[2].data[i].type.isShare){      //不共享券变为不可选
                                       items[2].data[i].disabled = true         
                                   }
                                }
                            }else{
                                unshareCouponNum++
                                console.log('不共享券')                  
                                for(var i in items[1].data){
                                   items[1].data[i].disabled = true         //所有其他券都变为不可选
                                }
                                for(var i in items[2].data){
                                   items[2].data[i].disabled = true         //所有其他券都变为不可选
                                }
                            }  
                            items[_parama].data[_paramb].active = true; 
                            items[_parama].data[_paramb].disabled = false;                      
                           _this.setData({ items:items })

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
  //选择
  chooseTap:function(e){          
    //item[0]  套餐  item[1]  非套餐（领用+品类） item[2] otherList                       
    var items = this.data.items,
        taoCanNum = this.data.taoCanNum,
        parama = e.currentTarget.dataset.parama,
        paramb = e.currentTarget.dataset.paramb;

    if(items[parama].data[paramb].disabled) return;
    
    var isShare = items[parama].data[paramb].type.isShare;       //点击的券是否共享
    var couponTypeId = items[parama].data[paramb].couponTypeId;  //点击的券的类型Id
    if(items[parama].data[paramb].active){                       //取消选择当前券
        if(isShare){
            shareCouponNum--;
            if(shareCouponNum==0){
                for(var i in items[1].data){        
                    items[1].data[i].disabled = false    
                }
                for(var i in items[2].data){
                    items[2].data[i].disabled = false    
                }
            }
        }else{
            unshareCouponNum--;
            console.log('不共享券数量'+unshareCouponNum)  
            if(unshareCouponNum==0){
              for(var i in items[1].data){        
                  items[1].data[i].disabled = false    
              }
              for(var i in items[2].data){
                  items[2].data[i].disabled = false    
              }
            }
        }
    }else{                                                   //选择当前券
        if(isShare){
            shareCouponNum++;
            console.log('共享券') 
            console.log('共享券数量'+shareCouponNum)                  
            for(var i in items[1].data){
               if(!items[1].data[i].type.isShare){
                   items[1].data[i].disabled = true         //不共享券变为不可选
               }
               // else{
               //     items[1].data[i].disabled = false    
               // }
            }
            for(var i in items[2].data){
               if(!items[2].data[i].type.isShare){
                   items[2].data[i].disabled = true         //不共享券变为不可选
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
                  }else{
                       items[1].data[i].disabled = true           //所有其他券都变为不可选
                       items[1].data[i].active = false
                  }
            }
            for(var i in items[2].data){                            
                  if(items[2].data[i].couponTypeId == couponTypeId){
                       items[2].data[i].disabled = false;
                  }else{
                       items[2].data[i].disabled = true           //所有其他券都变为不可选
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

    // //套餐券(点几份套餐用几张)
    // else if(parama == 0){
    //     var taoCan = 0;
    //     for(var k in items[0].data){
    //        if(items[0].data[k].active){
    //           taoCan++;
    //        }
    //     }
    //     if(taoCan >= taoCanNum){
    //       this.showDialog("已点"+taoCanNum+"份套餐，最多使用"+taoCanNum+"张套餐券");
    //       //  wx.showModal({
    //       //     content:"已点"+taoCanNum+"份套餐，最多使用"+taoCanNum+"张套餐券",
    //       //     showCancel: false
    //       // });
    //       return;
    //     }
    //     items[parama].data[paramb].active = !items[parama].data[paramb].active;
    // }
    
    //选 领用券 跟 品类券的逻辑
    else{

        //console.log(cart_coupon_items)            //所有品类券对应商品
        //console.log(items[parama].data[paramb])   //点击的券
        //=====================================================================
        //如果所点商品有品类券商品
        if(cart_coupon_items.length){             
            var goodsId =  items[parama].data[paramb].goodsId;
            if(items[parama].data[paramb].type.category == 6){                                 //选择的券是品类券
                console.log('品类券')
                for(var i in pinleiMap){
                   if(pinleiMap[i].goodsId == goodsId){
                        //console.log(cart_coupon_items[i])                 //品类券对应的商品 
                        //console.log(cart_coupon_items[i].categoryNo)      //品类券对应的商品的品类   
                        var choosedNum = pinleiMap[i].choosedNum;
                        if(items[parama].data[paramb].active){
                           items[parama].data[paramb].active = !items[parama].data[paramb].active;
                           pinleiMap[i].choosedNum = choosedNum-1;
                        }else{
                           items[parama].data[paramb].active = !items[parama].data[paramb].active;
                           pinleiMap[i].choosedNum = choosedNum+1;
                        }
                        //数量上限
                        var maxNum = 0;
                         for(var j in cart_coupon_items){ 
                            if(cart_coupon_items[j].categoryNo==goodsId){
                              maxNum = maxNum + cart_coupon_items[j].count;   
                            }       
                         }
                         var totalChooseNum = pinleiMap[i].choosedNum +  linyongMap.choosedNum
                         console.log(pinleiMap[i].goodsId+'总共已选'+totalChooseNum)
                         console.log(pinleiMap[i].goodsId+'总共可选'+maxNum)
                         if(totalChooseNum>=maxNum){
                            // wx.showModal({content:'不能再选了', showCancel: false});
                            for(var i in items[1].data){
                                console.log(items[1].data[i])
                                if(!items[1].data[i].active){
                                      items[1].data[i].disabled = true
                                }
                            }
                         }else{
                            if(unshareCouponNum==0 && shareCouponNum>0){
                              console.log('没有不共享券且共享商品券大于0')
                              for(var i in items[1].data){
                                  if(items[1].data[i].disabled && items[1].data[i].type.isShare){
                                        items[1].data[i].disabled = false
                                  }
                              }
                            }
                         }
                   }
                }
            }else{                                                                             //选中的券是针对某商品的券
                console.log('商品券')
                for(var i in cart_coupon_items){ 
                    if(cart_coupon_items[i].crmGoodsNo==goodsId){
                      // console.log(cart_coupon_items[i])               //领用券对应商品
                      // console.log(cart_coupon_items[i].categoryNo)    //领用券对应商品的品类
                        var categoryNo = cart_coupon_items[i].categoryNo;
                        var choosedNum = linyongMap.choosedNum
                        if(items[parama].data[paramb].active){
                           items[parama].data[paramb].active = !items[parama].data[paramb].active;
                           linyongMap.choosedNum = choosedNum-1;
                        }else{   
                            items[parama].data[paramb].active = !items[parama].data[paramb].active;                
                            linyongMap.choosedNum = choosedNum+1;
                        }
                        //数量上限
                        var maxNum = 0;
                        for(var j in cart_coupon_items){ 
                          if(cart_coupon_items[j].categoryNo==categoryNo){ 
                            maxNum = maxNum + cart_coupon_items[j].count;   
                          }       
                        } 
                        for(var k in pinleiMap){
                           if(pinleiMap[k].goodsId == categoryNo){
                              var _choosedNum = pinleiMap[k].choosedNum;
                           }
                        }
                        var totalChooseNum = linyongMap.choosedNum +  _choosedNum
                        console.log(categoryNo+'总共已选'+totalChooseNum)
                        console.log(categoryNo+'总共可选'+maxNum)
                        if(totalChooseNum>=maxNum){
                          for(var i in items[1].data){
                              if(!items[1].data[i].active){
                                    items[1].data[i].disabled = true
                              }
                          }
                        }else{
                            if(unshareCouponNum==0 && shareCouponNum>0){
                              console.log('没有不共享券且共享商品券大于0')
                              for(var i in items[1].data){
                                  if(items[1].data[i].disabled && items[1].data[i].type.isShare){
                                        items[1].data[i].disabled = false
                                  }
                              }
                            }
                        }

                        // for(var i in pinleiMap){
                        //    if(pinleiMap[i].goodsId == categoryNo){
                        //         var choosedNum = linyongMap.choosedNum
                        //         var _choosedNum = pinleiMap[i].choosedNum;
                        //         if(items[parama].data[paramb].active){
                        //            linyongMap.choosedNum = choosedNum-1;
                       //             pinleiMap[i].choosedNum = _choosedNum-1;
                        //         }else{
                        //            // if(choosedNum > pinleiMap[i].num){
                        //            //    wx.showModal({content:'不能再选了', showCancel: false});
                        //            //    return;
                        //            // }
                        //            linyongMap.choosedNum = choosedNum+1;
                        //            pinleiMap[i].choosedNum = _choosedNum+1;
                        //         }
                        //    }
                        // }
                    }              
                }
            }

        }else{
            items[parama].data[paramb].active = !items[parama].data[paramb].active;
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