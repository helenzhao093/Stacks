function modifyData(dataModel){
    var modData = dataModel.data
    modData.forEach(function(example){
      for (i = 0; i < dataModel.numClasses; i++){
        //console.log(dataModel.actualClasses[i], dataModel.predictedClasses[i])
        if (example[dataModel.actualClasses[i]] == 1){
          if (example[dataModel.predictedClasses[i]] == 1){
            example[dataModel.classNames[i]] = "TP"
          }
          else{
            example[dataModel.classNames[i]] = "FN"
          }
        }
        else{
          if (example[dataModel.predictedClasses[i]] == 0){
            example[dataModel.classNames[i]] = "TN"
          }
          else{
            example[dataModel.classNames[i]] = "FP"
          }
        }
      }
    })
    console.log(modData)
    return modData
}

function DataTable(dataModel, appSettings){

  tableData = modifyData(dataModel)
  console.log(tableData)
  // default check boxes

  var columns = []
  var classColumn = 1
  var actualColumn = 2
  var predictedColumn = 3
  var probColumn = 4
  var columnPerClass = 4
  var classColumns = dataModel.numClasses * 3 + dataModel.numFeatures
  var distanceIndex = 0 //dataModel.numClasses * columnPerClass

  columns.push({data: appSettings.distanceMeasure, title: "distance"})
  for (i = 0; i < dataModel.numClasses; i++){
    columns.push({data: dataModel.classNames[i], title: dataModel.classNames[i]})
    columns.push({data: dataModel.actualClasses[i], type: "num", title: dataModel.actualClasses[i]})
    columns.push({data: dataModel.predictedClasses[i], type: "num", title: dataModel.predictedClasses[i]})
    columns.push({data: dataModel.probColumns[i], type: "num", title: dataModel.probColumns[i]})
  }
  /*for (j = 0; j < dataModel.numFeatures; j++){
    columns.push({data: dataModel.featureColumns[j], title: dataModel.featureColumns[j]})
  }*/
  /*for (i = 0; i < dataModel.numClasses; i++){
    columns.push({data: dataModel.classNames[i], title: dataModel.classNames[i]})
  }*/
  console.log(columns)

  var columnDef = []
  columnDef.push({targets:[distanceIndex], className: "distance-column"})
  for (i = actualColumn; i < dataModel.numClasses * columnPerClass; i = i + columnPerClass){
    columnDef.push({targets:[i], orderData:[i,i+1, i+2]})
  }

  for (i = probColumn; i < dataModel.numClasses * columnPerClass + 1; i = i+columnPerClass){
    columnDef.push({className: 'dt-right prob-column', targets:[i]})
  }

  for (i = classColumn; i < dataModel.numClasses * columnPerClass; i = i+columnPerClass){
    columnDef.push({targets:[i], visible: false})
  }
  columnDef.push({className: 'dt-right', targets: '_all'})

  console.log(columnDef)

  // filtering
  filterDataTable = function(appSettings){
    //console.log(appSettings)
    $.fn.dataTable.ext.search.push( //if they are not matchings then remove them
      function(settings, data, dataIndex) {
        for (i = classColumn; i < dataModel.numClasses * 4; i = i + 4){
          console.log(inRange(data[distanceIndex], appSettings.distanceRange))
          if (inRange(data[i+3], appSettings.probabilityRange) && inRange(data[distanceIndex], appSettings.distanceRange)){ //probability in range
            if (data[i] == "FN"){
              if (appSettings.display.FN){
                return true;
              }
            }
            else if (data[i] == "FP"){
              if (appSettings.display.FP){
                return true;
              }
            }
            else if (data[i] == "TN"){
              if (appSettings.display.TN && appSettings.TNThreshold < data[i+3]){
                return true;
              }
            }
            else { //TP
              if (appSettings.display.TP && appSettings.TPThreshold > data[i+3]){
                return true;
              }
            }
        }
      }
      return false;
    })
  }


  //$(document).ready(function(){
  this.table = $('#datatable').DataTable( {
    "data": tableData,
    "columns": columns,
    "columnDefs": columnDef,
    "pagingType": "numbers"
  })



  var currentClass = ""
  this.table.cells().every( function () {
    var data = this.data();
    if (data == "TN" || data == "TP" || data == "FP" || data == "FN"){
      currentClass = data
    }
    //console.log(this.node().className != "similarity-column sorting_1")
    if (this.node().className != "similarity-column sorting_1"){
      this.node().className = this.node().className + " " + currentClass
    }
  } );

  this.applyFilter = function(settings){
    console.log(settings)
    filterDataTable(settings)
    this.table.draw()
  }

  this.clearFilter = function(numFilter){
    for (i=0; i < numFilter; i++){
      $.fn.dataTable.ext.search.pop()
    }
    this.table.draw()
  }

}
