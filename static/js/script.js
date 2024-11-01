const socket = io();

function renderBlockchain(blockchain) {
    const blockchainDiv = document.getElementById('blockchain');
    blockchainDiv.innerHTML = ''; // Clear existing blocks

    blockchain.forEach((block, index) => {
        // Create a new block div
        const blockDiv = document.createElement('div');
        blockDiv.className = 'block';
        blockDiv.id = `block-${block.id}`;
        blockDiv.innerHTML = `Block ${block.id}`;
        
        // Add tooltip for block data
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = block.data; // Display the block's data
        blockDiv.appendChild(tooltip);

        // Remove button for each block
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerText = 'x';
        removeBtn.onclick = () => removeBlock(block.id);
        blockDiv.appendChild(removeBtn);

        // Append the block to the blockchain div
        blockchainDiv.appendChild(blockDiv);

        // Add a chain link if this is not the last block
        if (index < blockchain.length - 1) {
            const chainLink = document.createElement('div');
            chainLink.className = 'chain-link';
            blockchainDiv.appendChild(chainLink);
        }
    });
}

// Fetch and render initial blockchain state
fetch('/get_blocks')
    .then(response => response.json())
    .then(blockchain => renderBlockchain(blockchain))
    .catch(error => console.error('Error fetching blockchain:', error));

// Add a new block
function addBlock() {
    const dataInput = document.getElementById('dataInput');
    const data = dataInput.value || 'Block Data'; // Default data if input is empty
    fetch('/add_block', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
    });
    dataInput.value = ''; // Clear input field after adding block
}

// Remove a block
function removeBlock(blockId) {
    fetch(`/remove_block/${blockId}`, {
        method: 'POST'
    });
}

// Listen for new blocks from the server
socket.on('new_block', block => {
    fetch('/get_blocks')
        .then(response => response.json())
        .then(blockchain => renderBlockchain(blockchain))
        .catch(error => console.error('Error fetching blockchain:', error));
});

// Listen for blockchain updates (after removal or update)
socket.on('update_blockchain', blockchain => {
    renderBlockchain(blockchain);
});
