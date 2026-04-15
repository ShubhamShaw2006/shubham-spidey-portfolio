/*
  ==============================================
  Project: Comic-Accurate Spider-Man Portfolio
  Author: Shubham Shaw
  Description: Custom built high-performance responsive portfolio.
  ==============================================
*/
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. THWIP! Click Interaction ---
    function triggerThwip(x, y) {
        const thwip = document.createElement('div');
        thwip.classList.add('thwip-text');
        
        const words = ["THWIP!", "THWACK!", "ZAP!", "SPLAT!"];
        thwip.innerText = words[Math.floor(Math.random() * words.length)];
        thwip.style.left = x + 'px';
        thwip.style.top = y + 'px';
        
        const rot = (Math.random() - 0.5) * 60;
        document.body.appendChild(thwip);
        
        requestAnimationFrame(() => {
            thwip.style.opacity = '1';
            thwip.style.transform = `translate(-50%, -50%) scale(1.5) rotate(${rot}deg)`;
            setTimeout(() => {
                thwip.style.opacity = '0';
                thwip.style.transform = `translate(-50%, -50%) scale(0.5) rotate(${rot}deg)`;
                setTimeout(() => thwip.remove(), 300);
            }, 300);
        });
    }

    // --- 2. Advanced Procedural Canvas (Point-to-Point Web Shooter) ---
    const canvas = document.getElementById('fx-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Web Objects Array
    const activeWebs = [];
    let currentWeb = null;

    // Helper: Draw a Comic-Accurate Spider Web Splat (Radial + Concentric arcs)
    function drawWebSplat(x, y, radius, opacity) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#000000'; // Comic black outline vibe

        const arms = 8;
        // Radial arms
        for(let i=0; i<arms; i++) {
            let angle = (i/arms) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle)*radius, y + Math.sin(angle)*radius);
            ctx.stroke();
        }

        // Concentric sagging rings
        for(let r=radius*0.3; r<=radius; r+=radius*0.3) {
            ctx.beginPath();
            for(let i=0; i<=arms; i++) {
                let angle = (i/arms) * Math.PI * 2;
                let px = x + Math.cos(angle)*r;
                let py = y + Math.sin(angle)*r;
                if(i===0) {
                    ctx.moveTo(px, py);
                } else {
                    let prevAngle = ((i-1)/arms) * Math.PI * 2;
                    let cpX = x + Math.cos((angle+prevAngle)/2)*(r*0.7); // 0.7 gives the droop
                    let cpY = y + Math.sin((angle+prevAngle)/2)*(r*0.7);
                    ctx.quadraticCurveTo(cpX, cpY, px, py);
                }
            }
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
    }

    // Helper: Draw the twisted Web Strand
    function drawWebStrand(x1, y1, x2, y2, opacity) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#000000';
        
        // Inner core
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.shadowBlur = 0;
        
        // Strands / Tangling
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let t = 0.05; t < 0.95; t += 0.02) {
            const bx = (1 - t) * x1 + t * x2;
            const by = (1 - t) * y1 + t * y2;
            
            const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
            const size = Math.random() * 8 + 2;
            
            // Random offset for twisted look
            const offset = (Math.random() - 0.5) * 4;
            ctx.moveTo(bx - Math.cos(angle)*size + offset, by - Math.sin(angle)*size + offset);
            ctx.lineTo(bx + Math.cos(angle)*size - offset, by + Math.sin(angle)*size - offset);
        }
        ctx.stroke();
    }

    // Event hooks
    function handleDown(x, y) {
        triggerThwip(x, y);
        currentWeb = { start: {x, y}, end: {x, y}, active: true, age: 0, opacity: 1 };
        activeWebs.push(currentWeb);
    }
    function handleMove(x, y) {
        if (currentWeb) {
            currentWeb.end = {x, y};
        }
    }
    function handleUp() {
        if (currentWeb) {
            currentWeb.active = false;
            currentWeb = null;
        }
    }

    // Mouse
    window.addEventListener('mousedown', (e) => handleDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', handleUp);

    // Touch
    window.addEventListener('touchstart', (e) => handleDown(e.touches[0].clientX, e.touches[0].clientY), {passive: true});
    window.addEventListener('touchmove', (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY), {passive: true});
    window.addEventListener('touchend', handleUp, {passive: true});

    // Render loop processing webs
    function renderLoop() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (let i = activeWebs.length - 1; i >= 0; i--) {
            const web = activeWebs[i];
            
            if (!web.active) {
                web.age += 0.016; // rough 60fps delta
                if (web.age > 2.0) {
                    web.opacity = Math.max(0, 1 - (web.age - 2.0) * 2); // fade out over 0.5s
                }
            }

            if (web.opacity > 0) {
                drawWebSplat(web.start.x, web.start.y, 25, web.opacity);
                
                if (!web.active) {
                    drawWebSplat(web.end.x, web.end.y, 25, web.opacity);
                } else {
                    // Draw a miniature cursor splat while dragging
                    ctx.beginPath();
                    ctx.fillStyle = '#fff';
                    ctx.arc(web.end.x, web.end.y, 5, 0, Math.PI*2);
                    ctx.fill();
                }

                drawWebStrand(web.start.x, web.start.y, web.end.x, web.end.y, web.opacity);
            }

            // Garbage collect
            if (web.opacity <= 0) {
                activeWebs.splice(i, 1);
            }
        }

        requestAnimationFrame(renderLoop);
    }
    renderLoop();

    // --- 3. GSAP Entry Animations ---
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.section-fade').forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 90%",
                toggleActions: "play none none reverse"
            },
            y: 40,
            rotation: (Math.random() - 0.5) * 4,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)"
        });
    });

});
