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
  var actualColumn = 0
  var predictedColumn = 1
  this.probabilityColumns = []
  this.featureColumns = []

  columns.push({data: "actual", title: "actual"})
  columns.push({data: "predicted", title: "predicted"})

  for (i = 0; i < dataModel.numClasses; i++){
    columns.push({data: dataModel.probColumns[i], type: "num", title: dataModel.probColumns[i]})
    that.probabilityColumns.push(i+2)
  }

  for (j = 0; j < dataModel.numFeatures; j++){
    columns.push({data: dataModel.featureColumns[j], title: dataModel.featureColumns[j]})
    that.featureColumns.push(j+2+dataModel.numClasses)
  }
  console.log(this.featureColumns, this.probabilityColumns)
  var columnDef = []
  columnDef.push({className: 'dt-right predicted-column', targets: [1]})
  columnDef.push({className: 'dt-right', targets: '_all'})

  this.table = $('#datatable').DataTable( {
    "data": tableData,
    "columns": columns,
    "columnDefs": columnDef,
    "pagingType": "numbers",
    "fixedColumns": {
         leftColumns: 2
       }
  })

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
}
