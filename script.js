<script>
// 1. CONFIGURATION DES SERVICES EXTERNES
// Remplace par tes propres clés Supabase et EmailJS
const _supabase = supabase.createClient('https://votre-url.supabase.co', 'votre-cle-api');
emailjs.init("votre-id-emailjs");

// 2. LA BASE DE CONNAISSANCES (Réponses et Options)
const ANSWERS = {
    q1: { opt: ["bethleem", "bethléem"], options: ["Nazareth", "Bethléem", "Cana"] },
    q2: { opt: ["pierre"], options: ["Jean", "Pierre", "Judas"] },
    q3: { opt: ["apocalypse"], options: ["Genèse", "Actes", "Apocalypse"] },
    q4: { opt: ["jean baptiste", "jean-baptiste"], options: ["Jean-Baptiste", "Élie", "Moïse"] },
    q5: { opt: ["4", "quatre"], options: ["3", "4", "12"] },
    q6: { opt: ["galilee", "galilée"], options: ["Rouge", "Morte", "Galilée"] },
    q7: { opt: ["paul"], options: ["Pierre", "Paul", "Jean"] },
    q8: { opt: ["vin", "eau en vin"], options: ["Pain", "Vin", "Guérison"] },
    q9: { opt: ["matthieu"], options: ["Matthieu", "Luc", "Jean"] },
    q10: { opt: ["judas", "judas iscariote"], options: ["Pierre", "Hérode", "Judas"] }
};

let selectedNiveau = "";
let currentStep = 0;
let timeLeft = 120; // 2 minutes
let timerInterval;
let userAnswers = {};

// 3. FONCTIONS D'INTERFACE
function launchQuiz() {
    // Effet de zoom arrière sur l'accueil
    document.getElementById('premium-welcome').classList.add('hide-welcome');
    setTimeout(() => {
        document.getElementById('premium-welcome').style.display = 'none';
        document.getElementById('quizCard').style.display = 'block';
    }, 1000);
}

function setLevel(niv, btn) {
    selectedNiveau = niv;
    // Visuel : bouton sélectionné
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function startQuiz() {
    const prenom = document.getElementById('prenom').value;
    const email = document.getElementById('email').value;

    if (!prenom || !email || !selectedNiveau) {
        alert("Veuillez remplir vos informations et choisir un niveau.");
        return;
    }

    // Si niveau Intermédiaire, on génère les boutons QCM dynamiquement
    if (selectedNiveau === "Intermédiaire") {
        prepareQCM();
    }

    document.getElementById('timer').style.display = 'block';
    startTimer();
    nextStep(0);
}

function prepareQCM() {
    for (let i = 1; i <= 10; i++) {
        let input = document.getElementById('q' + i);
        input.style.display = "none"; // On cache le champ texte
        
        // On crée les boutons d'options
        const container = input.parentElement;
        ANSWERS['q' + i].options.forEach(text => {
            let btn = document.createElement('button');
            btn.type = "button";
            btn.className = "option-btn";
            btn.innerText = text;
            btn.onclick = () => {
                input.value = text;
                btn.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            };
            container.appendChild(btn);
        });
    }
}

// 4. LOGIQUE DE NAVIGATION
function nextStep(n) {
    document.getElementById('step' + n).classList.remove('active');
    currentStep = n + 1;
    const nextNode = document.getElementById('step' + currentStep);
    
    if (nextNode) {
        nextNode.classList.add('active');
        // Mise à jour de la barre de progression (5 étapes = 20% par étape)
        document.getElementById('progressBar').style.width = (currentStep * 20) + "%";
    }
}

// 5. CHRONOMÈTRE
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        let mins = Math.floor(timeLeft / 60);
        let secs = timeLeft % 60;
        document.getElementById('timer').innerText = `⏱️ Temps restant : ${mins}:${secs < 10 ? '0' : ''}${secs}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishQuiz();
        }
    }, 1000);
}

// 6. FINALISATION ET ENVOI
document.getElementById('quizForm').onsubmit = async (e) => {
    e.preventDefault();
    finishQuiz();
};

async function finishQuiz() {
    clearInterval(timerInterval);
    let score = 0;

    // Calcul du score
    for (let i = 1; i <= 10; i++) {
        let val = document.getElementById('q' + i).value.toLowerCase().trim();
        if (ANSWERS['q' + i].opt.includes(val)) {
            score++;
        }
    }

    const resultDiv = document.getElementById('res-summary');
    resultDiv.innerHTML = `
        <div style="text-align:center; padding:20px; border:2px solid var(--gold); border-radius:10px;">
            <h3 style="color:var(--primary); font-family:'Cinzel';">Examen Terminé</h3>
            <p style="font-size:2rem; font-weight:bold; color:var(--gold);">${score} / 10</p>
            <p>Vos résultats ont été enregistrés dans le sanctuaire.</p>
            <button class="btn-nav" onclick="location.reload()">Recommencer</button>
        </div>
    `;
    document.getElementById('quizForm').style.display = 'none';
    document.getElementById('timer').style.display = 'none';

    // Sauvegarde Supabase (Optionnel selon tes besoins)
    try {
        await _supabase.from('resultats').insert([{
            prenom: document.getElementById('prenom').value,
            score: score,
            niveau: selectedNiveau
        }]);
    } catch (err) { console.error("Erreur Supabase:", err); }
}
</script>
