// Get the result from localStorage
const result = localStorage.getItem('gameResult');

// Set the image source based on the result
const resultImage = document.getElementById('result-image');
if (result === 'correct') {
    resultImage.src = 'background/winner.jpg'; // Updated path
    resultImage.alt = 'Correct!';
} else if (result === 'timeup') {
    resultImage.src = 'background/loser.jpg'; // Updated path
    resultImage.alt = 'Time\'s up!';
} else {
    resultImage.src = 'background/loser 2.jpg'; // Updated path
    resultImage.alt = 'Wrong answer.';
}

// Clear the result from localStorage
localStorage.removeItem('gameResult');

// Redirect to index.html after a delay
setTimeout(() => {
    window.location.href = 'index.html';
}, 6000); // 6000 milliseconds = 6 seconds (adjust delay as needed)
