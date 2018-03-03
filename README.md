# 395 Senior Projects

### Week 1:
1) Generate data
I used scikit-learn libraries to generate random multi-class and multi-label
datasets with 4 and 8 classes. The datasets were classified using k-neighbors
and random forest classifiers. The features, predicted classes, actual classes,
and predicted probability distributions were saved in separate files. The idea
is to closely model the process and data that machine learning practicians would
gather.

2) Generate csv
The 4 separate files will be used concatenated and formatted with the
generate_csv_file python script. The users will provide the file locations.
The resulting csv file will have columns of probability followed by actual classes,
followed by predicted classes, and lastly feature values. The number of columns
for actual, predicted classes, and probability are the same. For a dataset with
n classes, for the i-th class, the i + xn (where x is 0,1,2) columns relate to
the ith class. 0 in the (i + 1n)-th column indicates its not a predicted class.

### Week 2:
1) Model
I wrote a Model function that stores meta data on the user input dataset.
Information that were saved included the number of classes, class names, the probabilities, actual class, and predicted class columns names. The column names
are needed to process the data and count the number of TP, FP, FN, TNs. More
meta data will be stored in the Model object as I start working on writing
functions to process the data.
