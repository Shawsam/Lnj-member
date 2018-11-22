var app = getApp()
Page({
  data:{ amount:0,
  	     webUrl:''
  },
  onLoad:function(option){
	  this.setData({
	  	webUrl:app.globalData.webUrl,
	  	amount:option.amount||this.data.amount
	  })
  }
})
