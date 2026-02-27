// CONFIGURATION SUPABASE (Ton script original)
const SUPABASE_URL = "https://inrcrtyvbgjrrccpzxlk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucmNydHl2YmdqcnJjY3B6eGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjkxOTIsImV4cCI6MjA4NzU0NTE5Mn0.9Fg6ixbWUS4twFBVZmeSKYYMB9JJHIQb8LoMYe0g9js";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

emailjs.init("ulU_NSZFdTj6ZZV8T");

// BASE DE QUESTIONS AVEC OPTIONS QCM
const ANSWERS = {
q1:{opt:["bethléem","bethleem"], ref:"Matthieu 2:1", desc:"Jésus est né à Bethléem en Judée.", options: ["Jérusalem", "Bethléem", "Nazareth", "Capernaüm"]},
q2:{opt:["pierre"], ref:"Matthieu 26:75", desc:"Pierre a renié Jésus trois fois.", options: ["Jean", "Pierre", "Judas", "Paul"]},
q3:{opt:["apocalypse"], ref:"Apocalypse 22:21", desc:"Dernier livre de la Bible.", options: ["Genèse", "Actes", "Apocalypse", "Romains"]},
q4:{opt:["jean baptiste","jean-baptiste"], ref:"Matthieu 3:13", desc:"Jean-Baptiste a baptisé Jésus.", options: ["Jean-Baptiste", "Pierre", "Paul", "Moïse"]},
q5:{opt:["4","quatre"], ref:"Matthieu, Marc, Luc, Jean", desc:"Il y a quatre évangiles.", options: ["3", "4", "5", "12"]},
q6:{opt:["galilée","galilee"], ref:"Jean 6:19", desc:"Jésus a marché sur la mer de Galilée.", options: ["Morte", "Rouge", "Galilée", "Méditerranée"]},
q7:{opt:["paul"], ref:"Actes et Épîtres", desc:"Paul a écrit la majorité des épîtres.", options: ["Pierre", "Paul", "Jean", "Luc"]},
q8:{opt:["vin","eau en vin"], ref:"Jean 2:1-11", desc:"Le premier miracle fut Cana.", options: ["Eau en vin", "Guérison", "Multiplication", "Marche sur l'eau"]},
q9:{opt:["matthieu"], ref:"Matthieu 9:9", desc:"Matthieu était collecteur d'impôts.", options: ["Pierre", "Matthieu", "Judas", "André"]},
q10:{opt:["judas"], ref:"Luc 22:47-48", desc:"Judas a trahi Jésus pour de l'argent.", options: ["Pierre", "Judas", "Jean", "Thomas"]}
};

let timeLeft = 120;
let timerInterval;
let currentStep = 0;
let selectedNiveau = "";

// FONCTION POUR GÉRER LA SÉLECTION DU NIVEAU (Design boutons)
function setLevel(niveau, btn) {
    selectedNiveau = niveau;
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function startQuiz() {
  const p = document.getElementById('prenom').value;
  if(!p || !selectedNiveau) return alert("Veuillez remplir vos informations et choisir un niveau !");
  
  // MODIFICATION : Afficher les options QCM ou garder les inputs texte
  if(selectedNiveau === "Intermédiaire"){
    for(let i=1; i<=10; i++){
      const input = document.getElementById('q'+i);
      input.style.display = "none";
      const container = input.parentElement;
      let optionsHTML = "";
      ANSWERS['q'+i].options.forEach(opt => {
        optionsHTML += `<button type="button" class="option-btn" onclick="selectOption(this, ${i})">${opt}</button>`;
      });
      container.insertAdjacentHTML('beforeend', optionsHTML);
    }
  }
  
  document.getElementById('timer').style.display = 'block';
  nextStep(0);
}

// FONCTION POUR GÉRER LA SÉLECTION QCM
function selectOption(btn, qIndex) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    // On met la valeur dans l'input caché
    document.getElementById('q'+qIndex).value = btn.innerText;
}

function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = 120;
  updateTimerDisplay();
  
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 10 && timeLeft > 0) {
      document.getElementById('beepSound').play().catch(()=>{});
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById('finishSound').play().catch(()=>{});
      if(currentStep < 5) {
        alert("Temps écoulé pour ces questions !");
        nextStep(currentStep);
      } else {
        alert("Temps final écoulé ! Validation automatique.");
        document.getElementById('quizForm').requestSubmit();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  const timerElem = document.getElementById('timer');
  timerElem.innerText = `⏱️ Temps étape : ${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  
  if(timeLeft <= 10) timerElem.classList.add('timer-danger');
  else timerElem.classList.remove('timer-danger');
}

function normalizeText(t){return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();}

function nextStep(n){
  currentStep = n + 1;
  document.getElementById('step'+n).classList.remove('active');
  document.getElementById('step'+currentStep).classList.add('active');
  document.getElementById('progressBar').style.width = (currentStep/5*100) + "%";
  
  if(currentStep <= 5) {
    resetTimer();
  }
}

document.getElementById('quizForm').addEventListener('submit', async e=>{
e.preventDefault();
clearInterval(timerInterval);
document.getElementById('timer').style.display = 'none';

let score=0, tableauHTML="", commentairesHTML="<hr><h2 style='color:#2c3e50;'>Explications Bibliques</h2>";

for(let i=1;i<=10;i++){
    const val=document.getElementById('q'+i).value.trim()||"-";
    const config=ANSWERS['q'+i];
    const isCorrect=config.opt.map(a=>normalizeText(a)).includes(normalizeText(val));
    const feedback=document.getElementById('f'+i);
    feedback.style.display="block";
    if(isCorrect){
        score++;
        document.getElementById('block'+i).classList.add('is-correct');
        feedback.innerHTML=`✅ ${config.ref}`;
        feedback.style.color="var(--success)";
    } else {
        document.getElementById('block'+i).classList.add('is-wrong');
        feedback.innerHTML=`❌ ${config.ref}`;
        feedback.style.color="var(--error)";
    }

    tableauHTML+=`<tr><td style="padding:8px;border:1px solid #ddd;">Q${i}</td><td style="padding:8px;border:1px solid #ddd;">${val}</td><td style="padding:8px;border:1px solid #ddd;text-align:center;">${isCorrect?'✅':'❌'}</td></tr>`;
    commentairesHTML+=`<div style="margin-bottom:15px;padding:10px;background:#f9f9f9;border-left:4px solid ${isCorrect?'#2ecc71':'#e74c3c'};">
    <p style="margin:0;"><strong>Question ${i} :</strong> ${config.desc}</p>
    <p style="margin:5px 0 0 0;font-style:italic;color:#555;">📖 Référence : ${config.ref}</p>
    </div>`;
}

const p=document.getElementById('prenom').value;
const n=document.getElementById('nom').value;
const em=document.getElementById('email').value;

emailjs.send('service_raxr77e','template_244yyoi',{
    prenom:p, nom:n, email:em, score:score,
    tableau_html:tableauHTML,
    commentaires_html:commentairesHTML
});

// ENVOI VERS SUPABASE AVEC LE NIVEAU
await _supabase.from('reponses').upsert({
    email:em, 
    prenom:p, 
    nom:n, 
    score:score,
    niveau: selectedNiveau
},{onConflict:'email'});

document.querySelectorAll('#quizForm input, #quizForm button').forEach(el=>el.disabled=true);
document.getElementById('res-summary').innerHTML=`<div style="text-align:center;"><div class="score-anim">${score}/10</div><p>Bravo ${p} ! Niveau: ${selectedNiveau}</p></div>`;
document.getElementById('recap-table').style.display = "block";
document.getElementById('recap-table').innerHTML=`<h3 style="color:var(--primary);text-align:center;">Résumé des réponses</h3>
<table class="tableau-result"><thead><tr><th>Q°</th><th>Ta réponse</th><th>Résultat</th></tr></thead><tbody>${tableauHTML}</tbody></table>
<div class="commentaires">${commentairesHTML}</div>
<div class="verse">"Ta parole est une lampe à mes pieds..." - Psaume 119:105</div>`;
document.getElementById('btnReset').style.display="block";
});
