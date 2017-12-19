//index.js
//获取应用实例
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
     //获取全局数据，初始化当前页面
     app.getUserInfo(function(userInfo){
      //用户信息
       _this.setData({
         userInfo:userInfo,
         shopName:app.globalData.shopName
       })
     })
     

     //优惠券
     var items = [],
         couponsChoosed,                                //已选优惠券
         couponsData = JSON.parse(option.couponsData),  //所有优惠券 couponsData
         taoCanNum = option.taoCanNum;                  //所点套餐数量
     
     _this.setData({taoCanNum:taoCanNum})

      wx.getStorage({
        key:'choosed_card',
        complete: function(res) {
           couponsChoosed = res.data; 
           couponsData = [couponsData.taoCanList,couponsData.feiTaoCanList,couponsData.otherList];

           console.log(couponsData);
           for(var i in couponsData){
             var singledata = {};
             if(couponsChoosed){
               var couponsChoose = JSON.parse(couponsChoosed);
               // console.log(couponsChoose);
               for(var j in couponsData[i]){ 
                  for(var m in couponsChoose)
                      if(couponsData[i][j].couponNo == couponsChoose[m].couponNo){
                         couponsData[i][j].active = true;
                      }
               }
             }

             singledata.data = couponsData[i];
             singledata.slide = true;
             items[i] = singledata;
           }
           
           _this.setData({ items:items })

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
    var items = this.data.items,
        taoCanNum = this.data.taoCanNum,
        parama = e.currentTarget.dataset.parama,
        paramb = e.currentTarget.dataset.paramb;
    
    //抵用券始终只能用一张
    if(parama == 2){
        for(var i in items[2].data){
           if(i == paramb){
               items[parama].data[paramb].active = !items[parama].data[paramb].active;
           }else{
              items[2].data[i].active = false;
           }
        }
    }

    //点几份套餐用几张套餐券
    else if(parama == 0){
        var taoCan = 0;
        for(var k in items[0].data){
           if(items[0].data[k].active){
              taoCan++;
           }
        }

        if(taoCan >= taoCanNum){
           wx.showModal({
              content:"已点"+taoCanNum+"份套餐，最多使用"+taoCanNum+"张套餐券",
              showCancel: false
          });
          return;
        }
        items[parama].data[paramb].active = !items[parama].data[paramb].active;
    }

    else{
        items[parama].data[paramb].active = !items[parama].data[paramb].active;
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

    for(var i in items){
      for( var j in items[i].data){
        if(items[i].data[j].active){
           var singledata = {};
           singledata.single = items[i].data[j].type.single;
           singledata.goodsId = items[i].data[j].goodsId;
           singledata.typeName = items[i].data[j].type.typeName;
           singledata.couponNo =items[i].data[j].couponNo;
           //2、商品领用券；3、套餐领用券  1、现金抵扣券  5、尊享券
           if(i==0){
               singledata.type = 3;
           }else if(i==1){
               singledata.type = 2;
           }else{
               singledata.type =items[i].data[j].type.category + 1;
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
  }
})