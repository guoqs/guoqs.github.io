function doCount(date = ['', '']) {
  let [sv, ev] = date
  console.log(sv, ev)
  // 连续涨跌合集
  let sumData = []
  let ddlen = Data_netWorthTrend.length
  // 累计次数
  let totalTradeUp = 0
  let totalTradeUpTotal = 0
  let totalTraHorizontal = 0
  let totalTradeDown = 0
  let totalTradeDownTotal = 0
  // 首次上涨
  let totalFirstTimes = 0
  // 首次上涨累计
  let totalFirstUp = 0
  // 首次上涨还比前一天跌多的
  let totalFirstNiuBiTimes = 0
  let totalFirstNiuBiUp = 0
  // if (window.uni) {
  //   console.log(126545)
  //   console.log('uni.postMessage')
  //   uni.postMessage({
  //     data: 'asdgasgabh'
  //   })
  // }
  // 截取掉刚成立的那几天， 也就是刚成立 连续集团涨跌都是 0  时间
  // console.log(Data_netWorthTrend)
  // while (!Data_netWorthTrend[0].equityReturn) {
  //   Data_netWorthTrend.shift()
  // }
  let startPos = 0
  let endPos = ddlen
  if (sv) {
    let [year, month, day] = sv.split('-')
    let dateNum = +new Date(year, month - 1, day) - 100
    startPos = Data_netWorthTrend.findIndex(item => {
      return item.x >= dateNum
    })
  }
  if (ev) {
    let [year, month, day] = ev.split('-')
    let dateNum = +new Date(year, month - 1, day) + 100
    endPos = Data_netWorthTrend.findIndex(item => {
      return item.x >= dateNum
    })
  }
  console.log(endPos)
  console.log(endPos + 1)
  // console.log(Data_netWorthTrend)
  let useData = Data_netWorthTrend.slice(startPos, endPos < 0 ? undefined :
    endPos)
  let useDataWorth = Data_ACWorthTrend.slice(startPos > 0 ? (startPos - 1) :
    startPos, endPos < 0 ? undefined : endPos)
  // Data_netWorthTrend
  useData.forEach((item, idx) => {
    let {
      equityReturn,
      x,
      y
    } = item
    // 上一个
    let preItem = idx > 0 ? useData[idx - 1] : null
    if (preItem && preItem.equityReturn < 0 && equityReturn > 0) {
      totalFirstTimes++
      totalFirstUp += equityReturn
      if (equityReturn > Math.abs(preItem.equityReturn)) {

        totalFirstNiuBiTimes++
        totalFirstNiuBiUp += equityReturn
      }
    }
    if (equityReturn > 0) {
      totalTradeUp++
      totalTradeUpTotal += equityReturn
    } else if (equityReturn < 0) {
      totalTradeDown++
      totalTradeDownTotal += equityReturn
    } else {
      totalTraHorizontal++
    }
    item.datestr = formatDate(x)
    // 第一条
    if (idx == 0) {
      sumData.push([item])
      return
    }
    // 取总数的最后一条
    let sumLen = sumData.length
    let subSumData = sumLen ? sumData[sumLen - 1] : []
    let subItem = subSumData[subSumData.length - 1]
    if (equityReturn == 0) {
      if (subItem.equityReturn == 0) {
        subSumData.push(item)
        return
      }
      sumData.push([item])
      return
    }
    // 同涨或者同跌 归为上一组，不涨不跌也归上一组,  第一条 equityReturn 肯定是0
    if ((subItem.equityReturn > 0 && equityReturn > 0) || (subItem
        .equityReturn < 0 && equityReturn < 0)) {
      subSumData.push(item)
      if (!sumLen) {
        sumData.push(subSumData)
      }
      return
    } else {
      sumData.push([item])
    }
  })
  // 翻转一下数据
  sumData.reverse()
  const trendSorts = sumData.reduce((sort, item) => {
    let {
      equityReturn
    } = item[0]
    // debugger
    // if (!sort.length) {
    //   return [{
    //     trend: equityReturn > 0 ? 1 : equityReturn < 0 ? -
    //       1 : 0,
    //     items: [item]
    //   }]
    // }
    let target = sort.find((list, idx) => {
      let {
        trend,
        length,
        items
      } = list
      if (length === item.length && ((trend >
          0 && equityReturn > 0) || (trend <
          0 && equityReturn < 0) || (trend == 0 && equityReturn ==
          0))) {
        return true
      }
      return false
    })
    if (target) {
      // console.log('---------***---------')
      target.items.push(item)
      return sort
    }
    sort.push({
      trend: equityReturn > 0 ? 1 : equityReturn < 0 ? -
        1 : 0,
      items: [item],
      length: item.length
    })
    return sort.sort((s1, s2) => {
      return s1.length < s2.length ? 1 : -1
    })
  }, [])
  // console.log(trendSorts)
  // console.log(sumData)
  // console.log(sumData.reduce((sun, item) => {
  //   return sun + item.length
  // }, 0))

  totalTradeUpTotal = totalTradeUpTotal.toFixed(3)
  totalTradeDownTotal = totalTradeDownTotal.toFixed(3)
  return {
    useData,
    // Data_ACWorthTrend,
    useDataWorth,
    trendSorts,
    sumData,
    totalTradeUp,
    totalTradeUpTotal,
    totalTraHorizontal,
    totalTradeDown,
    totalTradeDownTotal,
    totalFirstTimes,
    totalFirstUp,
    totalFirstNiuBiTimes,
    totalFirstNiuBiUp
  }
}
