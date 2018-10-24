var page = 1,items=[],noMore=false

//获取应用实例
var app = getApp()

Page({
  data: {
     userInfo:null,
     items:[],
     keyInput:'',
     loaderhide:true,
     jumpLock:false,
     noticeClosed:true
  },
  onLoad: function (option) {
    //分页数据重置
    page = 1,items =[]
    //页面参数
    this.setData({
       latitude:option.latitude,
       longitude:option.longitude,
       items:items
    })

    var _this = this;
    //获取全局数据，初始化当前页面
    app.getUserInfo(function(userInfo){
      //用户信息
      _this.setData({
        userInfo:userInfo,
        deskNo:app.globalData.deskNo
      })
    })

    //时间限制
    wx.request({
                  url:app.globalData.host+"/getUTC",
                  data:{mini:'mini'},
                  header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
                  method:'POST',
                  success: function (resData) {
                      console.log(resData)
                      if(resData.data.errcode==0){
                          var currentTime = new Date(resData.data.data)
                      }else{
                          var currentTime = new Date()
                      }                   
                      var currentHours = currentTime.getHours()
                      var currentTime = currentTime.getMinutes()
                      if(currentHours>=20){
                         _this.showDialog2('当前时间不提供预约打包服务');
                      }
                      _this.fetchData()                    
                  }
    })

    //餐盒收费提示
    var noticeDate = new Date('2018-10-01').getTime()
    var currentDate = new Date().getTime()
    if(currentDate >= noticeDate) return
    this.setData({noticeClosed:false})

    // var currentTime = new Date(),
    // currentHours = currentTime.getHours(),
    // currentTime = currentTime.getMinutes();
    // if(currentHours>=20){
    //    _this.showDialog2('当前时间不提供预约打包服务');
    //    // wx.showModal({content:'当前时间不提供预约打包服务',
    //    //     showCancel: false,
    //    //     success: function(res) {
    //    //            if (res.confirm) {
    //    //              wx.redirectTo({url:'../../pages/entrace/index'});
    //    //            }
    //    //     }
    //    // });
    // }
    // this.fetchData()

  },
  loadMore:function(){
     if(noMore){
        wx.showModal({content:'没有更多门店',showCancel:false})
        return
     } 
     page = page + 1
     console.log(page)
     this.fetchData(page)
  },
  
  fetchData:function(){
      // 请求店铺列表

      var _this = this,
          param = { mini:'mini',
                    openId:app.globalData.openId,
                    latitudes:this.data.latitude,
                    longitudes:this.data.longitude,
                    pageNo:page,
                    pageCount:5,
                    shopName:encodeURI(this.data.keyInput)
                  };

        _this.setData({ loaderhide:false });
        wx.request({
            url: app.globalData.host+'/shop/nearShopListByPage',  
            data: param,
            success: function (res) {
                //服务器返回的结果
                console.log(res);
                _this.setData({ loaderhide:true });
                if (res.data.errcode == 0) {
                  var resdata = res.data.data
                  if(resdata.length==0){
                    noMore = true
                  }

                  for(var i in resdata){
                    if(resdata[i].status==1 && resdata[i].isSub==0){
                        var shopName = resdata[i].shopName,
                            shopId = resdata[i].shopId,
                            provinceName = resdata[i].provinceName,
                            cityName = resdata[i].cityName,
                            zoneName = resdata[i].zoneName,
                            address = resdata[i].address,
                            distance = resdata[i].distance;
                        if(provinceName == cityName){
                          var shopAddr = cityName+ ' ' + zoneName +' '+ address;
                        }else{
                          var shopAddr = provinceName+cityName+zoneName+address;
                        }
                        var singleData = {};
                            singleData.shopName = shopName;
                            singleData.shopAddr = shopAddr;
                            singleData.shopId = shopId;
                            singleData.distance = distance;
                        items.push(singleData);
                    }
                  }
                  _this.setData({items:items});

                } else {
                    console.log('服务器异常');
                    wx.redirectTo({ url:'../view_state/index?error='+res.statusCode})
                }
            }
        })
  },

  searchFun: function(){
    page = 1,items=[],noMore = false
    this.fetchData()
  },
  keyInput: function(e){
      this.setData({
         keyInput: e.detail.value
      })
  },
  enterShop:function(e){
      var _this = this;
      //跳转锁定
      var jumpLock = _this.data.jumpLock;
      if(jumpLock) return;
      _this.setData({jumpLock:true});

      var shopId = e.currentTarget.dataset.param;   //当前门店shopId

      var param = { 
           mini:'mini',
           openId:app.globalData.openId,
           shopId:shopId
      };

      wx.request({
          url: app.globalData.host+'/getOrderCount', 
          method:'GET',
          data: param,
          success: function (res) {
              //服务器返回的结果
              console.log(res);
              if (res.data.errcode == 0) {
                 var shopId = res.data.shopId,
                     shopName = res.data.shopName,
                     deskNo = res.data.deskNo,
                     orderNum = res.data.data;
                 app.globalData.shopId = shopId;
                 app.globalData.shopName = shopName;
                 app.globalData.deskNo = deskNo;
                 app.globalData.orderNum = orderNum;

                 //跳转控制
                 if(orderNum){
                     wx.navigateTo({
                        url: '../order_list/index',
                        success:function(){
                                setTimeout(function(){
                                       _this.setData({jumpLock:false});
                                },500)
                         }
                     })
                 }else{
                     wx.navigateTo({
                        url: '../index/index',
                        success:function(){
                                setTimeout(function(){
                                       _this.setData({jumpLock:false});
                                },500)
                         }
                     })
                 }
              }else{
                 console.log('服务器异常');
                 wx.redirectTo({ url:'../view_state/index?error='+res.statusCode,
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
  onShow:function(){
     wx.removeStorageSync('items');
  },

  noticeClose:function(){
     this.setData({noticeClosed:true})
  },
  coverTap:function(){
     this.noticeClose()
  },

  //=======提示框=========================================
  showDialog2:function(msg){
      this.setData({
        dialogShow2:true,
        contentMsg:msg
      })
  },
  dialogConfirm2:function(){
      this.setData({
        dialogShow:false
      })
      wx.navigateBack();
  }
})
