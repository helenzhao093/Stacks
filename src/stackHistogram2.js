getBinNum = function(prob){
  var bin = Math.floor(prob/0.1)
  return (bin == 10) ? 9 : bin
}

function Histogram(dataModel, settings){
  var margin = { top: 20, right: 20, bottom: 20, left: 20 }
  var width = 300 - margin.left - margin.right
  var height = 400 - margin.top - margin.bottom
  this.data = dataModel.data
  this.probColumns = dataModel.probColumns

  this.histogramData = []
  this.max = {negative: 0, positive: 0}
  this.bins = [0,1,2,3,4,5,6,7,8,9]
  //this.max.Left =

  this.initiateData = function(){
    //console.log(this)
    var histogramData = this.histogramData
    var bins = this.bins

    histogramData = dataModel.classNames.map(function(name){
      return {className: name, data: []}
    })

    histogramData.forEach(function (histogram){
      bins.forEach(function(binNum) {
        histogram.data.push({bin: binNum, tp:[], fp:[], tn:[], fn: []})
      })
      dataModel.classNames.forEach(function(name){

          histogram.data.forEach(function(data)
            data.fn.push({bin: data.bin, className: name, count: 0})
          )
          histogram.data.forEach(function(data)
            data.fp.push({bin: data.bin, className: name, count: 0})
          )

        if (name == histogram.className){
          histogram.data.forEach(function(data)
            data.tn.push({bin: data.bin, className: name, count: 0})
          )
          histogram.data.forEach(function(data)
            data.tp.push({bin: data.bin, className: name, count: 0})
          )
        }
      })
    })
    this.histogramData = histogramData
  }

  this.constructData = function(){
    var histogramData = this.histogramData

    dataModel.data.forEach(function(example){
      var actual = []
      var predicted = []
      for (classNum = 0; classNum < dataModel.numClasses; classNum++){
        if (example[dataModel.actualClasses[classNum]] == 1) {
          actual.push(classNum)
        }
        if (example[dataModel.predictedClasses[classNum]] == 1){
          predicted.push(classNum)
        }
      }

      for (classNum = 0; classNum < dataModel.numClasses; classNum++) {
        binNum = getBinNum(example[dataModel.probColumns[classNum]])

        if (actual.includes(classNum) && predicted.includes(classNum)) { //TP
          if (example[dataModel.probColumns[classNum]] < settings.TPThreshold){
            histogramData[classNum]['data'][binNum]['tp'][0].count += 1
          }
        }
        else if(actual.includes(classNum) && !predicted.includes(classNum)){ //FN
          predicted.forEach(function(d){
            histogramData[classNum]['data'][binNum]['fn'][d].count += 1
          })
        }
        else if(!actual.includes(classNum) && predicted.includes(classNum)){ //FP
          actual.forEach(function(d){
            histogramData[classNum]['data'][binNum]['fp'][d].count += 1
          });
        }
        else {
          if (example[dataModel.probColumns[classNum]] > settings.TNThreshold){
            histogramData[classNum]['data'][binNum]['tn'][0].count += 1
          }
        }
      }
    })
    this.histogramData = histogramData
    console.log(this.histogramData)
  }

  this.calculate_previous_sum = function(){
    var histogramData = this.histogramData

    histogramData.forEach(function(histogram){
      histogram.data.forEach(function(bin){
        bin['fn'][0].previous_sum = 0
        bin['fp'][0].previous_sum = 0
        for (i = 1; i < dataModel.numClasses; i++){
          bin['fn'][i].previous_sum = bin['fn'][i-1].previous_sum + bin['fn'][i-1].count
          bin['fp'][i].previous_sum = bin['fp'][i-1].previous_sum + bin['fp'][i-1].count
        }
        bin['tn'][0].previous_sum = bin['fn'][dataModel.numClasses-1].previous_sum + bin['fn'][dataModel.numClasses-1].count
        bin['tp'][0].previous_sum = bin['fp'][dataModel.numClasses-1].previous_sum + bin['fp'][dataModel.numClasses-1].count
      })
    })
    this.histogramData = histogramData
  }

  this.findMax = function(classification){
    return d3.max(this.histogramData.map(function(histogram){ // max in each class
      return d3.max(histogram.data.map(function(bin){ //for each bin
        return bin[classification][0].count + bin[classification][0].previous_sum
      }))
    })
  )}


  this.constructHistogram = function(){
    var histogramData = this.histogramData
    var bins = [9,8,7,6,5,4,3,2,1,0]
    var maxNeg = this.findMax("tn")
    var maxPos = this.findMax("tp")

    /*fakedata =
    [
      {
        className: "class0",
        data: [
          { bin: 0,
          tp: [{ bin: 0, className: "class0", count: 0, previous_sum: 7}],
          fp: [{ bin: 0, className: "class1", count: 3, previous_sum: 0} , { bin: 0, className: "class2", count: 4, previous_sum: 3}],
          tn: [{ bin: 0, className: "class0", count: 0, previous_sum: 8 }],
          fn: [{ bin: 0, className: "class1", count: 3, previous_sum: 0} , { bin: 0, className: "class2", count: 5, previous_sum: 3}]
          },
          {
          bin: 1,
          tp: [{ bin: 1, className: "class0", count: 10, previous_sum: 5}],
          fp: [{ bin: 1, className: "class1", count: 1, previous_sum: 0} , { bin: 1, className: "class2", count: 4, previous_sum: 1}],
          tn: [{ bin: 1, className: "class0", count: 8, previous_sum: 7}],
          fn: [{ bin: 1, className: "class1", count: 5, previous_sum: 0} , { bin: 1, className: "class2", count: 2, previous_sum: 5}]
          },
          {
          bin: 2,
          tp: [{ bin: 2, className: "class0", count: 5, previous_sum: 5}],
          fp: [{ bin: 2, className: "class1", count: 1, previous_sum: 0} , { bin: 2, className: "class2", count: 4, previous_sum: 1}],
          tn: [{ bin: 2, className: "class0", count: 4, previous_sum: 7}],
          fn: [{ bin: 2, className: "class1", count: 3, previous_sum: 0} , { bin: 2, className: "class2", count: 4, previous_sum: 3}]
          }
        ]
      },
      {
        className: "class1",
        data: [
          { bin: 0,
          tp: [{ bin: 0, className: "class1", count: 6, previous_sum: 7 }],
          fp: [{ bin: 0, className: "class0", count: 3, previous_sum: 0} , { bin: 0, className: "class2", count: 4, previous_sum: 3}],
          tn: [{ bin: 0, className: "class1", count: 5, previous_sum: 8}],
          fn: [{ bin: 0, className: "class0", count: 2, previous_sum: 0} , { bin: 0, className: "class2", count: 6, previous_sum: 2}]
          },
          {
          bin: 1,
          tp: [{ bin: 1, className: "class1", count: 2, previous_sum: 7 }],
          fp: [{ bin: 1, className: "class0", count: 3, previous_sum: 0} , { bin: 1, className: "class2", count: 4, previous_sum: 3}],
          tn: [{ bin: 1, className: "class1", count: 4, previous_sum: 7 }],
          fn: [{ bin: 1, className: "class0", count: 3, previous_sum: 0} , { bin: 1, className: "class2", count: 4, previous_sum: 3}]
          },
          {
          bin: 2,
          tp: [{ bin: 2, className: "class1", count: 1, previous_sum: 9}],
          fp: [{ bin: 2, className: "class0", count: 6, previous_sum: 0} , { bin: 2, className: "class2", count: 3, previous_sum: 6}],
          tn: [{ bin: 2, className: "class1", count: 1, previous_sum: 8}],
          fn: [{ bin: 2, className: "class0", count: 4, previous_sum: 0} , { bin: 2, className: "class2", count: 4, previous_sum: 4}]
          }
        ]
      }
    ]

    console.log(fakedata)*/
    var xDomainScale = Math.max(maxNeg , maxPos)
    var strokeWidth = 3
    var textLength = 40

    var xScale = d3.scaleLinear()
        .domain([-xDomainScale, xDomainScale]).nice()
        .rangeRound([0, width])

    var xScaleCount = d3.scaleLinear()
        .domain([0, 2*xDomainScale])
        .rangeRound([0, width])

    var yScale = d3.scaleBand()
        .domain(bins)
        .rangeRound([0, height]).padding(0.1)


    var color = d3.scaleOrdinal()
        .range(["#d73027","#f46d43","#fdae61","#a6d96a","#66bd63","#1a9850"])
        .domain("class0", "class1", "class2", "class3", "class4", "class5", "class6", "class7" )

    var svg = d3.select(".histograms")
        .selectAll(".svg-histogram")
        .data(histogramData)
        .enter().append("svg")
        .attr("class", "svg-histogram")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.right + ")")

    /*var svg = d3.select('body').append("svg")
        .attr("width", this.width + margin.left + margin.right)
        .attr("height", this.height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.right + ")")*/

    var bins = svg.selectAll(".row") // 9 bins per class
        .data(function(d){ return d.data })
      .enter().append("g")
        .attr("class", "bin")

    var fp = bins.selectAll("g")
        .data( function(d) {return d.fp})
      .enter().append("rect")
        .attr("class", "fp")
        .attr("height", function(d) { return yScale.bandwidth()})
        .attr("width", function (d) { return xScaleCount(d.count)})
        .attr("x", function(d){ return xScale(d.previous_sum)})
        .attr("y", function (d) {return yScale(d.bin)})
        .attr("fill", function (d) { return color(d.className)})
        //.attr("style", "fill=url(#pattern-stripe)")
        //.attr("mask", "url(#mask-stripe)")

    var tp = bins.selectAll("g")  // will store d.count and d.className
        .data( function(d) {return d.tp})
      .enter().append("rect")
        .attr("class", "tp")
        .attr("height", function(d) { return yScale.bandwidth()})
        .attr("width", function (d) { return xScaleCount(d.count) })
        .attr("x", function(d){ return xScale(d.previous_sum)})
        .attr("y", function (d) {return yScale(d.bin)})
        .attr("fill", function (d) { return color(d.className)})

    var fn = bins.selectAll("g")
        .data( function(d) {return d.fn})
      .enter().append("rect")
        .attr("class", "fn")
        .attr("height", function(d) { return yScale.bandwidth() - strokeWidth})
        .attr("width", function (d) { return (d.count == 0) ? 0 : (xScaleCount(d.count) - strokeWidth)})
        .attr("x", function(d){ return (d.count == 0) ? 0: (xScale(- (d.count + d.previous_sum)) + strokeWidth/2) })
        .attr("y", function (d) {return yScale(d.bin) + strokeWidth/2})
        .attr("fill", "white")
        .attr("stroke", function (d) { return color(d.className)})
        .attr("stroke-width", strokeWidth)
        .attr("text", function (d) { return d.count })
        //.attr("stroke-alignment", "inner")

    var tn = bins.selectAll("g")  // will store d.count and d.className
        .data( function(d) {return d.tn})
      .enter().append("rect")
        .attr("class", "tn")
        .attr("height", function(d) { return yScale.bandwidth()})
        .attr("width", function(d) { return xScaleCount(d.count)})
        .attr("x", function(d){ return xScale(-(d.count+ d.previous_sum))})
        .attr("y", function (d) {return yScale(d.bin)})
        .attr("fill", function (d) { return color(d.className)})

      svg.append("g")
          .attr("class", "y-axis")
        .append("line")
          .attr("x1", xScale(0))
          .attr("x2", xScale(0))
          .attr("y2", height)
          .attr("stroke", function(d) { return color(d.className)})
          .attr("stroke-width", 3)
          .attr("stroke-opacity", 0.5)

      svg.append("text")
          .attr("class", "histogram-label")
          .attr("x", width/2 - textLength/2)
          .attr("y", height + margin.bottom )
          .attr("textLength", textLength)
          .attr("font-family", "Verdana")
          .attr("font-size", 15)
          .text(function(d) {return d.className})
          .attr("fill", function(d) { return color(d.className)})
  }

  this.initiateData()
  this.constructData()
  this.calculate_previous_sum()
  console.log(this.histogramData)
  //this.max.negative = this.findMax("tn")
  //this.max.positve = this.findMax("tp")
  //console.log(this.max.negative)
  //this.max.positive = this.findMax(positive)
  this.constructHistogram()
}
