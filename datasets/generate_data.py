from sklearn.datasets import make_classification
from sklearn.datasets import make_multilabel_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn import datasets
import numpy as np

classifier_names = ['k_neighbors', 'random_forest']
classifiers = [KNeighborsClassifier(n_neighbors=3),
               RandomForestClassifier(max_depth=5, n_estimators=5, max_features=1)]
num_classes = [4,8]
features = []
classes = []

features_ml = []
classes_ml = []

for num in num_classes:
    X, y = make_classification(n_samples=100, n_features=10, n_redundant=0, n_repeated=0, n_classes=num, n_clusters_per_class=2, n_informative=4)
    features.append(X)
    classes.append(y)
    np.savetxt('features_' + str(num) + "_classes.csv", X, fmt='%5f', delimiter=',')
    np.savetxt('actual_' + str(num) + "_classes.csv", y, fmt='%i', delimiter=',')

    X_ml, y_ml = make_multilabel_classification(n_samples=100, n_features=10, n_classes=num, n_labels=2, allow_unlabeled=False)
    features_ml.append(X_ml)
    classes_ml.append(y_ml)
    np.savetxt('features_ml_' + str(num) + "_classes.csv", X, fmt='%5f', delimiter=',')
    np.savetxt('actual_ml_' + str(num) + "_classes.csv", y, fmt='%i', delimiter=',')


for name, classifier in zip(classifier_names, classifiers):
    for X, y in zip(features, classes):
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25)
        classifier.fit(X_train, y_train)
        predicted = classifier.predict(X)
        probabilities = classifier.predict_proba(X)
        num_classes = len(probabilities[0])
        np.savetxt("predicted_" + str(num_classes) + "_classes_" + name, predicted, fmt='%i', delimiter=',')
        np.savetxt("proba_" + str(num_classes) + "_classes_" + name, probabilities, fmt='%5f', delimiter=',')

for name, classifier in zip(classifier_names, classifiers):
    for X, y in zip(features_ml, classes_ml):
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25)
        classifier.fit(X_train, y_train)
        predicted = classifier.predict(X)
        probabilities = classifier.predict_proba(X)
        probabilities = [[example[0] for example in class_row] for class_row in probabilities]
        probabilities = np.array(probabilities).transpose()
        print(len(probabilities[0]))
        num_classes = len(probabilities[0])
        np.savetxt("predicted_ml_" + str(num_classes) + "_classes_" + name, predicted, fmt='%i', delimiter=',')
        np.savetxt("proba_ml_" + str(num_classes) + "_classes_" + name, probabilities, fmt='%5f', delimiter=',')

digits = datasets.load_digits()
X_digits, y_digits = digits.data, digits.target