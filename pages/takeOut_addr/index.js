//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
     userInfo:null,
     addrData:[],
     chooseAddr:null,
     loaderhide:true,
     jumpLock:false
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
    
    var addrData = [{id:1,active:true,lat:'127.21',lon:'38.23',name:'小贤',phone:13867242556,addr:'上海市黄浦区陆家浜路1275号10号楼701室'},
                    {id:2,active:false,lat:'127.21',lon:'38.23',name:'小贤',phone:13867242556,addr:'上海市黄浦区陆家浜路1275号10号楼701室'}]
    this.setData({ 
      addrData:addrData,
      chooseAddr:addrData[0]
    });
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
     var chooseAddr = this.data.chooseAddr,
         lat = chooseAddr.lat,
         lon = chooseAddr.lon;
     wx.navigateTo({url:'../takeOut_shop/index?lat='+lat+'&lon='+lon})
  },

  addrAdd:function(){
     wx.navigateTo({url:'../takeOut_addr_add/index'})
  }
})
