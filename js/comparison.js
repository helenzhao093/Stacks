$(document).ready(function(){
  console.log(dataModel)
  console.log(selectedInfo)
  console.log(settings)
  // boxplot descriptions
  var bottomAxisHeight = 40
  var titleHeight = 30
  var margin = { top: 30, right: 30, bottom: 30, left: 30}
  var boxMargin = { left: 20, top: 5 }
  var plotWidth = 300
  var plotHeight = 100
  var totalWidth = plotWidth + margin.right + margin.left + boxMargin.left
  var totalHeight = plotHeight + margin.top + margin.bottom + boxMargin.top + bottomAxisHeight + titleHeight
  var boxHeight = 30

  var boxQuartiles = function (d) { // d is an array
    var sorted = d.sort(function(a,b){return a - b})
    console.log(sorted)
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
    console.log(data)
    return data
  }

  var constructAllPlotData = function(groups, dataModel){
    return [
      constructPlotData(dataModel.probColumns, groups),
      constructPlotData(dataModel.featureColumns, groups),
      constructPlotData([dataModel.similarity_column], groups)
    ]
  }

  var getBinNum = function(prob){
    var bin = Math.floor((prob - settings.probabilityRange.lowerBound)/
                          ((settings.probabilityRange.upperBound - settings.probabilityRange.lowerBound)/settings.numBins))
    //var bin = Math.floor(prob/0.1)
    return (bin == 10) ? 9 : bin
  }

  var filterDataForSelected = function(data, selectedInfo, settings){
    var svgClass = ""
    if (selectedInfo.classification == "TP" || selectedInfo.classification == "FP"){
      svgClass = "predictedClass"
    } //if TP and FP used prob of predictedclass  (FN used probability of the class that it was pred)
    else{
      svgClass = "actualClass"
    }
    var filtered = data.filter(example => example["actual" + selectedInfo["actualClass"]] == 1)
      .filter(example => example["predicted" + selectedInfo["predictedClass"]] == 1)
      .filter(example => getBinNum(example["prob" + selectedInfo[svgClass]]) == selectedInfo["binNum"])

    console.log(filtered)
    return filtered
  }
  //legend
  var legendWidth = 300
  var legendHeight = 60
  var legendMargin = {top: 10, left: 20}
  var legendBoxHeight = 20
  var legendRowHeight = 25
  function constructLegend(info){
    var svg = d3.select(".legend")
      .append("svg")
      .attr("width", legendWidth)
      .attr("height", legendHeight)

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
        .text("actual:" + info[i].actualClass + "; predicted:" + info[i].predictedClass +  "; bin:" + info[i].binNum)
    }
  }

  function constructAllBoxPlots(allPlotData, selectedInfo){
    constructBoxPlots(allPlotData[0], selectedInfo, ".probability-boxplot-pane")
    constructBoxPlots(allPlotData[1], selectedInfo, ".feature-boxplot-pane")
    constructBoxPlots(allPlotData[2], selectedInfo, ".similarity-boxplot-pane")
  }

  function constructBoxPlots(boxPlotData, selectedInfo, divClassName){
    //[ [{}{}] [{}{}] [{}{}] ]
    //var divClassNames = [".probability-boxplot-pane", ".feature-boxplot-pane", ".similarity-boxplot-pane"]
      boxPlotData.forEach(function(pairOfData){
        var title = pairOfData[0].name

        // get the min and max from each
        xScaleMin = d3.min(pairOfData[0].quartiles.concat(pairOfData[1].quartiles))
        xScaleMax = d3.max(pairOfData[0].quartiles.concat(pairOfData[1].quartiles))
        //console.log(xScaleMin, xScaleMax)
        var xScale = d3.scaleLinear()
        	.domain([xScaleMin, xScaleMax])
          .range([0, plotWidth])

        var xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".2f"))

        var yScale = d3.scalePoint()
          .domain([pairOfData[0].group, pairOfData[1].group])
          .rangeRound([0, plotHeight - boxHeight])

        // setup svg and group that will contain the box plot
        console.log(divClassName)
        var svg = d3.select(divClassName)
          .append("svg")
            .attr("width", totalWidth)
            .attr("height", totalHeight)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        svg.append("text")
            .attr("class", "title")
            .attr("x", plotWidth/2 )
            .attr("y", titleHeight/2 )
            .attr("textLength", 50)
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
            .data(pairOfData)
            .enter()
          .append("line")
            .attr("x1", function(d){
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
            .data(pairOfData)
            .enter()
          .append("rect")
            .attr("width", function(d){
            	//console.log(d.quartile[2] - d.quartile[0])
            	//console.log(xScale(2))
              console.log(d.quartiles)
              console.log(Math.abs(d.quartiles[3]) - d.quartiles[1], xScale(d.quartiles[3]) - xScale(d.quartiles[1]))
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
              .data(pairOfData)
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

    var colors = []
    selectedInfo.forEach(function(info, i){
      var colorIndex = settings.allClassNames.indexOf("class" + info["actualClass"])
      colors.push(settings.colorRange[colorIndex])
    })
    console.log(colors)

    selectedInfo.forEach(function(d, i){
      d.groupNum = i,
      d.color = colors[i]
    });
    console.log(selectedInfo)
  }

  var makeComparison = function(selectedInfo, histogramData, data){
    var group1 = filterDataForSelected(data, selectedInfo[0])
    var group2 = filterDataForSelected(data, selectedInfo[1])

    var boxPlotData = constructAllPlotData([group1,group2], dataModel)

    modifySelectedInfo(selectedInfo, boxPlotData)
    constructLegend(selectedInfo)
    constructAllBoxPlots(boxPlotData, selectedInfo)
  }

  makeComparison(selectedInfo, histogramData, dataModel.data)
})
