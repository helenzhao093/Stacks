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
    upperBound: 1.0,
  }

  this.calculateProbabilityRange = function(sliderLower, sliderUpper){
    if (sliderLower != this.probabilityRangeDefault.lowerBound ||
      sliderUpper != this.probabilityRangeDefault.upperBound){
        var range = this.probabilityRange.upperBound - this.probabilityRange.lowerBound
        var newLowerBound = this.probabilityRange.lowerBound + (range * sliderLower)
        var newUpperBound = this.probabilityRange.upperBound - (range * (1 - sliderUpper))
        this.probabilityRange.lowerBound = newLowerBound
        this.probabilityRange.upperBound = newUpperBound
      }
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
  this.margin = { top: 20, right: 5, bottom: 20, left: 5 }
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
  this.colorRange = ["#00649b", "#bc4577", "#ff7e5a", "#b2bae4", "#a97856", "#a3a6af", "#48322e", "#ad8a85"]
  this.allClassNames = ["class0", "class1", "class2", "class3", "class4", "class5", "class6", "class7"]
  //this.width = 300 - margin.left - margin.right
  //this.height = 400 - margin.top - margin.bottom
  var pathRange = []
  for (i = 0; i < dataModel.numClasses; i++){
    pathRange.push(5 + this.axisWidth + (i+0.5) * this.histogramWidth)
  }
  console.log(pathRange)

  /* scales for paths in histograms */
  this.xScalePath = d3.scaleOrdinal()
    .domain(dataModel.classNames)
    .range(pathRange)

  this.yScalePath = d3.scaleBand()
    .domain(this.bins)
    .rangeRound([0, this.histogramHeight]).padding(0.1)


  ////////////
  //DISTANCE HISTOGRAM SETTINGS
  /////////////
  this.distanceMeasures = dataModel.distanceColumns
  this.defaultDistanceMeasure = dataModel.distanceColumns[1]
  this.distanceMeasure = this.defaultDistanceMeasure
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

  this.calculateDistanceMetadata = function() {
    that.distanceMax = d3.max(dataModel.data.map(function(d) {
      //console.log(that.distanceMeasure)
      //console.log(d[that.distanceMeasure])
      return d[that.distanceMeasure];
    }))
    that.distanceMin = d3.min(dataModel.data.map(function(d) {
      return d[that.distanceMeasure];
    }))
    that.distanceRangeDefault.lowerBound = Math.floor(that.distanceMin * 10)/10
    that.distanceRangeDefault.upperBound = Math.ceil(that.distanceMax*10)/10
    that.distanceRange.lowerBound = Math.floor(that.distanceMin * 10)/10
    that.distanceRange.upperBound = Math.ceil(that.distanceMax*10)/10
    this.distanceAxisStep = (this.distanceRange.upperBound - this.distanceRange.lowerBound) / this.numBins
    //console.log(that.distanceRange)
  }


  this.calculateDistanceRange = function(sliderLower, sliderUpper){
    // current range
    var totalRange = this.distanceRangeDefault.upperBound - this.distanceRangeDefault.lowerBound
    var currentRange = this.distanceRange.upperBound - this.distanceRange.lowerBound

    var newUpperBound = this.distanceRange.upperBound - (currentRange * (1 - sliderUpper))
    var newLowerBound = this.distanceRange.lowerBound + (currentRange * sliderLower)
    //var newLowerBound = this.distanceRange.lowerBound + (range * (sliderLower - this.distanceRangeDefault.lowerBound)/totalRange)
    //var newUpperBound = this.distanceRange.upperBound - (range * (this.distanceRangeDefault.upperBound - sliderUpper)/totalRange)
    this.distanceRange.lowerBound = newLowerBound
    this.distanceRange.upperBound = newUpperBound
  }

  this.distanceAxisStep = (this.distanceRange.upperBound - this.distanceRange.lowerBound) / this.numBins
  this.distanceAxisDomain =
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map(function (bin){
      return bin * that.distanceAxisStep + that.distanceRange.lowerBound
    })

  console.log(this)
  console.log(this.distanceAxisDomain)
  this.distanceAxisScale = d3.scalePoint().domain(this.distanceAxisDomain)
      .range([0, this.histogramHeight])
  this.distanceAxis = d3.axisLeft(this.distanceAxisScale).tickFormat(d3.format(".2f"))


  this.default = {
    TPThreshold: this.TPThresholdDefault,
    TNThreshold: this.TNThresholdDefault,
    display: {
      TN: this.displayDefault.TN,
      TP: this.displayDefault.TP,
      FN: this.displayDefault.FN,
      FP: this.displayDefault.FP
    },
    probabilityRange:{
      lowerBound: this.probabilityRangeDefault.lowerBound,
      upperBound: this.probabilityRangeDefault.upperBound
    },
    distanceRange: {
      lowerBound: this.distanceRangeDefault.lowerBound,
      upperBound: this.distanceRangeDefault.upperBound
    },
    distanceMeasure: this.defaultDistanceMeasure
  }


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
