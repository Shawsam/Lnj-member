//index.js
//获取应用实例
var Timer
var app = getApp()
Page({
  data: {
     deskNo:'',
     shopName:'',
     shopAddr:'',
     userInfo:null,
     loaderhide:true,
     jumpLock:false,
     noticeClosed:true,
     timer:3
  },
  noticeClose:function(){
    clearInterval(Timer)
     this.setData({
        noticeClosed:true
      })
  },
  //事件处理函数
  orderTap: function() {

   var _this = this;

   //跳转锁定
   var jumpLock = _this.data.jumpLock;
   if(jumpLock) return;
   _this.setData({jumpLock:true});

    wx.redirectTo({
      url: '../order/index',
      success:function(){
          setTimeout(function(){
             _this.setData({jumpLock:false});
          },500)
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
        deskNo:app.globalData.deskNo
      })
    })
    
    //请求门店信息
    var param = { mini:'mini',
                  shopId:app.globalData.shopId,
                  openId:app.globalData.openId };
    
    console.log(param);
    _this.setData({ loaderhide:false });
    wx.request({
        url: app.globalData.host+'/shop/shopInfo',  
        data: param,
        success: function (res) {
            //服务器返回的结果
            console.log(res);
            _this.setData({ loaderhide:true });
            if (res.data.errcode == 0) {
                var shopName = res.data.data.shopName,
                    provinceName = res.data.data.provinceName,
                    cityName = res.data.data.cityName,
                    zoneName = res.data.data.zoneName,
                    shopCode = res.data.data.shopCode,
                    address = res.data.data.address;
                if(provinceName == cityName){
                  var shopAddr = cityName+ ' ' + zoneName +' '+ address;
                }else{
                  var shopAddr = provinceName+cityName+zoneName+address;
                }
              
                app.globalData.shopName = shopName;
               
                //店铺信息 回填页面
                _this.setData({
                   shopName:shopName,
                   shopAddr:shopAddr
                })

                // //餐盒收费提示
                // var noticeDate = new Date('2018-10-01').getTime()
                // var currentDate = new Date().getTime()
                // if(currentDate >= noticeDate) return
                // var shopArray = ['210910010317','210910010064','210910010326','210910010332','210910010102','210910010314','210910010315','210910010167','210910010041','210910010154','210910010186','210910010195','210910010200','210910010201','210910010052','210910010334','210910010335']
                // if(shopArray.indexOf(shopCode)>-1){
                //    _this.setData({noticeClosed:true})
                // }else{
                //    _this.setData({noticeClosed:false})
                //    Timer = setInterval(function(){
                //         var timer = _this.data.timer
                //         if(timer > 1) _this.setData({timer:timer-1})
                //     },1000)
                //     setTimeout(function(){
                //          clearInterval(Timer)
                //         _this.setData({noticeClosed:true})
                //     },3000)
                // }

            } else {
                 wx.redirectTo({ url:'../view_state/index?error='+res.statusCode+'&errorMsg='+res.data.msg,
                                 success:function(){
                                    setTimeout(function(){
                                         _this.setData({jumpLock:false});
                                    },500)
                                 }
                 })
            }
        }
    })

  }
})
