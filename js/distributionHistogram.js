function DistributionHistogram(dataModel, settings, boxPlots){
  // initialize empty JS object to contain data for histograms
  var that = this
  var initiateData = function(dataModel){
    var histogramData = dataModel.classNames.map(function(name, i){
      return {classNum: i, className: name, data: []}
    })

    histogramData.forEach(function (histogram){
      settings.bins.forEach(function(binNum) {
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
    console.log(histogramData)
    return histogramData
  }

  // fill the JS object with counts for histograms
  this.constructData = function(dataModel, settings){
    // initialize data
    var histogramData = initiateData(dataModel)

    // iterate through each example in the dataset
    dataModel.data.forEach(function(example){

      // store class names for actual and predicted classes
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

      // increment classification counts for classes
      for (classNum = 0; classNum < dataModel.numClasses; classNum++) {
        if (inRange(example[dataModel.probColumns[classNum]], settings.probabilityRange) && inRange(example[settings.distanceMeasure], settings.distanceRange)){

          binNum = getBinNum(example[dataModel.probColumns[classNum]], settings.probabilityRange, settings.numBins)
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
      }
    })
    console.log(histogramData)
    // add previous sum key for each count, needed for drawing svg
    histogram = calculatePreviousSum(histogramData, dataModel.numClasses)
    console.log(histogram)
    return histogramData
  }

  ///////////////
  // SELECT BARS
  //////////////
  var numSelected = [0]
  var selectedInfo = []


  var selectedStack = function(){
    // increment number of selected stacks

    if ($(this).attr('class').split(' ').length == 3){ //already selected, so remove selection
      removeSelectedStack($(this), selectedInfo, numSelected)
    } //alright selected
    else{
      addSelectedStack($(this), selectedInfo, numSelected);
      console.log(selectedInfo)
      console.log(numSelected)
    }
    if (numSelected[0] == 2){
      boxPlots.makeComparison(selectedInfo, histogramData, dataModel.data)
    }
  }


  // append svg elements to "draw" the histogram from the data
  var constructHistogram = function(histogramData){
    //console.log(settings)
    //var histogramData = this.histogramData
    //var bins = [9,8,7,6,5,4,3,2,1,0]
    // find the max counts in the negative and positive histograms
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
    ]*/

    // use the overall max as the x-domain scale
    var xDomainScale = Math.max(maxNeg , maxPos)


    var xScale = d3.scaleLinear()
        .domain([-xDomainScale, xDomainScale]).nice()
        .rangeRound([0, settings.histogramWidth])

    var xScaleCount = d3.scaleLinear()
        .domain([0, xDomainScale*2])
        .rangeRound([0, settings.histogramWidth])

    var yScale = d3.scaleBand()
        //.domain(settings.bins)
        .domain([0,1,2,3,4,5,6,7,8,9])
        .rangeRound([0, settings.histogramHeight]).padding(0.1)

    var color = d3.scaleOrdinal()
        .range(settings.colorRange)
        .domain(["class0", "class1", "class2", "class3", "class4", "class5", "class6", "class7"])

    // axis
    //var axisScale = d3.scaleLinear().domain([1.0,0.0]).range([0,settings.histogramHeight]) //fix domain
    //var axis = d3.axisLeft(axisScale)
    /* Axis */
    d3.select(".histograms")
      .attr("width", settings.totalWidth)
      .attr("height", settings.svgHeight)
      .append("svg")
        .attr("class", "svg-axis")
        .attr("width", settings.axisWidth)
        .attr("height", settings.svgHeight)
      .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (settings.axisWidth - 5) + "," + settings.margin.top + ")")
        .call(settings.axis)

    d3.select(".svg-axis")
      .append("text")
      .attr("style", "writing-mode: tb")
      .attr("x", 20)
      .attr("y", (400 - 70)/2)
      .text("probability")
      .attr("textLength", 70)

    var svg = d3.select(".histograms")
        .selectAll(".svg-histogram")
        .data(histogramData)
      .enter().append("g")
        .attr("transform", function(d) { return "translate(" + (20 + (settings.axisWidth + settings.histogramWidth * d.classNum)) + "," + 0 + ")" })
      .append("svg")
        .attr("class", function(d) { return "svg-histogram " + d.className })
        .attr("width", settings.histogramWidth)
        .attr("height", settings.svgHeight)
        .attr("text", function(d) { return d.classNum})
      .append("g")
        .attr("transform", "translate(" + settings.margin.left + "," + settings.margin.top + ")")

    var bins = svg.selectAll(".row") // 9 bins per class
        .data(function(d){ return d.data })
      .enter().append("g")
        .attr("class", function (d){ return "bin " + d.bin })

    var fp = bins.selectAll("g")
        .data( function(d) {return d.fp})
      .enter().append("rect")
        .attr("class", function(d) {return "FP " + d.className })
        .attr("height", function(d) { return yScale.bandwidth()})
        .attr("width", function (d) { return xScaleCount(d.count)})
        .attr("x", function(d){ return xScale(d.previous_sum) + settings.yAxisStrokeWidth/2})
        .attr("y", function (d) {return yScale(d.bin)})
        .attr("fill", function (d) { return color(d.className)})
        .attr("text", function(d){ return d.className })
        //.attr("onclick", "function changerect(evt){ console.log(evt); var svg = evt.target; svg.attr(\"fill\", \"black\")}" )

    var tp = bins.selectAll("g")  // will store d.count and d.className
        .data( function(d) {return d.tp})
      .enter().append("rect")
        .attr("class", function(d) {return "TP " + d.className })
        .attr("height", function(d) { return yScale.bandwidth()})
        .attr("width", function (d) { return xScaleCount(d.count) })
        .attr("x", function(d){ return xScale(d.previous_sum) + settings.yAxisStrokeWidth/2})
        .attr("y", function (d) {return yScale(d.bin)})
        .attr("fill", function (d) { return color(d.className)})
        .attr("text", function(d){ return xScale(d.previous_sum) + "," + xScaleCount(d.previous_sum)})

    var fn = bins.selectAll("g")
        .data( function(d) {return d.fn})
      .enter().append("rect")
        .attr("class", function(d) {return "FN " + d.className })
        .attr("height", function(d) { return yScale.bandwidth() - settings.fnStrokeWidth})
        .attr("width", function (d) { return (d.count == 0) ? 0 : (xScaleCount(d.count) - settings.fnStrokeWidth)})
        .attr("x", function (d) {
          return  (d.previous_sum == 0) ? xScale(0) - xScaleCount(d.count) + settings.fnStrokeWidth/2 - settings.yAxisStrokeWidth/2 :
          xScale(0) - xScaleCount(d.previous_sum) - xScaleCount(d.count) + settings.fnStrokeWidth/2 - settings.yAxisStrokeWidth/2})
        //.attr("x", function(d){ return xScale(0) - xScaleCount(d.previous_sum + d.count)})
        .attr("y", function (d) {return yScale(d.bin) + settings.fnStrokeWidth/2})
        .attr("fill", "white")
        .attr("stroke", function (d) { return color(d.className)})
        .attr("stroke-width", settings.fnStrokeWidth)
        .attr("text", function(d){ return xScaleCount(d.count) })

        //.attr("stroke-alignment", "inner")

    var tn = bins.selectAll("g")  // will store d.count and d.className
        .data( function(d) {return d.tn})
      .enter().append("rect")
        .attr("class", "TN")
        .attr("height", function(d) { return yScale.bandwidth()})
        .attr("width", function(d) { return xScaleCount(d.count)})
        .attr("x", function(d){ return (d.previous_sum == 0) ? xScale(0) - xScaleCount(d.count) - settings.yAxisStrokeWidth/2 : xScale(0) - xScaleCount(d.previous_sum) - xScaleCount(d.count) - settings.yAxisStrokeWidth/2 } )
        .attr("y", function (d) {return yScale(d.bin)})
        .attr("fill", function (d) { return color(d.className)})
        .attr("text", function(d){ return d.previous_sum + "," + d.count })

    fp.on("click", selectedStack)
    fn.on("click", selectedStack)
    tp.on("click", selectedStack)

      svg.append("g")
          .attr("class", "y-axis")
        .append("line")
          .attr("x1", xScale(0))
          .attr("x2", xScale(0))
          .attr("y2", settings.histogramHeight)
          //.attr("y2", settings.histogramHeight - settings.margin.top - settings.margin.bottom)
          .attr("stroke", function(d) { return color(d.className)})
          .attr("stroke-width", settings.yAxisStrokeWidth)
          .attr("stroke-opacity", 0.5)

      svg.append("text")
          .attr("class", "histogram-label")
          .attr("x", settings.histogramWidth/2 - settings.textLength/2 )
          .attr("y", settings.svgHeight - settings.margin.top)
          .attr("textLength", settings.textLength)
          .attr("font-family", "Verdana")
          .attr("font-size", 15)
          .text(function(d) {return d.className})
          .attr("fill", function(d) { return color(d.className)})
  }

  this.updateData = function(histogramData){
    //console.log(histogramData)
    var maxNeg = findMax("tn", histogramData)
    var maxPos = findMax("tp", histogramData)
    var xDomainScale = Math.max(maxNeg , maxPos)
    //console.log(xDomainScale)

    var xScale = d3.scaleLinear()
        .domain([-xDomainScale, xDomainScale]).nice()
        .rangeRound([0, settings.histogramWidth])

    var xScaleCount = d3.scaleLinear()
        .domain([0, xDomainScale*2])
        .rangeRound([0, settings.histogramWidth])

    var svg = d3.select(".histograms")
            .selectAll(".svg-histogram")
            .data(histogramData)
    //console.log(svg)

    // enter
    svg.enter().append("svg")

    // exit
    svg.exit().remove();

    var bins = svg.selectAll(".bin") // 9 bins per class
            .data(function(d){ return d.data })
    console.log(bins)
    //enter
    bins.enter().append("g")

    //exit
    bins.exit().remove()

    var fp = bins.selectAll(".FP")
        .data( function(d) {return d.fp})

    //console.log(fp)

    // enter
    fp.enter().append("rect")

    // update
    fp
        .attr("width", function (d) { return xScaleCount(d.count)})
        .attr("x", function(d){ return xScale(d.previous_sum) + settings.yAxisStrokeWidth/2})
        .attr("text", function (d) { return xScaleCount(d.count)})

    // exit
    fp.exit().remove()

    var tp = bins.selectAll(".TP")  // will store d.count and d.className
        .data( function(d) {return d.tp})

    // enter
    tp.enter().append("rect")

    // update
    tp
        .attr("width", function (d) { return xScaleCount(d.count) })
        .attr("x", function(d){ return xScale(d.previous_sum) + settings.yAxisStrokeWidth/2})
        .attr("text", function (d) { return xScaleCount(d.count)})
    // exit
    tp.exit().remove();

    var fn = bins.selectAll(".FN")
        .data( function(d) {return d.fn})

    fn.enter().append("rect")

    fn
        .attr("width", function (d) { return (d.count == 0) ? 0 : (xScaleCount(d.count) - settings.fnStrokeWidth)})
        .attr("x", function (d) { return  (d.previous_sum == 0) ? xScale(0) - xScaleCount(d.count) + settings.fnStrokeWidth/2 - settings.yAxisStrokeWidth/2 : xScale(0) - xScaleCount(d.previous_sum) - xScaleCount(d.count) + settings.fnStrokeWidth/2 - settings.yAxisStrokeWidth/2})
        .attr("text", function (d) { return xScaleCount(d.count)})

    fn.exit().remove();

    var tn = bins.selectAll(".TN")  // will store d.count and d.className
        .data( function(d) {return d.tn})

    tn.enter().append("rect")

    tn
        .attr("width", function(d) { return xScaleCount(d.count)})
        .attr("x", function(d){ return (d.previous_sum == 0) ? xScale(0) - xScaleCount(d.count) - settings.yAxisStrokeWidth/2 : xScale(0) - xScaleCount(d.previous_sum) - xScaleCount(d.count) - settings.yAxisStrokeWidth/2 } )
        .attr("text", function (d) { return xScaleCount(d.count)})

    tn.exit().remove();

    settings.axisDomain = settings.axisDomain.map(function(d, i){ return settings.probabilityRange.lowerBound + (settings.numBins - i)*(settings.probabilityRange.upperBound - settings.probabilityRange.lowerBound)/settings.numBins })
    //console.log(settings.axisDomain)
    settings.axisScale.domain(settings.axisDomain)
    var axis = d3.select(".axis")
      .call(settings.axis)
    //console.log(axis)
    /*var axisScale = d3.scaleLinear().domain([1.0,0.0]).range([0,settings.histogramHeight]) //fix domain
    var axis = d3.axisLeft(axisScale)

    d3.select(".histograms")
      .attr("width", settings.totalWidth)
      .attr("height", settings.svgHeight)
      .append("svg")
        .attr("class", "axis")
        .attr("width", settings.axisWidth)
        .attr("height", settings.svgHeight)
        .append("g")
        .attr("transform", "translate(" + (settings.axisWidth - 5) + "," + settings.margin.top + ")")
        .call(axis)*/
  }

  var histogramData = this.constructData(dataModel, settings)
  constructHistogram(histogramData)
}
