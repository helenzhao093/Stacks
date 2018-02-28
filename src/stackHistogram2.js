getBinNum = function(prob){
  var bin = Math.floor(prob/0.1)
  return (bin == 10) ? 9 : bin
}

function Histogram(dataModel){
  var positive = 0, negative = 1;
  var margin = { top: 20, right: 20, bottom: 20, left: 20 }
  this.data = dataModel.data
  this.probColumns = dataModel.probColumns

  this.histogramData = []
  this.max = {negative: 0, positive: 0}

  //this.max.Left =

  this.constructData = function(){
    console.log(this)
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
    var svg = d3.select('body').append("svg")
        .selectAll('.svg-histogram')
        .data(this.histogramData)
        .enter().append("svg")
        .attr("class", "svg-histogram")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.right + ")")

    var rows = svg.selectAll(".row")
        .data(this.histogramData)
      .enter().append("g")
        .attr("class", "bar")
  }

  this.constructData()
  console.log(this.histogramData)
  this.max.negative = this.findMax(negative)
  this.max.positive = this.findMax(positive)
  this.constructHistogram()
}
