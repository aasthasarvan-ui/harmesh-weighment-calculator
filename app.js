import { auth, database } from "./firebase.js";

import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  ref,
  set,
  get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";


// GitHub URL
const actionCodeSettings = {
  url: "https://aasthasarvan-ui.github.io/harmesh-weighment-calculator/",
  handleCodeInApp: true
};

// Screen Change
function openCalculator() {
  document.getElementById("loginScreen").classList.add("hide");
  document.getElementById("calculatorScreen").classList.remove("hide");
}


// Device Lock (Fixed: Ab userAgent ki jagah localStorage use karega)
function getDeviceID() {
  let id = localStorage.getItem("my_device_id");
  if (!id) {
      // Agar first time hai, toh ek random ID generate karein
      id = "device_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("my_device_id", id);
  }
  return id;
}

async function deviceLock(id, email) {
  let deviceID = getDeviceID(); 
  let deviceRef = ref(database, "devices/" + id);
  
  let data = await get(deviceRef);

  if (data.exists()) {
    if (data.val().deviceID !== deviceID) {
      throw new Error("Device Not Authorized");
    }
  } else {
    await set(deviceRef, {
      email: email,
      deviceID: deviceID,
      date: new Date().toString()
    });
  }
}


// Email Link Send
document.getElementById("sendLinkBtn").onclick = async () => {
  let email = document.getElementById("email").value.trim();

  if (email === "") {
    alert("Enter Email");
    return;
  }

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem("emailForSignIn", email);
    document.getElementById("loginMessage").innerHTML = "Email link sent. Check your mail";
  } catch (error) {
    alert(error.message);
  }
};


// PIN Login (Fixed: Ab ye Firebase Database se PIN check karega)
document.getElementById("pinBtn").onclick = async () => {
  let pinInput = document.getElementById("pin").value.trim();

  if (pinInput === "") {
      alert("Please enter PIN");
      return;
  }

  try {
      let pinRef = ref(database, "admin/master_pin"); 
      let snapshot = await get(pinRef);

      if (snapshot.exists()) {
          // Firebase se mila hua PIN
          let dbPin = String(snapshot.val()); 

          if (pinInput === dbPin) {
              await deviceLock("pin_device", "PIN Login");
              openCalculator();
          } else {
              alert("Wrong PIN");
          }
      } else {
          alert("Error: Firebase me 'admin/master_pin' set nahi hai.");
      }
  } catch (e) {
      alert("Error connecting to database: " + e.message);
  }
};


// Email Verification Check
async function checkEmail() {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = localStorage.getItem("emailForSignIn");

    if (!email) {
      email = prompt("Enter Email");
    }

    try {
      let result = await signInWithEmailLink(auth, email, window.location.href);
      await deviceLock(result.user.uid, email);
      openCalculator();
    } catch (e) {
      alert(e.message);
    }
  }
}


// Calculator (Fixed: Ab NaN ka error nahi aayega agar input khali ho)
function calculate() {
  
  // Helper function: Khali string ya galat input ko 0 maan lega
  const getNumber = (id) => {
      let val = Number(document.getElementById(id).value);
      return isNaN(val) ? 0 : val;
  };

  let sku1 = getNumber("sku1");
  let bags1 = getNumber("bags1");
  let sku2 = getNumber("sku2");
  let bags2 = getNumber("bags2");

  let totalWeight = (sku1 * bags1) + (sku2 * bags2);
  let totalBags = bags1 + bags2;

  document.getElementById("totalWeight").innerHTML = totalWeight.toFixed(3) + " KG";
  document.getElementById("totalBags").innerHTML = totalBags;
}

document.getElementById("sku1").onchange = calculate;
document.getElementById("sku2").onchange = calculate;
document.getElementById("bags1").oninput = calculate;
document.getElementById("bags2").oninput = calculate;


// Reset
document.getElementById("resetBtn").onclick = () => {
  document.getElementById("bags1").value = "";
  document.getElementById("bags2").value = "";
  calculate(); // Ek baar wapas call karenge taaki total 0 ho jaye
};

// Init
checkEmail();
