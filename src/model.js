/* Stores meta data on the user input dataset*/
function DataModel(data){
  this.data = data

  // number of columns
  this.numColumns = data.columns.length
  console.log(this.numColumns)

  // array of feature names
  this.features = getColumnNames(this.data, "feature")

  // number of features
  this.numFeatures = this.features.length
  console.log(this.numFeatures);

  // array of class names
  this.actualClasses = getColumnNames(this.data, "actual")
  console.log(this.actualClasses);

  this.numClasses = this.actualClasses.length
  console.log(this.numClasses)
  this.predictedClasses = getColumnNames(this.data, "predicted")

  this.probColumns = getColumnNames(this.data, "prob")

  this.classNames = getClassNames(this.numClasses)
  console.log(this.classNames)
}

// returns array with feature names
function getColumnNames(data, columnName){
  return data.columns.filter(column => column.substring(0, columnName.length) == columnName)
}

function getClassNames(numClasses){
  var classNames = []
  for (i = 0; i < numClasses; i++){
    classNames.push("class" + i)
  }
  return classNames
}
