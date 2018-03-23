var getBinNum = function(prob){
  var bin = Math.floor(prob/0.1)
  return (bin == 10) ? 9 : bin
}

function Histogram(dataModel, settings){
  var margin = { top: 20, right: 0, bottom: 20, left: 0 }
  var width = 300 - margin.left - margin.right
  var height = 400 - margin.top - margin.bottom
  var data = dataModel.data
  var probColumns = dataModel.probColumns

  var max = {negative: 0, positive: 0}
  var bins = [0,1,2,3,4,5,6,7,8,9]
  var strokeWidth = 2
  var textLength = 40
  var yAxisStroke = 2

  var initiateData = function(bins, dataModel){
    //console.log(this)
    //var histogramData = this.histogramData
    //var bins = this.bins
    var i = -1;
    var histogramData = dataModel.classNames.map(function(name){
      i = i+1
      return {classNum: i, className: name, data: []}
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
    return histogramData
    //this.histogramData = histogramData
  }

  var constructData = function(bins, dataModel, settings){
    console.log(settings)
    var histogramData = initiateData(bins, dataModel)
    console.log(histogramData)
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

        if (settings.display.TP && actual.includes(classNum) && predicted.includes(classNum)) { //TP
          if (example[dataModel.probColumns[classNum]] < settings.TPThreshold){
            histogramData[classNum]['data'][binNum]['tp'][0].count += 1
          }
        }
        else if(settings.display.FN && actual.includes(classNum) && !predicted.includes(classNum)){ //FN
          predicted.forEach(function(d){
            histogramData[classNum]['data'][binNum]['fn'][d].count += 1
          })
        }
        else if(settings.display.FP && !actual.includes(classNum) && predicted.includes(classNum)){ //FP
          actual.forEach(function(d){
            histogramData[classNum]['data'][binNum]['fp'][d].count += 1
          });
        }
        else {
          if (settings.display.TN && example[dataModel.probColumns[classNum]] > settings.TNThreshold){
            histogramData[classNum]['data'][binNum]['tn'][0].count += 1
          }
        }
      }
    })

    histogram = calculate_previous_sum(histogramData)
    console.log(histogram)
    return histogramData
    //this.histogramData = histogramData
    //console.log(this.histogramData)
  }

  var calculate_previous_sum = function(histogramData){
    //var histogramData = this.histogramData

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
    return histogramData
    //this.histogramData = histogramData
  }

  var findMax = function(classification, histogramData){
    return d3.max(histogramData.map(function(histogram){ // max in each class
      return d3.max(histogram.data.map(function(bin){ //for each bin
        return bin[classification][0].count + bin[classification][0].previous_sum
      }))
    })
  )}


  var constructHistogram = function(histogramData){
    //var histogramData = this.histogramData
    var bins = [9,8,7,6,5,4,3,2,1,0]
    var maxNeg = findMax("tn", histogramData)
    var maxPos = findMax("tp", histogramData)

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

    var xScale = d3.scaleLinear()
        .domain([-xDomainScale, xDomainScale]).nice()
        .rangeRound([0, width])

    var xScaleCount = d3.scaleLinear()
        .domain([0, xDomainScale*2])
        .rangeRound([0, width])

    var yScale = d3.scaleBand()
        .domain(bins)
        .rangeRound([0, height]).padding(0.1)


    var color = d3.scaleOrdinal()
        .range(["#d73027","#f46d43","#fdae61","#a6d96a","#66bd63","#1a9850"])
        .domain("class0", "class1", "class2", "class3", "class4", "class5", "class6", "class7" )

    var axisWidth = 40

    var histogramWidth = 300
    var histogramHeight = 400

    var axisScale = d3.scaleLinear().domain([0,10]).range([0,height])

    var axis = d3.axisLeft(axisScale)//.tickFormat("")

    d3.select(".histograms")
      .attr("width", 1366)
      .attr("height", 400)
      .append("svg")
        .attr("class", "axis")
        .attr("width", axisWidth)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + axisWidth/2 + "," + margin.top + ")")
        .call(axis)

    /*d3.select(".histograms")
      .append("svg")
        .attr("class", "parent")*/

    var svg = d3.select(".histograms")
        .selectAll(".svg-histogram")
        .data(histogramData)
      .enter().append("g")
        .attr("transform", function(d) { return "translate(" + histogramWidth * d.classNum + "," + 0 + ")" })
      .append("svg")
        .attr("class", "svg-histogram")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("text", function(d) { return d.classNum})
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

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
        .attr("x", function(d){ return xScale(d.previous_sum) + yAxisStroke/2})
        .attr("y", function (d) {return yScale(d.bin)})
        .attr("fill", function (d) { return color(d.className)})
        .attr("text", function(d){ return d.previous_sum + "," + d.count })
        //.attr("style", "fill=url(#pattern-stripe)")
        //.attr("mask", "url(#mask-stripe)")

    var tp = bins.selectAll("g")  // will store d.count and d.className
        .data( function(d) {return d.tp})
      .enter().append("rect")
        .attr("class", "tp")
        .attr("height", function(d) { return yScale.bandwidth()})
        .attr("width", function (d) { return xScaleCount(d.count) })
        .attr("x", function(d){ return xScale(d.previous_sum) + yAxisStroke/2})
        //.attr("x", function(d){ return xScale(0) + xScaleCount(d.previous_sum) + yAxisStroke/2})
        .attr("y", function (d) {return yScale(d.bin)})
        .attr("fill", function (d) { return color(d.className)})
        .attr("text", function(d){ return xScale(d.previous_sum) + "," + xScaleCount(d.previous_sum)})

    var fn = bins.selectAll("g")
        .data( function(d) {return d.fn})
      .enter().append("rect")
        .attr("class", "fn")
        .attr("height", function(d) { return yScale.bandwidth() - strokeWidth})
        .attr("width", function (d) { return (d.count == 0) ? 0 : (xScaleCount(d.count) - strokeWidth)})
        .attr("x", function (d) { return  (d.previous_sum == 0) ? xScale(0) - xScaleCount(d.count) + strokeWidth/2 - yAxisStroke/2 : xScale(0) - xScaleCount(d.previous_sum) - xScaleCount(d.count) + strokeWidth/2 - yAxisStroke/2})
        //.attr("x", function(d){ return xScale(0) - xScaleCount(d.previous_sum + d.count)})
        .attr("y", function (d) {return yScale(d.bin) + strokeWidth/2})
        .attr("fill", "white")
        .attr("stroke", function (d) { return color(d.className)})
        .attr("stroke-width", strokeWidth)
        .attr("text", function(d){ return xScaleCount(d.count) })

        //.attr("stroke-alignment", "inner")

    var tn = bins.selectAll("g")  // will store d.count and d.className
        .data( function(d) {return d.tn})
      .enter().append("rect")
        .attr("class", "tn")
        .attr("height", function(d) { return yScale.bandwidth()})
        .attr("width", function(d) { return xScaleCount(d.count)})
        .attr("x", function(d){ return (d.previous_sum == 0) ? xScale(0) - xScaleCount(d.count) - yAxisStroke/2 : xScale(0) - xScaleCount(d.previous_sum) - xScaleCount(d.count) - yAxisStroke/2 } )
        .attr("y", function (d) {return yScale(d.bin)})
        .attr("fill", function (d) { return color(d.className)})
        .attr("text", function(d){ return d.previous_sum + "," + d.count })


      svg.append("g")
          .attr("class", "y-axis")
        .append("line")
          .attr("x1", xScale(0))
          .attr("x2", xScale(0))
          .attr("y2", height)
          .attr("stroke", function(d) { return color(d.className)})
          .attr("stroke-width", yAxisStroke)
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

  var updateData = function(histogramData){
    console.log(histogramData)
    var maxNeg = findMax("tn", histogramData)
    var maxPos = findMax("tp", histogramData)
    var xDomainScale = Math.max(maxNeg , maxPos)

    var xScale = d3.scaleLinear()
        .domain([-xDomainScale, xDomainScale]).nice()
        .rangeRound([0, width])

    var xScaleCount = d3.scaleLinear()
        .domain([0, xDomainScale*2])
        .rangeRound([0, width])

    var svg = d3.select(".histograms")
            .selectAll(".svg-histogram")
            .data(histogramData)

    // enter
    svg.enter().append("svg")

    // exit
    svg.exit().remove();

    var bins = svg.selectAll(".bin") // 9 bins per class
            .data(function(d){ return d.data })

    //enter
    bins.enter().append("g")

    //exit
    bins.exit().remove()

    var fp = bins.selectAll(".fp")
        .data( function(d) {return d.fp})

    // enter
    fp.enter().append("rect")

    // update
    fp
        .attr("width", function (d) { return xScaleCount(d.count)})
        .attr("x", function(d){ return xScale(d.previous_sum) + yAxisStroke/2})
        .attr("text", function (d) { return xScaleCount(d.count)})

    // exit
    fp.exit().remove()

    var tp = bins.selectAll(".tp")  // will store d.count and d.className
        .data( function(d) {return d.tp})

    // enter
    tp.enter().append("rect")

    // update
    tp
        .attr("width", function (d) { return xScaleCount(d.count) })
        .attr("x", function(d){ return xScale(d.previous_sum) + yAxisStroke/2})
        .attr("text", function (d) { return xScaleCount(d.count)})
    // exit
    tp.exit().remove();

    var fn = bins.selectAll(".fn")
        .data( function(d) {return d.fn})

    fn.enter().append("rect")

    fn
        .attr("width", function (d) { return (d.count == 0) ? 0 : (xScaleCount(d.count) - strokeWidth)})
        .attr("x", function (d) { return  (d.previous_sum == 0) ? xScale(0) - xScaleCount(d.count) + strokeWidth/2 - yAxisStroke/2 : xScale(0) - xScaleCount(d.previous_sum) - xScaleCount(d.count) + strokeWidth/2 - yAxisStroke/2})
        .attr("text", function (d) { return xScaleCount(d.count)})

    fn.exit().remove();

    var tn = bins.selectAll(".tn")  // will store d.count and d.className
        .data( function(d) {return d.tn})

    tn.enter().append("rect")

    tn
        .attr("width", function(d) { return xScaleCount(d.count)})
        .attr("x", function(d){ return (d.previous_sum == 0) ? xScale(0) - xScaleCount(d.count) - yAxisStroke/2 : xScale(0) - xScaleCount(d.previous_sum) - xScaleCount(d.count) - yAxisStroke/2 } )
        .attr("text", function (d) { return xScaleCount(d.count)})

    tn.exit().remove();
  }


  $('#filter').on('click', function(e){
    e.preventDefault();
    settings.TPThreshold = $('#tp-threshold').val()
    settings.TNThreshold = $('#tn-threshold').val()
    settings.display.TN = $('#tn').is(":checked")
    settings.display.TP = $('#tp').is(":checked")
    settings.display.FN = $('#fn').is(":checked")
    settings.display.FP = $('#fp').is(":checked")
    console.log(settings)
    var histogramData = constructData(bins, dataModel, settings)
    console.log(histogramData)
    updateData(histogramData)
  })

  var histogramData = constructData(bins, dataModel, settings)
  console.log(histogramData)
  //this.max.negative = this.findMax("tn")
  //this.max.positve = this.findMax("tp")
  //console.log(this.max.negative)
  //this.max.positive = this.findMax(positive)
  constructHistogram(histogramData)
}

var drawPath = function(data, dataModel){

  var datapoints = dataModel.classNames.map(function (d, i){
    return [ dataModel.classNames[i], data[dataModel.probColumns[i]] ]
  })

  var linepoints = [].append(datapoints)
  console.log(linepoints)
  var xScale = d3.scaleOrdinal()
    .domain(["class0", "class1", "class2", "class3" ])
    .range([150, 450, 750, 1050])

  var yScale = d3.scaleBand()
    .domain([9,8,7,6,5,4,3,2,1,0])
    .rangeRound([0, 400]).padding(0.1)


  var draw = d3.line()
      .x(function (d) { return xScale(d[0])} )
      .y(function (d) { return yScale(getBinNum(d[1])) })

  var data = [[["class0", 0.8],["class1", 0.7]]]

  var connect = d3.select(".connect-histograms")
    .selectAll("path")
    .data(linepoints)
    .enter().append("path")
    .attr("text", function(d) {return d[0]})
    .attr("class", "line")
    .attr("d", draw)

}
