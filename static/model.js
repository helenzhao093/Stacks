/* Stores meta data on the user input dataset*/
function DataModel(data){
  var that = this

  this.data = data
  this.columns = Object.keys(data[0])

  // number of columns
  this.numColumns = this.columns.length
  //console.log(this.numColumns)

  // number of features
  this.featureColumns = getColumnNames("feature")
  this.numFeatures = this.featureColumns.length
  //console.log(this.numFeatures);

  // array of class names
  this.actualClasses = getColumnNames("actual")
  //console.log(this.actualClasses);

  this.numClasses = this.actualClasses.length
  //console.log(this.numClasses)
  this.predictedClasses = getColumnNames("predicted")
  //console.log(this.predictedClasses)

  this.probColumns = getColumnNames("prob")
  //console.log(this.probColumns)

  this.classNames = (function (){
    var classNames = []
    for (i = 0; i < that.numClasses; i++){
      classNames.push("class" + i)
    }
    //console.log(classNames)
    return classNames
  })();

  this.distanceColumns = getColumnNames("distance")
  console.log(this.distanceColumns)

  // returns array with feature names
  function getColumnNames(columnName){
    return that.columns.filter(column => column.substring(0, columnName.length) == columnName)
  }


}
