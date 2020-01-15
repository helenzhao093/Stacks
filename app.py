import os, json
from flask import Flask, render_template, request, redirect, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'static/'
ALLOWED_EXTENSIONS = set(['txt', 'csv'])

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
APP_STATIC = os.path.join(APP_ROOT, 'static')

def allowed_file(filename):
    return '.' in filename and \
            filename.rsplit('.',1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/receive_data', methods=['POST'])
def receive_data():
    with open(os.path.join(APP_STATIC, 'uploaded_file.csv'),'w') as outfile:
        #print request.json
        outfile.write(request.json)
    return "/index"
    #return redirect(url_for('uploaded_file', data=request.json))

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit a empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], "uploaded_file.csv"))
            return redirect(url_for('uploaded_file', filename="uploaded_file.csv"))
    return render_template('upload.html')

@app.route("/index")
def uploaded_file():
    return render_template('index.html')

@app.route('/static/<path:path>')
def send_js(path):
    return send_from_directory('static', path)

# do not cache results
@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)