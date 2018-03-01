//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
     userInfo:null,
     loaderhide:true,
     jumpLock:false
  },

  is_phone:function(str){
    var reg=/^1\d{10}$/;
    if(reg.test(str))
      return true;
    else
      return false;
  },
  onLoad:function(){
	  var _this = this;
	  //获取全局数据，初始化当前页面
	  app.getUserInfo(function(userInfo){
	     //用户信息
	     _this.setData({
	       userInfo:userInfo
	     })
	  })
  },
  nameBlur:function(e){
    this.setData({
        name: e.detail.value,
    })
  },
  phoneBlur:function(e){
    this.setData({
        mobile: e.detail.value,
    })
  },
  addrBlur:function(e){
    this.setData({
        address: e.detail.value,
    })
  },
  mapChoose:function(){
    var _this = this;
  	wx.chooseLocation({
      success:function(ret){
        _this.setData({
          addr:ret,
          address:ret.address
        })
      }
    })
  },
  addConfirm:function(){
    var _this = this;

    //====数据校验
    var name = _this.data.name;
    if(!name){
       wx.showModal({content:'请输入收货人姓名',showCancel: false})
       return;
    }
    var mobile = _this.data.mobile;
    if(!mobile){
       wx.showModal({content:'请输入手机号',showCancel: false})
       return;
    }

    if(!_this.is_phone(mobile)){
       wx.showModal({content:'请输入正确的手机号',showCancel: false})
       return;
    }

    var addr = _this.data.addr;
    if(!addr){
       wx.showModal({content:'请选择地址',showCancel: false})
       return;
    }

    var address = _this.data.address;
    if(!address){
       wx.showModal({content:'请输入详细地址',showCancel: false})
       return;
    }

    //跳转锁定
    var jumpLock = _this.data.jumpLock;
    if(jumpLock) return;
    _this.setData({jumpLock:true});


    //====提交数据
    var param = {
      mini:'mini',            
      USER_ID:app.globalData.userId,          
      NAME:name,            
      MOBILE:mobile,       
      ADDRESS:address,  
      ADDRESS_NAME:addr.name,  
      LATITUDE:addr.latitude,             
      LONGITUDE:addr.longitude,            
      IDDEFAULE:0
    };

    _this.setData({ loaderhide:false });
    wx.request({
        url: app.globalData.host+'/waimai/address/add',  
        data: param,
        header: {  
          "Content-Type": "application/x-www-form-urlencoded"  
        }, 
        method:'POST',
        success: function (res) {
            //服务器返回的结果
            console.log(res.data);
            _this.setData({ loaderhide:true });
            if (res.data.errcode == 0) {
                 wx.navigateBack();
            }else{
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
