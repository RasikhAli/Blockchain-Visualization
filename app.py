from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

# Initialize blockchain list and ID counter
blockchain = []
next_block_id = 1  # Unique counter for block IDs

# Add a block to the blockchain
def add_block(data):
    global next_block_id
    block = {
        'id': next_block_id,  # Use the unique ID from the counter
        'data': data
    }
    blockchain.append(block)
    next_block_id += 1  # Increment counter for the next block
    return block

# Route to render the main page
@app.route('/')
def index():
    return render_template('index.html')

# Endpoint to add a block
@app.route('/add_block', methods=['POST'])
def add_new_block():
    data = request.json.get('data', 'New Block')
    block = add_block(data)
    socketio.emit('new_block', block)  # Send the new block to clients
    return jsonify(block)

# Endpoint to remove a block by ID
@app.route('/remove_block/<int:block_id>', methods=['POST'])
def remove_block(block_id):
    global blockchain
    # Filter out the block to remove it
    blockchain = [block for block in blockchain if block['id'] != block_id]
    # Notify clients to update their view
    socketio.emit('update_blockchain', blockchain)
    return jsonify({'success': True})

# Endpoint to get the entire blockchain
@app.route('/get_blocks', methods=['GET'])
def get_blocks():
    return jsonify(blockchain)

# Run the app
if __name__ == '__main__':
    socketio.run(app, debug=True)
