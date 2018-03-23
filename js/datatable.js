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
  $('#tn').prop("checked", appSettings.displayDefault.TN)
  $('#tp').prop("checked", appSettings.displayDefault.TP)
  $('#fn').prop("checked", appSettings.displayDefault.FN)
  $('#fp').prop("checked", appSettings.displayDefault.FP)

  var columns = []
  var classColumn = 0
  var actualColumn = 1
  var predictedColumn = 2
  var probColumn = 3
  var columnPerClass = 4
  var classColumns = dataModel.numClasses * 3 + dataModel.numFeatures

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
  for (i = actualColumn; i < dataModel.numClasses * columnPerClass; i = i + columnPerClass){
    columnDef.push({targets:[i], orderData:[i,i+1, i+2]})
  }

  for (i = probColumn; i < dataModel.numClasses * columnPerClass; i = i+columnPerClass){
    columnDef.push({className: 'dt-right prob-column', targets:[i]})
  }

  for (i = classColumn; i < dataModel.numClasses * columnPerClass; i = i+columnPerClass){
    columnDef.push({targets:[i], visible: false})
  }
  columnDef.push({className: 'dt-right', targets: '_all'})

  console.log(columnDef)

  // filtering
  filterDataTable = function(appSettings){

    $.fn.dataTable.ext.search.push( //if they are not matchings then remove them
      function(settings, data, dataIndex) {
        for (i = 3; i < dataModel.numClasses * 4; i = i + 4){
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
            if (appSettings.display.TN && appSettings.TNThreshold < data[i-1]){
              return true;
            }
          }
          else { //TP
            if (appSettings.display.TP && appSettings.TPThreshold > data[i-1]){
              return true;
            }
          }
        }
        return false;
      }
    )
  }

  //$(document).ready(function(){
  this.table = $('#datatable').DataTable( {
    //"scrollX": true,
    "data": tableData,
    "columns": columns,
    "columnDefs": columnDef
  })

  var currentClass = ""
  this.table.cells().every( function () {
    var data = this.data();
    if (data == "TN" || data == "TP" || data == "FP" || data == "FN"){
      currentClass = data
    }
    //console.log(this.node().className)
    this.node().className = this.node().className + " " + currentClass
  } );

  this.applyFilter = function(settings){
    filterDataTable(settings)
    this.table.draw()
  }

  this.clearFilter = function(){
    $.fn.dataTable.ext.search.pop()
    this.table.draw()
  }

  /*$('#clearFilter').on('click', function(e){
    e.preventDefault();
    $.fn.dataTable.ext.search.pop()
    datatable.table.draw()
  })*/

}