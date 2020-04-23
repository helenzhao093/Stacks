/* Stores meta data on the user input dataset*/
function DataModel(data){
  var that = this

  this.data = data
  this.columns = Object.keys(data[0])

  this.idColumn = getColumnNames("Id");

  // number of columns
  this.numColumns = this.columns.length

  // array of class names
  this.actualClasses = getColumnNames("actual")

  this.numClasses = this.actualClasses.length
  this.predictedClasses = getColumnNames("predicted")

  this.probColumns = getColumnNames("prob")

  this.classNames = (function (){
    var classNames = []
    for (i = 0; i < that.numClasses; i++){
      classNames.push("class" + i)
    }
    return classNames
  })();

  this.distanceColumns = getColumnNames("distance");

  // number of features
  this.featureColumns = this.columns.slice( (this.idColumn.length + this.actualClasses.length + this.predictedClasses.length + this.probColumns.length), (this.numColumns - this.distanceColumns.length) )
  this.numFeatures = this.featureColumns.length;

  // returns array with feature names
  function getColumnNames(columnName){
    return that.columns.filter(column => column.substring(0, columnName.length) == columnName)
  }
}
