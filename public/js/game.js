// Global variables
let questions = [];
let currentQuestion = {};
let timerDuration = 30; // Time in seconds
let timerInterval;
let touchElement = null; // Track the currently touched element

// Function to load questions from XML file and start the game with a random question
function loadQuestionsFromXML(filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "application/xml");
            const questionElements = xml.getElementsByTagName("question");
            for (let i = 0; i < questionElements.length; i++) {
                const questionText = questionElements[i].getElementsByTagName("text")[0].textContent.trim();
                const answerText = questionElements[i].getElementsByTagName("answer")[0].textContent.trim();
                questions.push({ question: questionText, answer: answerText });
            }
            startGame();
        })
        .catch(error => {
            console.error('Error loading XML file:', error);
        });
}

// Function to start the game
function startGame() {
    if (questions.length > 0) {
        const randomIndex = Math.floor(Math.random() * questions.length);
        currentQuestion = questions[randomIndex];
        questions.splice(randomIndex, 1); // Remove selected question from the array
        
        // Display the question text
        displayQuestion(currentQuestion.question);
        
        // Jumble the answer's letters and display them as draggable items
        const jumbledAnswer = jumbleAnswerLetters(currentQuestion.answer);
        displayJumbledLetters(jumbledAnswer);
        
        // Display droppable places for answer letters
        displayDroppablePlaces(currentQuestion.answer.length);
        
        // Start the timer
        startTimer(timerDuration);
    } else {
        endGame();
    }
}

// Function to jumble the answer's letters
function jumbleAnswerLetters(answer) {
    const answerLetters = answer.split('');
    const shuffledLetters = answerLetters.sort(() => Math.random() - 0.5);
    return shuffledLetters.join('');
}

// Function to display the question
function displayQuestion(question) {
    const questionContainer = document.getElementById('question');
    questionContainer.textContent = question;
}

// Function to display jumbled answer letters as draggable items
function displayJumbledLetters(jumbledAnswer) {
    const jumbledLettersContainer = document.getElementById('jumbled-letters');
    jumbledLettersContainer.innerHTML = ''; // Clear previous content

    for (let letter of jumbledAnswer) {
        const draggableElement = document.createElement('div');
        draggableElement.className = 'draggable letter-box'; // Apply the letter-box class
        draggableElement.textContent = letter;
        draggableElement.draggable = true;

        // Mouse events for dragging
        draggableElement.addEventListener('dragstart', dragStart);

        // Touch events for dragging
        draggableElement.addEventListener('touchstart', touchStart);
        draggableElement.addEventListener('touchmove', touchMove);
        draggableElement.addEventListener('touchend', touchEnd);

        jumbledLettersContainer.appendChild(draggableElement);
    }
}

// Function to display droppable places for answer letters
function displayDroppablePlaces(length) {
    const droppableWordContainer = document.getElementById('droppable-word');
    droppableWordContainer.innerHTML = '';
    for (let i = 0; i < length; i++) {
        const droppableElement = document.createElement('div');
        droppableElement.className = 'droppable';

        // Mouse events for dropping
        droppableElement.addEventListener('dragover', dragOver);
        droppableElement.addEventListener('drop', drop);

        // Touch events for dropping
        droppableElement.addEventListener('touchend', touchEnd);

        droppableWordContainer.appendChild(droppableElement);
    }
}

// Function to start the timer
function startTimer(duration) {
    let timer = duration;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `${timer}s`;
    timerInterval = setInterval(() => {
        timer--;
        timerElement.textContent = `${timer}s`;
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
    
    // Clear the droppable element before adding the new content
    event.target.textContent = '';

    // Add the dragged content
    event.target.textContent = data;
    event.target.classList.add('filled');
    
    // Remove the corresponding jumbled letter
    const jumbledLetters = document.querySelectorAll('.draggable');
    for (let letter of jumbledLetters) {
        if (letter.textContent === data) {
            letter.remove();
            break;
        }
    }
    
    checkAllPlacesFilled();
}

// Touch functions
function touchStart(event) {
    event.preventDefault();
    touchElement = event.target;
}

function touchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    
    if (touchElement) {
        touchElement.style.position = 'absolute';
        touchElement.style.left = `${touch.pageX - touchElement.offsetWidth / 2}px`;
        touchElement.style.top = `${touch.pageY - touchElement.offsetHeight / 2}px`;
    }
}

function touchEnd(event) {
    event.preventDefault();
    if (!touchElement) return;
    
    const dropTarget = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    if (dropTarget.classList.contains('droppable') && dropTarget.textContent.trim() === '') {
        dropTarget.textContent = touchElement.textContent;
        dropTarget.classList.add('filled');
        touchElement.remove();
        checkAllPlacesFilled();
    } else {
        touchElement.style.position = '';
        touchElement.style.left = '';
        touchElement.style.top = '';
    }
    
    touchElement = null;
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
    const userAnswer = Array.from(document.querySelectorAll('.droppable')).map(element => element.textContent.toLowerCase()).join('');

    let result = '';

    if (!timeUp && userAnswer === currentQuestion.answer.toLowerCase()) {
        result = 'correct';
    } else if (timeUp) {
        result = 'timeup';
    } else {
        result = 'wrong';
    }

    // Store the result in localStorage
    localStorage.setItem('gameResult', result);

    // Redirect to the result page
    window.location.href = 'result.html';
}

// Function to end the game
function endGame() {
    document.getElementById('question').textContent = 'Game over!';
    checkResult(true); // Trigger result check when game ends due to no more questions
}

// Load questions from XML and start the game with a random question
loadQuestionsFromXML('xml/questions.xml');
