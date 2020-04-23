function modifyData(dataModel){
  var modData = dataModel.data
  modData.forEach(function(ex){
    ex["actual"] = " "
    ex["predicted"] = " "
    for (i = 0; i < dataModel.numClasses; i++){
      if (ex[dataModel.actualClasses[i]] == 1){
        ex["actual"] = ex["actual"] + i + " "
      }
      if (ex[dataModel.predictedClasses[i]] == 1){
        ex["predicted"] = ex["predicted"] + i + " "
      }
    }
  })
  return modData
}

function DataTable(dataModel, appSettings) {
  var that = this
  this.colors = appSettings.colorRange
  tableData = modifyData(dataModel)
  var columns = []
  var idColumn = 0
  var actualColumn = 1
  var predictedColumn = 2
  this.probabilityColumns = []
  this.featureColumns = []
  this.distanceColumns = []

  // initialize columns
  columns.push({data: "Id", title: "Id"})
  columns.push({data: "actual", title: "actual"})
  columns.push({data: "predicted", title: "predicted"})

  for (var i = 0; i < dataModel.numClasses; i++){
    columns.push({data: dataModel.probColumns[i], type: "num", title: dataModel.probColumns[i]})
    that.probabilityColumns.push(i+3)
  }

  for (var j = 0; j < dataModel.numFeatures; j++){
    columns.push({data: dataModel.featureColumns[j], title: dataModel.featureColumns[j]})
    that.featureColumns.push(j + 3 + dataModel.numFeatures)
  }

  /*for (var k = 0; k < dataModel.distanceColumns.length; k++){
    columns.push({data: dataModel.distanceColumns[k], title: dataModel.distanceColumns[k]})
    that.distanceColumns.push(k + 3 + dataModel.numClasses+dataModel.numFeatures)
  }*/

  console.log(this.featureColumns, this.probabilityColumns)

  var columnDef = []
  columnDef.push({className: 'dt-right predicted-column', targets: [2]})
  columnDef.push({className: 'dt-right', targets: '_all'})

  /*var initColumn = 3 + dataModel.numClasses + dataModel.numFeatures
  for (var i = initColumn; i < initColumn + dataModel.distanceColumns.length; i++){
    columnDef.push({targets:[i], visible: false})
  }*/

  columnDef.push({targets: [1], orderData: [0,1]})
  columnDef.push({targets: [2], orderData: [0,1]})

  this.table = $('#datatable').DataTable( {
    "scrollX": true,
    "data": tableData,
    "columns": columns,
    "columnDefs": columnDef,
    "pagingType": "numbers",
    "fixedColumns": {
         leftColumns: 3
       },
    "order": [[1, 'asc'],[2, 'asc']]
  })

  filterSubSet = function(selectedInfo, appSettings){
    $.fn.dataTable.ext.search.push( //if they are not matchings then remove them
      function(settings, data, dataIndex) {
        for (var i = 0; i < selectedInfo.length; i++){
          if (+data[actualColumn] == +selectedInfo[i].actualClass && +data[predictedColumn] == +selectedInfo[i].predictedClass){
            if (selectedInfo[i].distance){
              var index = 1 + dataModel.numFeatures + dataModel.numClasses + appSettings.distanceColumnNum
              if (inRange(data[index], selectedInfo[i].range)){
                return true;
              }
            }
            else{
              if (selectedInfo[i].classification == "TP" || selectedInfo[i].classification == "FN") {
                var index = +data[actualColumn] + actualColumn + 2;
                // map predicted class to proba index 
                console.log(index, data[index], selectedInfo[i].range)
                if (inRange(data[index], selectedInfo[i].range)) {
                  return true;
                }
              } else if (selectedInfo[i].classification == "FP") {
                var index = +data[predictedColumn] + predictedColumn + 1;
                // map predicted class to proba index 
                console.log(index, data[index], selectedInfo[i].range)
                if (inRange(data[index], selectedInfo[i].range)) {
                  return true;
                }
              }
            }
          }
        }
        return false;
      })
  }


  filterSettings = function(appSettings){
    $.fn.dataTable.ext.search.push( //if they are not matchings then remove them
      function(settings, data, dataIndex) {
        if (+data[actualColumn] == +data[predictedColumn]) { // TP
          var probIndex = +data[predictedColumn] + +2
          if (appSettings.display.TP && inRange(data[probIndex], appSettings.probabilityRange) && (appSettings.TPThreshold > data[probIndex]) ){
            return true;
          }
        }
        else {
          var probIndex = +data[predictedColumn] + +2
          if (inRange(data[probIndex], appSettings.probabilityRange) ) {
            if (appSettings.display.FP || appSettings.display.FN){
              return true;
            }
          }
        }
        return false;
    })
  }

  dataModel.predictedClasses.forEach(function(className, i){
    var color = that.colors[i]
    var classNum = className.substring("predicted".length,"predicted".length +1)
    var indexes = that.table.rows().eq( 0 ).filter( function (rowIdx) {
      return that.table.cell( rowIdx, 1 ).data() == +classNum ? true : false;
    });
    //console.log(indexes)
    //console.log(color, i )
    that.table.rows( indexes )
      .nodes()
      .to$()
      .css("background", color)
  })

  $('a.toggle-vis').on('click', function(e){
    e.preventDefault();
    var columnNums
    var columnType = $(this).attr('data-columns');
    console.log(columnType)
    if (columnType == "probability-columns"){
      columnNums = that.probabilityColumns;
    }else{
      columnNums = that.featureColumns;
    }
    console.log(columnNums)
    columnNums.forEach(function(columnNum){
      var col = that.table.column(columnNum)
      col.visible(!col.visible());
    })
  })

  this.filterForSubSet = function(selectedInfo, appSettings){
    console.log(selectedInfo)
    filterSubSet(selectedInfo, appSettings)
    this.table.draw()
  }

  this.filterBySettings = function(appSettings){
    filterSettings(appSettings)
    this.table.draw()
  }

  this.clearFilter = function(numFilter){
    console.log(numFilter)
    for (i=0; i < numFilter; i++){
      $.fn.dataTable.ext.search.pop()
    }
    this.table.draw()
  }

}
