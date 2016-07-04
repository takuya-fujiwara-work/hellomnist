import tensorflow as tf, numpy as np

def model() :
    def weight_variable(shape) :
        initial = tf.truncated_normal(shape, stddev=0.1)
        return tf.Variable(initial)
    
    def bias_variable(shape) :
        initial = tf.constant(.1, shape=shape)
        return tf.Variable(initial)
    
    def conv2d(x, W) : 
        return tf.nn.conv2d(x, W, strides=[1, 1, 1, 1], padding='SAME')
    
    def max_pool_2x2(x) :
        return tf.nn.max_pool(x, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')
    
    
    x = tf.placeholder(tf.float32, shape=[None, 784])
    
    W_conv1 = weight_variable([5, 5, 1, 32])
    b_conv1 = bias_variable([32])
    
    x_image = tf.reshape(x, [-1, 28, 28, 1])
    
    h_conv1 = tf.nn.relu(conv2d(x_image, W_conv1) + b_conv1)
    h_pool1 = max_pool_2x2(h_conv1)
    
    W_conv2 = weight_variable([5, 5, 32, 64])
    b_conv2 = bias_variable([64])
    
    h_conv2 = tf.nn.relu(conv2d(h_pool1, W_conv2) + b_conv2)
    h_pool2 = max_pool_2x2(h_conv2)
    
    W_fc1 = weight_variable([7 * 7 * 64, 1024])
    b_fc1 = bias_variable([1024])
    
    h_pool2_flat = tf.reshape(h_pool2, [-1, 7 * 7 * 64])
    h_fc1 = tf.nn.relu(tf.matmul(h_pool2_flat, W_fc1) + b_fc1)
    
    keep_prob = tf.placeholder(tf.float32)
    h_fc1_drop = tf.nn.dropout(h_fc1, keep_prob)
    
    W_fc2 = weight_variable([1024, 10])
    b_fc2 = bias_variable([10])
    
    y_conv = tf.nn.softmax(tf.matmul(h_fc1_drop, W_fc2) + b_fc2)
    
    return x, keep_prob, y_conv, [W_conv1, b_conv1, W_conv2, b_conv2, W_fc1, b_fc1, W_fc2, b_fc1]


x, keep_prob, y_conv, var_list = model()
sess = tf.Session()
saver = tf.train.Saver(var_list)
sess.run(tf.initialize_all_variables())
saver.restore(sess, "model.ckpt")

def recognize(input):
    result = sess.run(y_conv, feed_dict={x: input, keep_prob: 1.0})
    return result.flatten().tolist()

from flask import Flask, render_template, request
import json
app = Flask(__name__)

@app.route('/handwritten')
def hand_written_recognition():
	return render_template('index.html')

@app.route('/recognize',methods=['POST'])
def recognize_api():
    if request.headers['Content-Type'] != 'application/json':
        print(request.headers['Content-Type'])
        return flask.jsonify(res='error'), 400

    a = np.array(request.json, dtype=np.uint8).reshape(1, 784)
    
    if a.size != 784:
        print a.size
        return flask.jsonify(res='error'), 400

    o = recognize(a)
    x = np.argsort(o)[::-1][:3]

    result = {
        "result": x[0],
        "rank": x.tolist(),
        "rate": [float(round(o[i], 3)) for i in x] 
    }

    return json.dumps(result)

@app.route('/emotion')
def emotion_recognition():
	return render_template('index2.html')

@app.route('/emotionapi',methods=['POST'])
def emotion_api():
    if request.headers['Content-Type'] != 'application/json':
        print(request.headers['Content-Type'])
        return flask.jsonify(res='error'), 400

    import random

    emotion = ""
    rand = random.randint(0,1)
    print rand
    if rand == 0:
        emotion = "cry"
    else:
        emotion = "smile"

    result = {
        "result": emotion
    }

    return json.dumps(result)

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0')

