function showLoader() {
  document.getElementById("loader").style.display = "block";
}
function hideLoader() {
  document.getElementById("loader").style.display = "none";
}
function getUrlParameter(parameterName) {
  // Tworzymy wyrażenie regularne do wyszukiwania parametru w query stringu
  var regex = new RegExp('[\\?&]' + parameterName + '=([^&#]*)');
  var results = regex.exec(window.location.search);

  // Jeśli parametr nie istnieje, zwracamy 'Undefined'
  if (results === null) {
      return 'Undefined';
  } else {
      // Dekodujemy wartość parametru
      return decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
}

function transformLocaleData(original) {
  const result = {};

  for (const sectionName in original.data.translation) {
    if (sectionName.startsWith(':')) continue; // Skip metadata keys

    const section = original.data.translation[sectionName];
    result[sectionName] = {};

    section.data.forEach(item => {
      // Convert "true" and "false" strings to boolean, numbers to actual numbers
      let value = item.value;
      if (value === "true") {
        value = true;
      } else if (value === "false") {
        value = false;
      } else if (!isNaN(value) && value.trim() !== '') {
        value = Number(value);
      }
      result[sectionName][item.xtnd_nt_labels] = value;
    });
  }

  return result;
}


async function eventSend(eventCategory, eventAction, eventLabel, eventName = "experience_event", screenName = "SAC25_McD_landing") {

  console.log("event send:"+eventLabel+", scr:"+screenName);

  const response = await window.xtnd.analytics.send({
    event: eventName,
    screen_name: screenName,
    event_category: eventCategory,
    event_action: eventAction,
    event_label: eventLabel,
  });

  console.log(JSON.stringify(response, null, 2));
}

async function getUserId() {
  const response = await window.xtnd.gam.getUserIdentity();
  //let res = JSON.stringify(response, null, 2)
  return response;
}

async function logUserIn() {
  const response = await window.xtnd.gam.logIn();
  //let res = JSON.stringify(response, null, 2)
  return response;
}

async function navigate(url, newTab = false) {
  const response = await window.xtnd.browser.navigate({
    url: url,
    newTab: newTab
  });

  return response;
}



export { showLoader, hideLoader, getUrlParameter, transformLocaleData, eventSend, getUserId, logUserIn, navigate };
