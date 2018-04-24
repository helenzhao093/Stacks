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

### Week 3:
1) Initialized JS object that will store the data needed to draw histograms
2) Constructed JS object from the input data. Iterates over each example in the
dataset, incrementing the counts for bins of each classification.
3) Constructed SVG of histograms from the JS objects
4) Styled the histogram - TP bars are solid, FP bars are striped, FN bars are
outlined

### Week 4:
1) Use DataTables library to construct data table of dataset
2) Colored the cells of datatable according to classification
3) Styled the datatable
4) Implemented filters for filtering high TPs, low TNs, and probability range
5) Use noUIslider library to create sliders for filters
6) Used materialize library to create switches for filtering classifications
7) Implemented function - when hovering over row of table, draws the path of the
probabilities on the histograms
8) Implemented function - when click row of table, added path to the histograms

To-dos
1) On hover, highlight the table row
2) Leave the last highlighted row highlighted
3) Highlight the rows clicked
4) Legend for classification
5) Fix styling for filters

Additional Features to consider
1) Click on a bar to draw paths of all examples in that bar. Allows users to
see how the probabilities of the examples differ.
2) Change magnitude of paths to be reflective of # of examples in that path.
Allows users to see how the algorithm is predicting similar examples and how the
probabilities of examples differ.
3) Box plots for feature values. Create box-plot for each feature for each
classification for each class.
4) Box plots for TP+FN, TP, FN, TP for each feature for each class. Classes
are tabbed. Columns have box-plots of the same feature. Rows are box-plots for
the same classification. Allows users to see the difference in the range
of feature values for each classification.
5) Click on a FP bar - bring up box-plots to compare ranges of feature value for
FP examples and the true class of those examples.
6) Click on FN bar - bring up box-plots to compare ranges of feature values for
the FN examples and the true class.

### Week 5:
1) Added zoom-in feature for probability range
2) Added similarity measure to datasets
3) Added boxplots
4) Opens new window when two stacks are selected, new window shows box plots of
the probability ranges, feature ranges, and similarity range

TODO:
1) Add tabs
2) Add slider functionality to y axis
3) Dropdown for distance
4) Reorganize sliders

### WEEK 6:
1) Added distance histograms
2) Added probability histograms
3) Added tabs
4) Moved sliders
5) All tab views correspond to each other and to filtering

TODO:
1) Fix sliders: after filtering, moving bars back to max and min positions.
adjust the step size for the sliders.
2) Fix datatable filtering
3) Add slider to distance tab

### WEEK 7:
1) Fixed sliders. After filtering, bars move back to max and min positions
2) Fix filtering in datatables
3) Sorted plots in features tab
4) Adjusted colors

## WEEK 8:
TODO:
1) Make slider fixed on probability distribution tab
2) Add data table tab
3) Add descriptions to tabs
4) Add sub-tabs to features tab
5) Fix sliders for selected distance
6) Make bars solid on probability and distance tabs
7) Don't set limit on number of boxplots to compare
8) Undo button
9) Style datatable, adjust precision

Completed:
1) fixed distance slider
2) fixed path on distribution tab. Path was distorted by the slider div
3) added table tab

## WEEK 9:
TODO:
1) Reorganize table?
2) Filter for examples in the selected bars and remove probability and distance boxplots from feature tab
3) Fix feature button
4) Look to see if we can integrate with scikit-learn
5) Allow users to view boxplots of just one bar
6) Add tooltips


Completed
