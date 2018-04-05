function Settings(dataModel){
  var that = this
  // filter settings
  // default thresholds


  this.TNThresholdDefault = 0.1
  this.TNMax = 0.5
  this.TNMin = 0.0
  this.numBins = 10

  this.TPThresholdDefault = 0.9
  this.TPMax = 1.0
  this.TPMin = 0.5
  this.probabilityRangeDefault = { lowerBound: 0.0, upperBound: 1.0 }
  this.probabilityRange = {
    lowerBound: 0.0,
    upperBound: 1.0
  }

  // current thresholds
  this.TNThreshold = 0.1
  this.TPThreshold = 0.9

  this.displayDefault = { TP: true, FP: true, FN: true, TN: false }
  this.display = { TP: true, FP: true, FN: true, TN: false }

  // window settings
  this.totalWidth = 1366

  // graph settings
  this.histogramsWidth = 1240

  // histogram settings
  this.axisWidth = 60
  this.svgWidth = (this.histogramsWidth - this.axisWidth) / dataModel.numClasses
  this.svgHeight = 400
  this.margin = { top: 20, right: 0, bottom: 20, left: 0 }
  this.histogramHeight = this.svgHeight - this.margin.top - this.margin.bottom
  this.histogramWidth = this.svgWidth - this.margin.left - this.margin.right
  this.textLength = 40
  this.histogramAxisStrokeWidth = 2
  this.yAxisStrokeWidth = 2
  this.fnStrokeWidth = 2

  //console.log(Array.apply(null, {length:11}).map(Number.call, Number).map(function(num) { return num * 0.1}))
  // axis settings
  this.bins = [9,8,7,6,5,4,3,2,1,0]
  /*this.axisScale = d3.scaleLinear().domain([1.0,0.0]).range([0,this.histogramHeight]) //fix domain
  var ticks = this.axisScale.ticks(5)
  this.axis = d3.axisLeft(this.axisScale)*/
  this.axisDomain = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0]
  //this.axisRange = this.axisDomain.map(function(d){ return Math.ceil(that.histogramHeight * (that.probabilityRange.upperBound - d)/(that.probabilityRange.upperBound - that.probabilityRange.lowerBound))})

  /*this.axisScale = d3.scaleBand().domain(this.axisDomain)
    .rangeRound([0, this.histogramHeight]).padding(0.0)*/
  this.axisScale = d3.scalePoint().domain(this.axisDomain)
      .range([0, this.histogramHeight])
  this.axis = d3.axisLeft(this.axisScale).tickFormat(d3.format(".2f"))

  //this.colorRange = ["#d73027","#f46d43","#fdae61","#a6d96a","#66bd63","#1a9850"]
  this.colorRange = ["#FE3600", "#DA0049", "#5408A2", "#00AA4F", "#91A738", "#2A5370", "#AE7C3A", "#79286F"]
  this.allClassNames = ["class0", "class1", "class2", "class3", "class4", "class5", "class6", "class7"]
  //this.width = 300 - margin.left - margin.right
  //this.height = 400 - margin.top - margin.bottom
  var pathRange = []
  for (i = 0; i < dataModel.numClasses; i++){
    pathRange.push(this.axisWidth + (i+0.5) * this.svgWidth)
  }

  /* scales for paths in histograms */
  this.xScale = d3.scaleOrdinal()
    .domain(dataModel.classNames)
    .range(pathRange)

  this.yScale = d3.scaleBand()
    .domain(this.bins)
    .rangeRound([0, this.histogramHeight]).padding(0.1)


  ////////////
  //DISTANCE HISTOGRAM SETTINGS
  /////////////
  this.distanceMeasures = ["cosine", "euclidean", "manhattan"]
  this.defaultDistanceMeasure = dataModel.distanceColumns[0]
  this.distanceMeasure = "similarity"//dataModel.distanceColumns[0]
  this.distanceMax = d3.max(dataModel.data.map(function(d) {
    return d[that.distanceMeasure];
  }))
  this.distanceMin = d3.min(dataModel.data.map(function(d) {
    return d[that.distanceMeasure];
  }))
  this.distanceRangeDefault = {
    lowerBound : Math.floor(this.distanceMin * 10)/10,
    upperBound : Math.ceil(this.distanceMax*10)/10
  }
  this.distanceRange = {
    lowerBound : Math.floor(this.distanceMin * 10)/10,
    upperBound : Math.ceil(this.distanceMax*10)/10
  }

  this.calculateDistanceMetadata = function(distanceColumn) {
    this.distanceMax = d3.max(dataModel.data.map(function(d) {
      return d[distanceColumn];
    }))
    this.distanceMin = d3.min(dataModel.data.map(function(d) {
      return d[distanceColumn];
    }))
    this.distanceRange.lowerBound = Math.floor(this.distanceMin * 10)/10
    this.distanceRange.upperBound = Math.ceil(this.distanceMax*10)/10
  }

  this.distanceAxisStep = (this.distanceRange.upperBound - this.distanceRange.lowerBound) / this.numBins
  this.distanceAxisDomain =
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(function (bin){
      return bin * that.distanceAxisStep;
    })
  console.log(this)
  console.log(this.distanceAxisDomain)
  this.distanceAxisScale = d3.scalePoint().domain(this.distanceAxisDomain)
      .range([0, this.histogramHeight])
  this.distanceAxis = d3.axisLeft(this.distanceAxisScale).tickFormat(d3.format(".2f"))

  this.histogramTypes = {
    distance: {
      type: "distance",
      getBinNum: [this.distanceMeasure],
      axis: this.distanceAxis,
      axisScale: this.distanceAxisScale,
      range: this.distanceRange,
      axisDomain: this.distanceAxisDomain
    },
    probability: {
      type: "probability",
      getBinNum: dataModel.probColumns,
      axis: this.axis,
      axisScale: this.axisScale,
      range: this.probabilityRange,
      axisDomain: this.axisDomain
    }
  }

  ////HISTOGRAM CREATE SCALE FUNCTIONS
  this.yScale = d3.scaleBand()
      //.domain(settings.bins)
      .domain([0,1,2,3,4,5,6,7,8,9])
      .rangeRound([0, this.histogramHeight]).padding(0.1)

  this.xScale = function(xDomainScale){
    return d3.scaleLinear()
        .domain([-xDomainScale, xDomainScale]).nice()
        .rangeRound([0, this.histogramWidth])
  }

  this.xScaleCount = function(xDomainScale){
    return d3.scaleLinear()
        .domain([0, xDomainScale*2])
        .rangeRound([0, this.histogramWidth])
  }

  this.color = d3.scaleOrdinal()
      .range(this.colorRange)
      .domain(this.allClassNames)

  this.getAxis = function(axisDomain){
    var axisScale = d3.scalePoint().domain(axisDomain)
        .range([0, this.histogramHeight])
    return d3.axisLeft(axisScale).tickFormat(d3.format(".2f"))
  }

}
