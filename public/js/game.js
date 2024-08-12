// Global variables
let questions = [];
let currentQuestion = {};
let timerDuration = 600; // Time in seconds
let timerInterval;

// Maximum number of .letter-box and .droppable elements to show
const maxElements = 15;

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

function displayJumbledLetters(jumbledAnswer) {
    const jumbledLettersContainer = document.getElementById('jumbled-letters');
    jumbledLettersContainer.innerHTML = ''; // Clear previous content

    // Only show up to maxElements number of letters
    for (let i = 0; i < Math.min(jumbledAnswer.length, maxElements); i++) {
        const draggableElement = document.createElement('div');
        draggableElement.className = 'draggable letter-box'; // Apply the letter-box class
        draggableElement.textContent = jumbledAnswer[i];
        draggableElement.draggable = true;
        draggableElement.addEventListener('dragstart', dragStart);

        // Touch event listeners
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
    for (let i = 0; i < Math.min(length, maxElements); i++) {
        const droppableElement = document.createElement('div');
        droppableElement.className = 'droppable';
        droppableElement.addEventListener('dragover', dragOver);
        droppableElement.addEventListener('drop', drop);
        
        // Touch event listeners
        droppableElement.addEventListener('touchstart', touchOver);
        droppableElement.addEventListener('touchend', touchDrop);

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
    const target = event.target;

    // Check if the droppable area already contains a letter
    if (target.textContent.trim() !== '') {
        // If it contains a letter, swap it with the dragged letter
        const existingLetter = target.textContent.trim();
        target.textContent = data;

        // Find the corresponding draggable letter element and restore it
        const jumbledLetters = document.querySelectorAll('.draggable');
        for (let letter of jumbledLetters) {
            if (letter.textContent === data) {
                letter.textContent = existingLetter;
                break;
            }
        }
    } else {
        // If it does not contain a letter, place the dragged letter
        target.textContent = data;
        target.classList.add('filled');
        
        // Remove the corresponding jumbled letter
        const jumbledLetters = document.querySelectorAll('.draggable');
        for (let letter of jumbledLetters) {
            if (letter.textContent === data) {
                letter.remove();
                break;
            }
        }
    }
    
    checkAllPlacesFilled();
}

// Function to handle touch start
function touchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const draggableElement = event.target;
    draggableElement.style.position = 'absolute';
    draggableElement.style.zIndex = 1000;
    draggableElement.style.left = `${touch.pageX - draggableElement.offsetWidth / 2}px`;
    draggableElement.style.top = `${touch.pageY - draggableElement.offsetHeight / 2}px`;

    // Store the original position of the draggable element
    draggableElement.dataset.originalLeft = draggableElement.style.left;
    draggableElement.dataset.originalTop = draggableElement.style.top;
}

// Function to handle touch move
function touchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const draggableElement = event.target;
    draggableElement.style.left = `${touch.pageX - draggableElement.offsetWidth / 2}px`;
    draggableElement.style.top = `${touch.pageY - draggableElement.offsetHeight / 2}px`;
}

// Function to handle touch end
function touchEnd(event) {
    event.preventDefault();
    const draggableElement = event.target;
    draggableElement.style.position = 'static';
    
    const dropTarget = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    if (dropTarget && dropTarget.classList.contains('droppable')) {
        const data = draggableElement.textContent;
        
        // Check if the droppable area already contains a letter
        if (dropTarget.textContent.trim() !== '') {
            // Move the existing letter back to jumbled letters container
            const letterToMoveBack = document.createElement('div');
            letterToMoveBack.className = 'draggable letter-box';
            letterToMoveBack.textContent = dropTarget.textContent;
            letterToMoveBack.draggable = true;
            letterToMoveBack.addEventListener('dragstart', dragStart);
            
            // Add touch event listeners
            letterToMoveBack.addEventListener('touchstart', touchStart);
            letterToMoveBack.addEventListener('touchmove', touchMove);
            letterToMoveBack.addEventListener('touchend', touchEnd);
            
            document.getElementById('jumbled-letters').appendChild(letterToMoveBack);
            
            dropTarget.textContent = '';
            dropTarget.classList.remove('filled');
        }
        
        // Place the letter in the droppable area
        dropTarget.textContent = data;
        dropTarget.classList.add('filled');
        draggableElement.remove();
        checkAllPlacesFilled();
    } else {
        // If not dropped on a valid target, return to the original position
        draggableElement.style.left = draggableElement.dataset.originalLeft;
        draggableElement.style.top = draggableElement.dataset.originalTop;
    }
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

// Additional touch event handlers
function touchOver(event) {
    event.preventDefault();
}

function touchDrop(event) {
    event.preventDefault();
}
