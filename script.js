<script>
// ==========================
// CONFIGURATION SUPABASE ET EMAILJS
// ==========================
const _supabase = supabase.createClient(
  "https://inrcrtyvbgjrrccpzxlk.supabase.co",
  "sb_publishable_tEVOnHljw_fz5UC_cEG9pA_9xglC1VK"
);

emailjs.init("ulU_NSZFdTj6ZZV8T");


// ==========================
// VARIABLES GLOBALES
// ==========================
let currentStep = 0;
let timeLeft = 120;
let timerInterval = null;
let selectedNiveau = "";
let alreadySubmitted = false;


// ==========================
// BASE DE QUESTIONS
// ==========================
const ANSWERS = {
  q1:{opt:["bethléem","bethleem"], ref:"Matthieu 2:1", desc:"Jésus est né à Bethléem en Judée.", options:["Jérusalem","Bethléem","Nazareth","Capernaüm"]},
  q2:{opt:["pierre"], ref:"Matthieu 26:75", desc:"Pierre a renié Jésus trois fois.", options:["Jean","Pierre","Judas","Paul"]},
  q3:{opt:["apocalypse"], ref:"Apocalypse 22:21", desc:"Dernier livre de la Bible.", options:["Genèse","Actes","Apocalypse","Romains"]},
  q4:{opt:["jean baptiste","jean-baptiste"], ref:"Matthieu 3:13", desc:"Jean-Baptiste a baptisé Jésus.", options:["Jean-Baptiste","Pierre","Paul","Moïse"]},
  q5:{opt:["4","quatre"], ref:"Matthieu, Marc, Luc, Jean", desc:"Il y a quatre évangiles.", options:["3","4","5","12"]},
  q6:{opt:["galilée","galilee"], ref:"Jean 6:19", desc:"Jésus a marché sur la mer de Galilée.", options:["Morte","Rouge","Galilée","Méditerranée"]},
  q7:{opt:["paul"], ref:"Actes et Épîtres", desc:"Paul a écrit la majorité des épîtres.", options:["Pierre","Paul","Jean","Luc"]},
  q8:{opt:["vin","eau en vin"], ref:"Jean 2:1-11", desc:"Le premier miracle fut Cana.", options:["Eau en vin","Guérison","Multiplication","Marche sur l'eau"]},
  q9:{opt:["matthieu"], ref:"Matthieu 9:9", desc:"Matthieu était collecteur d'impôts.", options:["Pierre","Matthieu","Judas","André"]},
  q10:{opt:["judas"], ref:"Luc 22:47-48", desc:"Judas a trahi Jésus pour de l'argent.", options:["Pierre","Judas","Jean","Thomas"]}
};


// ==========================
// OUTILS
// ==========================
function normalizeText(t){
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
}


// ==========================
// SELECTION NIVEAU
// ==========================
function setLevel(niveau, btn){
  selectedNiveau = niveau;
  document.querySelectorAll('.level-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
}


// ==========================
// LANCEMENT QUIZ
// ==========================
function startQuiz(){
  const p = document.getElementById('prenom').value;

  if(!p || !selectedNiveau){
    alert("Veuillez entrer votre prénom et choisir un niveau.");
    return;
  }

  // Générer QCM si niveau Intermédiaire
  if(selectedNiveau === "Intermédiaire"){
    for(let i=1;i<=10;i++){
      const input=document.getElementById('q'+i);
      input.style.display="none";

      const container=input.parentElement;
      let html="";

      ANSWERS['q'+i].options.forEach(opt=>{
        html+=`<button type="button" class="option-btn" onclick="selectOption(this,${i})">${opt}</button>`;
      });

      container.insertAdjacentHTML("beforeend",html);
    }
  }

  document.getElementById('timer').style.display='block';
  goToStep(1);
}


// ==========================
// NAVIGATION
// ==========================
function goToStep(step){
  document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));

  currentStep = step;

  const el=document.getElementById('step'+step);
  if(el) el.classList.add('active');

  document.getElementById('progressBar').style.width=(step/5*100)+"%";

  resetTimer();
}

function nextStep(){ goToStep(currentStep+1); }
function prevStep(){ goToStep(currentStep-1); }


// ==========================
// TIMER FIABLE
// ==========================
function resetTimer(){
  if(timerInterval){
    clearInterval(timerInterval);
    timerInterval=null;
  }

  timeLeft=120;
  updateTimerDisplay();

  timerInterval=setInterval(()=>{
    timeLeft--;
    updateTimerDisplay();

    if(timeLeft<=10 && timeLeft>0){
      document.getElementById('beepSound')?.play().catch(()=>{});
    }

    if(timeLeft<=0){
      clearInterval(timerInterval);
      timerInterval=null;

      if(currentStep<5){
        nextStep();
      }else{
        document.getElementById('quizForm').requestSubmit();
      }
    }
  },1000);
}

function updateTimerDisplay(){
  const min=Math.floor(timeLeft/60);
  const sec=timeLeft%60;

  document.getElementById('timer').innerText=
  `⏱️ Temps : ${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}


// ==========================
// SELECTION QCM
// ==========================
function selectOption(btn,qIndex){
  const parent=btn.parentElement;

  parent.querySelectorAll('.option-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');

  document.getElementById('q'+qIndex).value=btn.innerText;
}


// ==========================
// SOUMISSION
// ==========================
document.getElementById('quizForm').addEventListener('submit',async e=>{
  e.preventDefault();

  if(alreadySubmitted) return;
  alreadySubmitted=true;

  clearInterval(timerInterval);

  let score=0;
  let tableauHTML="<table class='tableau-result'><tr><th>Q</th><th>Réponse</th><th>✔</th></tr>";
  let commentairesHTML="<h2>Explications</h2>";

  for(let i=1;i<=10;i++){
    const val=document.getElementById('q'+i).value||"-";
    const config=ANSWERS['q'+i];

    const ok=config.opt.map(a=>normalizeText(a)).includes(normalizeText(val));
    if(ok) score++;

    tableauHTML+=`<tr><td>${i}</td><td>${val}</td><td>${ok?'✅':'❌'}</td></tr>`;

    commentairesHTML+=`<p><b>Q${i}</b> : ${config.desc}<br><i>${config.ref}</i></p>`;
  }

  tableauHTML+="</table>";

  const p=document.getElementById('prenom').value;
  const n=document.getElementById('nom').value;
  const em=document.getElementById('email').value;


  // EMAIL ADMIN
  await emailjs.send('service_raxr77e','template_uh8xoa6',{
    prenom:p,nom:n,email:em,score:score,
    tableau_html:tableauHTML,commentaires_html:commentairesHTML,
    niveau:selectedNiveau
  });


  // EMAIL PARTICIPANT
  await emailjs.send('service_raxr77e','template_632ld9j',{
    prenom:p,email:em,score:score,tableau_html:tableauHTML,niveau:selectedNiveau
  });


  // SUPABASE
  await _supabase.from('reponses').upsert({
    email:em,prenom:p,nom:n,score:score,niveau:selectedNiveau
  },{onConflict:'email'});


  // AFFICHAGE
  document.getElementById('res-summary').innerHTML=
  `<div class="score-anim">${score}/10<br>Bravo ${p} !</div>`;

});
</script>
