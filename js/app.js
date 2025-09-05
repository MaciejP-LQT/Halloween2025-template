import { showLoader, hideLoader, transformLocaleData, eventSend, getUserId, logUserIn, navigate } from './lib.js';

window.unityGame  = null; 
window.setupUnity = function() {

  var buildUrl = "Build";
  config = {
      loaderUrl: buildUrl + "/{{{ LOADER_FILENAME }}}" + "?" + Math.random(),
      dataUrl: buildUrl + "/{{{ DATA_FILENAME }}}" + "?" + Math.random(),
      frameworkUrl: buildUrl + "/{{{ FRAMEWORK_FILENAME }}}" + "?" + Math.random(),
      codeUrl: buildUrl + "/{{{ CODE_FILENAME }}}" + "?" + Math.random(),
      streamingAssetsUrl: "StreamingAssets",
      companyName: "{{{ COMPANY_NAME }}}",
      productName: "{{{ PRODUCT_NAME }}}",
      productVersion: "{{{ PRODUCT_VERSION }}}"
  };

#if MEMORY_FILENAME
  config.memoryUrl = buildUrl + "/{{{ MEMORY_FILENAME }}}";
#endif
#if SYMBOLS_FILENAME
  config.symbolsUrl = buildUrl + "/{{{ SYMBOLS_FILENAME }}}";
#endif
}

let config = {};
let resUserStatus = {};
let resUserLogIn = {};
let resNavigate = {};
let locale =  {
  howToPlay: {
    title: "*Welcome to the Share A Meal McDonald’s Game",
    subtitle:"*How to play",
    p1Text:"*Duis aute irure dolor in reprehenderit.",
    p2Text:"*Duis aute irure dolor in reprehenderit.",
    p3Text:"*Duis aute irure dolor in reprehenderit.",
    btnPlay:"*Play"
  }
};
let rotateScreenLoaded = false;
let rotateScreenEventSent = false;
let loginFormType = 'start';
let btnLogin = 'Login';
let needLogin = false;
let gYear = 2025;
// let gMonth = 1;
// let gDay = 1;
let ageLimit = 13;
let showAgeLimitForm = true; 
let showModal = false;
let gameBrand = 'fanta'; 
const UUId = uuidv4();
let correctLocale = 'en';
const eventUrl = 'https://api-games-v2.smvg.pl/event';
let gameId = 'hlw-25'
let version = 'v0.0.1'

function generateYearArray(startYear, endYear) {
  const yearTab = [];
  
  for (let year = startYear; year <= endYear; year++) {
    yearTab.push({ name: year.toString(), value: year });
  }
  
  return yearTab;
}

function generateDaysArray(year, month) {
  const dayTab = [];
  
  // Liczba dni w każdym miesiącu (przy założeniu, że luty ma 28 dni)
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Sprawdzenie, czy rok jest przestępny
  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }
  
  // Jeśli luty i rok przestępny, to ma 29 dni
  if (month === 2 && isLeapYear(year)) {
    daysInMonth[1] = 29;
  }
  
  const totalDays = daysInMonth[month - 1];
  
  for (let day = 1; day <= totalDays; day++) {
    const dayName = day < 10 ? `0${day}` : `${day}`;
    dayTab.push({ name: dayName, value: day });
  }
  
  return dayTab;
}

const yearTab = generateYearArray(1940, gYear);
const monthTab = [
  {name: "01", value: 1},
  {name: "02", value: 2},
  {name: "03", value: 3},
  {name: "04", value: 4},
  {name: "05", value: 5},
  {name: "06", value: 6},
  {name: "07", value: 7},
  {name: "08", value: 8},
  {name: "09", value: 9},
  {name: "10", value: 10},
  {name: "11", value: 11},
  {name: "12", value: 12}
];
let dayTab = generateDaysArray(gYear, 1);


function loadOptions(selectId, options, placeholderText) {
  const select = document.getElementById(selectId);
  select.innerHTML = ''; 
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.text = placeholderText;
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  options.forEach(function(item) {
      const option = document.createElement("option");
      option.text = item.name;
      option.value = item.value;
      select.add(option);
  });
}



var unityContainer = document.getElementById('unity-container');

function updateZIndex() {

  const mainContainer = document.getElementById('main');


  if (mainContainer && mainContainer.classList.contains('load-game')) {
    if (window.matchMedia("(orientation: landscape)").matches) {
      unityContainer.style.zIndex = '5';
    } else {
      unityContainer.style.zIndex = '1';
    }
  }


  // if (window.matchMedia("(orientation: landscape)").matches) {
  //   unityContainer.style.zIndex = '5';    
  // } else {
  //   unityContainer.style.zIndex = '1';
  // }
}

window.addEventListener('resize', updateZIndex);

// #region loadLocale
async function loadLocale() {
  let xtndExperienceId = 'hlw-25-fanta-fear-factory-runner';
  let xtndLocale = null; 
  

  const urlParams = new URLSearchParams(window.location.search);

  xtndExperienceId = urlParams.get('xtnd-experience-id') || 'hlw-25-fanta-fear-factory-runner';
  xtndLocale = urlParams.get('xtnd-locale');

  console.log(`Xtnd-locale from urlParams: ${xtndLocale}`);
  
  let localesToTry = [];

  if (xtndLocale) {
    localesToTry.push(xtndLocale); // np. 'pl-cy'
  }
  localesToTry.push('en'); 

 
  const uniqueLocales = [...new Set(localesToTry)];


  for (const currentLocale of uniqueLocales) {
    try {
      console.log(`Attempt to retrieve translations for: ${currentLocale}`);
      
      const response = await window.xtnd.translations.get({
        "xtndExperienceId": xtndExperienceId,
        "xtndContent": "publish",
        "xtndLocale": currentLocale
      });
      
      locale = transformLocaleData(response);
      console.log(`Translations retrieved for: ${currentLocale}`);
      loginFormType = locale.xtnd_nt_config.loginFormType;
      ageLimit = locale.xtnd_nt_config.ageLimit;
      showAgeLimitForm = locale.xtnd_nt_config.showAgeLimitForm;
      gameBrand = locale.xtnd_nt_config.brand;
      correctLocale = currentLocale;
      gameId = locale.xtnd_nt_config.gameId;
      version = locale.xtnd_nt_config.version;
      
   
      return; 
      
    } catch (error) {
      console.error(`Failed to retrieve translations for: "${currentLocale}". Attempting next fallback.`);
      console.dir(error); 
    }
  }

  console.error("Failed to retrieve any translation versions. The application may not function properly.");
}
// #endregion


// #region EventAdd
async function EventAdd(name, details) {

  let language;
  let region;

  if (correctLocale.includes('-')) {
    const parts = correctLocale.split('-');
    language = parts[0].toUpperCase();
    region = parts[1].toUpperCase();
  } else {
    language = correctLocale;
    region = correctLocale;
  }

  let json = `{"configuration":"${gameId}.${region}","user":"${UUId}","name":"${name}","details":{`;
  let i = 0;
  for (const [key, value] of Object.entries(details)) {
    if (i === 0) {
      json = json + `"${key}":"${value}"`;
    } else {
      json = json + `,"${key}":"${value}"`;
    }
    i++;
  }
  json = json + `},"gameUID":"","language":"${language}","version":"${version}"}`;


  try {
    const response = await fetch(eventUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: json
    });
    if (response.ok) {
      let result = await response.json();
      console.log('EventAdd result:');
      console.log(result);
      
    } else {

        console.log(`www.isNetworkError:${response.ok}\n`);
        console.log(`www.isHttpError:${response.status}\n`);
        console.log(`www.error:${response.statusText}\n`);

    }
  } catch (error) {
      console.log(`error:${error.message}`);
  }
}

// #endregion



function rotateInfoFill() {
  const templateSource = document.getElementById('rotate-info-template').innerHTML;
  const template = Handlebars.compile(templateSource);
  const compiledHtml = template({ locale: locale });
  rotateScreenLoaded = true;
  document.getElementById('rotate-info').innerHTML = compiledHtml;

  if (window.matchMedia("(orientation: portrait)").matches) {
    eventSend("app_progress", "view", "screen_load", "FHW25_rotate");
    rotateScreenEventSent = true;
  }
}

function desktopCoverFill() {
  const templateSource = document.getElementById('desktop-cover-template').innerHTML;
  const template = Handlebars.compile(templateSource);
  const compiledHtml = template({ locale: locale });
  const dist = document.getElementById('desktop-cover');
  dist.innerHTML = compiledHtml;

  if (isMobileDevice()) {
    dist.classList.remove('active');
  } else {
    dist.classList.add('active');
  }
}

function readyPageFill() { 

  const templateSource = document.getElementById('ready-page-template').innerHTML;
  const template = Handlebars.compile(templateSource);
  const compiledHtml = template({ locale: locale });
  const mainContainer = document.getElementById('main');
  mainContainer.classList.add('ready-page');
  mainContainer.innerHTML = compiledHtml;
  const buttonPlay = document.querySelector('.js-btn-play');
  //const buttonTest = document.querySelector('.test-btn-xhr');

  eventSend("app_progress", "view", "screen_load", "FHW25_instructions");

  if (buttonPlay) {
    buttonPlay.addEventListener('click', async function () {      
      console.log('ready-page-template Play');
      eventSend("user_action", "click", "play_button", "FHW25_instructions");

      EventAdd('GameStart', {
          sessionUid: UUId,
          gameBrand: gameBrand,
          locale: correctLocale
      });

      mainContainer.style.zIndex = '1';     
      mainContainer.style.display = 'none';
      //window.unityGame.SendMessage('MainScript', 'XtndAudioContextResumed', 'Audio context has been resumed');
      window.unityGame.SendMessage('MainScript', 'OnGameAwake', gameBrand);
    });
  }

}


function loginIfNeeded() {

  if (resUserStatus.status !== "success" && loginFormType === 'start') {
    needLogin = true;    
    console.log('no logged !');  
  }

  setTimeout(async () => {

    if (needLogin) {  
          // eventSend("user_action", "click", "login_button");   
        console.log('needLogin: '+needLogin);

        resUserLogIn = await logUserIn();
        if (resUserLogIn.status === 'success') {
          localStorage.setItem('_Hlw25_uuid', resUserLogIn.data.uuid);
          needLogin = false;
        }
        return; 
    }

    // eventSend("user_action", "click", "play_button");
    document.getElementById("rotate-info").classList.add('active');
    showLoader();
    console.log('loginIfNeeded Play');
    rotateInfoFill();
    loadGameFill();
    initializeUnity(config);
    hideLoader();

  }, 10);  

}


// function howToPlayFill() {
//   const templateSource = document.getElementById('how-to-play-template').innerHTML;
//   const template = Handlebars.compile(templateSource);
//   const compiledHtml = template({ locale: locale });
//   document.getElementById('main').innerHTML = compiledHtml;
//   const buttonPlay = document.querySelector('.js-btn-play');

//   // eventSend("app_progress", "view", "screen_load");

//   // loginFormType może być: start - logowanie na początku na HowToPlay, game - logowanie w grze, none - bez logowania
//   if (resUserStatus.status !== "success" && loginFormType === 'start') {
//     needLogin = true;
//     buttonPlay.childNodes[0].textContent = btnLogin; 
//     buttonPlay.querySelector('span').textContent = btnLogin;  
//     console.log('no logged !');  
//   }

  
//   if (buttonPlay) {
//     buttonPlay.addEventListener('click', async function () {

//       if (needLogin) {  
//         // eventSend("user_action", "click", "login_button");       
//         resUserLogIn = await logUserIn();

//         if (resUserLogIn.status === 'success') {
//           localStorage.setItem('_Hlw25_uuid', resUserLogIn.data.uuid);
//           needLogin = false;
//         }
//         return; 
//       }

//       // eventSend("user_action", "click", "play_button");
//       document.getElementById("rotate-info").classList.add('active');
//       showLoader();
//       console.log('how-to-play button Play');
//       rotateInfoFill();
//       loadGameFill();
//       initializeUnity(config);
//       hideLoader();
//     });
//   }
// }


function verifyAgeFill() {
  const templateSource = document.getElementById('verify-age-template').innerHTML;
  const template = Handlebars.compile(templateSource);
  const compiledHtml = template({ locale: locale });
  document.getElementById('main').innerHTML = compiledHtml;
  const buttonPlay = document.querySelector('.js-btn-next');
  const formName = document.getElementById('js-form-name');
  const formNamefont = locale.ageVerify.formNameFont;

  eventSend("app_progress", "view", "screen_load", "FHW25_age_gate");

  if (formNamefont) {
    formName.classList.add(formNamefont);
  }



  let btnTarget = 'next';  
  
  if (buttonPlay) {
    buttonPlay.addEventListener('click', async function () {

      showLoader();
      eventSend("user_action", "click", "age_continue", "FHW25_age_gate");      
      console.log('verifyAgeFill button Next');

      if (btnTarget === 'next') {

        if(resUserStatus.status == 'success') {
          localStorage.setItem('_Hlw25_uuid', resUserStatus.data.uuid);
        }
        else {
          localStorage.setItem('_Hlw25_uuid', "--no logged");
        }      
        //howToPlayFill();
        loginIfNeeded();

      } 
      else {  
        verifyAgeModalFill();
      }      
      
      hideLoader();
    });
  }

  loadOptions('month', monthTab, 'MM');
  loadOptions('day', dayTab, 'DD');
  loadOptions('year', yearTab, 'YYYY');

  function checkForm() {
    const year = parseInt(document.getElementById('year').value);
    const month = parseInt(document.getElementById('month').value);
    const day = parseInt(document.getElementById('day').value);
    const isAgreed = document.getElementById('agree').checked;
    const agreeInfoText = document.querySelector('.agree-info');

    agreeInfoText.style.visibility = 'hidden';
    
    if (!isAgreed) {
      agreeInfoText.style.visibility = 'visible';
      document.querySelector('.js-btn-next').disabled = true;
      return;
    }

    if (!year || !month || !day || !isAgreed) {
        document.querySelector('.js-btn-next').disabled = true;    
        return;
    }
   

    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    // console.log('today: '+today);
    // console.log('birthDate: '+birthDate);
    // console.log('age: '+age);
    // console.log('monthDifference: '+monthDifference);
    // console.log('dayDifference: '+dayDifference);
    // console.log('ageLimit: '+ageLimit);


    document.querySelector('.js-btn-next').disabled = false;
    if (age > ageLimit ||
        (age === ageLimit && (monthDifference > 0 || (monthDifference === 0 && dayDifference >= 0)))) {
      btnTarget = 'next';
    } else {
      btnTarget = 'dialog';
    }
  }


  function updateDays() {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');

    const year = parseInt(yearSelect.value, 10);
    const month = parseInt(monthSelect.value, 10);

    if (!isNaN(year) && !isNaN(month)) {
        dayTab = generateDaysArray(year, month);
        //console.log('updateDays', dayTab);
        loadOptions('day', dayTab, 'DD');
    }

    checkForm();
  }




  document.getElementById('year').addEventListener('change', updateDays);
  document.getElementById('month').addEventListener('change', updateDays);
  document.getElementById('day').addEventListener('change', checkForm);
  document.getElementById('agree').addEventListener('change', checkForm);

}

function verifyAgeModalFill() {

  const btnLink = locale.xtnd_nt_config.shareUrl;
  const modalOverlay = document.getElementById('modal-overlay');
  const modalDialog = document.getElementById('modal-dialog');
  const header = document.querySelector('.d-header');
  const descr = document.querySelector('.d-text');
  const btn = document.querySelector('#d-btn');
  header.innerHTML = ''+locale.ageVerify.dialogTitle;
  descr.innerHTML = ''+locale.ageVerify.dialogText;
  btn.innerHTML = ''+locale.ageVerify.dialogBtn;
 
  modalOverlay.style.display = 'block';
  setTimeout(() => {
    modalOverlay.classList.add('active');
    modalDialog.classList.add('active');
  }, 50);


  if (btn) {
    btn.addEventListener('click', async function () {
      modalOverlay.classList.remove('active');
      modalDialog.classList.remove('active');   


      modalOverlay.style.display = 'none';
      resNavigate = await navigate(btnLink, true);    
      console.log(JSON.stringify(resNavigate, null, 2));


    });
  }


}




function loadGameFill() {
  const templateSource = document.getElementById('loader-game-template').innerHTML;
  const template = Handlebars.compile(templateSource);
  const compiledHtml = template({ locale: locale });
  document.getElementById('main').classList.add('load-game');
  document.getElementById('main').innerHTML = compiledHtml;
  document.querySelector('.js-bg').classList.add('active');

  eventSend("app_progress", "view", "screen_load", "FHW25_loading");

  const loaderImg1 = document.getElementById('loader-img-1');
  if (gameBrand === 'royal') {
    loaderImg1.src = 'images/h-royal-can.png';  
    loaderImg1.alt = 'Royal loader';
  } else if (gameBrand === 'zero') {
    loaderImg1.src = 'images/h-zero-can.png';
    loaderImg1.alt = 'Coca-Cola Zero Sugar loader';
  }
  else {  
    loaderImg1.src = 'images/h-fanta-can.png';  
    loaderImg1.alt = 'Fanta loader';  
  }


  
  updateZIndex();

  // const loaderContainer = document.querySelector('.loader-img-wrap');
  // setTimeout(() => {
  //       if (loaderContainer) {
  //           loaderContainer.classList.add('show-second-image');
  //       }
  //   }, 100);


}

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}



// #region Main
// ************ main ************ //
async function main() {
  const setHeight = () => {
    if (window.innerHeight > window.innerWidth) {
      document.body.style.height = `${window.innerHeight}px`;

      if (rotateScreenLoaded && !rotateScreenEventSent) {
        eventSend("app_progress", "view", "screen_load", "FHW25_rotate");
        rotateScreenEventSent = true;
      }

    } else {
      document.body.style.height = 'auto';
      rotateScreenEventSent = false;
    }
  };
  window.addEventListener('resize', setHeight);
  setHeight();


   
  showLoader();
  await loadLocale();
  resUserStatus = await getUserId();
  const storeUid = localStorage.getItem('_Hlw25_uuid');
  console.log("resUserStatus.status: "+resUserStatus.status);
  //console.log("storeUid: "+storeUid);

  desktopCoverFill();

  EventAdd('AppStart', {
      sessionUid: UUId,
      version: "xtnd",
      userIdStatus: resUserStatus.status,
      userId: resUserStatus.status === 'success' ? resUserStatus.data.uuid : 'no-logged',
      storedUserId: storeUid ? storeUid : 'no-store'
  });

  if (resUserStatus.status === 'success') { 

    localStorage.setItem('_Hlw25_uuid', resUserStatus.data.uuid);   
    //howToPlayFill();
    loginIfNeeded();
  }
  else {

    if (storeUid !== null || showAgeLimitForm == false) {
      //howToPlayFill();
      loginIfNeeded();
    }
    else {
      verifyAgeFill();
    }    
  }
  
  hideLoader();

}
// #endregion


function initializeUnity(config) {
  console.log("Inicjalizacja Unity");

  var canvas = document.querySelector("#unity-canvas");
  var bg = document.querySelector(".js-bg");
  var htp = document.querySelector(".js-htp");

  var progressIndicator = document.querySelector("#js-progress-indicator");
  config.devicePixelRatio = 2;

  var bgLoading = document.querySelector(".bg-loading"); 
  var loaderVal = document.querySelector("#loader-val");
  const viewportHeight = window.innerHeight;

  var script = document.createElement("script");
  script.src = config.loaderUrl;

  script.onload = () => {

      createUnityInstance(canvas, config, (progress) => {
          
          if (parseFloat(progress) >= 0.9) {
              progress = 1.0;
          }

      if (bgLoading && loaderVal) {

          const percentage = Math.round(progress * 100);
          loaderVal.textContent = percentage + '%';

          const bottomPosition = progress * viewportHeight;
          bgLoading.style.bottom = bottomPosition + 'px';

      } else {
          console.warn("Brakuje elementu .bg-loading lub #loader-val");
      }
          


      }).then((unityInstance) => {
          readyPageFill();
          window.unityGame = unityInstance;
          bg.style.display = "none";
          htp.style.display = "none";
        }).catch((message) => {
          console.error("Błąd przy tworzeniu UnityInstance:", message);
          alert(message);
      });
  };
  document.body.appendChild(script);
  console.log("Script dodany do body");
}

Handlebars.registerHelper('decodeHTML', function(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  // Użyj innerHTML, aby zachować znaczniki HTML
  return new Handlebars.SafeString(doc.body.innerHTML);
});

await main();
