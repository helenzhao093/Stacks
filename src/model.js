/* Stores meta data on the user input dataset*/
function DataModel(data){
  var that = this
  console.log(this)
  this.data = data

  // number of columns
  this.numColumns = data.columns.length
  console.log(this.numColumns)
  // array of feature names
  this.features = []

  // number of features
  this.numFeatures = this.features.length
  console.log(this.numFeatures);

  // array of class names
  this.actualClasses = getColumnNames("actual")
  console.log(this.actualClasses);

  this.numClasses = this.actualClasses.length
  console.log(this.numClasses)
  this.predictedClasses = getColumnNames("predicted")
  console.log(this.predictedClasses)

  this.probColumns = getColumnNames("prob")
  console.log(this.probColumns)

  this.classNames = (function (){


    var classNames = []
    for (i = 0; i < that.numClasses; i++){
      classNames.push("class" + i)
    }
    console.log(classNames)
    return classNames
  })();

  //this.actualClasses.map(actual => "class" + actual.substring(6, 7))
  console.log(this.classNames)

  // returns array with feature names
  function getColumnNames(columnName){
    return that.data.columns.filter(column => column.substring(0, columnName.length) == columnName)
  }

}
