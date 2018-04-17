function Histogram(dataModel, settings, histogramType, boxPlots){
  console.log(histogramType)
  var that = this;
  this.histogramType = histogramType
  var initializeData = function(){
    var histogramData = dataModel.classNames.map(function(name, i){
      return {classNum: i, className: name, data: []}
    })

    histogramData.forEach(function (histogram){
      settings.bins.forEach(function(binNum) {
        histogram.data.push({bin: binNum, tp:[], fn: []})
      })
      dataModel.classNames.forEach(function(name){

        histogram.data.forEach(function(data)
          data.fn.push({bin: data.bin, className: name, count: 0})
        )

        if (name == histogram.className){
          histogram.data.forEach(function(data)
            data.tp.push({bin: data.bin, className: name, count: 0})
          )
        }
      })
    })
    console.log(histogramData)
    return histogramData
  }

  this.constructData = function(dataModel, settings){
    // only adding to the chart if the true class is current class
    var histogramData = initializeData()
    dataModel.data.forEach(function(example){
      if (inRange(example[settings.distanceMeasure], settings.distanceRange)){
        dataModel.actualClasses.forEach(function(actualClass, i){
          //console.log(example[dataModel.probColumns[i]], inRange(example[dataModel.probColumns[i]], settings.probabilityRange), settings.probabilityRange.upperBound)
          if (example[dataModel.actualClasses[i]] == 1 && inRange(example[dataModel.probColumns[i]], settings.probabilityRange))  {
            var columnName = (histogramType.getBinNum.length == 1) ? histogramType.getBinNum[0] : histogramType.getBinNum[i]

            var binNum = getBinNum(example[columnName], histogramType.range, settings.numBins)
            //console.log(binNum, columnName, example[columnName], histogramType.range)
            dataModel.predictedClasses.forEach(function(predictedClass, j){
              if (example[dataModel.predictedClasses[j]] == 1) {
                if (i == j && settings.display.TP && (example[dataModel.probColumns[i]] < settings.TPThreshold) ){
                  histogramData[i]['data'][binNum]['tp'][0].count += 1;
                }
                if(i != j && settings.display.FN){
                  histogramData[i]['data'][binNum]['fn'][j].count += 1;
                }
              }
            })

          }
        })
      }
    })
    histogramData = calculatePreviousSumTPFN(histogramData, dataModel.numClasses)
    return histogramData
  }

  var numSelected = [0]
  var selectedInfo = []
  var maxSelect = 5
  var selectedStack = function(){
    if ($(this).attr('class').split(' ').length == 3){ //already selected, so remove selection
      removeSelectedStack($(this), selectedInfo, numSelected)
    }
    else if (numSelected[0] == maxSelect){
      removeAll(selectedInfo, maxSelect)
      numSelected[0] = 0
      addSelectedStack($(this), selectedInfo, numSelected, true);
    }
    else{
      addSelectedStack($(this), selectedInfo, numSelected, true);
    }
    console.log(selectedInfo)
    console.log(numSelected)
  }

  var constructHistogram = function(histogramData){
    //console.log(histogramData)
    var xDomainScale = calculateXDomain("tp", "fn", histogramData)

    console.log(xDomainScale)

    var xScale = settings.xScale(xDomainScale)

    var xScaleCount = settings.xScaleCount(xDomainScale)


    /* add axis */
    //d3.select(".distanceHistograms") //select svg
    // svgClass == distance
    d3.select("." + histogramType.type + "-histograms")
      .attr("width", settings.totalWidth)
      .attr("height", settings.svgHeight)
      .append("svg")
        .attr("class", histogramType.type + "-histograms-svgAxis")
        .attr("width", settings.axisWidth)
        .attr("height", settings.svgHeight)
      .append("g")
        .attr("class", histogramType.type + "-axis")
        .attr("transform", "translate(" + (settings.axisWidth - 5) + "," + settings.margin.top + ")")
        .call(histogramType.axis)

    /* axis label */
    d3.select("." + histogramType.type + "-histograms-svgAxis")
      .append("text")
      .attr("style", "writing-mode: tb")
      .attr("x", 20)
      .attr("y", (400 - 70)/2)
      .text(histogramType.type)
      .attr("textLength", 70)

    var svg = d3.select("." + histogramType.type + "-histograms")
        .selectAll(".svg-histogram")
        .data(histogramData)
      .enter().append("g")
        .attr("transform", function(d) { return "translate(" + (20 + (settings.axisWidth + settings.histogramWidth * d.classNum)) + "," + 0 + ")" })
      .append("svg")
        .attr("class", function(d) { return histogramType.type + "-histogram " + d.className })
        .attr("width", settings.histogramWidth)
        .attr("height", settings.svgHeight)
        .attr("text", function(d) { return d.classNum})
      .append("g")
        .attr("transform", "translate(" + settings.margin.left + "," + settings.margin.top + ")")

    var bins = svg.selectAll(".row") // 9 bins per class
        .data(function(d){ return d.data })
      .enter().append("g")
        .attr("class", function (d){ return "bin " + d.bin })

    var tp = bins.selectAll("g")  // will store d.count and d.className
        .data( function(d) {return d.tp})
      .enter().append("rect")
        .attr("class", function(d) {return "TP " + d.className })
        .attr("height", function(d) { return settings.yScale.bandwidth()})
        .attr("width", function (d) { return xScaleCount(d.count) })
        .attr("x", function(d){ return xScale(d.previous_sum) + settings.yAxisStrokeWidth/2})
        .attr("y", function (d) {return settings.yScale(d.bin)})
        .attr("fill", function (d) { return settings.color(d.className)})
        .attr("text", function(d){ return xScale(d.previous_sum) + "," + xScaleCount(d.previous_sum)})

    var fn = bins.selectAll("g")
        .data( function(d) {return d.fn})
      .enter().append("rect")
        .attr("class", function(d) {return "FN " + d.className })
        .attr("height", function(d) { return settings.yScale.bandwidth()})
        .attr("width", function (d) { return (d.count == 0) ? 0 : xScaleCount(d.count)})
        .attr("x", function (d) {
          return  (d.previous_sum == 0) ? xScale(0) - xScaleCount(d.count) - settings.yAxisStrokeWidth/2:
          xScale(0) - xScaleCount(d.previous_sum) - xScaleCount(d.count) - settings.yAxisStrokeWidth/2 })
        //.attr("x", function(d){ return xScale(0) - xScaleCount(d.previous_sum + d.count)})
        .attr("y", function (d) {return settings.yScale(d.bin) })
        .attr("fill", function (d) { return settings.color(d.className) })
        //.attr("stroke", function (d) { return settings.color(d.className) })
        //.attr("stroke-width", settings.fnStrokeWidth)
        .attr("text", function(d){ return xScaleCount(d.count) })

    fn.on("click", selectedStack)
    tp.on("click", selectedStack)

    svg.append("g")
        .attr("class", "y-axis")
      .append("line")
        .attr("x1", xScale(0))
        .attr("x2", xScale(0))
        .attr("y2", settings.histogramHeight)
        //.attr("y2", settings.histogramHeight - settings.margin.top - settings.margin.bottom)
        .attr("stroke", function(d) { return settings.color(d.className)})
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
        .attr("fill", function(d) { return settings.color(d.className)})
    }

    this.updateData = function(histogramData, newRange){
      var xDomainScale = calculateXDomain("tp", "fn", histogramData)

      console.log(xDomainScale)

      var xScale = settings.xScale(xDomainScale)

      var xScaleCount = settings.xScaleCount(xDomainScale)

      var svg = d3.select("." + histogramType.type + "-histograms")
              .selectAll("." + histogramType.type + "-histogram")
              .data(histogramData)
      svg.enter().append("svg")
      svg.exit().remove();

      var bins = svg.selectAll(".bin") // 9 bins per class
              .data(function(d){ return d.data })
      bins.enter().append("g")
      bins.exit().remove()


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
          .attr("width", function (d) { return (d.count == 0) ? 0 : xScaleCount(d.count)})
          .attr("x", function (d) { return  (d.previous_sum == 0) ?
            xScale(0) - xScaleCount(d.count) - settings.yAxisStrokeWidth/2 :
            xScale(0) - xScaleCount(d.previous_sum) - xScaleCount(d.count) - settings.yAxisStrokeWidth/2})
          .attr("text", function (d) { return xScaleCount(d.count)})

      fn.exit().remove();

      console.log(newRange)
      var newAxisDomain = histogramType.axisDomain.map(
        function(d, i){
          return newRange.lowerBound +
            (settings.numBins - i)*(newRange.upperBound - newRange.lowerBound)/settings.numBins
      })
      //console.log(histogramType.axisDomain)
      //console.log(settings.axisDomain)
      //console.log(histogramType.axis)
      var newAxis = settings.getAxis(newAxisDomain)
      var axis = d3.select("." + histogramType.type + "-axis")
        .call(newAxis)

    }

    var histogramData = this.constructData(dataModel, settings)
    constructHistogram(histogramData)
}
