getBinNum = function(prob){
  var bin = Math.floor(prob/0.1)
  return (bin == 10) ? 9 : bin
}

function Histogram(dataModel){
  var positive = 0, negative = 1;
  var margin = { top: 20, right: 20, bottom: 20, left: 20 }
  var width = 300 - margin.left - margin.right
  var height = 400 - margin.top - margin.bottom
  this.data = dataModel.data
  this.probColumns = dataModel.probColumns

  this.histogramData = []
  this.max = {negative: 0, positive: 0}
  this.bins = [0,1,2,3,4,5,6,7,8,9]
  //this.max.Left =

  this.constructData = function(){
    //console.log(this)
    var positive = 0, negative = 1;
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
        if (name != histogram.className){
          histogram.data.forEach(function(data)
            data.fn.push({bin: data.bin, className: name, count: 0})
          )
          histogram.data.forEach(function(data)
            data.fp.push({bin: data.bin, className: name, count: 0})
          )
        }
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

    /*histogramData = dataModel.classNames.map(function(className){
      return [0,1,2,3,4,5,6,7,8,9].map(function(binNum) {
        return [0,1].map(function(d){
          return dataModel.classNames.map(function(className){
            return 0;
          })
        })
      })
    })

    /*histogramData = dataModel.classNames.map(functon(className){
      return
      [0,1,2,3,4,5,6,7,8,9].map(function(binNum){
        return {
          TP: {},
          TN: {},
          FP: {},
          FN: {},
        }
      })
    })

    for (classNum = 0; classNum < dataModel.numClasses; classNum++){
      for (binNum = 0; binNum < 10; binNum++){
        histogramData[classNum][binNum]["TP"]["classData"] = { [dataModel.classNames[classNum]]  }
        histogramData[classNum][binNum]["FP"][dataModel.classNames[classNum]] = 0
      }
      for (classNum2 = 0; classNum2 < dataModel.numClasses; classNum2++){
        if (classNum2 != classNum){
          histogramData[classNum][binNum]["FP"]["className"] = dataModel.classNames[classNum]
        }
      }
    }*/

    /*dataModel.data.forEach(function(example){
      var actual = []
      var predicted =[]

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
          histogramData[classNum][binNum][positive][classNum] += 1
        }
        else if(actual.includes(classNum) && !predicted.includes(classNum)){ //FN
          predicted.forEach(function(d){
            histogramData[classNum][binNum][negative][d] += 1
          });
        }
        else if(!actual.includes(classNum) && predicted.includes(classNum)){ //FP
          actual.forEach(function(d){
            histogramData[classNum][binNum][positive][d] += 1
          });
        }
        else {
          histogramData[classNum][binNum][negative][classNum] += 1
        }
      }
    })
    this.histogramData = histogramData
  }

  this.findMax = function(classification){
    return d3.max(this.histogramData.map(function(data){ // for each class
      return d3.max(data.map(function(bin){ //for each bin
        return d3.sum(bin[classification])
      }))
    })
  )}*/


  this.constructHistogram = function(){

    fakedata =
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

    console.log(fakedata)

    var xScale = d3.scaleLinear()
        .domain([-20, 20]).nice()
        .rangeRound([0, width])

    var xScaleCount = d3.scaleLinear()
        .domain([0, 40])
        .rangeRound([0, width])

    var yScale = d3.scaleBand()
        .domain([0, 1, 2])
        .rangeRound([0, height]).padding(0.1)


    var color = d3.scaleOrdinal()
        .range(["#d73027","#f46d43","#fdae61","#a6d96a","#66bd63","#1a9850"])
        .domain("class0", "class1", "class2")

    var strokeWidth = 5
    var textLength = 40

    var svg = d3.select(".histograms")
        .selectAll(".svg-histogram")
        .data(fakedata)
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
        .attr("width", function (d) { return xScaleCount(d.count) - strokeWidth})
        .attr("x", function(d){ return xScale(- (d.count + d.previous_sum)) + strokeWidth/2})
        .attr("y", function (d) {return yScale(d.bin) + strokeWidth/2})
        .attr("fill", "white")
        .attr("stroke", function (d) { return color(d.className)})
        .attr("stroke-width", strokeWidth)
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

  this.constructData()
  console.log(this.histogramData)
  //this.max.negative = this.findMax(negative)
  //this.max.positive = this.findMax(positive)
  this.constructHistogram()
}
