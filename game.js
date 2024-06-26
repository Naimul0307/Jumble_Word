let words = [];
let currentWord = '';
let timerDuration = 30; // Time in seconds
let timerInterval;

// Function to load words from XML file and start the game with a random word
function loadWordsFromXML(filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "application/xml");
            const wordElements = xml.getElementsByTagName("word");
            for (let i = 0; i < wordElements.length; i++) {
                words.push(wordElements[i].textContent.trim());
            }
            // Pick a random word from the list
            const randomIndex = Math.floor(Math.random() * words.length);
            currentWord = words[randomIndex].toUpperCase(); // Convert to uppercase
            words.splice(randomIndex, 1); // Remove selected word from the array
            const jumbledWord = jumbleWord(currentWord);
            displayJumbledWord(jumbledWord);
            displayDroppablePlaces(currentWord.length);
            startTimer(timerDuration);
        })
        .catch(error => {
            console.error('Error loading XML file:', error);
        });
}

// Function to jumble a word
function jumbleWord(word) {
    const shuffled = word.split('').sort(() => 0.5 - Math.random()).join('');
    return shuffled;
}

// Function to start the game
function startGame() {
    if (words.length > 0) {
        // No need to pop from words array here, already selected in loadWordsFromXML
    } else {
        endGame();
    }
}

// Function to display jumbled word
function displayJumbledWord(word) {
    const jumbledWordContainer = document.getElementById('jumbled-word');
    jumbledWordContainer.innerHTML = '';
    word.split('').forEach(letter => {
        const letterElement = document.createElement('div');
        letterElement.className = 'letter';
        letterElement.textContent = letter;
        letterElement.draggable = true;
        letterElement.addEventListener('dragstart', dragStart);
        jumbledWordContainer.appendChild(letterElement);
    });
}

// Function to display droppable places
function displayDroppablePlaces(length) {
    const droppableWordContainer = document.getElementById('droppable-word');
    droppableWordContainer.innerHTML = '';
    for (let i = 0; i < length; i++) {
        const droppableElement = document.createElement('div');
        droppableElement.className = 'droppable';
        droppableElement.addEventListener('dragover', dragOver);
        droppableElement.addEventListener('drop', drop);
        droppableWordContainer.appendChild(droppableElement);
    }
}

// Function to start the timer
function startTimer(duration) {
    let timer = duration;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `Time left: ${timer}s`;
    timerInterval = setInterval(() => {
        timer--;
        timerElement.textContent = `Time left: ${timer}s`;
        if (timer <= 0) {
            clearInterval(timerInterval);
            checkResult(true);
        }
    }, 1000);
}

// Drag and drop functions
function dragStart(event) {
    event.dataTransfer.setData('text', event.target.textContent);
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text');
    event.target.textContent = data;
    event.target.classList.add('filled');
    checkAllPlacesFilled();
}

// Function to check if all places are filled
function checkAllPlacesFilled() {
    const droppableElements = document.querySelectorAll('.droppable');
    for (let element of droppableElements) {
        if (!element.textContent) {
            return;
        }
    }
    clearInterval(timerInterval);
    checkResult(false);
}

// Function to check the result
function checkResult(timeUp) {
    const userWord = Array.from(document.querySelectorAll('.droppable')).map(element => element.textContent.toLowerCase()).join('');

    if (!timeUp && userWord === currentWord.toLowerCase()) {
        document.getElementById('result').textContent = 'Congratulations! You guessed the word correctly!';
    } else if (timeUp) {
        document.getElementById('result').textContent = `Time's up! Better luck next time.`;
    } else {
        document.getElementById('result').textContent = `You Put Wrong Word!`;
    }
}

// Function to end the game
function endGame() {
    document.getElementById('jumbled-word').textContent = 'Game over!';
}

// Load words from XML and start the game with a random word
loadWordsFromXML('words.xml');
