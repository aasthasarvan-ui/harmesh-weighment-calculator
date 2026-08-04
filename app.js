import { 
auth,
database
} from "./firebase.js";


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





// Elements

const loginScreen =
document.getElementById("loginScreen");


const calculatorScreen =
document.getElementById("calculatorScreen");


const loadingScreen =
document.getElementById("loadingScreen");





const emailBox =
document.getElementById("email");


const message =
document.getElementById("loginMessage");







// Send Email Link

document
.getElementById("sendLinkBtn")
.onclick = async ()=>{


let email =
emailBox.value.trim();


if(!email){

message.innerHTML =
"Enter email address";

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



message.innerHTML =

"Verification link sent. Check your email";


}

catch(error){

message.innerHTML =
error.message;

}


};








// Check Email Login


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





localStorage.setItem(

"emailForSignIn",

email

);





await deviceLock(

result.user.uid,

email

);





openCalculator();



}

catch(error){

alert(error.message);

}



}

else{


loadingScreen.classList.add("hide");

loginScreen.classList.remove("hide");


}



}







// Device Lock


async function deviceLock(uid,email){



let deviceID =

btoa(

navigator.userAgent

);




let deviceRef =

ref(

database,

"devices/"+uid

);



let snapshot =

await get(deviceRef);





if(snapshot.exists()){



let oldDevice =

snapshot.val().deviceID;





if(oldDevice !== deviceID){


throw new Error(

"This device is not authorized"

);


}



}

else{



await set(

deviceRef,

{

email:email,

deviceID:deviceID,

date:new Date().toString()

}

);


}



}









// Open Calculator


function openCalculator(){


loadingScreen.classList.add("hide");

loginScreen.classList.add("hide");

calculatorScreen.classList.remove("hide");


}








// Calculator


function calculate(){



let total =



(Number(
document.getElementById("sku1").value
)
*
Number(
document.getElementById("bags1").value || 0
))


+

(Number(
document.getElementById("sku2").value
)
*
Number(
document.getElementById("bags2").value || 0
));





document.getElementById("totalWeight")

.innerHTML =

total.toFixed(3)+" KG";





document.getElementById("totalBags")

.innerHTML =


Number(
document.getElementById("bags1").value || 0
)

+

Number(
document.getElementById("bags2").value || 0
);



}






document
.getElementById("sku1")
.onchange=calculate;


document
.getElementById("sku2")
.onchange=calculate;


document
.getElementById("bags1")
.oninput=calculate;


document
.getElementById("bags2")
.oninput=calculate;







// Reset


document
.getElementById("resetBtn")
.onclick=()=>{


document.getElementById("bags1").value="";

document.getElementById("bags2").value="";


calculate();


};







checkEmailLogin();
if("serviceWorker" in navigator){

navigator.serviceWorker.register(
"service-worker.js"
);

}
