//index.js
//获取应用实例
var app = getApp()
var isInitSelfShow = true;

Page({
  data: {
     userInfo:null,
     addrData:[],
     loaderhide:true,
     jumpLock:false
  },
  onLoad:function(){
	  var _this = this;
	  //获取全局数据，初始化当前页面
	  app.getUserInfo(function(userInfo){
	      //用户信息
	      _this.setData({ userInfo:userInfo })
       
        //请求地址列表
        _this.setData({ loaderhide:false });
        var param = { USER_ID:app.globalData.userId,
                      mini:'mini'
                    };
        wx.request({
            url: app.globalData.host+'/waimai/address/list',  
            data: param,
            success: function (res) {
                //服务器返回的结果
                console.log(res.data);
                _this.setData({ loaderhide:true });
                if (res.data.errcode == 0) {
                    var addrData = res.data.data;
                    if(addrData.length>0) addrData[0].active = true;
                    _this.setData({ 
                      addrData:addrData,
                      chooseAddr:addrData[0]
                    });
                }else{
                   wx.redirectTo({ 
                       url:'../view_state/index?error='+res.statusCode+'&errorMsg='+res.data.msg,
                   })
                }
            }
        })

    })
  },

  chooseAddr:function(e){
     var param = e.currentTarget.dataset.param,
         addrData = this.data.addrData,
         chooseAddr;
     for(var i in addrData){
        i==param?addrData[i].active = true:addrData[i].active = false;
     }
    
     this.setData({ 
       addrData:addrData,
       chooseAddr:addrData[param]
     });
  },
  
  addrConfirm:function(){
     var _this = this;
     //跳转锁定
     var jumpLock = _this.data.jumpLock;
     if(jumpLock) return;
     _this.setData({jumpLock:true});
     
     var chooseAddr = this.data.chooseAddr,
         lat = chooseAddr.latitude,
         lon = chooseAddr.longitude;

     wx.setStorageSync('chooseAddr',JSON.stringify(chooseAddr))
     wx.navigateTo({
      url:'../takeOut_shop/index?lat='+lat+'&lon='+lon,
      success:function(){
          setTimeout(function(){
             _this.setData({jumpLock:false});
          },500)
      }
    })
  },

  addrAdd:function(){
     var _this = this;
     //跳转锁定
     var jumpLock = _this.data.jumpLock;
     if(jumpLock) return;
     _this.setData({jumpLock:true});

     wx.navigateTo({
      url:'../takeOut_addr_add/index',
      success:function(){
          setTimeout(function(){
             _this.setData({jumpLock:false});
          },500)
      }
    })
  },

  onShow:function(){
    if (isInitSelfShow) return;
    this.onLoad();
  },

  onHide() {
      isInitSelfShow = false;
  },

})
