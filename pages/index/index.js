//index.js
//获取应用实例
var Timer
var isInitSelfShow = true;
var app = getApp()
Page({
  data: {
      indexPage:false,
      deskNo:'',
      shopName:'',
      shopAddr:'',
      userInfo:null,
      loaderhide:true,
      jumpLock:false,
      noticeClosed:true,
      timer:3,
      imgUrls: [],
      indicatorDots: false,
      autoplay: false,
      interval: 1500,
      duration: 1500,
      fillHeight:wx.getSystemInfoSync().windowHeight-473.5,
      userId:''
  },
  userRegister(mobile){
    var _this = this;
    var param =  {  mini:'mini',
                    openid:app.globalData.openId,
                    unionid:app.globalData.unionId,
                    mobile,
                    name:this.data.userInfo.nickName,
                    gender:this.data.userInfo.gender,
                    type:3,
                    shopNo:this.data.shopCode,
                    shopId:app.globalData.shopId
                 };
    wx.request({
        url: app.globalData.host+'/member/registerUser', 
        method:'POST',
        header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
        data: param,
        success: function (res) {
            if(res.data.errcode==0){
              _this.userLogin(mobile);
            }else{
               wx.showToast({ 
                                title:res.data.msg,
                                icon:'none'
                            });
            }
        }
    })
  },
  userLogin(mobile){
    var _this = this;
    var param =  {  mini:'mini',
                    openid:app.globalData.openId,
                    unionid:app.globalData.unionId,
                    mobile
                 };
    wx.request({
        url: app.globalData.host+'/member/memberLogin', 
        method:'POST',
        header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
        data: param,
        success: function (res) {
            if(res.data.errcode==0){
               console.log('登录成功');
               var { userId, cardNo, mobile } = res.data.data;
               app.globalData.userId = userId;
               app.globalData.cardNo = cardNo;
               app.globalData.mobile = mobile;
               _this.setData({panelRegShow:false,userId:userId});
               
               wx.navigateTo({
                  url: '../order/index',
                  success:function(){
                      setTimeout(function(){
                         _this.setData({jumpLock:false});
                      },500)
                  }
              })
            }else{
               wx.showToast({ 
                                title:res.data.msg,
                                icon:'none'
                            });
            }
        }
    })
  },
  getPhoneNumber(res){
    if(res.detail.encryptedData){
        var _this = this;
        var param =  {  mini:'mini',
                        openId:app.globalData.openId,
                        iv:res.detail.iv,
                        encryptedData:res.detail.encryptedData
                     };
        wx.request({
            url: app.globalData.host+'/wxMini/encryptedData2', 
            method:'GET',
            header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
            data: param,
            success: function (res) {
                if(res.data.errcode==0){
                    const mobile = res.data.data.phoneNumber;
                    _this.setData({phoneNumber:mobile})
                    //通过手机号查询用户是否被注册
                    var param2 =  {  mini:'mini',
                                     amount:mobile,
                                     type:5
                                 };
                    wx.request({
                        url: app.globalData.host+'/member/userInfo', 
                        method:'GET',
                        header: {  "Content-Type": "application/x-www-form-urlencoded" }, 
                        data: param2,
                        success: function (res) {
                            let { errcode } = res.data;
                            if(errcode==0 || errcode==1001241){
                                //用户已注册或用户已登出
                                _this.userLogin(mobile);
                            }else if(errcode==100124){
                                //用户不存在
                                _this.userRegister(mobile);
                            }else if(errcode==100130){
                                wx.showToast({ 
                                                title:'您的账户已被禁用',
                                                icon:'none'
                                             });
                            }else{
                                wx.showToast({ 
                                                title:'网络异常，请重试',
                                                icon:'none'
                                             });
                            }
                        }
                    })                  
                }
            }
        })
    }else{
        wx.showToast({ 
                          title:'请同意手机号授权',
                          icon:'none'
                    });
    }
  },
  closeRegPanel(){
     this.setData({panelRegShow:false});
  },
  Return:function(){
    wx.redirectTo({url:'../../pages/homepage/index'});
  },
  
  noticeClose:function(){
     clearInterval(Timer)
     this.setData({
        noticeClosed:true
      })
  },
  openCharge:function(){
      var userId = app.globalData.userId;
      console.log('USERID='+userId);
      if(!userId){
         app.globalData.userInfo = null;  
         // wx.navigateTo({url: '/pages/webUsercenter/index'})
         wx.navigateToMiniProgram({
            appId: 'wxbe8426115715a0c7',
            path: 'pages/coupon/coupon'
         })  
      }else{
         // wx.navigateTo({url:'/pages/charge/index?bala=0&userId='+ app.globalData.userId +'&mobile='+  app.globalData.mobile });
         wx.navigateToMiniProgram({
            appId: 'wxbe8426115715a0c7',
            path: 'pages/wallet/wallet'
         })  
      }      
  },
  openCoupon:function(){
      // wx.navigateTo({url:'/pages/webCoupon/index'});  
      wx.navigateToMiniProgram({
          appId: 'wxbe8426115715a0c7',
          path: 'pages/coupon/coupon'
      })  
  },
  //事件处理函数
  orderTap: function(e) {
   var formId = e.detail.formId;
   this.addFormId(formId,1);

   //====================================
   var _this = this;
   //跳转锁定
   var jumpLock = _this.data.jumpLock;
   if(jumpLock) return;
   _this.setData({jumpLock:true});

    wx.navigateTo({
      url: '../order/index',
      success:function(){
          setTimeout(function(){
             _this.setData({jumpLock:false});
          },500)
      }
    })
  },
  addFormId(formId,type){
    var expiryTime = new Date().getTime()+7*24*360000-360000;
    var param = { mini:'mini',
                  miniProId:2,   // 1为会员中心小程序,2为点餐小程序
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
  onHide() {
    isInitSelfShow = false;
  },

  onLoad: function () {
    this.setData({userId:app.globalData.userId})

    var _this = this;
    if(getCurrentPages().length==1){
      this.setData({indexPage:true})
    }

    //获取全局数据，初始化当前页面
    app.getUserInfo(function(userInfo){
      //用户信息
      _this.setData({
        userInfo:userInfo,
        deskNo:app.globalData.deskNo
      })
    })
    
    var param = { mini:'mini',
                  openId:app.globalData.openId,
                  userId:app.globalData.userId||'',
                  merId:3,
                  posId:1 };
    wx.request({
        url: app.globalData.host+'/banner/popup',  
        data: param,
        success: function (res) {
          if (res.data.errcode == 0) {
               _this.setData({panelShow:true,panelImg:res.data.data})   
          }else{

          }
        }
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
                   shopCode:shopCode,
                   shopAddr:shopAddr
                })
                
                let subNotAllowed = res.data.isSub;
                if(app.globalData.deskNo==999 && subNotAllowed){
                    wx.showModal({
                      content:'该门店已关闭打包预定功能',
                      showCancel:false,
                      success:()=>{
                          wx.navigateBack();
                      }
                    })
                    return;
                } 

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
    //请求Banner
    var param = { mini:'mini',
                  page:'自助点餐首页',
                  posId:1
                };
    wx.request({
        url: app.globalData.host+'/banner/getBanner', 
        data: param,
        success: function (res) {
          if (res.data.errcode == 0) {
             var imgUrls = res.data.data
             if(imgUrls.length==1){
                 _this.setData({
                      indicatorDots: false,
                      autoplay: false,
                      imgUrls:imgUrls
                 }) 
             }else{
                 _this.setData({imgUrls:imgUrls})
             }
          }
        }
    })

    //没有获取到userId, 提示注册
    // if(!app.globalData.userId){
    //     var param = { mini:'mini',
    //                   page:'点餐页',
    //                   posId:7
    //                 };
    //     wx.request({
    //         url: app.globalData.host+'/banner/getBanner', 
    //         data: param,
    //         success: function (res) {
    //           if (res.data.errcode == 0) {
    //                _this.setData({panelRegShow:true})      
    //           }
    //         }
    //     })
    // }
  },
  jumpFun(e){
    var item =  e.currentTarget.dataset.item;
    console.log(item)
    if(item.type==1){         //type=1,表示跳转链接
       if(item.hrefUrl){
           wx.navigateTo({url: '/pages/webPage/index?url='+item.hrefUrl})
       }
    }else if(item.type==4){
       const { appid, page } = JSON.parse(item.hrefUrl);
       wx.navigateToMiniProgram({appId:appid,path:page});
    }else{
      if(item.hrefUrl){
           this.setData({panelImg:item.hrefUrl,panelShow:true})    
       }
    }
  },
  closePanel(){
      this.setData({
         panelShow:false
      })
  },
  onShow:function(scene){
    var _this = this;
    console.log('进入index页面')
    if (isInitSelfShow) return;
    if(app.globalData.unionId){
        var param =  { mini:'mini',
                       openId:app.globalData.openId,
                       unionId:app.globalData.unionId
                     };
        wx.request({
            url: app.globalData.host+'/wxMini/getUseByUnionId', 
            data: param,
            success: function (res) {
              console.log(res)
              var userId = res.data.data.userId;
              var cardNo = res.data.data.cardNo;
              var mobile = res.data.data.mobile;
              if(app.globalData.userId!=userId){           //userId 发生变化
                    console.log('变化前userId'+app.globalData.userId)
                    console.log('变化后userId'+userId)
                    app.globalData.userId = userId
                    app.globalData.cardNo = cardNo
                    app.globalData.mobile = mobile
                    _this.onLoad();
              }
            }
        })
    }
  }
})
