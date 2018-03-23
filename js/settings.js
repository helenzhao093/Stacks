function Settings(dataModel){
  var that = this
  // filter settings
  // default thresholds
  this.TNThresholdDefault = 0.1
  this.TNMax = 0.5
  this.TNMin = 0.0

  this.TPThresholdDefault = 0.9
  this.TPMax = 1.0
  this.TPMin = 0.5

  // current thresholds
  this.TNThreshold = 0.1
  this.TPThreshold = 0.9

  this.displayDefault = { TP: true, FP: true, FN: true, TN: false }
  this.display = { TP: true, FP: true, FN: true, TN: false }

  // window settings
  this.totalWidth = 1366

  // graph settings
  this.histogramsWidth = 1240

  //console.log(Array.apply(null, {length:11}).map(Number.call, Number).map(function(num) { return num * 0.1}))
  // axis settings
  this.axisWidth = 40
  this.bins = [9,8,7,6,5,4,3,2,1,0]

  // histogram settings
  this.svgWidth = (this.histogramsWidth - this.axisWidth) / dataModel.numClasses
  this.svgHeight = 400
  this.margin = { top: 20, right: 0, bottom: 20, left: 0 }
  this.histogramHeight = this.svgHeight - this.margin.top - this.margin.bottom
  this.histogramWidth = this.svgWidth - this.margin.left - this.margin.right
  this.textLength = 40
  this.histogramAxisStrokeWidth = 2
  this.yAxisStrokeWidth = 2
  this.fnStrokeWidth = 2

  this.colorRange = ["#d73027","#f46d43","#fdae61","#a6d96a","#66bd63","#1a9850"]
  this.allClassNames = ["class0", "class1", "class2", "class3", "class4", "class5", "class6", "class7"]
  //this.width = 300 - margin.left - margin.right
  //this.height = 400 - margin.top - margin.bottom
  var pathRange = []
  for (i = 0; i < dataModel.numClasses; i++){
    pathRange.push(this.axisWidth + (i+0.5) * this.svgWidth)
  }
  // scale for paths in histograms
  this.xScale = d3.scaleOrdinal()
    .domain(dataModel.classNames)
    .range(pathRange)

  this.yScale = d3.scaleBand()
    .domain(this.bins)
    .rangeRound([0, this.histogramHeight]).padding(0.1)
}
