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
get,
set
}
from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";



const actionCodeSettings = {

url:
"https://aasthasarvan-ui.github.io/harmesh-weighment-calculator/",

handleCodeInApp:true

};





function openCalculator(){

document
.getElementById("loginScreen")
.classList.add("hide");


document
.getElementById("calculatorScreen")
.classList.remove("hide");

}







// Device Lock

async function deviceLock(id,email){


let deviceID =
btoa(
navigator.userAgent
);



let deviceRef =
ref(database,"devices/"+id);



let data =
await get(deviceRef);



if(data.exists()){


if(data.val().deviceID !== deviceID){

throw new Error(
"Another device is already registered"
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








// Send Email Link


document
.getElementById("sendLinkBtn")
.onclick = async ()=>{


let email =
document
.getElementById("email")
.value.trim();



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



document
.getElementById("loginMessage")
.innerHTML =
"Verification link sent";


}

catch(e){

alert(e.message);

}


};









// PIN Login from Firebase


document
.getElementById("pinBtn")
.onclick = async ()=>{


let enteredPIN =

document
.getElementById("pin")
.value;



try{


let pinRef =
ref(database,"settings/pin");



let snap =
await get(pinRef);



let savedPIN =
snap.val();





if(enteredPIN === savedPIN){



await deviceLock(

"pin_device",

"PIN LOGIN"

);



openCalculator();



}

else{


alert("Wrong PIN");


}


}

catch(e){

alert(e.message);

}



};









// Email Verify


async function checkEmail(){



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
prompt("Enter Email");

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




document
.getElementById("totalWeight")
.innerHTML =
total.toFixed(3)+" KG";




document
.getElementById("totalBags")
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








document
.getElementById("resetBtn")
.onclick=()=>{


document.getElementById("bags1").value="";

document.getElementById("bags2").value="";

calculate();


};








checkEmail();



if("serviceWorker" in navigator){

navigator.serviceWorker.register(
"service-worker.js"
);

}
