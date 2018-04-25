$(document).ready(function(){

  //var graphData = "{{ url_for( 'static', filename='uploaded_file.csv') }}"
  //console.log(graphData)
  // load the dataset
  loadDataset = function(){
    //d3.csv("datasets/multiclass/euclid_similarity_100_random_forest_4_classes_dataset.csv", type, function(error, data) {
    //d3.csv("datasets/multiclass/cosine_similarity_1000_random_forest_4_classes_dataset.csv", type, function(error, data) {
    //d3.csv("datasets/multiclass/dataset100/ranforest_4classes_multidistance_dataset.csv", type, function(error, data) {
    //d3.csv("datasets/multiclass/dataset200RF/ranforest_4classes_multidistance_dataset.csv", type, function(error, data) {
    //d3.csv("datasets/multiclass/dataset200kneigh/k_neighbor_4classes_multidistance_dataset.csv", type, function(error, data) {
    //d3.csv("datasets/iris/iris_svm.csv", type, function(error, data) {
    d3.csv("http://localhost:5000/static/uploaded_file.csv", type, function(error, data){
      console.log(data)
      interface = new Interface(data)
    })
  }

  //convert strings to number
  function type(d) {
    for (var key in d){
      if (key.substring(0, 4) == "prob"){
        d[key] = +Number.parseFloat(d[key]).toFixed(3);
      }
      else if(key.substring(0, 7) == "feature"){
        d[key] = +Number.parseFloat(d[key]).toFixed(5);
      }
      else if(key.substring(0,8) == "distance"){
        d[key] = +Number.parseFloat(d[key]).toFixed(3);
      }
      else{
        d[key] = +d[key]
      }
    }
    return d;
  }

  loadDataset();
});
