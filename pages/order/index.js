//index.js
//获取应用实例

var isInitSelfShow = true;
var errorGoodsMap = new Map();
errorGoodsMap.set('goodsList',[]);

var app = getApp()
Page({
  data: {
     panelShow:false,
     overHeight:false,
     userInfo:null,
     shopName:'老娘舅',
     items:[],
     cart_num:0,
     cart_fee:'0.00',
     detail_panel:false,
     choose_panel:false,
     info_panel:false,
     infoData:{},
     panel_data:{},
     panel_i:'',
     panel_j:'',
     info_i:'',
     info_j:'',
     work_num:0,
     work_num_choosed:0,
     stockList:[],
     loaderhide:true,
     addLock1:false,
     addLock2:false,
     addLock3:false,
     jumpLock:false,
     confirmDisabled:false,
     itemHeight:145,
     fillHeight:wx.getSystemInfoSync().windowHeight - 100,
     currentIndex:0,
     noticeClosed:false
  },
  addFormId(formId,type){
    var expiryTime = new Date().getTime()+7*24*360000-360000;
    var param = { mini:'mini',
                  openid:app.globalData.openId,
                  openId:app.globalData.openId,
                  unionid:app.globalData.unionId,
                  formId,
                  expiryTime,
                  type };
    wx.request({
        url: app.globalData.host+'/templateMessage/addFormId', 
        header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
        method:'POST', 
        data: param,
        success: function (res) {
          if (res.data.errcode == 0) {
              console.log('formId上报成功')   
          }else{
              console.log('formId上报失败')   
          }
        }
    })
  },
  onLoad: function () {
     var _this = this;
  
     //获取全局数据，初始化当前页面
     app.getUserInfo(function(userInfo){
      //用户信息
      _this.setData({
        userInfo:userInfo,
        shopName:app.globalData.shopName   
      })
    })
  
    //购物车历史数据 
    // console.log(app.globalData.fromType);
    var history = wx.getStorageSync('items'),
        work_num = wx.getStorageSync('work_num'),
        work_num_choosed = wx.getStorageSync('work_num_choosed');
    if(history){
       _this.setData({
         work_num:work_num,
         work_num_choosed:work_num_choosed
       })
       _this.computed(history);
       return;
    }


    //请求菜单数据
    var param = { mini:'mini',
                  shopId:app.globalData.shopId,
                  openId:app.globalData.openId,
                  userId:app.globalData.userId?app.globalData.userId:''};


    _this.setData({ loaderhide:false });
    wx.request({
        url: app.globalData.host+'/goods/goodsList',  
        data: param,
        success: function (res) {
            //服务器返回的结果
            console.log(res.data);

            if (res.data.errcode == 0) {
               var work_num = res.data.workNum;     //工作餐数量
               var stockList = res.data.stockList;  //库存数据
               _this.setData({
                   work_num:work_num,
                   stockList:stockList
               })
               wx.setStorageSync('work_num',work_num); 
               
              wx.request({
                url:app.globalData.host+"/getUTC",
                data:{mini:'mini'},
                header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
                method:'POST',
                success: function (resData) {
                    console.log(resData)
                    if(resData.data.errcode==0){
                        var date = new Date(resData.data.data);
                        var year = date.getFullYear();    //年
                        var month = date.getMonth() + 1;  //月
                        var day = date.getDate();         //日
                        var currentTime = date.getTime();  //当前时间戳
                        console.log(currentTime)
                    }else{
                        var date = new Date();
                        var year = date.getFullYear();    //年
                        var month = date.getMonth() + 1;  //月
                        var day = date.getDate();         //日
                        var currentTime = date.getTime();  //当前时间戳
                    }

                    var menuData = res.data.data;           //菜单数据
                    for(var i in menuData){       
                       var reg = /^http/;
                       if(reg.test(menuData[i].onPicture)){
                           menuData[i].onPicture =  menuData[i].onPicture;
                           menuData[i].picture =  menuData[i].picture;
                       }else{
                           menuData[i].onPicture =  menuData[i].onPicture?'http://demo.i-manji.com/lnj-weixin/'+menuData[i].onPicture.split('../../../')[1]:'';
                           menuData[i].picture =  menuData[i].picture?'http://demo.i-manji.com/lnj-weixin/'+menuData[i].picture.split('../../../')[1]:'';
                       }
                       if(i==0){
                           menuData[0].active = true;
                       }else{
                           menuData[i].active = false;
                       }

                       delete menuData[i].categoryCode;
                       delete menuData[i].categoryTime;
                       delete menuData[i].isDel;
                       delete menuData[i].createTime;
                       delete menuData[i].updateTime;
                       delete menuData[i].sequence;
                       delete menuData[i].shop;
                       delete menuData[i].shopId;
                       delete menuData[i].key;
                       delete menuData[i].goodsCount;
                       delete menuData[i].merId;
                       delete menuData[i].status;
                       delete menuData[i].typeDesc;
                       delete menuData[i].sideGoodsList;

                       var mainGoodsList = menuData[i].mainGoodsList;
                       for (var j in mainGoodsList){
                          
                          var singeItem = mainGoodsList[j];
                          
                          //处理iSoldOut = 1
                          if(singeItem.isSoldOut == 1){
                             singeItem.stockNum = 0
                          }

                          //singeItem.availableTodayTimes  = '00:00-00:00'; 处理销售时段
                          var timeArray = [];

                          if(singeItem.availableTodayTimes){
                              var available_times = singeItem.availableTodayTimes.split(',');
                              

                              for(var a in available_times){
                                 var _available_times = available_times[a].split('-');
                                 for(var b in _available_times){
                                    var timeStamp = new Date(year+'/'+month+'/'+day+' '+_available_times[b]).getTime();
                                    timeArray.push(timeStamp);
                                 }
                              }
                              
                              var groupNum = Math.ceil(timeArray.length/2);
                              var record = 0;
                              for(var g=0; g<=groupNum; g++){
                                if(currentTime >= timeArray[2*g] && currentTime<= timeArray[2*g+1]){
                                    record++;
                                    // console.log(currentTime);
                                    // console.log(timeArray[2*g]);
                                    // console.log(timeArray[2*g+1]);
                                }
                              }
                              if(record == 0) singeItem.NotAvailable = true;
                          }

                          singeItem.isNewGoods = singeItem.tagEndTime>=currentTime?true:false

                          singeItem.categoryId = menuData[i].categoryId;
                          singeItem.categoryName = menuData[i].name;
                          singeItem.categoryDescription = menuData[i].description;  
                          singeItem.count = 0;
                          singeItem.cart_items = [];      //主菜
                          singeItem.minArray = [];        //小菜
                          singeItem.priceVal =  (singeItem.price/100).toFixed(2);
                          var reg = /^http/;
                          if(reg.test(singeItem.smallPicture)){
                             singeItem.centerImg =  singeItem.smallPicture;
                          }else{
                             singeItem.centerImg =  singeItem.smallPicture?'http://demo.i-manji.com/lnj-weixin/'+singeItem.smallPicture.split('../../../')[1]:'';
                          }

                          delete singeItem.availableTimes;
                          delete singeItem.createTime;
                          delete singeItem.merId;
                          delete singeItem.lnjPrice;
                          delete singeItem.isSoldOutDesc;
                          delete singeItem.key;
                          delete singeItem.quotaCount;
                          delete singeItem.sequence;
                          delete singeItem.shop;
                          delete singeItem.shopId;
                          delete singeItem.isDel;
                          delete singeItem.typeDesc;
                          delete singeItem.updateTime;
                          delete singeItem.sideGoodsList;
                          delete singeItem.picture;
                          delete singeItem.smallPicture;
                          
                          
                          for(var m in singeItem.sideDcGoodsCategoryList){
                              delete singeItem.sideDcGoodsCategoryList[m].onPicture;
                              delete singeItem.sideDcGoodsCategoryList[m].picture;
                              delete singeItem.sideDcGoodsCategoryList[m].sequence;
                              delete singeItem.sideDcGoodsCategoryList[m].shop;
                              delete singeItem.sideDcGoodsCategoryList[m].shopId;
                              delete singeItem.sideDcGoodsCategoryList[m].isDel;
                              delete singeItem.sideDcGoodsCategoryList[m].createTime;
                              delete singeItem.sideDcGoodsCategoryList[m].key;
                              delete singeItem.sideDcGoodsCategoryList[m].mainGoodsList;
                              delete singeItem.sideDcGoodsCategoryList[m].updateTime;
                              delete singeItem.sideDcGoodsCategoryList[m].status;
                              delete singeItem.sideDcGoodsCategoryList[m].typeDesc;

                              for(var n in singeItem.sideDcGoodsCategoryList[m].sideGoodsList){
                                  singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].categoryId = singeItem.sideDcGoodsCategoryList[m].categoryId;
                                  singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].categoryName = singeItem.sideDcGoodsCategoryList[m].name;
                                  singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].categoryDescription = singeItem.sideDcGoodsCategoryList[m].description;
                                  
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].sideGoodsList;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].sideDcGoodsCategoryList;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].picture;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].smallPicture;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].availableTimes;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].isSoldOutDesc;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].key;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].lnjPrice;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].merId;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].createTime;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].updateTime;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].quotaCount;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].sequence;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].shop;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].shopId;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].ticketName;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].ticketNoList;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].ticketNum;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].type;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].typeDesc;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].isDel;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].categoryDescription;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].categoryName;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].categoryId;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].categoryIds;
                                  delete singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].description;
                              }
                          }

                       }  
                    }

                    _this.setData({ loaderhide:true });

                    //menuData 是处理完的菜单数据
                    wx.setStorageSync('menuData',menuData)

                    var itemHeight = _this.data.itemHeight 
                    var heightArray = [185]                  //范围数组
                    var heightArray2 = [0]
                    var _scrollHeight = 185
                    var _scrollHeight2 = 0
                    var titleHeight = 0
                    menuData.map(function(item,i){
                        i==0?titleHeight=150:titleHeight = 40
                        if(item.mainGoodsList.length==0){
                           _scrollHeight = _scrollHeight + itemHeight + titleHeight
                           _scrollHeight2 = _scrollHeight2 + itemHeight + titleHeight
                        }else{
                           _scrollHeight = _scrollHeight + item.mainGoodsList.length*itemHeight + titleHeight
                           _scrollHeight2 = _scrollHeight2 + item.mainGoodsList.length*itemHeight + titleHeight
                        }
                        heightArray.push(_scrollHeight)
                        heightArray2.push(_scrollHeight2)
                    })
                    console.log(heightArray)
                    console.log(heightArray2)

                    _this.setData({
                       items:menuData,
                       meal:res.data.meal,
                       mealIsShow:res.data.mealIsShow,
                       cart_num:0,
                       cart_fee:'0.00',
                       detail_panel:false,
                       choose_panel:false,
                       info_panel:false,
                       heightArray:heightArray,
                       heightArray2:heightArray2
                    })
                }
              })
              
            } else {
                _this.setData({ loaderhide:true });
                _this.showDialog1(res.data.msg);
                // wx.showModal({
                //     content:res.data.msg,
                //     showCancel: false
                // });
            }

        },
        fail: function () {
            console.log('系统错误')
        }
    })
  },

  // onShow:function(){
  //     if (isInitSelfShow) return;
  //     // console.log(wx.getStorageSync('clearCart'))
  //     if(wx.getStorageSync('clearCart')){
  //         this.computed(menuData);
  //         wx.clearStorageSync('clearCart');
  //     }

  // },

  // onHide() {
  //     isInitSelfShow = false;
  // },

  //切换菜单类
  tabTap: function(e){
    var items = this.data.items,
        index = e.currentTarget.dataset.param;
    console.log(index)
    this.setData({ toView:'v_'+index})
  },

  //处理数据变化 数据全依赖于items
  computed: function(data){    
     var items = data,
         cart_num = 0, 
         cart_fee = 0;

     //console.log(items);

      //全部配菜数据
      var _allminArray = [];
      for(var i in items){   
           for(var j in items[i].mainGoodsList){
                var singeItem = items[i].mainGoodsList[j];  
                if(singeItem){     
                    for(var tt in singeItem.minArray){
                      for(var ss in singeItem.minArray[tt]){
                        _allminArray.push(singeItem.minArray[tt][ss]);
                      }
                    }
                }
          }
      }

     
     //从菜单数据中取出购物车数据 菜单列表 数量 金额
     for(var i in items){   
           for(var j in items[i].mainGoodsList){
                var singeItem = items[i].mainGoodsList[j];  
                if(singeItem){           
                    if(singeItem.sideDcGoodsCategoryList && singeItem.sideDcGoodsCategoryList.length >0){
                          //根据主菜数据        ==>  计算得出数量金额
                          if(singeItem.cart_items.length > 0){
                            for(var k in singeItem.cart_items){
                                cart_num = cart_num + 1;
                                cart_fee = cart_fee + 1*singeItem.cart_items[k].priceVal;
                            }
                            
                          }

                          //所选配菜数据可操作  ==> 计算得出配菜库存
                          for(var m in singeItem.sideDcGoodsCategoryList){
                              for(var n in singeItem.sideDcGoodsCategoryList[m].sideGoodsList){
                                  var _stockId = singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].stockId;
                                  var _minCount = 0;
                                  if(_stockId){
                                      // console.log(_allminArray);
                                      for(var ii in _allminArray){             
                                             //console.log(_allminArray[ii])
                                             if(_allminArray[ii].stockId == _stockId){
                                                 _minCount++;
                                             }
                                      }
                                      singeItem.sideDcGoodsCategoryList[m].sideGoodsList[n].minCount = _minCount;
                                  }
                              }
                          }


                    }else{
                          cart_num = cart_num + singeItem.count;
                          cart_fee = cart_fee + singeItem.count*singeItem.priceVal;
                    }
                }  
            }
     }
     
     this.setData({
          items:items,
          cart_num:cart_num,
          cart_fee:cart_fee.toFixed(2)
     })
      
     wx.setStorageSync('items',items)

  },

  //点击加号
  addTap:function(e){
      var _items = this.data.items,
          work_num = this.data.work_num,
          work_num_choosed = this.data.work_num_choosed,
          stockList = this.data.stockList,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb,
          _count = _items[parama].mainGoodsList[paramb].count,
          panel_data = _items[parama].mainGoodsList[paramb];      //当前菜品数据
     
    if(panel_data.NotAvailable){
        // wx.showToast({
        //   title: panel_data.availableTodayTimes=='00:00-00:00'?'当前时段暂不可售':'销售时段：'+panel_data.availableTodayTimes,
        //   icon: 'none',
        //   duration: 1500
        // })

        this.showTime(panel_data.availableTodayTimes)
        // wx.showModal({
        //   content: '销售时段：'+panel_data.availableTodayTimes,
        //   showCancel:false
        // })
        return;
    }

    if(panel_data.stockNum == 0){
        this.showDialog('已售罄！');
        return;
    }

    //点击锁定
    if(panel_data.type == 3){
        var tapLock = this.data.addLock1;
        if(tapLock) return;
        this.setData({addLock1:true});
    }

    //所有菜品(受限于库存） stockId为null 表示不受库存约束
    if(panel_data.stockId){
       for(var i in stockList){
           if(stockList[i].id == panel_data.stockId){        //根据库存id匹配出库存数量
               if(_count>=stockList[i].stock){
                  this.showDialog('没有更多库存！');
                  //wx.showModal({content:"没有更多库存！", showCancel: false});
                  this.setData({addLock1:false});
                  return;
               }
           }
       }
    }

      //工作餐(受限于所持券数量)
      if(panel_data.isWork){    
         if(work_num_choosed>=work_num){
              this.showDialog("您只有"+work_num+"张亲情套餐券！");
              //wx.showModal({content:"您只有"+work_num+"张亲情套餐券！", showCancel: false});
              this.setData({addLock1:false});
              return;
         }
         work_num_choosed = work_num_choosed + 1; 
         this.setData({
            work_num_choosed:work_num_choosed
         });   
         wx.setStorageSync('work_num_choosed',work_num_choosed) 
      }
      //会员商品券
      console.log(panel_data)
      var ticketNum = panel_data.ticketNum;   
      if(ticketNum){                                       //所点商品是会员尊享商品券对应商品
         var isShare = panel_data.isShareCoupon,           //当前券是否可以共享
             ticketName = panel_data.ticketName,           //唯一id
             couponUseNumber = panel_data.couponUseNumber  //最大使用张数

         //过滤出已点的会员尊享商品
         console.log(_items)
         for(var i in _items){
            if(_items[i].categoryId==0){
                for(var j in _items[i].mainGoodsList){
                    var  couponGoods = _items[i].mainGoodsList[j]
                    if(couponGoods.count > 0  ){
                        if(isShare){           //当前可以共享
                            if(couponGoods.isShareCoupon==0 && couponGoods.ticketName != ticketName){
                                wx.showModal({content:"您已享受尊享优惠，不可与其他优惠同享！", showCancel: false});
                                this.setData({addLock1:false});
                                return;
                            }
                        }else{                //当前不可以共享
                           if(couponGoods.ticketName != ticketName){
                               wx.showModal({content:"您已享受尊享优惠，不可与其他优惠同享！", showCancel: false});
                               this.setData({addLock1:false});
                               return;
                           }
                        }
                    }
                }
            }

         }
         //拥有数量超出最大使用张数
         if(_count>=couponUseNumber){
                // this.showDialog("您最多可使用"+couponUseNumber+"张 "+ panel_data.name +"！");
                wx.showModal({content:"亲，您最多可使用"+couponUseNumber+"张该商品尊享券！", showCancel: false});
                this.setData({addLock1:false});
                return;
         }      
         //拥有数量不足
         if(_count>=ticketNum){
              //wx.showModal({content:"您只有"+ticketNum+"张会员商品尊享券！", showCancel: false});
              //this.showDialog("您只有"+ticketNum+"张 "+ panel_data.name +"！");
              wx.showModal({content:"亲，您只有"+ticketNum+"张该商品尊享券！", showCancel: false});
              this.setData({addLock1:false});
              return;
         }
      }

      _items[parama].mainGoodsList[paramb].count = _count+1;
      this.computed(_items);                                          
      

      //对应套餐的处理 1单品，2配菜，3套餐
      var confirmDisabled = false;
      if(panel_data.type == 3){
         console.log( panel_data.sideDcGoodsCategoryList)
         for(var i in panel_data.sideDcGoodsCategoryList){
           var subNum = panel_data.sideDcGoodsCategoryList[i].sideGoodsList.length;   //配菜数量
           var m = 0;
           for(var j in panel_data.sideDcGoodsCategoryList[i].sideGoodsList){
              if(panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].stockNum === 0 
                || panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].isSoldOut
                || panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].minCount >= panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].stockNum){
                m++;
              }
           }  
           if(m >= subNum){
              confirmDisabled = true;
           }else{
              panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].active = true;
           }
            
   //      if(j == 0){
   //          if(panel_data.sideDcGoodsCategoryList[i].sideGoodsList[j].isSoldOut){
   //             confirmDisabled = true;
   //          }else{
   //             panel_data.sideDcGoodsCategoryList[i].sideGoodsList[j].active = true;
   //          }
   //      }else{
   //          panel_data.sideDcGoodsCategoryList[i].sideGoodsList[j].active = false;        
   //      }
         }
         this.setData({
              choose_panel:true,
              detail_panel:false,
              info_panel:false,
              panel_i:parama,
              panel_j:paramb,
              confirmDisabled:confirmDisabled,
              panel_data:panel_data,
         });
      }

  },
  chooseTap:function(e){
      var isSoldOut = e.currentTarget.dataset.param;
      if(isSoldOut) return;

      var stockList = this.data.stockList,
          panel_data = this.data.panel_data,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb;
      
      //当前库存为0，不可选
      var data = panel_data.sideDcGoodsCategoryList[parama].sideGoodsList[paramb];
      if( data.stockId){
        if(data.stockNum==0 || data.stockNum == data.minCount){
            this.showDialog("该配菜已售完，请选择其他配菜！");
            //wx.showModal({content:"该配菜已售完，请选择其他配菜！", showCancel: false});
            return;
        }
      }

      for(var i in panel_data.sideDcGoodsCategoryList[parama].sideGoodsList){
           if(i==paramb){
               panel_data.sideDcGoodsCategoryList[parama].sideGoodsList[i].active = true;
           }else{
               panel_data.sideDcGoodsCategoryList[parama].sideGoodsList[i].active = false;
           }
      }
      
    var num = panel_data.sideDcGoodsCategoryList.length;
    var _num = 0;
    for(var m in panel_data.sideDcGoodsCategoryList){
       for(var n in panel_data.sideDcGoodsCategoryList[m].sideGoodsList){
          // console.log(panel_data.sideDcGoodsCategoryList[m].sideGoodsList[n]);
          if(panel_data.sideDcGoodsCategoryList[m].sideGoodsList[n].active){
             _num++;
          }
       }
     }

     var confirmDisabled;
     if(_num<num){
        confirmDisabled = true;
     }else{
        confirmDisabled = false
     }
      
      this.setData({
        panel_data:panel_data,
        confirmDisabled:confirmDisabled
      });
  },
  confirmTap:function(){                           //确定，触发底层数据items的改变  
     if(this.data.confirmDisabled) return;
     var panel_data = this.data.panel_data,        //当所点前菜品数据
         panel_i = this.data.panel_i,
         panel_j = this.data.panel_j,
         _items = this.data.items;
     

     //判断是否有加价小菜
     var priceAdd = 0,
         _minArray = [];

     var subItemNum = panel_data.sideDcGoodsCategoryList.length;
     var subItemChoosedNum = 0;

     for(var i in panel_data.sideDcGoodsCategoryList){
        for(var j in panel_data.sideDcGoodsCategoryList[i].sideGoodsList){
            if(panel_data.sideDcGoodsCategoryList[i].sideGoodsList[j].active){
                  subItemChoosedNum++;
                  _minArray.push(panel_data.sideDcGoodsCategoryList[i].sideGoodsList[j]);              
                  priceAdd = priceAdd + panel_data.sideDcGoodsCategoryList[i].sideGoodsList[j].price;
            }   
        }
     }

     if(subItemChoosedNum != subItemNum){
        var parama = this.data.panel_i,
            paramb = this.data.panel_j,
            work_num_choosed = this.data.work_num_choosed,
           _count = _items[parama].mainGoodsList[paramb].count;

         if(_items[parama].mainGoodsList[paramb].isWork){
             work_num_choosed = work_num_choosed - 1; 
             this.setData({
                work_num_choosed:work_num_choosed
             }); 
             wx.setStorageSync('work_num_choosed',work_num_choosed)
         }

         _items[parama].mainGoodsList[paramb].count = _count-1;
         this.computed(_items);

         wx.showToast({
             title:'配菜库存不足，请选择其他菜品',
             icon:'none',
             duration:2000
         })
     }else{
         panel_data.priceVal = ((panel_data.price + priceAdd)/100).toFixed(2);       //加价    
         _items[panel_i].mainGoodsList[panel_j].cart_items.push(panel_data);         //购物车数据变化
         _items[panel_i].mainGoodsList[panel_j].minArray.push(_minArray);            //小菜
        
         delete panel_data.cart_items;
         delete panel_data.minArray;
       
         this.computed(_items);
     }
     this.setData({
        choose_panel:false,
        confirmDisabled:false,
        addLock1:false,
        addLock2:false,
        addLock3:false
     })

  },
  cancelTap:function(){
       var _items = this.data.items,
          parama = this.data.panel_i,
          paramb = this.data.panel_j,
          work_num_choosed = this.data.work_num_choosed,
         _count = _items[parama].mainGoodsList[paramb].count;

       if(_items[parama].mainGoodsList[paramb].isWork){
           work_num_choosed = work_num_choosed - 1; 
           this.setData({
              work_num_choosed:work_num_choosed
           }); 
           wx.setStorageSync('work_num_choosed',work_num_choosed)
       }

       _items[parama].mainGoodsList[paramb].count = _count-1;
       this.computed(_items);
       this.setData({
          choose_panel:false,
          confirmDisabled:false,
          addLock1:false,
          addLock2:false,
          addLock3:false
       })
  },
  minusTap:function(e){
      var _items = this.data.items,
          work_num_choosed = this.data.work_num_choosed,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb,
          _count = _items[parama].mainGoodsList[paramb].count;
      if(_count>0){
          _items[parama].mainGoodsList[paramb].count = _count-1;
          _items[parama].mainGoodsList[paramb].cart_items.pop();    //主菜数据变化
          _items[parama].mainGoodsList[paramb].minArray.pop();      //小菜数据变化

          if(_items[parama].mainGoodsList[paramb].isWork){
             work_num_choosed = work_num_choosed - 1; 
             this.setData({
                work_num_choosed:work_num_choosed
             }); 
             wx.setStorageSync('work_num_choosed',work_num_choosed)
          }
        
        this.computed(_items);
      }
  },
  detailTap:function(e){
      var param = e.currentTarget.dataset.param;
      // console.log(this.data.items);
      if(param==0) return;
      this.setData({
        detail_panel:true,
        choose_panel:false,
        info_panel:false
      })
  },
  coverTap:function(){
      this.setData({
        detail_panel:false,
        info_panel:false,
      })
  },

  infoScan:function(e){
     var  _items = this.data.items,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb,
          panel_data = _items[parama].mainGoodsList[paramb];

     // console.log(panel_data);
     this.setData({
            info_panel:true,
            choose_panel:false,
            detail_panel:false,
            infoData:panel_data,
            info_i:parama,
            info_j:paramb
     });
  },
  
  closeInfoTap:function(){
      this.setData({
            info_panel:false
      })
  },
  infoAdd:function(){
      var _items = this.data.items,
          work_num = this.data.work_num,
          work_num_choosed = this.data.work_num_choosed,
          stockList = this.data.stockList,
          parama = this.data.info_i,
          paramb = this.data.info_j,
          _count = _items[parama].mainGoodsList[paramb].count,
          panel_data = _items[parama].mainGoodsList[paramb];      //当前菜品数据
      

     //点击锁定
     if(panel_data.type == 3){
        var tapLock = this.data.addLock2;
        if(tapLock) return;
        this.setData({addLock2:true});
     }

      // console.log(panel_data);
      //所有菜品(受限于库存） stockId为null 表示不受库存约束
      if(panel_data.stockId){
         for(var i in stockList){
             if(stockList[i].id == panel_data.stockId){        //根据库存id匹配出库存数量
                 if(_count>=stockList[i].stock){
                    this.showDialog("没有更多库存！");
                    //wx.showModal({content:"没有更多库存！", showCancel: false});
                    this.setData({addLock2:false});
                    return;
                 }
             }
         }
      }

      //工作餐(受限于所持券数量)
      if(panel_data.isWork){          
         if(work_num_choosed>=work_num){
              this.showDialog("您只有"+work_num+"张亲情套餐券！");
              //wx.showModal({content:"您只有"+work_num+"张亲情套餐券！", showCancel: false});
              this.setData({addLock2:false});
              return;
         }
         work_num_choosed = work_num_choosed + 1; 
         this.setData({
            work_num_choosed:work_num_choosed
         });  
         wx.setStorageSync('work_num_choosed',work_num_choosed)  
      }
      //会员商品券
      console.log(panel_data)
      var ticketNum = panel_data.ticketNum;   
      if(ticketNum){                                       //所点商品是会员尊享商品券对应商品
         var isShare = panel_data.isShareCoupon,           //当前券是否可以共享
             ticketName = panel_data.ticketName,           //唯一id
             couponUseNumber = panel_data.couponUseNumber  //最大使用张数

         //过滤出已点的会员尊享商品
         console.log(_items)
         for(var i in _items){
            if(_items[i].categoryId==0){
                for(var j in _items[i].mainGoodsList){
                    var  couponGoods = _items[i].mainGoodsList[j]
                    if(couponGoods.count > 0  ){
                        if(isShare){           //当前可以共享
                            if(couponGoods.isShareCoupon==0 && couponGoods.ticketName != ticketName){
                                wx.showModal({content:"您已享受尊享优惠，不可与其他优惠同享！", showCancel: false});
                                this.setData({addLock1:false});
                                return;
                            }
                        }else{                //当前不可以共享
                           if(couponGoods.ticketName != ticketName){
                               wx.showModal({content:"您已享受尊享优惠，不可与其他优惠同享！", showCancel: false});
                               this.setData({addLock1:false});
                               return;
                           }
                        }
                    }
                }
            }

         }
         //拥有数量超出最大使用张数
         if(_count>=couponUseNumber){
                // this.showDialog("您最多可使用"+couponUseNumber+"张 "+ panel_data.name +"！");
                wx.showModal({content:"亲，您最多可使用"+couponUseNumber+"张该商品尊享券！", showCancel: false});
                this.setData({addLock1:false});
                return;
         }      
         //拥有数量不足
         if(_count>=ticketNum){
              //wx.showModal({content:"您只有"+ticketNum+"张会员商品尊享券！", showCancel: false});
              //this.showDialog("您只有"+ticketNum+"张 "+ panel_data.name +"！");
              wx.showModal({content:"亲，您只有"+ticketNum+"张该商品尊享券！", showCancel: false});
              this.setData({addLock1:false});
              return;
         }
      }

      _items[parama].mainGoodsList[paramb].count = _count+1;
      
      var infoData = _items[parama].mainGoodsList[paramb];
      this.setData({
        infoData:infoData,
      })
      
      this.computed(_items);                                          


      //对应套餐的处理 1单品，2配菜，3套餐
      var confirmDisabled;
      if(panel_data.type == 3){
         console.log( panel_data.sideDcGoodsCategoryList)
         for(var i in panel_data.sideDcGoodsCategoryList){
           var subNum = panel_data.sideDcGoodsCategoryList[i].sideGoodsList.length;   //配菜数量
           var m = 0;
           for(var j in panel_data.sideDcGoodsCategoryList[i].sideGoodsList){
              if(panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].stockNum === 0 
                || panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].isSoldOut
                || panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].minCount >= panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].stockNum){
                m++;
              }
           }  
           if(m >= subNum){
              confirmDisabled = true;
           }else{
              panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].active = true;
           }
            
   //      if(j == 0){
   //          if(panel_data.sideDcGoodsCategoryList[i].sideGoodsList[j].isSoldOut){
   //             confirmDisabled = true;
   //          }else{
   //             panel_data.sideDcGoodsCategoryList[i].sideGoodsList[j].active = true;
   //          }
   //      }else{
   //          panel_data.sideDcGoodsCategoryList[i].sideGoodsList[j].active = false;        
   //      }
         }
         this.setData({
              choose_panel:true,
              detail_panel:false,
              info_panel:false,
              panel_i:parama,
              panel_j:paramb,
              confirmDisabled:confirmDisabled,
              panel_data:panel_data,
         });
      }

  },

  infoMinus:function(){
      var _items = this.data.items,
          work_num_choosed = this.data.work_num_choosed,
          parama = this.data.info_i,
          paramb = this.data.info_j,
          _count = _items[parama].mainGoodsList[paramb].count;

      if(_count>0){
          _items[parama].mainGoodsList[paramb].count = _count-1;
          _items[parama].mainGoodsList[paramb].cart_items.pop();    //主菜数据变化
          _items[parama].mainGoodsList[paramb].minArray.pop();      //小菜数据变化

          if(_items[parama].mainGoodsList[paramb].isWork){
             work_num_choosed = work_num_choosed - 1; 
             this.setData({
                work_num_choosed:work_num_choosed
             }); 
             wx.setStorageSync('work_num_choosed',work_num_choosed)
          }
        
        var infoData = _items[parama].mainGoodsList[paramb];
        this.setData({
          infoData:infoData,
        })

        this.computed(_items);
      }
  },
  
  cartMinusTap:function(e){
      var _items = this.data.items,
          work_num_choosed = this.data.work_num_choosed,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb,
          paramc = e.currentTarget.dataset.paramc,
          _count = _items[parama].mainGoodsList[paramb].count,
          panel_data = _items[parama].mainGoodsList[paramb];
      if(_count>0){
          _items[parama].mainGoodsList[paramb].count = _count-1;
          var cart_items = _items[parama].mainGoodsList[paramb].cart_items;
          var minArray = _items[parama].mainGoodsList[paramb].minArray;
          _items[parama].mainGoodsList[paramb].cart_items = cart_items.slice(0,paramc).concat(cart_items.slice(paramc+1,cart_items.length))   //主菜数据变化
          _items[parama].mainGoodsList[paramb].minArray = minArray.slice(0,paramc).concat(minArray.slice(paramc+1,minArray.length));                                         //小菜数据变化
          
          if(panel_data.isWork){
             work_num_choosed = work_num_choosed - 1; 
             this.setData({
                work_num_choosed:work_num_choosed
             }); 
             wx.setStorageSync('work_num_choosed',work_num_choosed)
          }


          this.computed(_items);
          if(this.data.cart_num==0){                              //购物车数量为0时，触发关闭弹窗
             this.coverTap();
          }
      }

  },
  cartAddTap:function(e){
      var _items = this.data.items,
          work_num = this.data.work_num,
          work_num_choosed = this.data.work_num_choosed,
          stockList = this.data.stockList,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb,
          paramc = e.currentTarget.dataset.paramc,
         _count = _items[parama].mainGoodsList[paramb].count,
          panel_data = _items[parama].mainGoodsList[paramb];
      
     //点击锁定
     if(panel_data.type == 3){
        var tapLock = this.data.addLock3;
        if(tapLock) return;
        this.setData({addLock3:true});
     }

      //所有菜品(受限于库存） stockId为null 表示不受库存约束
      if(panel_data.stockId){
         for(var i in stockList){
             if(stockList[i].id == panel_data.stockId){        //根据库存id匹配出库存数量
                 if(_count>=stockList[i].stock){
                    this.showDialog('没有更多库存！');
                    //wx.showModal({content:"没有更多库存！", showCancel: false});
                    this.setData({addLock3:false});
                    return;
                 }
             }
         }
      }

      //工作餐(受限于所持券数量)
      if(panel_data.isWork){          
         if(work_num_choosed>=work_num){
              this.showDialog("您只有"+work_num+"张亲情套餐券！");
              //wx.showModal({content:"您只有"+work_num+"张亲情套餐券！", showCancel: false});
              this.setData({addLock3:false});
              return;
         }
         work_num_choosed = work_num_choosed + 1; 
         this.setData({
            work_num_choosed:work_num_choosed
         });  
         wx.setStorageSync('work_num_choosed',work_num_choosed)  
      }

      //会员商品券
      var ticketNum = panel_data.ticketNum;
      if(ticketNum){
         if(_count>=ticketNum){
              this.showDialog("您只有"+ticketNum+"张会员商品尊享券！");
              //wx.showModal({content:"您只有"+ticketNum+"张会员商品尊享券！", showCancel: false});
              this.setData({addLock3:false});
              return;
         }
      }



      _items[parama].mainGoodsList[paramb].count = _count+1;
      this.computed(_items);


      //对应套餐的处理 1单品，2配菜，3套餐
      var confirmDisabled;
      if(panel_data.type == 3){
         console.log( panel_data.sideDcGoodsCategoryList)
         for(var i in panel_data.sideDcGoodsCategoryList){
           var subNum = panel_data.sideDcGoodsCategoryList[i].sideGoodsList.length;   //配菜数量
           var m = 0;
           for(var j in panel_data.sideDcGoodsCategoryList[i].sideGoodsList){
              if(panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].stockNum === 0 
                || panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].isSoldOut
                || panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].minCount >= panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].stockNum){
                m++;
              }
           }  
           if(m >= subNum){
              confirmDisabled = true;
           }else{
              panel_data.sideDcGoodsCategoryList[i].sideGoodsList[m].active = true;
           }
            
   //      if(j == 0){
   //          if(panel_data.sideDcGoodsCategoryList[i].sideGoodsList[j].isSoldOut){
   //             confirmDisabled = true;
   //          }else{
   //             panel_data.sideDcGoodsCategoryList[i].sideGoodsList[j].active = true;
   //          }
   //      }else{
   //          panel_data.sideDcGoodsCategoryList[i].sideGoodsList[j].active = false;        
   //      }
         }
         this.setData({
              choose_panel:true,
              detail_panel:false,
              info_panel:false,
              panel_i:parama,
              panel_j:paramb,
              confirmDisabled:confirmDisabled,
              panel_data:panel_data,
         });
      }


  },

  closeDetailTap:function(){
      this.setData({
            detail_panel:false
      })
  },

  cartEmpty:function(){
      var menuData = wx.getStorageSync('menuData');
      console.log(menuData);
      this.setData({
         items:menuData,
         cart_num:0,
         cart_fee:'0.00',
         detail_panel:false,
         choose_panel:false,
         info_panel:false,
      })
      wx.setStorageSync('items',null);
      wx.setStorageSync('work_num_choosed',0);
      this.setData({ work_num_choosed:0 }); 
  },
  
  //去结算
  orderConfirmTap:function(e){
     var formId = e.detail.formId;
     this.addFormId(formId,1);

     var param = e.currentTarget.dataset.param;
     if(param == 'false') return;


     var _this = this;
     //跳转锁定
     var jumpLock = _this.data.jumpLock;
     if(jumpLock) return;
     _this.setData({jumpLock:true});


     var cart_items = [],
         dwCoupons = [],
         taoCanNum = 0,
         goodsId = '',
         items = this.data.items;

     for(var i in items){
        for(var j in items[i].mainGoodsList){
           if(items[i].mainGoodsList[j].count > 0){
            if(items[i].mainGoodsList[j].cart_items.length>0){
                for(var m in items[i].mainGoodsList[j].cart_items){
                   cart_items.push(items[i].mainGoodsList[j].cart_items[m]);
                }
            }else{
                   cart_items.push(items[i].mainGoodsList[j]);
            }
          }
        }
     }
     
     
     var feiTaoCan = [],
         detail_items = [],
         m = 0,
         j = 0;


     for(var i in cart_items){
        if(cart_items[i].sideDcGoodsCategoryList){                         //套餐       
           cart_items[i].count = 1;                               
           if(cart_items[i].isWork==0 && cart_items[i].type==3){        //套餐且非情亲套餐    
                taoCanNum++;
           }

           //套餐外部主菜信息
           var singe_items = {};
           singe_items.shopId = cart_items[i].shopId;
           singe_items.goodsId = cart_items[i].goodsId;
           singe_items.goodsName = cart_items[i].name;
           singe_items.isWork = cart_items[i].isWork;
           singe_items.type = cart_items[i].type;
           singe_items.price = cart_items[i].price;
           singe_items.count = 1;
           singe_items.merId = cart_items[i].shopId;
           // singe_items.depId = cart_items[i].merId;
           singe_items.categoryId = cart_items[i].categoryId;
           singe_items.categoryName = cart_items[i].categoryName;
           singe_items.categoryDescription = cart_items[i].categoryDescription;
           singe_items.crmGoodsNo = cart_items[i].crmGoodsNo;
           singe_items.group = m;
           detail_items.push(singe_items);
           
           //套餐内部小菜信息
           var sideGoodsListLength = cart_items[i].sideDcGoodsCategoryList.length;
           var _sideGoodsListLength = 0;
           for(var k in cart_items[i].sideDcGoodsCategoryList){
              for(var t in cart_items[i].sideDcGoodsCategoryList[k].sideGoodsList){
                 var food = cart_items[i].sideDcGoodsCategoryList[k].sideGoodsList[t];
                 if(food.active){
                     _sideGoodsListLength++;
                     var singe_items = {};
                     singe_items.shopId = food.shopId;
                     singe_items.goodsId = food.goodsId;
                     singe_items.goodsName = food.name;
                     singe_items.isWork = food.isWork;
                     singe_items.type = food.type;
                     singe_items.price = food.price;
                     singe_items.count = 1;
                     singe_items.merId = food.shopId;
                     singe_items.depId = cart_items[i].goodsId;
                     singe_items.categoryId = food.categoryId;
                     singe_items.categoryName = food.categoryName;
                     singe_items.categoryDescription = food.categoryDescription;
                     singe_items.crmGoodsNo = food.crmGoodsNo;
                     singe_items.group = m;
                     detail_items.push(singe_items);
                 }
              }
           }
           m++;
           if(sideGoodsListLength != _sideGoodsListLength){
                var goodsList = errorGoodsMap.get('goodsList')
                goodsList.push({
                    index:i,
                    goodsId:cart_items[i].goodsId,
                    goodsName:cart_items[i].name
                });
                errorGoodsMap.set('goodsList',goodsList);
           }else{
                if(cart_items[i].isWork==0){                                              //单品 套餐
                   feiTaoCan[j]=cart_items[i].crmGoodsNo+"#"+cart_items[i].count;
                   j++;
                 } 

                 if(cart_items[i].categoryNo){                                           //品类券商品
                      feiTaoCan[j] = cart_items[i].categoryNo+"#"+cart_items[i].count;  
                      j++;
                 }

                 if(cart_items[i].ticketNum){                                           //会员券 商品
                   for(var mm = 0; mm<cart_items[i].count; mm++){
                       dwCoupons.push(JSON.parse(cart_items[i].ticketNoList[mm]));
                   }
                 }
           }
         }else{
             //单品菜信息
             var singe_items = {};
             singe_items.shopId = cart_items[i].shopId;
             singe_items.goodsId = cart_items[i].goodsId;
             singe_items.goodsName = cart_items[i].name;
             singe_items.isWork = cart_items[i].isWork;
             singe_items.type = cart_items[i].type;
             singe_items.price = cart_items[i].price;
             singe_items.count = cart_items[i].count;
             singe_items.merId = cart_items[i].shopId;
             singe_items.depId = cart_items[i].goodsId;
             singe_items.categoryId = cart_items[i].categoryId;
             singe_items.categoryName = cart_items[i].categoryName;
             singe_items.categoryDescription = cart_items[i].categoryDescription;
             singe_items.crmGoodsNo = cart_items[i].crmGoodsNo;
             singe_items.group = m;
             detail_items.push(singe_items);
             m++;

             if(cart_items[i].isWork==0){                                              //单品 套餐
               feiTaoCan[j]=cart_items[i].crmGoodsNo+"#"+cart_items[i].count;
               j++;
             } 

             if(cart_items[i].categoryNo){                                           //品类券商品
                  feiTaoCan[j] = cart_items[i].categoryNo+"#"+cart_items[i].count;  
                  j++;
             }

             if(cart_items[i].ticketNum){                                           //会员券 商品
               for(var mm = 0; mm<cart_items[i].count; mm++){
                   dwCoupons.push(JSON.parse(cart_items[i].ticketNoList[mm]));
               }
             }
         }         
     }
     goodsId = feiTaoCan.join('-');
     dwCoupons = JSON.stringify(dwCoupons);
     cart_items = JSON.stringify(cart_items);
     cart_items = cart_items.replace(/\?/g,'');
     detail_items = JSON.stringify(detail_items);
     wx.removeStorage({key:'paytype'});
     wx.removeStorage({key:'choosed_card'});


     var errorGoodsList = errorGoodsMap.get('goodsList');
     var errorGoodsLength = errorGoodsList.length;
     console.log(errorGoodsLength)
     var errorGoodsNameArray = []; 
     if(errorGoodsLength){
          for(let e = 0; e< errorGoodsLength; e++){
              errorGoodsNameArray.push(errorGoodsList[e].goodsName)

              var errorGoodsId = errorGoodsList[e].goodsId;
              for(let ii in items){
                 for(let jj in items[ii].mainGoodsList){
                      if(items[ii].mainGoodsList[jj].goodsId == errorGoodsId){
                         items[ii].mainGoodsList[jj].count = 0;
                         items[ii].mainGoodsList[jj].cart_items = [];
                      }                      
                 }
              }
          }
          wx.showToast({
             title:errorGoodsNameArray.join(',')+'配菜库存不足，请选择其他菜品',
             icon:'none',
             duration:2000
          })
          setTimeout(function(){
               errorGoodsMap.set('goodsList',[]);
               _this.computed(items);
               _this.setData({jumpLock:false});
          },2000)
     }else{
         wx.navigateTo({ 
            url: '../order_confirm/index?cart_items='+cart_items+'&detail_items='+detail_items+'&dwCoupons='+dwCoupons+'&goodsId='+goodsId+'&taoCanNum='+taoCanNum,
            success:function(){
                setTimeout(function(){
                   _this.setData({jumpLock:false});
                },500)
            }
         })
     }



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
      wx.reLaunch({url:'../../pages/entrace/index'});
  },

  showTime:function(data){
      var data = data.split(',')
      this.setData({
        showTime:true,
        dataTime:data
      })
  },

  cancelTime:function(){
      this.setData({
        showTime:false
      })
  },
  productScroll:function(e){
      var _this = this
      var scrollTop = e.detail.scrollTop,
          heightArray = this.data.heightArray,
          heightArray2 = this.data.heightArray2,
          items = this.data.items

      console.log(scrollTop)
      console.log(heightArray2)

      if(scrollTop>=140){
         if(!this.data.overHeight){
              this.setData({overHeight:true})
         }
      }else{
          if(this.data.overHeight){
               this.setData({overHeight:false})
          }
          // for(var i=0; i<=heightArray.length;  i++){
          //     if(scrollTop>=heightArray[i] && scrollTop<heightArray[i+1]){
          //         var currentIndex = this.data.currentIndex
          //         if(i==currentIndex) return
          
          //         items.map(function(item,n){
          //            if(n==i){
          //               items[n].active = true
          //               _this.setData({toTabView:'tab_'+n})
          //            }else{
          //               items[n].active = false
          //            }
          //         })
          //         this.setData({items:items,currentIndex:i})
          //     }
          // }
      }
      for(var i=0; i<=heightArray2.length;  i++){
          if(scrollTop>=heightArray2[i] && scrollTop<heightArray2[i+1]){
              var currentIndex = this.data.currentIndex
              if(i==currentIndex) return
      
              items.map(function(item,n){
                 if(n==i){
                    items[n].active = true
                    _this.setData({toTabView:'tab_'+n})
                 }else{
                    items[n].active = false
                 }
              })
              this.setData({items:items,currentIndex:i})
          }
      }

  }
})
