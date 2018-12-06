//index.js
//获取应用实例

var isInitSelfShow = true, 
    menuData;


var app = getApp()
Page({
  data: {
     userInfo:null,
     shopName:'老娘舅',
     items:[],
     cart_num:0,
     cart_fee:'0.00',
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
     jumpLock:false
  },
  delRepeat:function(array){
    var result=[]
    for(var i=0; i<array.length; i++){
      if(result.indexOf(array[i])==-1){
        result.push(array[i])
      }
    }
    return(result); 
  },
  onLoad: function(option) {
     var _this = this;
     var moreshopId = option.shopId;
     var moreshopName = option.shopName;

     //获取全局数据，初始化当前页面
     app.getUserInfo(function(userInfo){
      //用户信息
      _this.setData({
        userInfo:userInfo,
        shopName:app.globalData.shopName   
      })
    })

    if(moreshopId){
      console.log(moreshopName);
      app.globalData.shopId = moreshopId;
      app.globalData.shopName = moreshopName;
      _this.setData({
         shopId:moreshopId,
         shopName:moreshopName
      })   
    }
    //请求菜单数据
    var param = { mini:'mini',
                  STORE_ID:app.globalData.shopId
                };
    
    console.log(param);

    _this.setData({ loaderhide:false });
    wx.request({
        url: app.globalData.host+'/waimai/goods/getShopDishKind',  
        data: param,
        success: function (res) {
            //服务器返回的结果
            console.log(res.data);

            if (res.data.errcode == 0) {               
               menuData = res.data.data.list;        //菜单数据
               for(var i in menuData){       
                   if(i==0){
                       menuData[0].active = true;
                   }else{
                       menuData[i].active = false;
                   }


                   var goodsList = menuData[i].goodsList;
                   for (var j in goodsList){
                          var singeItem = goodsList[j];
                          singeItem.categoryId = menuData[i].amdkid;
                          singeItem.categoryName = menuData[i].name;
                          singeItem.count = 0;
                          singeItem.cart_items = [];      //主菜
                          singeItem.minArray = [];        //小菜
                          singeItem.priceVal =  singeItem.price;
                    }
                }

                _this.setData({ loaderhide:true });
                console.log(menuData);
                _this.setData({
                   items:menuData,
                   cart_num:0,
                   cart_fee:'0.00',
                   detail_panel:false,
                   info_panel:false,
                   choose_panel:false
                })
            } else {
                _this.setData({ loaderhide:true });
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

  onShow:function(){
      if (isInitSelfShow) return;
      // console.log(wx.getStorageSync('clearCart'))
      if(wx.getStorageSync('clearCart')){
          this.computed(menuData);
          wx.removeStorageSync('clearCart');
      }

  },

  onHide() {
      isInitSelfShow = false;
  },

  //切换菜单类
  tabTap: function(e){
    var _items = this.data.items,
        index = e.currentTarget.dataset.param;

    for(var i in _items){
        if(i==index){
           _items[i].active = true;
        }
        else{
           _items[i].active = false;
        }
    }
    this.setData({items:_items})
  },

  //处理数据变化 数据全依赖于items
  computed: function(data){  
      var items = data,
         cart_num = 0, 
         cart_fee = 0;
      for(var i in items){   
           for(var j in items[i].goodsList){
                var singeItem = items[i].goodsList[j];  
                //console.log(singeItem);
                if(singeItem.issetfood == 1){
                   for(var k in singeItem.cart_items){
                        cart_num = cart_num + 1;
                        cart_fee = cart_fee + 1*singeItem.cart_items[k].priceVal;
                   }
                }else{
                   cart_num = cart_num + singeItem.count;
                   cart_fee = cart_fee + singeItem.count*singeItem.priceVal;
                }
           }
      }
      this.setData({
          items:items,
          cart_num:cart_num,
          cart_fee:cart_fee.toFixed(2)
      })
      // console.log(items);
      wx.setStorageSync('items',items);
  },

  //点击加号
  addTap:function(e){
      var _this = this;
      var _items = this.data.items,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb,
          _count = _items[parama].goodsList[paramb].count,
          panel_data = _items[parama].goodsList[paramb];      //当前菜品数据

      if(panel_data.issetfood == 1){
         var tapLock = this.data.addLock1;
         if(tapLock) return;
         this.setData({addLock1:true});
         console.log(this.data.addLock1);
      }
      
      //单品、套餐都加1
      _items[parama].goodsList[paramb].count = _count+1;
      this.computed(_items);  

      //对应套餐的处理
      if(panel_data.issetfood == 1){
         var mainArray = panel_data.mainarray;
         var groupIds = [];
         for(var i in mainArray){
           groupIds.push(mainArray[i].groupnum);
         }
         groupIds = _this.delRepeat(groupIds);
         
         var itemsArray=[],m=0;
         for(var i in groupIds){
           var singeItem = {};
           var sideGoodsList = [];
           for(var j in mainArray){
             if(mainArray[j].groupnum == groupIds[i]){
               sideGoodsList.push(mainArray[j]);
               singeItem.groupname = mainArray[j].groupname;
               singeItem.groupnum = mainArray[j].groupnum;
             }
             singeItem.sideGoodsList = sideGoodsList;
             itemsArray[m] = singeItem;
           }
           m++;
         }
         
         //选中第一个子菜
         for(var i in itemsArray){
            itemsArray[i].sideGoodsList[0].active = true;
         }
         panel_data.mainarray = itemsArray;

         console.log(panel_data);
         this.setData({
              choose_panel:true,
              detail_panel:false,
              info_panel:false,
              panel_i:parama,
              panel_j:paramb,
              panel_data:panel_data,
         });
      }
  },

  chooseTap:function(e){
    var panel_data = this.data.panel_data,
        parama = e.currentTarget.dataset.parama,
        paramb = e.currentTarget.dataset.paramb;
     for(var i in panel_data.mainarray[parama].sideGoodsList){
           if(i==paramb){
               panel_data.mainarray[parama].sideGoodsList[i].active = true;
           }else{
               panel_data.mainarray[parama].sideGoodsList[i].active = false;
           }
      }

      this.setData({
        panel_data:panel_data
      })
  },

  confirmTap:function(){                         //确定，触发底层数据items的改变
     var panel_data = this.data.panel_data,        //当所点前菜品数据
         panel_i = this.data.panel_i,
         panel_j = this.data.panel_j,
         _items = this.data.items;
     

     //判断是否有加价小菜
     var priceAdd = 0,
         _minArray = [];
     for(var i in panel_data.mainarray){
        for(var j in panel_data.mainarray[i].sideGoodsList){
            if(panel_data.mainarray[i].sideGoodsList[j].active){   
                  _minArray.push(panel_data.mainarray[i].sideGoodsList[j]);           
                  priceAdd = priceAdd + parseFloat(panel_data.mainarray[i].sideGoodsList[j].addprice);
            }   
        }
     }


    panel_data.priceVal = (parseFloat(panel_data.price) + priceAdd);     //加价 
    _items[panel_i].goodsList[panel_j].cart_items.push(panel_data);      //购物车数据变化
    _items[panel_i].goodsList[panel_j].minArray.push(_minArray);         //小菜

    console.log(panel_data);
    delete panel_data.cart_items;
    delete panel_data.minArray;

     this.computed(_items);
     this.setData({
        choose_panel:false,
        addLock1:false,
        addLock2:false,
        addLock3:false
     })

  },
  cancelTap:function(){
       var _items = this.data.items,
          parama = this.data.panel_i,
          paramb = this.data.panel_j,
         _count = _items[parama].goodsList[paramb].count;

       _items[parama].goodsList[paramb].count = _count-1;
       this.computed(_items);
       this.setData({
          choose_panel:false,
          addLock1:false,
          addLock2:false,
          addLock3:false
       })
  },
  
  //点击减号
  minusTap:function(e){
      var _items = this.data.items,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb,
          _count = _items[parama].goodsList[paramb].count,
          panel_data = _items[parama].goodsList[paramb];      //当前菜品数据

      if(_count>0){
          _items[parama].goodsList[paramb].count = _count-1;  
          _items[parama].goodsList[paramb].cart_items.pop();    //主菜数据变化
          _items[parama].goodsList[paramb].minArray.pop();      //小菜数据变化     
          this.computed(_items);
      }

  },

  //明细
  detailTap:function(e){
      var param = e.currentTarget.dataset.param;
      // console.log(this.data.items);
      if(param==0) return;
      this.setData({
        detail_panel:true,
        info_panel:false,
        choose_panel:false
      })
  },

  //购物车加
  cartAddTap:function(e){
      var _items = this.data.items,
          stockList = this.data.stockList,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb,
          paramc = e.currentTarget.dataset.paramc,
          _count = _items[parama].goodsList[paramb].count,
          panel_data = _items[parama].goodsList[paramb];
      //点击锁定
      if(panel_data.issetfood == 1){
         var tapLock = this.data.addLock2;
         if(tapLock) return;
         this.setData({addLock2:true});
         console.log(this.data.addLock2);
      }

      _items[parama].goodsList[paramb].count = _count+1;
      this.computed(_items);
      
      var _this = this;
      //对应套餐的处理
      if(panel_data.issetfood == 1){
         var mainArray = panel_data.mainarray;
         var groupIds = [];
         for(var i in mainArray){
           groupIds.push(mainArray[i].groupnum);
         }
         groupIds = _this.delRepeat(groupIds);
         
         var itemsArray=[],m=0;
         for(var i in groupIds){
           var singeItem = {};
           var sideGoodsList = [];
           for(var j in mainArray){
             if(mainArray[j].groupnum == groupIds[i]){
               sideGoodsList.push(mainArray[j]);
               singeItem.groupname = mainArray[j].groupname;
               singeItem.groupnum = mainArray[j].groupnum;
             }
             singeItem.sideGoodsList = sideGoodsList;
             itemsArray[m] = singeItem;
           }
           m++;
         }
         
         //选中第一个子菜
         for(var i in itemsArray){
            itemsArray[i].sideGoodsList[0].active = true;
         }
         panel_data.mainarray = itemsArray;
         this.setData({
              choose_panel:true,
              detail_panel:false,
              info_panel:false,
              panel_i:parama,
              panel_j:paramb,
              panel_data:panel_data,
         });
      }
  },

  //购物车减
  cartMinusTap:function(e){
      var _items = this.data.items,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb,
          paramc = e.currentTarget.dataset.paramc,
          _count = _items[parama].goodsList[paramb].count,
          panel_data = _items[parama].goodsList[paramb];
      if(_count>0){
          _items[parama].goodsList[paramb].count = _count-1;
          _items[parama].goodsList[paramb].cart_items.pop();    //主菜数据变化
          _items[parama].goodsList[paramb].minArray.pop();      //小菜数据变化    
      }

      this.computed(_items);
      if(this.data.cart_num==0){                              //购物车数量为0时，触发关闭弹窗
             this.coverTap();
      }
  },

  closeDetailTap:function(){
      this.setData({
            detail_panel:false
      })
  },
 
  //清空购物车
  cartEmpty:function(){
      wx.removeStorageSync('items');
      wx.removeStorageSync('clearCart');
      
      this.setData({
         items:menuData,
         cart_num:0,
         cart_fee:'0.00',
         detail_panel:false,
         info_panel:false,
         choose_panel:false
      })
  },

  coverTap:function(){
      this.setData({
        detail_panel:false,
        info_panel:false
      })
  },

  infoScan:function(e){
     var  _items = this.data.items,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb,
          panel_data = _items[parama].goodsList[paramb];

     this.setData({
            info_panel:true,
            detail_panel:false,
            choose_panel:false,
            infoData:panel_data,
            info_i:parama,
            info_j:paramb
     });
  },

  infoAdd:function(){
      var _items = this.data.items,
          parama = this.data.info_i,
          paramb = this.data.info_j,
          _count = _items[parama].goodsList[paramb].count,
          panel_data = _items[parama].goodsList[paramb];      //当前菜品数据

      //点击锁定
      if(panel_data.issetfood == 1){
         var tapLock = this.data.addLock3;
         if(tapLock) return;
         this.setData({addLock3:true});
         console.log(this.data.addLock3);
      }

      _items[parama].goodsList[paramb].count = _count+1;
      this.computed(_items);

      //对应套餐的处理
      var _this = this;
      if(panel_data.issetfood == 1){
         var mainArray = panel_data.mainarray;
         var groupIds = [];
         for(var i in mainArray){
           groupIds.push(mainArray[i].groupnum);
         }
         groupIds = _this.delRepeat(groupIds);
         
         var itemsArray=[],m=0;
         for(var i in groupIds){
           var singeItem = {};
           var sideGoodsList = [];
           for(var j in mainArray){
             if(mainArray[j].groupnum == groupIds[i]){
               sideGoodsList.push(mainArray[j]);
               singeItem.groupname = mainArray[j].groupname;
               singeItem.groupnum = mainArray[j].groupnum;
             }
             singeItem.sideGoodsList = sideGoodsList;
             itemsArray[m] = singeItem;
           }
           m++;
         }
         
         //选中第一个子菜
         for(var i in itemsArray){
            itemsArray[i].sideGoodsList[0].active = true;
         }
         panel_data.mainarray = itemsArray;

         this.setData({
              choose_panel:true,
              detail_panel:false,
              info_panel:false,
              panel_i:parama,
              panel_j:paramb,
              panel_data:panel_data,
         });
      }

      var infoData = _items[parama].goodsList[paramb];
      this.setData({
        infoData:infoData,
      })
      
  },

  infoMinus:function(){
      var _items = this.data.items,
          parama = this.data.info_i,
          paramb = this.data.info_j,
          _count = _items[parama].goodsList[paramb].count;

      if(_count>0){
          _items[parama].goodsList[paramb].count = _count-1;
          _items[parama].goodsList[paramb].cart_items.pop();    //主菜数据变化
          _items[parama].goodsList[paramb].minArray.pop();      //小菜数据变化    
          
          var infoData = _items[parama].goodsList[paramb];
          this.setData({
            infoData:infoData,
          })
          this.computed(_items);
      }
  },
  
  //去结算
  orderConfirmTap:function(e){
    var param = e.currentTarget.dataset.param;
    if(param == 'false') return;

    var _this = this;
    //跳转锁定
    var jumpLock = _this.data.jumpLock;
    if(jumpLock) return;
    _this.setData({jumpLock:true});

    var cart_items = [],
        goodsId = '',
        items = this.data.items;

     for(var i in items){
        for(var j in items[i].goodsList){
           if(items[i].goodsList[j].count > 0){
            if(items[i].goodsList[j].cart_items.length>0){
                for(var m in items[i].goodsList[j].cart_items){
                   cart_items.push(items[i].goodsList[j].cart_items[m]);
                }
            }else{
                   cart_items.push(items[i].goodsList[j]);
            }
          }
        }
    }
    
    var feiTaoCan = [],
       detail_items = [],
       j = 0;
    for(var i in cart_items){
      //套餐
      if(cart_items[i].issetfood == 1){
          var singe_items = {};
          singe_items.itemid = cart_items[i].did;
          singe_items.dishsno = cart_items[i].dishsno;          
          singe_items.itemname = cart_items[i].name;
          singe_items.bsetmeal = cart_items[i].issetfood;
          singe_items.itemcount = 1;
          singe_items.price = cart_items[i].price;
          singe_items.box_num = cart_items[i].box_num;
          singe_items.box_price = cart_items[i].box_price;
          
          var subitem = [];
          for(var k in cart_items[i].mainarray){
             for(var t in cart_items[i].mainarray[k].sideGoodsList){
                 var singeData={};
                 if(cart_items[i].mainarray[k].sideGoodsList[t].active){
                      singeData.itemid = cart_items[i].mainarray[k].sideGoodsList[t].mainamdid;
                      singeData.itemname = cart_items[i].mainarray[k].sideGoodsList[t].mainname;
                      singeData.itemcount = 1;
                      singeData.price = cart_items[i].mainarray[k].sideGoodsList[t].addprice;
                      subitem.push(singeData);
                 }
             }
          }
          singe_items.subitem = subitem;
          detail_items.push(singe_items);
      //单品
      }else{
          var singe_items = {};
          singe_items.itemid = cart_items[i].did;
          singe_items.dishsno = cart_items[i].dishsno;    
          singe_items.itemname = cart_items[i].name;
          singe_items.bsetmeal = cart_items[i].issetfood;
          singe_items.itemcount = cart_items[i].count;
          singe_items.price = cart_items[i].price;
          singe_items.box_num = cart_items[i].box_num;
          singe_items.box_price = cart_items[i].box_price;
          detail_items.push(singe_items);
      }

      feiTaoCan[j]=cart_items[i].dishsno+"#"+cart_items[i].count;
      j++;

    }

    

    goodsId = feiTaoCan.join('-');
    cart_items = JSON.stringify(cart_items);
    cart_items = cart_items.replace(/\?/g,'');
    detail_items = JSON.stringify(detail_items);

    wx.removeStorage({key:'paytype'});
    wx.removeStorage({key:'choosed_coupon'});
    wx.navigateTo({
      url:'../takeOut_order_confirm/index?cart_items='+cart_items+'&detail_items='+detail_items+'&goodsId='+goodsId,
      success:function(){
            setTimeout(function(){
               _this.setData({jumpLock:false});
            },500)
      }
    })
  }

})
