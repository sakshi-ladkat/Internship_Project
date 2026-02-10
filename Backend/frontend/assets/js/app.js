document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadFooter();

    console.log('App initialized');

    // Example: common functionality
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            console.log('Link clicked');
        });
    });
});
