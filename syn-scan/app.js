
		var app = null;
		var orderBack = []
        // 预览图片
		function fileInput(el) {
			var file = el.files[0]
			var pe = el.parentNode || el.parentElement
			if(file) {
				// el.parentNode||el.parentElement
				pe.style.backgroundImage = 'url(' + URL.createObjectURL(file) + ')'
				pe.querySelector('span').style.opacity = 0;
			} else {
				pe.style.backgroundImage = ''
				pe.querySelector('span').style.opacity = 1;
			}
		}
		function createRes () {
			var files = app.$refs.input.files
			if (!files.length) {
				alert('请输入模版文件')
				return
			}
			var outputPre = app.$refs.outputPreview
			// 图片canvas
			var mCanvas = document.createElement('canvas')
			var mCan2d = mCanvas.getContext('2d')
			// 标题canvas
			var tCanvas = document.createElement('canvas')
			var tCan2d = tCanvas.getContext('2d')
			// 输出canvas 可能会有三张
			var outCan = document.createElement('canvas')
			var out2d = outCan.getContext('2d')
			// 待收货对比参数
			var btnCfg = {
				w:73,
				h:48,
				x:657
			}
			var compareArea  = document.createElement('canvas')
			 compareArea.height = btnCfg.h;
			 compareArea.width = btnCfg.w;
			var  compareArea2d = compareArea.getContext('2d')
			// 循环对比按钮
			var tempBtn  = document.createElement('canvas')
				tempBtn.height = btnCfg.h;
				tempBtn.width = btnCfg.w;
			var tempBtn2d = tempBtn.getContext('2d')
			// 原始图片
			var mImg = document.createElement('img')
			var orderCount = 0
			mImg.addEventListener('load',function () {
				mCanvas.width = this.naturalWidth
				mCanvas.height = this.naturalHeight
				tCanvas.width = this.naturalWidth
				tCanvas.height = 200
				outputPre.appendChild(compareArea)
				outputPre.appendChild(tempBtn)
				outputPre.appendChild(tCanvas)
				outputPre.appendChild(mCanvas)
				outputPre.appendChild(mImg)
				mCan2d.drawImage(this,0,0)
				tCan2d.drawImage(this,0,0)
				compareArea2d.drawImage(this,btnCfg.x,560,btnCfg.w,btnCfg.h,0,0,btnCfg.w,btnCfg.h)
//				compareArea2d.drawImage(this,btnCfg.x,555,btnCfg.w,btnCfg.h,0,0,btnCfg.w,btnCfg.h)
				var points = []
				!function draw (ch,i){
					tempBtn2d.clearRect(0,0,btnCfg.w,btnCfg.h)
					tempBtn2d.drawImage(mImg,btnCfg.x,i,btnCfg.w,btnCfg.h,0,0,btnCfg.w,btnCfg.h)
					outputPre.appendChild(tCanvas)
					var curCompareData = compareCanvas(tempBtn2d.getImageData(0,0,tempBtn.width,tempBtn.height),  compareArea2d.getImageData(0,0, compareArea.width, compareArea.height))
					if (curCompareData < 90000) {
						console.warn(i, curCompareData)
						points.push(i)
					}
					if( ch > i){
						setTimeout(draw, 1, ch, ++i)
					}else{
						console.log(points)
//						setColor(mCan2d, points[0])
						points.forEach(point => {
							setColor(mCan2d, point)
						})
					}
				}(this.naturalHeight,0)
			}, false)
			mImg.setAttribute('src', URL.createObjectURL(files[0]))
		}
		// 对比获取待收区域
		function compareCanvas (cdata1,cdata2) {
			var d1 = cdata1.data
			var d2 = cdata2.data
			var sum = 0
			d1.forEach((d,idx)=>{
				if(idx%4!=3){
					sum+=Math.abs(d-d2[idx])
				}
			})
			return sum
		}
		// 参数对比区域
		var btnCfg = {
			w:73,
			h:48,
			x:657
		}
		app = new Vue({
			components: {
				canvasCom: {
					template:'<div class="orders-item"><div></div><slot></slot></div>',
					props:['canvas'],
					mounted () {
						this.$el.querySelector('div').appendChild(this.canvas)
					}
				}
			},
			data () {
				return {
                    isEnable: false,
                    title: null,
                    topLeft: null,
                    topRight:null,
					pageBar: null,
					compareAreas:[],
                    inputs:[],
                    orders: [],
                    orderPoints:[],
                    moban: '1-3'
				}
			},
			mounted() {
				let refs = this.$refs
                var areaImgs = [refs.dsh,refs.dpj,refs.footer,refs.mi,refs.ww,refs.set,refs.num13,refs.num24]
                !function isEnable () {
                    for(let i=0,len=areaImgs.length;i<len;i++){
                        if(!areaImgs[i].complete){
                            setTimeout(isEnable, 500)
                            return
                        }
                    }
					app.isEnable=true
					let compareAreas = []
					areaImgs.forEach((img,idx)=>{
						if(idx > 2){
							return
						}
						var canvas = document.createElement('canvas')
						canvas.width = img.naturalWidth
						canvas.height = img.naturalHeight
						let ctx = canvas.getContext('2d')
						ctx.drawImage(img,0,0)
						compareAreas.push(ctx.getImageData(0,0,canvas.width,canvas.height))
					})
					app.compareAreas = compareAreas
                }()
			},
			methods: {
                createRes,
				compareCanvas,
				getPoint (file) {
					return new Promise((resolve, reject) =>{
						let points = []
						let img = document.createElement('img')
						img.addEventListener('load', function(){
							app.inputs.push(this)
							let fileCanvas = document.createElement('canvas')
							fileCanvas.width = this.naturalWidth
							fileCanvas.height = this.naturalHeight
							let fileCtx = fileCanvas.getContext('2d')
							fileCtx.drawImage(this, 0, 0)
							// document.body.appendChild(fileCanvas)
							!function draw (ch,i){
								let clipData = fileCtx.getImageData(btnCfg.x,i,btnCfg.w,btnCfg.h)
								let compareRes0 = app.compareCanvas(clipData, app.compareAreas[0])
								let compareRes1 = app.compareCanvas(clipData, app.compareAreas[1])
								let limitNum = 90000
								if (compareRes0 < limitNum || compareRes1 < limitNum) {
									// console.warn(i, compareRes0,compareRes1)
									points.push(i)
								}
								if( ch > i){
									// setTimeout(draw, 1, ch, ++i)
									draw (ch, ++i)
								}else{
									let copyPoints = JSON.parse(JSON.stringify(points))
									for(let len=points.length, idx = len;idx>0;idx--){
										if(idx>0&&Math.abs(points[idx] - points[idx-1])<10){
											copyPoints.splice(idx,1)
										}
									}
									resolve(copyPoints)
								}
							}(this.naturalHeight,0)
						},false)
						img.setAttribute('src', URL.createObjectURL(file))
					})
				},
				getPoints(){
					return new Promise((resolve, reject) =>{
						let points = []
						let refs = app.$refs
						let inputs = []
						if(refs.input1.files.length){
							inputs.push(refs.input1.files[0])
						}
						if(refs.input2.files.length){
							inputs.push(refs.input2.files[0])
						}
						if(refs.input3.files.length){
							inputs.push(refs.input3.files[0])
						}
						if(!inputs.length){
							reject(new Error('请先上传文件'))
							return
						}
						!function getInputsPoints (inputs, idx) {
							if(inputs[idx]){
								app.getPoint(inputs[idx]).then(sips=>{
									points.push(sips)
									getInputsPoints (inputs, ++idx)
								})
							}else{
								resolve(points)
							}
						}(inputs, 0)
					})
				},
                getOrders () {
                },
                appInit(){
					this.isEnable = false
					this.$nextTick(()=>{
						if(!this.orders.length){
							let orders = []
							let inputs = this.inputs
							this.getPoints().then(points=>{
								points.forEach((ps,pIdx)=>{
									ps.forEach((p,idx)=>{
										if (idx<ps.length-1) {
											let canvas = document.createElement('canvas')
											let cw = 950
											let ch = ps[idx+1] - p - 10
											canvas.width = cw
											canvas.height = ch
											canvas.getContext('2d').fillRect(0,0,10,10)
											canvas.getContext('2d').drawImage(inputs[pIdx],-130,-p)
											// document.body.appendChild(canvas)
											canvas.setAttribute('data-id', 'id' + pIdx+'-'+idx)
											orders.push(canvas)
										}
									})
								})
								this.orders = orders
								this.orderPoints = points
								// title: null,
								// topLeft: null,
								// topRight:null,
								// pageBar: null,
								return this.getTitle()
							}).then(title=>{
								this.title = title
									return this.getTopLeft()
							}).then(topLeft=>{
								this.topLeft = topLeft
								return this.getTopRight()
							}).then(topRight=>{
								this.topRight = topRight
								return this.getPageBar()
							}).then(pageBar=>{
								this.pageBar = pageBar
								this.isEnable = true
							}).catch(err=>{
								this.isEnable = true
								if(err.message){
									alert(err.message)
								}
								console.error(err)
							})
						}else{
							console.log('creatting')
							this.isEnable = true
							let $data = this.$data
							let orders = $data.orders
							let getHeight = () => {
								let height = orders.reduce((h, canvas)=>{
									return h + canvas.height + 10
								},0)
								return height + 198 + $data.topRight.height + $data.pageBar.height
							}
							let canvas = document.createElement('canvas')
							canvas.width = this.inputs[0].naturalWidth
							canvas.height = getHeight()
							let ctx = canvas.getContext('2d')
							ctx.fillStyle="#ffffff"
							ctx.fillRect(0,0,canvas.width,canvas.height)
							// 画头部
							ctx.drawImage($data.title,0,0)
							// 画左边标题
							let topLeft = $data.topLeft
							ctx.drawImage(topLeft,0,0,topLeft.width,topLeft.height,0,198,topLeft.width,topLeft.height)
							// 画右边边标题
							let topRight = $data.topRight
							ctx.drawImage(topRight,0,0,topRight.width,topRight.height,130,198,topRight.width,topRight.height)
							// 画订单
							!function drawOrders (idx,y) {
								let order = orders[idx]
								if(order){
									ctx.drawImage(order,0,0,order.width,order.height,130,y,order.width,order.height)
									drawOrders (++idx,y+order.height+10)
								}
							}(0, 198 + topRight.height)
							// 画pageBar 和下面推荐部分
							let pageBar = $data.pageBar
							ctx.drawImage(pageBar,0,canvas.height - pageBar.height,pageBar.width,pageBar.height)
							document.body.appendChild(canvas)
							app.slice(canvas)
						}
					})
				},
				slice (canvas) {
					// 目前只针对syn
					!function slice (idx) {
						let input = app.inputs[0]
						let targetCanvas = document.createElement('canvas')
						targetCanvas.height = 2160
						targetCanvas.width = 1080
						let ctx = targetCanvas.getContext('2d')
						ctx.drawImage(canvas,0,idx==0?0:idx==1?-800:2160-canvas.height)
						//小蜜蜂
						let mi = app.$refs.mi
						ctx.drawImage(mi,0,0,mi.naturalWidth,mi.naturalHeight,900,1800,mi.naturalWidth,mi.naturalHeight)
						// 旺旺
						let ww = app.$refs.ww
						ctx.drawImage(ww,0,0,ww.naturalWidth,ww.naturalHeight,1020,2138,ww.naturalWidth,ww.naturalHeight)
						// 设置
						let set = app.$refs.set
						ctx.drawImage(set,1,1,ww.naturalWidth-1,ww.naturalHeight-1,1055,2138,ww.naturalWidth,ww.naturalHeight)
						// title
						let title = app.title
						ctx.drawImage(title,0,0)
						// 各种订单数
						if(idx == 0){
							let moban = app.moban
							let refs = app.$refs
							let typeNum = null
							if(moban == '1-3'){
								typeNum = refs.num13
							}else{
								typeNum = refs.num24
							}
							console.log(app.orderPoints)
							let yy = app.orderPoints[0][0] - 200 
							ctx.drawImage(typeNum,0,0,typeNum.naturalWidth,typeNum.naturalHeight,250,yy,typeNum.naturalWidth,typeNum.naturalHeight)
						}
						// ctx.drawImage(input,1020,input.naturalHeight-30,60,30,1020,2130,60,30)
						// let jj = document.createElement('canvas')
						// jj.width=60
						// jj.height=30
						// let jjctx = jj.getContext('2d')
						// jjctx.drawImage(input,1020,input.naturalHeight-30,60,30,0,0,60,30)
						// document.body.appendChild(jj)
						targetCanvas.toBlob(blob=>{
							let img = document.createElement('img')
							img.setAttribute('src', URL.createObjectURL(blob))
							let h1 = document.createElement('h1')
							h1.style.textAlign = 'center'
							h1.innerText = '第' +(idx+1)+ '个图片'
							document.body.appendChild(h1)
							document.body.appendChild(img)
							 if(idx<2){
							 	slice (++idx)
							 }
						})
					}(0)
				},
				getTitle () {
					return new Promise((resolve,reject)=>{
						let canvas = document.createElement('canvas')
						let input = this.inputs[0]
						canvas.width = input.naturalWidth
						canvas.height = 198
						canvas.getContext('2d').drawImage(input,0,0)
						resolve(canvas)
					})
				},
				getTopLeft () {
					return new Promise((resolve,reject)=>{
						let canvas = document.createElement('canvas')
						let input = this.inputs[0]
						canvas.width = 130
						canvas.height = 650
						canvas.getContext('2d').drawImage(input,0,-198)
						resolve(canvas)
					})
				},
				getTopRight () {
					return new Promise((resolve,reject)=>{
						let canvas = document.createElement('canvas')
						let input = this.inputs[0]
						canvas.width = input.naturalWidth - 130
						canvas.height = this.orderPoints[0][0] - 198
						canvas.getContext('2d').drawImage(input,-130,-198)
						resolve(canvas)
					})
				},
				getPageBar () {
					return new Promise((resolve,reject)=>{
						let input = this.inputs[0]
						let singleInput = this.orderPoints[0]
						let starty = singleInput[singleInput.length - 1]
						!function draw (ch,y){
							let fileCanvas = document.createElement('canvas')
							fileCanvas.width = input.naturalWidth
							fileCanvas.height = input.naturalHeight
							let fileCtx = fileCanvas.getContext('2d')
							fileCtx.drawImage(input,0,0)
							let clipData = fileCtx.getImageData(0,y,96,30)
							// bbb2d.drawImage(fileCanvas,0,y * -1)
							let compareRes = app.compareCanvas(clipData, app.compareAreas[2])
							// console.log(compareRes)
							let limitNum = 50000
							if (compareRes < limitNum) {
								// console.warn(y, compareRes)
								let canvas = document.createElement('canvas')
								canvas.width = input.naturalWidth
								canvas.height = input.naturalHeight - y + 85
								canvas.getContext('2d').drawImage(input,0,-y+85)
								resolve(canvas)
								return
							}
							if( ch > y){
								setTimeout(() => {
									draw (ch, ++y)
								}, 1);
							}else{
								console.log('end')
							}
						}(input.naturalHeight,starty)
					})
				},
				delOrder (idx) {
					let orders = this.orders
					this.orders = []
					orderBack.push({
						idx:idx,
						canvas:orders.splice(idx,1)[0]
					})
					this.$nextTick(()=>{
						this.orders = orders
						console.log(orderBack)
					})
				},
				backUp () {
					let orders = this.orders
					this.orders = []
					if(!orderBack.length){
						alert('没有删除，不可撤销')
						return
					}
					let order = orderBack.pop()
					orders.splice(order.idx,0,order.canvas)
					this.$nextTick(()=>{
						this.orders = orders
						console.log(orderBack)
					})
				}
			},
        })