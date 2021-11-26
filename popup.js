/*************
* Constantes
*************/
const urlPetiteApi = 'https://api.motdepasse.xyz/create/?include_lowercase&';
const urlGrandeApi = 'https://api.motdepasse.xyz/create/?include_lowercase&include_digits&include_uppercase&include_special_characters&password_length=20&quantity=1';
const immediatement = "immédiatement";
const infini = "∞";

/*************
*  Functions
*************/
function genereMDP() {
  let url = urlPetiteApi;
  if ($('#chiffres').is(':checked')) {
    url += 'include_digits&'
  }
  if ($('#majuscules').is(':checked')){
    url += 'include_uppercase&';
  }
  if ($('#caracteresSpeciaux').is(':checked')){
    url += 'include_special_characters&';
  }

  url += 'password_length=' + $('#longueur').val() + '&quantity=1';

  let myRequest = new Request(url);

  fetch(myRequest).then((response) => response.json())
                  .then(function(json_response){
                    json_response.passwords.forEach(password => $("#result").val(password));
                  });

  calculTemps(document.getElementById("result").value);
}

//TODO : A reprendre pour le lier avec un tableau
// Mettre un lien vers le tableau en bas de l'onglet
function calculTemps(motDePasse) {
  let tempsCalcule = 0;

  let longueur = $('#result').val().length;
  if (longueur == 0) {
    longueur = $('#longueur').val();
  }

  let combinaisons = Math.pow(calculPasswordTypes(), longueur);

  let effectiveCores = 1/((1-0.99)+(0.99/2));

  let GFLOPS = 3 * effectiveCores / 0.00000000001;

  tempsCalcule = combinaisons / GFLOPS;

  let tempsCalculeHeures = 0;
  if (tempsCalcule.toString().indexOf("e") != -1) {
    tempsCalculeHeures = infini;
  } else if (tempsCalcule < 0.1) {
    tempsCalculeHeures = immediatement;
  } else {
    tempsCalculeHeures = toHHMMSS(parseInt(tempsCalcule.toString().split(".")[0]));
  } 

  $("#tempsValeur").text(tempsCalcule);
  $("#tempsValeurHeures").text(tempsCalculeHeures);
}
  
function calculPasswordTypes() {
  let passwordTypes = 26;
  if ($('#chiffres').is(':checked')) {
    passwordTypes += 9;
  }
  if ($('#majuscules').is(':checked')){
    passwordTypes += 26;
  }
  if ($('#caracteresSpeciaux').is(':checked')){
    passwordTypes += 30;
  }
  return passwordTypes;
}

function toHHMMSS (secs) {
  let heures = parseInt(secs / 3600);
  let reste = secs - (secs - (secs % 3600));
  let minutes = parseInt(reste / 60);
  reste = reste - (reste - (reste % 60));
  let secondes = parseInt(reste);
    
    let jours = parseInt(heures / 24);
    heures = (heures - (heures - (heures % 24)));

    let ans = parseInt(jours / 365.24219);
    jours = parseInt((jours - (jours - (jours % 365.24219))));

    let stringFinal = "";
    if (ans > 0)
      stringFinal += ans + "ans ";
    if (jours > 0)
      stringFinal += jours + "j ";
    if (heures > 0)
      stringFinal += heures + "h ";
    if (minutes > 0)
      stringFinal += minutes + "min ";
    if (secondes > 0)
      stringFinal += secondes + "s";

    return stringFinal;
}

function copyTextToClipboard(text) {
    var copyFrom = $('<textarea/>');
    copyFrom.text(text);
    $('body').append(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    copyFrom.remove();
}

function recupererMotDePasse() {
  reinitTimer();
  let url = urlGrandeApi;

  let myRequest = new Request(url);

  fetch(myRequest).then((response) => response.json())
                  .then(function(json_response){
                    json_response.passwords.forEach(password => $("#motDePasseGenere").val(password));
                  });
}

function reinitTimer() {
  let timer = 10;
  $("progress").attr("max", timer);

  setInterval(function() {
      let timerHeuresMinutes = toHHMMSS(timer);
      $('#timer').text(timerHeuresMinutes);
      $("progress").val(timer);
      if(timer == 0) {
        recupererMotDePasse();
      }

      timer --;
  }, 1000);
}

/*************
*   Events
*************/
//Onglets
$("#onglet1Bouton").on("click", function() {
  $("#onglet1").show();
  $("#onglet2").hide();

  $("#onglet1Bouton").addClass('focused');
  $("#onglet2Bouton").removeClass('focused');

  $("#onglet2 > div").css("max-height", "0px");
});
$("#onglet2Bouton").on("click", function() {
  $("#onglet2").show();
  $("#onglet1").hide();

  $("#onglet2Bouton").addClass('focused');
  $("#onglet1Bouton").removeClass('focused');

  $("#onglet2 > div").css("max-height", "100px");
});

//Onglet 1
$('#copiePressePapier').click(function(){
    copyTextToClipboard($("#motDePasseGenere").val());
});

//Onglet 2
$( "#majuscules" ).on( "click", function() {
  genereMDP();
});
$( "#chiffres" ).on( "click", function() {
  genereMDP();
});
$( "#caracteresSpeciaux" ).on( "click", function() {
  genereMDP();
});
$( "#longueur" ).on( "change", function() {
  genereMDP();
  $("#longeurValeur").text($('#longueur').val());
});
$( "#result" ).on( "change", function() {
  calculTemps(event.target.value);
});



/*************
*   Main
*************/
document.addEventListener('DOMContentLoaded', function () {
  genereMDP();
  $("#longeurValeur").text($('#longueur').val());

  recupererMotDePasse();
  $("#textClipBoard").val($("#motDePasseGenere").val());
});
