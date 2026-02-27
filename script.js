// 2. ENVOI À L'UTILISATEUR (le résultat simple)
emailjs.send('service_raxr77e','template_ue97zdi',{ // <--- ID CORRIGÉ ICI
    prenom:p, 
    email:em, // EmailJS utilisera ça pour envoyer à l'utilisateur
    score:score,
    tableau_html:tableauHTML,
    niveau: selectedNiveau
});
