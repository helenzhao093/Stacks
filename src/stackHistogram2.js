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

  //this.max.Left =

  this.constructData = function(){
    //console.log(this)
    var positive = 0, negative = 1;
    var histogramData = this.histogramData

    histogramData = dataModel.classNames.map(function(className){
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

    dataModel.data.forEach(function(example){
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
  )}


  this.constructHistogram = function(){

    fakedata =
    [
      {
        className: "class0",
        data: [
          { bin: "bin1",
          tp: [{ bin: "bin1", className: "class0", count: 0, previous_sum: 7}],
          fp: [{ bin: "bin1", className: "class1", count: 3, previous_sum: 0} , { bin: "bin1", className: "class2", count: 4, previous_sum: 3}],
          tn: [{ bin: "bin1", className: "class0", count: 0, previous_sum: 8 }],
          fn: [{ bin: "bin1", className: "class1", count: 3, previous_sum: 0} , { bin: "bin1", className: "class2", count: 5, previous_sum: 3}]
          },
          {
          bin: "bin2",
          tp: [{ bin: "bin2", className: "class0", count: 10, previous_sum: 5}],
          fp: [{ bin: "bin2", className: "class1", count: 1, previous_sum: 0} , { bin: "bin2", className: "class2", count: 4, previous_sum: 1}],
          tn: [{ bin: "bin2", className: "class0", count: 8, previous_sum: 7}],
          fn: [{ bin: "bin2", className: "class1", count: 5, previous_sum: 0} , { bin: "bin2", className: "class2", count: 2, previous_sum: 5}]
          },
          {
          bin: "bin3",
          tp: [{ bin: "bin3", className: "class0", count: 5, previous_sum: 5}],
          fp: [{ bin: "bin3", className: "class1", count: 1, previous_sum: 0} , { bin: "bin3", className: "class2", count: 4, previous_sum: 1}],
          tn: [{ bin: "bin3", className: "class0", count: 4, previous_sum: 7}],
          fn: [{ bin: "bin3", className: "class1", count: 3, previous_sum: 0} , { bin: "bin3", className: "class2", count: 4, previous_sum: 3}]
          }
        ]
      },
      {
        className: "class1",
        data: [
          { bin: "bin1",
          tp: [{ bin: "bin1", className: "class1", count: 6, previous_sum: 7 }],
          fp: [{ bin: "bin1", className: "class0", count: 3, previous_sum: 0} , { bin: "bin1", className: "class2", count: 4, previous_sum: 3}],
          tn: [{ bin: "bin1", className: "class1", count: 5, previous_sum: 8}],
          fn: [{ bin: "bin1", className: "class0", count: 2, previous_sum: 0} , { bin: "bin1", className: "class2", count: 6, previous_sum: 2}]
          },
          {
          bin: "bin2",
          tp: [{ bin: "bin2", className: "class1", count: 2, previous_sum: 7 }],
          fp: [{ bin: "bin2", className: "class0", count: 3, previous_sum: 0} , { bin: "bin2", className: "class2", count: 4, previous_sum: 3}],
          tn: [{ bin: "bin2", className: "class1", count: 4, previous_sum: 7 }],
          fn: [{ bin: "bin2", className: "class0", count: 3, previous_sum: 0} , { bin: "bin2", className: "class2", count: 4, previous_sum: 3}]
          },
          {
          bin: "bin3",
          tp: [{ bin: "bin3", className: "class1", count: 1, previous_sum: 9}],
          fp: [{ bin: "bin3", className: "class0", count: 6, previous_sum: 0} , { bin: "bin3", className: "class2", count: 3, previous_sum: 6}],
          tn: [{ bin: "bin3", className: "class1", count: 1, previous_sum: 8}],
          fn: [{ bin: "bin3", className: "class0", count: 4, previous_sum: 0} , { bin: "bin3", className: "class2", count: 4, previous_sum: 4}]
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
        .domain(["bin1", "bin2", "bin3"])
        .rangeRound([0, height]).padding(0.1)


    var color = d3.scaleOrdinal()
        .range(["#d73027","#f46d43","#fdae61","#a6d96a","#66bd63","#1a9850"])
        .domain("class0", "class1", "class2")


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
        .attr("height", function(d) { return yScale.bandwidth()})
        .attr("width", function (d) { return xScaleCount(d.count)})
        .attr("x", function(d){ return xScale(- (d.count + d.previous_sum))})
        .attr("y", function (d) {return yScale(d.bin)})
        .attr("fill", function (d) { return color(d.className)})

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
        .attr("y2", height);


        //.append("text")
        //.text(function(d) {return d})
  }

  //this.constructData()
  //console.log(this.histogramData)
  //this.max.negative = this.findMax(negative)
  //this.max.positive = this.findMax(positive)
  this.constructHistogram()
}
