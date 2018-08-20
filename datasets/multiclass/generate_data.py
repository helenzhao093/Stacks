from sklearn.datasets import make_classification
from sklearn.datasets import make_multilabel_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn import datasets
import numpy as np

classifier_names = ['k_neighbor', 'random_forest']
classifiers = [KNeighborsClassifier(n_neighbors=3),
               RandomForestClassifier(max_depth=5, n_estimators=5, max_features=1),
               SVC(probability=True)]
num_classes = [4,8]
features = []
classes = []

features_ml = []
classes_ml = []

def generate_multiclass_dataset(num_classes):
    X, y = make_classification(n_samples=200, n_features=9, n_redundant=0, n_repeated=0, n_classes=num_classes, n_clusters_per_class=2, n_informative=4)
    #features.append(X)
    #classes.append(y)
    np.savetxt('200_features_' + str(num_classes) + "_classes.csv", X, fmt='%5f', delimiter=',')
    np.savetxt('200_actual_' + str(num_classes) + "_classes.csv", y, fmt='%i', delimiter=',')
    return X, y

def  generate_multilabel_dataset(num_classes):
    X_ml, y_ml = make_multilabel_classification(n_samples=1000, n_features=10, n_classes=num_classes, n_labels=2, allow_unlabeled=False)
    #features_ml.append(X_ml)
    #classes_ml.append(y_ml)
    np.savetxt('100_features_ml_' + str(num_classes) + "_classes.csv", X_ml, fmt='%5f', delimiter=',')
    np.savetxt('100_actual_ml_' + str(num_classes) + "_classes.csv", y_ml, fmt='%i', delimiter=',')
    return X_ml, y_ml

def generate_multiclass_predictions(num_classes, classifier, filename):
    X, y = generate_multiclass_dataset(num_classes)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25)
    classifier.fit(X_train, y_train)
    predicted = classifier.predict(X)
    probabilities = classifier.predict_proba(X)
    num_classes = len(probabilities[0])
    np.savetxt("200_predicted_" + str(num_classes) + "_classes_" + filename + ".csv", predicted, fmt='%i', delimiter=',')
    np.savetxt("200_proba_" + str(num_classes) + "_classes_" + filename + ".csv", probabilities, fmt='%5f', delimiter=',')

def generate_multilabel_predictions(num_classes, classifier, filename):
    X, y = generate_multilabel_dataset(num_classes)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25)
    classifier.fit(X_train, y_train)
    predicted = classifier.predict(X)
    probabilities = classifier.predict_proba(X)
    probabilities = [[example[0] for example in class_row] for class_row in probabilities]
    probabilities = np.array(probabilities).transpose()
    print(len(probabilities[0]))
    num_classes = len(probabilities[0])
    np.savetxt("predicted_ml_" + str(num_classes) + "_classes_" + filename + ".csv", predicted, fmt='%i', delimiter=',')
    np.savetxt("proba_ml_" + str(num_classes) + "_classes_" + filename + ".csv", probabilities, fmt='%5f', delimiter=',')

generate_multiclass_predictions(4, classifiers[1], 'random_forest')

#digits = datasets.load_digits()
#X_digits, y_digits = digits.data, digits.target
