document.addEventListener('DOMContentLoaded', function() {
    // Get the result from localStorage
    const result = localStorage.getItem('gameResult');

    // Set the background image based on the result
    const resultContainer = document.querySelector('.result-container');
    if (result === 'correct') {
        resultContainer.style.backgroundImage = 'url("background/winner.jpg")'; // Updated path
    } else if (result === 'timeup') {
        resultContainer.style.backgroundImage = 'url("background/loser.jpg")'; // Updated path
    } else {
        resultContainer.style.backgroundImage = 'url("background/loser2.jpg")'; // Updated path
    }

    // Redirect to index.html after a delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 6000); // 6000 milliseconds = 6 seconds (adjust delay as needed)
});
