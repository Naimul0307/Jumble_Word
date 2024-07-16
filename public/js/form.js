document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('user-form').addEventListener('submit', function(e) {
        e.preventDefault();
        window.location.href = 'game.html'; // Redirects to game.html upon form submission
    });
});
