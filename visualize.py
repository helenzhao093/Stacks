from scipy.spatial.distance import sqeuclidean
from scipy.spatial.distance import cosine
from scipy.spatial.distance import minkowski
from scipy.spatial.distance import cityblock
import requests
import webbrowser
import numpy as np
import pandas

baseurl = 'http://127.0.0.1:5000/index'
posturl = 'http://127.0.0.1:5000/receive_data'

def vectorize(y, num_classes):
    y = y.astype(int)
    y = y.tolist()
    #print y
    for example in range(len(y)):
        actual_class = y[example]
        y[example] = [0]*num_classes
        y[example][actual_class] = 1
    return y

def generate_header(num_classes, num_features):
    header = []
    texts = ['prob', 'actual', 'predicted', 'feature']
    distances = ["distance_man", "distance_cosine", "distance_euclidean", "distance_minkowski"]
    for text in texts:
        if text == 'feature':
            for i in range(num_features):
                header.append(text + str(i))
        else:
            for i in range(num_classes):
                header.append(text + str(i))
    for dist in distances:
        header.append(dist)
    return header

def get_distances(X):
    nfeatures = len(X[0])
    man_dist = [cityblock(features, np.zeros(nfeatures)) for features in X]
    cosine_dist = [cosine(features, np.ones(nfeatures)) for features in X]
    euclid_dist = [sqeuclidean(features, np.zeros(nfeatures)) for features in X]
    minkowski_dist = [minkowski(features, np.zeros(nfeatures), 2) for features in X]
    all_dist = np.column_stack((np.column_stack((np.column_stack((man_dist, cosine_dist)), euclid_dist)), minkowski_dist))
    return all_dist

def visualize(X, y, predicted, probabilities, multilabel=False):
    nfeatures = len(X[0])
    nClasses = len(probabilities[0])

    actual_class = y
    predicted_class = predicted

    if not multilabel:
        actual_class = vectorize(actual_class, len(probabilities[0]))
        predicted_class = vectorize(predicted_class, len(probabilities[0]))

    all_dist = get_distances(X)

    data = np.column_stack((np.column_stack((np.column_stack((np.column_stack((probabilities, actual_class)), predicted_class)), X)), all_dist))

    header = generate_header(nClasses, nfeatures)

    df = pandas.DataFrame(data,
                 columns=generate_header(4, 10))

    json_data = df.to_json(orient='records')

    r = requests.post(url=posturl, json=json_data)
    webbrowser.open_new(baseurl)
