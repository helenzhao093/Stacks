// Stacked Histogram Function
// parameters: the data model and current settings
// creates all the data variable

//VARIABLES
// histogram data - variable that stores the histogram data
// class names
// x scale
// y scale
// width
// height
// margin

//tooltips for bars - http://bl.ocks.org/Caged/6476579

//FUNCTIONS

// prepare histogram data: count the number for TP, TN, FN, FP in each bin
// var histogramData: array of individual classes and counts
  /* { name: classname
      data:
       [ { bin:1, TP: 4, FP: 5, TN: 9, FP: 10 },
       ...
        { bin:10, TP: 4, FP: 5, TN: 9, FP: 10 }
      ]
    }
  } */

function Histogram(dataModel){

  //data
  this.data = dataModel.data
  this.numClasses = dataModel.numClasses
  this.classNames = dataModel.classNames
  this.actualClasses = dataModel.actualClasses
  this.predictedClasses = dataModel.predictedClasses
  this.probColumns = dataModel.probColumns
  this.histogramData = []
  this.max = { rightGraph: 0, leftGraph: 0 };

  //svg information
  var margin = { top: 20, right: 20, bottom: 20, left: 20 }

  this.initHistogramData = function(classNames){
    bins = []
    for (i = 1; i <= 10; i++){
      bins.push({bin: i , TP: 0, TN: 0, FN: 0, FP: 0})
    }

    this.histogramData = classNames.map(function(className){
      return {className: className, data: bins}
    })
    //console.log(data)
  }

  this.getBinNum = function(prob){
    //prob max / number of bins
    var bin = Math.floor(prob/0.1)
    return (bin == 10) ?  9 : bin
  }

  this.constructData = function(data){
    numClasses = this.numClasses
    probColumns = this.probColumns
    getBinNum = this.getBinNum
    actualClasses = this.actualClasses
    predictedClasses = this.predictedClasses
    histogramData = this.histogramData

    for (example = 0; example < data.length; example++){
      for (classNum = 0; classNum < numClasses; classNum++){
        binNum = getBinNum(data[example][probColumns[classNum]])
        //console.log(row[probColumns[classNum]])
        //console.log(binNum)
        if (data[example][actualClasses[classNum]] == 1){
          if (data[example][predictedClasses[classNum]] == 1){
            histogramData[classNum]["data"][binNum].TP += 1;
          }
          else{
            histogramData[classNum]["data"][binNum].FN += 1;
          }
        }
        else{
          if (data[example][predictedClasses[classNum]] == 1){
            histogramData[classNum]["data"][binNum].FP += 1;
          }
          else{
            histogramData[classNum]["data"][binNum].TN += 1;
          }
        }
      }
    };

    countsMaxLeft = []
    countsMaxRight = []
    histogramData.forEach(function(data){
      console.log(data)
      countsMaxLeft.push(d3.max(data["data"], function(d){
        return d["TP"] + d["FP"]
      }))
      countsMaxRight.push(d3.max(data["data"], function(d){
        return d["FN"] + d["TN"]
      }))
    })
    this.max.leftGraph = d3.max(countsMaxLeft)
    this.max.rightGraph = d3.max(countsMaxRight)

    console.log(this.max.leftGraph)
  }

  this.initHistogramData(this.classNames)
  this.constructData(this.data)
  console.log(this.histogramData)

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

  }

  this.constructHistogram()

}
