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
    var sorted = d.sort()
     return [
       d3.quantile(sorted, 0),
       d3.quantile(sorted, 0.25),
       d3.quantile(sorted, 0.5),
       d3.quantile(sorted, 0.75),
       d3.quantile(sorted, 1)
     ];
  }

  var constructPlotData = function(groups, dataModel){
    //[ [{}{}] [{}{}] [{}{}] ]
    var allData = []
    dataModel.probColumns.forEach(function(d){
      allData.push([])
    })

    //for (i = 0; i < dataModel.numClasses; i++){
    dataModel.probColumns.forEach(function(probColumn, j){
      groups.forEach(function(group, i){
        allData[j].push({
          group: i,
          name: probColumn,//dataModel.probColumns[i],
          quartiles: boxQuartiles(group.map(function(d){ //need to sort
            return d[probColumn]//d[dataModel.probColumns[i]]
          }))
        })
      })
    })
    console.log(allData)
    return allData
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

  function constructBoxPlots(boxPlotData){
    //[ [{}{}] [{}{}] [{}{}] ]
    boxPlotData.forEach(function(pairOfData){
      var title = pairOfData[0].name
      // get the min and max from each
      xScaleMin = d3.min(pairOfData[0].quartiles.concat(pairOfData[1].quartiles))
      xScaleMax = d3.max(pairOfData[0].quartiles.concat(pairOfData[1].quartiles))
      console.log(xScaleMin, xScaleMax)
      var xScale = d3.scaleLinear()
      	.domain([xScaleMin, xScaleMax])
        .range([0, plotWidth])

      var xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".2f"))

      var yScale = d3.scalePoint()
        .domain([pairOfData[0].group, pairOfData[1].group])
        .rangeRound([0, plotHeight - boxHeight])

      // setup svg and group that will contain the box plot
      var svg = d3.select(".probability-boxplot-pane")
        .append("svg")
          .attr("width", totalWidth)
          .attr("height", totalHeight)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

      svg.append("text")
          .attr("class", "title")
          .attr("x", totalWidth/2 )
          .attr("y", titleHeight/2 )
          .attr("textLength", 40)
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
            console.log(d.quartiles[3] - d.quartiles[1], xScale(d.quartiles[3]) - xScale(d.quartiles[1]))
            return xScale(d.quartiles[3]) - xScale(d.quartiles[1]);
          })
          .attr("height", boxHeight)
          .attr("x", function(d){
          	return xScale(d.quartiles[1]); //box starts at 1/4 quartile
          })
          .attr("y", function(d){
          	return yScale(d.group)
          })
          .attr("fill", "red")
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

  var makeComparison = function(selectedInfo, histogramData, data){
    var group1 = filterDataForSelected(data, selectedInfo[0])
    var group2 = filterDataForSelected(data, selectedInfo[1])

    var boxPlotData = constructPlotData([group1,group2], dataModel)
    constructBoxPlots(boxPlotData)
  }

  makeComparison(selectedInfo, histogramData, dataModel.data)
})


/*var rects = g.selectAll("rect")
	.data(boxData)
  .enter()
  .append("rect")
  .attr("width", function(d){
  	console.log(d.quartile[2] - d.quartile[0])
  	console.log(xScale(2))
    return xScale(d.quartile[2] - d.quartile[0]);
  })
  .attr("height", "50")
  .attr("x", function(d){
  	return xScale(d.quartile[0]);
  })
  .attr("y", function(d){
  	return yScale(d.num)
  })
  .attr("fill", "red")
  .attr("stroke", "black")

  var vertLine = [
  {
  	x1:function(d) { return xScale(d.min)},
    y1:function(d) { return yScale(d.num) - 25},
    x2:function(d) { return xScale(d.min)},
    y2:function(d) { return yScale(d.num) + 25},
  }
  ]

  var verLin = g.selectAll(".whisker")
  	.data(boxData)
    .enter()
    .append("line")
    .attr("x1", vertLine[0].x1)
    .attr("y1", vertLine[0].y1)
    .attr("x2", vertLine[0].x2)
    .attr("y2", vertLine[0].y2)
    .attr("stroke", "black")
    .attr("stroke-width", 1)*/
