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
  /* { class0:
        { bin: 1,
          postive: { class0: 5, class1: 10, class2: 10 ... }
          negative: { class0: 5, class1: 10, class2: 10 ... }
        }
       ...
       { bin: 10,
         postive: { class0: 5, class1: 10, class2: 10 ... }
         negative: { class0: 5, class1: 10, class2: 10 ... }
       }
      ]
    }

    { name: classname
        data:
         [ { bin:1, TP: 4, FP: 5, TN: 9, FP: 10 }
         ...
          { bin:10, TP: 4, FP: 5, TN: 9, FP: 10 }
        ]
      }
  } */

function Histogram(dataModel){
  //data
  console.log(this)
  var that = this
  this.data = dataModel.data
  this.numClasses = dataModel.numClasses
  this.classNames = dataModel.classNames
  this.actualClasses = dataModel.actualClasses
  this.predictedClasses = dataModel.predictedClasses
  this.probColumns = dataModel.probColumns

  this.max = { rightGraph: 0, leftGraph: 0 };

  var margin = { top: 20, right: 20, bottom: 20, left: 20 }

  // initialize the histogram data variable
  this.histogramData = (function(){
    classNames = that.classNames
    /*bins = []
    for (i = 1; i <= 10; i++){
      bins.push({bin: i , TP: 0, TN: 0, FN: 0, FP: 0})
    }

    this.histogramData = classNames.map(function(className){
      return {className: className, data: bins}
    })*/

    /*data = []
    binData = {}
    classNames.map(function(className) {
      binData[className] = 0
    })*/
    /*
    var classification = []
    classNames.forEach(function(d){
      classification.push(0);
    })

    bin = []
    classification.forEach(function(d){
      bin.push(classification)
    })

    bins = []
    for (i = 0; i < 10; i++){
      bins.push(bin)
    }

    return classNames.map(function(className){
      return bins
    })*/

    //console.log(this.histogramData)
  })();

  console.log(this.histogramData)

  this.getBinNum = function(prob){
    //prob max / number of bins
    var bin = Math.floor(prob/0.1)
    return (bin == 10) ?  9 : bin
  }

  this.constructData = function(){
    var that = this
    numClasses = this.numClasses
    probColumns = this.probColumns
    getBinNum = this.getBinNum
    actualClasses = this.actualClasses
    predictedClasses = this.predictedClasses
    classNames = this.classNames
    //histogramData = this.histogramData
    positive = 0
    negative = 1
    console.log(this.histogramData)

    this.data.forEach(function(example){
      //console.log(data[example])
      // index of actual and predicted classes
      var actual = []
      var predicted = []
      console.log(this)
      console.log(numClasses)
      for (classNum = 0; classNum < numClasses; classNum++){
        if (example[actualClasses[classNum]] == 1) {
          actual.push(classNum)
        }
        if (example[predictedClasses[classNum]] == 1){
          predicted.push(classNum)
        }
      }

      /*
      that.classNames.forEach(function(name){
        binNum = that.getBinNum(example[])
      }*/

      for (classNum = 0; classNum < numClasses; classNum++) {
        binNum = that.getBinNum(example[probColumns[classNum]])


        if (actual.includes(classNum) && predicted.includes(classNum)) { //TP
          histogramData[classNum][binNum][positive][classNum] += 1
        }
        else if(actual.includes(classNum) && !predicted.includes(classNum)){ //FN
          predicted.forEach(function(d){
            histogramData[classNum][binNum][negative][predicted[0]] += 1
          });
        }
        else if(!actual.includes(classNum) && predicted.includes(classNum)){ //FP
          actual.forEach(function(d){
            histogramData[classNum][binNum][positive][actual[0]] += 1
          });
        }
        else {
          histogramData[classNum][binNum][negative][classNum] += 1
        }
      }
    });
    //console.log(histogramData)

        //console.log(row[probColumns[classNum]])
        //console.log(binNum)
        // if actuali == predictedi == 1 -> histogram[classi][postive][classi]++ (TP)
        // if actuali = 1 and predictedi = 0 -> histogram[classi][negative][class where example was predicted = 1]++ (FN)
        // if actuali = 0 and predictedi = 1 -> histogram[classi][postive][classi][actual class of example = 1]++ (FP)
        // if actuali == predictedi == 9 -> histogram[classi][negative][classi]++ (TN)
        /*if (example[actual[classNum]] == 1) {
          console.log(classNames[classNum])
          if (example[actualClasses[classNum]] == 1) {
            histogramData[classNum]["data"][binNum]["positive"][classNames[classNum]] += 1;
          }
        }
        else {
          histogramData[classNum]["data"][binNum]["negative"][classNames[classNum]] += 1;
        }
      }*/

          /*
          }
          else{
            histogramData[actualClasses[classNum]]["data"][binNum]["positive"][classNum] += 1;
          }
        }
        else{
          if (example[predictedClasses[classNum]] == 1){
            histogramData[classNum]["data"][binNum]["negative"][classNum] += 1;
          }
          else{
            histogramData[classNum]["data"][binNum].TN += 1;
          }
        }
      }*/
    //console.log(histogramData)
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

  //this.constructData(this.data)
  //console.log(this.histogramData)

  // create the svg for the histograms
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
  this.constructData()
  this.constructHistogram()

}
