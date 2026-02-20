/* _anki_sandbox.js */

(function() {
    // Evitamos duplicar listeners si Anki recarga partes del DOM
    if (window.gamificationListenerAttached) return;
    window.gamificationListenerAttached = true;

    console.log("Sistema de Gamificación Iniciado...");

    window.addEventListener('message', function(event) {
        
        // 1. FILTRADO DE SEGURIDAD/ORIGEN
        // Verificamos que el mensaje venga de nuestro protocolo de reto
        if (!event.data || !event.data.type) return;

        // 2. MANEJO DE ÉXITO
        if (event.data.type === 'CHALLENGE_SOLVED') {
            console.log("🏆 Reto completado. Payload:", event.data.payload);

            window.currentChallengeStatus = 'success';
            
            // A) Efectos Visuales (Confeti, bordes, etc.)
            //lanzarConfeti(); 
            iluminarBordes();

            // B) Lógica de Anki (Mostrar respuesta si estuvieras en el reverso, etc.)
            // En tu caso, como es front-only, quizás solo quieras reproducir un sonido
            reproducirSonidoVictoria();
        }

        // 3. MANEJO DE FALLO (Opcional)
        if (event.data.type === 'CHALLENGE_FAILED') {
            console.log("❌ Intento fallido:", event.data.reason);
            animarTemblor(); // Efecto de "shake" en la pantalla
        }
    });

    // --- Funciones Auxiliares de Efectos ---

    function lanzarConfeti() {
        // Si usas una librería como canvas-confetti, la llamas aquí
        // Si no, puedes manipular el DOM principal de Anki:
        const logo = document.getElementById('logo-header');
        if(logo) logo.innerHTML = "🎉 ¡EXCELENTE! 🎉";
    }

    function iluminarBordes() {
        // Podemos acceder al iframe desde aquí porque estamos en el padre
        const iframe = document.getElementById('challenge-sandbox');
        if (iframe) {
            iframe.style.transition = "box-shadow 0.5s ease";
            iframe.style.boxShadow = "0 0 30px #4CAF50";
            iframe.style.borderColor = "#4CAF50";
        }
    }

    function reproducirSonidoVictoria() {
        // Cuidado con el volumen en Anki, usar con precaución
        // const audio = new Audio('_success_sound.mp3');
        // audio.play();
    }

    function animarTemblor() {
        const iframe = document.getElementById('challenge-sandbox');
        if(iframe) {
            iframe.style.animation = "shake 0.5s";
            setTimeout(() => iframe.style.animation = "", 500);
        }
    }

    // Definición de animación CSS inyectada dinámicamente al padre
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
    `;
    document.head.appendChild(styleSheet);

})();