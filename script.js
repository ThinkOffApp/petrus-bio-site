document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-animate').forEach(section => {
        observer.observe(section);
    });

    // Fetch publications and calculate total references
    fetchPublications();
});

async function fetchPublications() {
    const refCountEl = document.getElementById('ref-count');
    
    try {
        // We use the Inspire HEP API to search for Petrus Pennanen's literature
        const response = await fetch('https://inspirehep.net/api/literature?q=a+Pennanen,+Petrus&size=100');
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        // Sum up citation_count from all hits
        let totalCitations = 0;
        
        if (data.hits && data.hits.hits) {
            data.hits.hits.forEach(hit => {
                const citations = hit.metadata.citation_count || 0;
                totalCitations += citations;
            });
        }

        // Animate the counter
        animateValue(refCountEl, 0, totalCitations, 2000);

    } catch (error) {
        console.error('Error fetching Inspire HEP data:', error);
        refCountEl.textContent = 'Data unavailable';
    }
}

// Function to animate a number counting up
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // easeOutQuart curve for smooth deceleration
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        obj.innerHTML = Math.floor(easeProgress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end;
        }
    };
    window.requestAnimationFrame(step);
}
