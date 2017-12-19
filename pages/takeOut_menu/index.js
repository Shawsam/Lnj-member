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
    var history = wx.getStorageSync('items');
    if(history){
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
            // console.log(res.data);

            if (res.data.errcode == 0) {
               var work_num = res.data.workNum;     //工作餐数量
               var stockList = res.data.stockList;  //库存数据
               _this.setData({
                   work_num:work_num,
                   stockList:stockList
               })
               
               menuData = res.data.data;        //菜单数据
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


                   var mainGoodsList = menuData[i].mainGoodsList;
                   for (var j in mainGoodsList){
                          var singeItem = mainGoodsList[j];
                          singeItem.categoryId = menuData[i].categoryId;
                          singeItem.categoryName = menuData[i].name;
                          singeItem.categoryDescription = menuData[i].description;  
                          singeItem.count = 0;
                          singeItem.priceVal =  (singeItem.price/100).toFixed(2);
                          var reg = /^http/;
                          if(reg.test(singeItem.smallPicture)){
                             singeItem.centerImg =  singeItem.smallPicture;
                          }else{
                             singeItem.centerImg =  singeItem.smallPicture?'http://demo.i-manji.com/lnj-weixin/'+singeItem.smallPicture.split('../../../')[1]:'';
                          }
                    }
                }

                _this.setData({ loaderhide:true });
                // console.log(menuData);
                _this.setData({
                   items:menuData,
                   cart_num:0,
                   cart_fee:'0.00',
                   detail_panel:false,
                   info_panel:false,
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
          wx.clearStorageSync('clearCart');
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
           for(var j in items[i].mainGoodsList){
                var singeItem = items[i].mainGoodsList[j];  
                if(singeItem.count > 0){
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
      wx.setStorageSync('items',items);
      // console.log(menuData);
  },

  //点击加号
  addTap:function(e){
      var _items = this.data.items,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb,
          _count = _items[parama].mainGoodsList[paramb].count;
      _items[parama].mainGoodsList[paramb].count = _count+1;
      this.computed(_items);  
  },
  
  //点击减号
  minusTap:function(e){
      var _items = this.data.items,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb,
          _count = _items[parama].mainGoodsList[paramb].count;
      if(_count>0){
          _items[parama].mainGoodsList[paramb].count = _count-1;       
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
        info_panel:false
      })
  },

  //购物车加
  cartAddTap:function(e){
      var _items = this.data.items,
          stockList = this.data.stockList,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb,
          paramc = e.currentTarget.dataset.paramc,
         _count = _items[parama].mainGoodsList[paramb].count,
          panel_data = _items[parama].mainGoodsList[paramb];

      _items[parama].mainGoodsList[paramb].count = _count+1;
      this.computed(_items);
  },

  //购物车减
  cartMinusTap:function(e){
      var _items = this.data.items,
          parama = e.currentTarget.dataset.parama,
          paramb = e.currentTarget.dataset.paramb,
          paramc = e.currentTarget.dataset.paramc,
          _count = _items[parama].mainGoodsList[paramb].count,
          panel_data = _items[parama].mainGoodsList[paramb];
      if(_count>0){
          _items[parama].mainGoodsList[paramb].count = _count-1;
      }

      this.computed(_items);
      if(this.data.cart_num==0){                              //购物车数量为0时，触发关闭弹窗
             this.coverTap();
      }
  },
 
  //清空购物车
  cartEmpty:function(){
      wx.clearStorageSync('items');
      wx.clearStorageSync('clearCart');
      
      this.setData({
         items:menuData,
         cart_num:0,
         cart_fee:'0.00',
         detail_panel:false,
         info_panel:false,
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

     this.setData({
            info_panel:true,
            detail_panel:false,
            infoData:panel_data,
            info_i:parama,
            info_j:paramb
     });
  },

  infoAdd:function(){
      var _items = this.data.items,
          parama = this.data.info_i,
          paramb = this.data.info_j,
          _count = _items[parama].mainGoodsList[paramb].count,
          panel_data = _items[parama].mainGoodsList[paramb];      //当前菜品数据

      _items[parama].mainGoodsList[paramb].count = _count+1;
      
      var infoData = _items[parama].mainGoodsList[paramb];
      this.setData({
        infoData:infoData,
      })
      
      this.computed(_items);    
      
  },

  infoMinus:function(){
      var _items = this.data.items,
          parama = this.data.info_i,
          paramb = this.data.info_j,
          _count = _items[parama].mainGoodsList[paramb].count;

      if(_count>0){
          _items[parama].mainGoodsList[paramb].count = _count-1;
          var infoData = _items[parama].mainGoodsList[paramb];
          this.setData({
            infoData:infoData,
          })

          this.computed(_items);
      }
  },

  orderConfirmTap:function(){
    wx.navigateTo({url:'../takeOut_order_confirm/index'})
  }

})
