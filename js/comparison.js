function BoxPlot(dataModel, settings){
  //console.log(dataModel)
  //console.log(selectedInfo)
  // boxplot descriptions
  // console.log(settings)
  var that = this
  this.settings = settings
  var distanceMeasure = settings.distanceMeasure
  var bottomAxisHeight = 40
  var titleHeight = 30
  var margin = { top: 30, right: 30, bottom: 30, left: 30}
  var boxMargin = { left: 20, top: 5 }
  var plotWidth = 300
  var plotHeight = 120
  var totalWidth = plotWidth + margin.right + margin.left + boxMargin.left
  var totalHeight = plotHeight + margin.top + margin.bottom + boxMargin.top + bottomAxisHeight + titleHeight
  var boxHeights = [0, 30, 30, 25, 20, 15]

  var boxQuartiles = function (d) { // d is an array
    var sorted = d.sort(function(a,b){return a - b})
    //console.log(sorted)
     return [
       d3.quantile(sorted, 0),
       d3.quantile(sorted, 0.25),
       d3.quantile(sorted, 0.5),
       d3.quantile(sorted, 0.75),
       d3.quantile(sorted, 1)
     ];
  }

  var constructPlotData = function(columnNames, groups){
    var data = []
    columnNames.forEach(function(name) {
      data.push([])
    })
    columnNames.forEach(function(column, j){
      groups.forEach(function(group, i){
        data[j].push({
          group: i,
          name: column,//dataModel.probColumns[i],
          quartiles: boxQuartiles(group.map(function(d){ //need to sort
            return d[column]//d[dataModel.probColumns[i]]
          }))
        })
      })
    })

    //var sortedData = sortPlotData(data)
    return data //sortedData
  }

  var sortPlotData = function (boxPlotData){
    var sorted = boxPlotData.sort(function(a,b){
      //console.log(a,b)
      return Math.abs((a[0].quartiles[4] - b[0].quartiles[0]) - (a[1].quartiles[4] - b[1].quartiles[0]))
    })
    console.log(sorted)
    return sorted
  }

  var constructAllPlotData = function(groups, dataModel){
    return [
      constructPlotData(dataModel.probColumns, groups),
      constructPlotData(dataModel.featureColumns, groups),
      constructPlotData([that.settings.distanceMeasure], groups)
    ]
  }



  var filterDataForSelected = function(data, selectedInfo, distanceMeasure){
    console.log(settings)
    var svgClass = ""
    if (selectedInfo.classification == "TP" || selectedInfo.classification == "FP"){
      svgClass = "predictedClass"
    } //if TP and FP used prob of predictedclass  (FN used probability of the class that it was pred)
    else{
      svgClass = "actualClass"
    }
    var filtered = data.filter(example => example["actual" + selectedInfo["actualClass"]] == 1)
      .filter(example => example["predicted" + selectedInfo["predictedClass"]] == 1)

    if (selectedInfo.distance){
      filtered = filtered.filter(example => getBinNum(example[settings.distanceMeasure], settings.distanceRange, settings.numBins) == selectedInfo["binNum"])
    }
    else {
      filtered = filtered.filter(example => getBinNum(example["prob" + selectedInfo[svgClass]], settings.probabilityRange, settings.numBins) == selectedInfo["binNum"])
    }
    console.log(filtered)
    return filtered
  }
  //legend
  var legendWidth = 500
  var legendHeight = 30
  var legendMargin = {top: 10, left: 20}
  var legendBoxHeight = 20
  var legendRowHeight = 25
  var colors = ['#BE3B59', '#FF945A', '#4771AF', '#938FA9', '#82353F']
  function constructLegend(info){

    /* remove the previous legend */
    d3.select(".svg-legend").remove()

    var svg = d3.select(".legend")
      .append("svg")
      .attr("width", legendWidth)
      .attr("height", legendHeight * info.length)
      .attr("class", "svg-legend")

    for (var i = 0; i < info.length; i++){
      var row = svg.append("g")
        .attr("class", "legend-row")
        .attr("transform", "translate(" + legendMargin.left + "," + (legendMargin.top + info[i].groupNum * legendRowHeight) + ")")
      row.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", legendBoxHeight)
        .attr("height", legendBoxHeight)
        .style("fill", info[i].color)
        .attr("strokeWidth", 1)
        .attr("stroke", "black")

      row.append("text")
        .attr("x", 20 + 5)
        .attr("y", 15)
        .attr("font-family", "Verdana")
        .attr("font-size", 15)
        .text("true class:" + info[i].actualClass + "; predicted class:" + info[i].predictedClass +  "; range:" + info[i].range.lower.toFixed(3) + "-" + info[i].range.upper.toFixed(3))
    }
  }

  function constructAllBoxPlots(allPlotData, selectedInfo){
    d3.selectAll(".svg-boxplot").remove()
    constructBoxPlots(allPlotData[0], selectedInfo, ".probability-boxplot-pane")
    constructBoxPlots(allPlotData[1], selectedInfo, ".feature-boxplot-pane")
    constructBoxPlots(allPlotData[2], selectedInfo, ".similarity-boxplot-pane")
  }

  function constructBoxPlots(boxPlotData, selectedInfo, divClassName){
    //[ [{}{}] [{}{}] [{}{}] ]
      boxPlotData.forEach(function(featureData){

        // var title = (divClassName == ".similarity-boxplot-pane") ? "distance" : featureData[0].name
        var title, textLength;
        if (divClassName == ".probability-boxplot-pane"){
          title = "Class " + featureData[0].name.substring(4,5) + " Probability"
          textLength = 100
        }
        else if(divClassName == ".feature-boxplot-pane"){
          title = "Feature " + featureData[0].name.substring(7,8)
          textLength = 60
        }
        else{
          title = "Distance"
          textLength = 50
        }

        var boxHeight = boxHeights[selectedInfo.length]
        // get the min and max from each
        //xScaleMin = d3.min(pairOfData[0].quartiles.concat(pairOfData[1].quartiles))
        xScaleMin = d3.min(featureData.map(function(d){
          return d.quartiles[0]
        }))
        xScaleMax = d3.max(featureData.map(function(d){
          return d.quartiles[4]
        }))
        console.log(xScaleMin, xScaleMax)
        var xScale = d3.scaleLinear()
        	.domain([xScaleMin, xScaleMax])
          .range([0, plotWidth])

        var xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".2f"))

        var h = (selectedInfo.length == 2) ? 100 : plotHeight
        var yScale = d3.scalePoint()
          //.domain([pairOfData[0].group, pairOfData[1].group])
          .domain(featureData.map(function(d){
            return d.group
          }))
          //.rangeRound([0, h])
          .rangeRound([0, plotHeight - boxHeight/2])

        // setup svg and group that will contain the box plot
        //console.log(divClassName, pairOfData)
        var svg = d3.select(divClassName)
          .append("svg")
            .attr("width", totalWidth)
            .attr("height", totalHeight)
            .attr("class", "svg-boxplot")
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        svg.append("text")
            .attr("class", "title")
            .attr("x", plotWidth/2 )
            .attr("y", titleHeight/2 )
            .attr("textLength", textLength)
            .attr("font-family", "Verdana")
            .attr("font-size", 15)
            .text(title)
            //.attr("fill", function(d) { return color(d.className)})

        svg.append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(" + boxMargin.left + "," + (plotHeight + titleHeight + margin.top + boxMargin.top) + ")")
          .call(xAxis)

        // setup group the boxplot elements will render in
        var g = svg.append("g")
          .attr("transform", "translate(" + boxMargin.left + "," + (boxMargin.top + titleHeight) + ")");

        var horizontalLines = g.selectAll(".horizontal-line")
            .data(featureData)
            .enter()
          .append("line")
            .attr("x1", function(d){
              //console.log(d.quartiles[0])
              //console.log(xScale(d.quartiles[0]))
          	   return xScale(d.quartiles[0])
             })
            .attr("y1", function(d){
          	   return yScale(d.group) + boxHeight/2
             })
            .attr("x2", function(d){
          	   return xScale(d.quartiles[4])
             })
            .attr("y2", function(d){
          	   return yScale(d.group) + boxHeight/2
             })
            .attr("stroke", "black")
            .attr("stroke-width", 1)

        var rects = g.selectAll("rect")
            .data(featureData)
            .enter()
          .append("rect")
            .attr("width", function(d){
            	//console.log(d.quartile[2] - d.quartile[0])
            	//console.log(xScale(2))
              //console.log(d.quartiles)
              //console.log(Math.abs(d.quartiles[3]) - d.quartiles[1], xScale(d.quartiles[3]) - xScale(d.quartiles[1]))
              return xScale(d.quartiles[3]) - xScale(d.quartiles[1]);
            })
            .attr("height", boxHeight)
            .attr("x", function(d){
            	return xScale(d.quartiles[1]); //box starts at 1/4 quartile
            })
            .attr("y", function(d){
            	return yScale(d.group)
            })
            .attr("fill", function(d){
              for (var i = 0; i < selectedInfo.length; i++){
                //console.log(selectedInfo[i].groupNum, d.group)
                if (selectedInfo[i].groupNum == d.group){
                  return selectedInfo[i].color
                }
              }
            })
            .attr("stroke", "black")

        var whiskers = [
          //left whisker, min value
          {
            x1: function(d) { return xScale(d.quartiles[0]) },
            y1: function(d) { return yScale(d.group) },
            x2: function(d) { return xScale(d.quartiles[0]) },
            y2: function(d) { return yScale(d.group) + boxHeight }
          },
          {
            x1: function(d) { return xScale(d.quartiles[2]) },
            y1: function(d) { return yScale(d.group) },
            x2: function(d) { return xScale(d.quartiles[2]) },
            y2: function(d) { return yScale(d.group) + boxHeight }
          },
          {
            x1: function(d) { return xScale(d.quartiles[4]) },
            y1: function(d) { return yScale(d.group) },
            x2: function(d) { return xScale(d.quartiles[4]) },
            y2: function(d) { return yScale(d.group) + boxHeight }
          }
        ]

        for (i = 0; i < whiskers.length; i++){
          var whiskerConfig = whiskers[i];
          var horizontalLine = g.selectAll(".whiskers")
              .data(featureData)
              .enter()
            .append("line")
              .attr("x1", whiskerConfig.x1)
              .attr("y1", whiskerConfig.y1)
              .attr("x2", whiskerConfig.x2)
              .attr("y2", whiskerConfig.y2)
              .attr("stroke", "black")
              .attr("stroke-width", 1)
        }
      })
    }

  var modifySelectedInfo = function(selectedInfo, boxPlotData){

    /*var colors = []
    selectedInfo.forEach(function(info, i){
      var colorIndex = settings.allClassNames.indexOf("class" + info["actualClass"])
      colors.push(settings.colorRange[colorIndex])
    })
    //console.log(colors)*/

    selectedInfo.forEach(function(d, i){
      d.groupNum = i,
      d.color = colors[i]
    });
    //console.log(selectedInfo)
  }

  this.makeComparison = function(selectedInfo, histogramData, data){
    console.log(selectedInfo)
    //var group1 = filterDataForSelected(data, selectedInfo[0], distanceMeasure)
    //var group2 = filterDataForSelected(data, selectedInfo[1], distanceMeasure)

    var groups = selectedInfo.map(function(info){
      return filterDataForSelected(data, info, distanceMeasure)
    })
    var boxPlotData = constructAllPlotData(groups, dataModel)
    //var sortedboxPlotData = sortPlotData(boxPlotData)
    modifySelectedInfo(selectedInfo, boxPlotData)
    console.log(boxPlotData)
    constructLegend(selectedInfo)
    constructAllBoxPlots(boxPlotData, selectedInfo)
  }

  $("#boxplot-select").change(function(){
    console.log($(this).val())
    var boxplot_classes = ["probability-boxplot-pane","feature-boxplot-pane","similarity-boxplot-pane"]
    for (var i = 0; i < boxplot_classes.length; i++){
      document.getElementsByClassName(boxplot_classes[i])[0].style.display = "none";
    }
    document.getElementsByClassName($(this).val())[0].style.display = "block";
  })

  //makeComparison(selectedInfo, histogramData, dataModel.data)
}
