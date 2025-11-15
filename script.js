const contractAddress = 'YOUR_CONTRACT_ADDRESS';
const abi = [ /* Your Contract ABI here */ ];

let web3;
let contract;
let accounts = [];
let messages = [];

// Connect wallet and enable UI
document.getElementById('connectBtn').onclick = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      accounts = await web3.eth.getAccounts();
      document.getElementById('walletAddress').innerText = 'Connected wallet: ' + accounts[0];
      contract = new web3.eth.Contract(abi, contractAddress);

      document.getElementById('sendMsgBtn').disabled = false;
      document.getElementById('sendStatus').innerText = 'Ready to send messages.';
      // On connect, fetch previous messages from backend
      fetchMessagesFromBackend();
    } catch(e) {
      document.getElementById('sendStatus').innerText = 'User denied wallet connection.';
    }
  } else {
    alert('MetaMask required. Please install it.');
  }
};

// Send message button
document.getElementById('sendMsgBtn').onclick = async () => {
  const messageText = document.getElementById('messageInput').value.trim();
  if (!messageText) {
    alert('Please enter a message.');
    return;
  }

  // Example encryption or keep plain for simplicity; implement encryption as needed
  const encryptedMessage = btoa(messageText); // simple base64 encoding here; replace with real encryption if desired

  document.getElementById('sendStatus').innerText = 'Sending message on blockchain...';
  try {
    await contract.methods.sendMessage(encryptedMessage).send({ from: accounts[0] });

    // Save message to backend also
    await saveMessageToBackend({ sender: accounts[0], message: encryptedMessage });

    // Show success & update message list
    document.getElementById('sendStatus').innerText = 'Message sent successfully!';
    document.getElementById('messageInput').value = '';
    messages.unshift({ sender: accounts[0], message: messageText, time: new Date().toLocaleString() });
    renderMessages();
  } catch (err) {
    console.error(err);
    document.getElementById('sendStatus').innerText = 'Failed to send message.';
  }
};

// Function to save message in backend database
async function saveMessageToBackend(messageObj) {
  try {
    const response = await fetch('/api/save-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageObj)
    });
    if (!response.ok) throw new Error('Backend save failed');
  } catch (e) {
    console.warn('Could not save message to backend:', e);
  }
}

// Fetch previous messages from backend when user connects wallet
async function fetchMessagesFromBackend() {
  try {
    const response = await fetch('/api/get-messages');
    if (response.ok) {
      const data = await response.json();
      messages = data.map(m => ({ sender: m.sender, message: atob(m.message), time: m.time }));
      renderMessages();
    }
  } catch (e) {
    console.warn('Could not fetch messages from backend:', e);
  }
}

// Render sent messages UI
function renderMessages() {
  const container = document.getElementById('messagesList');
  container.innerHTML = '';
  if (messages.length === 0) {
    container.innerHTML = '<p>No messages yet.</p>';
    return;
  }
  messages.forEach(m => {
    const div = document.createElement('div');
    div.style.borderBottom = '1px solid #444';
    div.style.padding = '6px 0';
    div.innerHTML = `<strong>From:</strong> ${m.sender}<br><strong>At:</strong> ${m.time}<br><strong>Message:</strong> ${m.message}`;
    container.appendChild(div);
  });
}

// Page navigation function
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// Contact form submission
document.getElementById('contactForm').onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name, email, message})
    });
    if (response.ok) {
      document.getElementById('contactStatus').innerText = 'Message sent! We will contact you soon.';
      e.target.reset();
    } else {
      throw new Error('Failed to send message');
    }
  } catch {
    document.getElementById('contactStatus').innerText = 'Error sending message.';
  }
};

// Report error form submission
document.getElementById('reportForm').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('reportEmail').value.trim();
  const error = document.getElementById('errorDesc').value.trim();

  try {
    const response = await fetch('/api/report-error', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, error})
    });
    if (response.ok) {
      document.getElementById('reportStatus').innerText = 'Error reported! Thank you.';
      e.target.reset();
    } else {
      throw new Error('Failed to report error');
    }
  } catch {
    document.getElementById('reportStatus').innerText = 'Failed to report error.';
  }
};
