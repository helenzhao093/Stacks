function DistanceHistogram(dataModel, settings){
  // TP on the left
  // FN on the right with the color of the falsely predicted class

  var getBinNum = function(distance, settings){
    var bin = Math.floor((distance - settings.distanceRange.lower)/
                          ((settings.distanceRange.upperBound - settings.distanceRange.upperBound)/settings.numBins))
    return (bin == 10) ? 9 : bin
  }

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

  this.constructData = function(settings){
    // only adding to the chart if the true class is current class
    var histogramData = initiateData()
    dataModel.data.forEach(function(example){
      var binNum = getBinNum(example[settings[distanceMeasure]], settings)
      dataModel.actualClasses.forEach(function(actualClass, i){
        if (example[dataModel.actualClasses[i]] == 1) {
          if (example[dataModel.predictedClasses[i]] == 1){
            histogramData[i]['data'][binNum]['tp'][0].count += 1
          }else{
            dataModel.predictedClasses.forEach(function(predictedClass, i){
              if (example[dataModel.predictedClass[i]] == 1){
                histogramData[i]['data'][binNum]['fn'][i].count += 1
              }
            })
          }
        }
      })
    }
  }

}
