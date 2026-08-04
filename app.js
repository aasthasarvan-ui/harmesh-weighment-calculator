import { auth, database } from "./firebase.js";

import {
sendSignInLinkToEmail,
isSignInWithEmailLink,
signInWithEmailLink
}
from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


import {
ref,
set,
get
}
from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";



// GitHub Pages URL

const actionCodeSettings = {

url:
"https://aasthasarvan-ui.github.io/harmesh-weighment-calculator/",

handleCodeInApp:true

};



// Backup PIN

const MASTER_PIN = "1234";




// Open Calculator

function openCalculator(){

document.getElementById("loadingScreen")
.classList.add("hide");


document.getElementById("loginScreen")
.classList.add("hide");


document.getElementById("calculatorScreen")
.classList.remove("hide");

}





// Device Lock Function

async function deviceLock(uid,email){


let deviceID =
btoa(navigator.userAgent);



let deviceRef =
ref(database,"devices/"+uid);



let data =
await get(deviceRef);



if(data.exists()){


if(data.val().deviceID !== deviceID){

throw new Error(
"This device is not authorized"
);

}


}

else{


await set(deviceRef,{

email:email,

deviceID:deviceID,

date:new Date().toString()

});


}



}







// Email Link Send


document
.getElementById("sendLinkBtn")
.onclick = async ()=>{


let email =
document.getElementById("email").value.trim();


if(!email){

alert("Enter Email");

return;

}



try{


await sendSignInLinkToEmail(

auth,

email,

actionCodeSettings

);



localStorage.setItem(

"emailForSignIn",

email

);



document.getElementById("loginMessage")
.innerHTML =
"Verification link sent. Check your email";


}

catch(e){

alert(e.message);

}


};








// PIN Login


document
.getElementById("pinBtn")
.onclick = async ()=>{


let pin =
document.getElementById("pin").value;


if(pin === MASTER_PIN){



let uid = "pin_user";


try{


await deviceLock(

uid,

"PIN LOGIN"

);



openCalculator();


}

catch(e){

alert(e.message);

}



}

else{


alert("Wrong PIN");


}



};









// Email Link Verify


async function checkEmailLogin(){



if(

isSignInWithEmailLink(

auth,

window.location.href

)

){



let email =
localStorage.getItem(
"emailForSignIn"
);



if(!email){


email =
prompt(
"Enter your email"
);


}



try{


let result =

await signInWithEmailLink(

auth,

email,

window.location.href

);




await deviceLock(

result.user.uid,

email

);



openCalculator();



}

catch(e){


alert(e.message);


}



}

else{


document
.getElementById("loadingScreen")
.classList.add("hide");


document
.getElementById("loginScreen")
.classList.remove("hide");


}



}







// Calculator


function calculate(){


let total =


(Number(
document.getElementById("sku1").value
)
*
Number(
document.getElementById("bags1").value || 
