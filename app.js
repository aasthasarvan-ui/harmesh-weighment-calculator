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




// GitHub URL

const actionCodeSettings = {

url:

"https://aasthasarvan-ui.github.io/harmesh-weighment-calculator/",

handleCodeInApp:true

};





// Open Calculator Screen

function openCalculator(){


document
.getElementById("loginScreen")
.classList.add("hide");


document
.getElementById("calculatorScreen")
.classList.remove("hide");


}







// Firebase PIN Check

async function checkPIN(inputPIN){


let pinRef = ref(

database,

"settings/pin/value"

);



let snapshot = await get(pinRef);



if(snapshot.exists()){


return inputPIN === snapshot.val();


}


return false;


}








// Maximum 10 Device Lock

async function deviceLock(id,email){



let deviceID = btoa(

navigator.userAgent +

screen.width +

screen.height

);




let deviceRef = ref(

database,

"devices/"+id

);




let data = await get(deviceRef);





if(data.exists()){



let devices = data.val().devices || [];




// Already Registered

if(devices.includes(deviceID)){


return;


}




// Maximum Limit

if(devices.length >= 10){


throw new Error(

"Maximum 10 devices allowed"

);


}




devices.push(deviceID);





await set(deviceRef,{

email:email,

devices:devices,

date:new Date().toString()

});



}

else{


await set(deviceRef,{

email:email,

devices:[deviceID],

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
.value
.trim();



if(email===""){


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

"Email link sent. Check your mail";


}

catch(error){


alert(error.message);


}


};









// PIN Login

document
.getElementById("pinBtn")
.onclick = async ()=>{


let pin =
document
.getElementById("pin")
.value;



try{


let valid = await checkPIN(pin);



if(valid){



await deviceLock(

"pin_device",

"PIN Login"

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









// Email Verification Check

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


email = prompt(

"Enter Email"

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



}

// Calculator

function calculate(){



let total =

(
Number(
document.getElementById("sku1").value
)
*
Number(
document.getElementById("bags1").value || 0
)

)

+

(

Number(
document.getElementById("sku2").value
)

*

Number(
document.getElementById("bags2").value || 0
)

);





document
.getElementById("totalWeight")
.innerHTML =

total.toFixed(3) + " KG";





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







// Auto Calculate

document
.getElementById("sku1")
.onchange = calculate;


document
.getElementById("sku2")
.onchange = calculate;


document
.getElementById("bags1")
.oninput = calculate;


document
.getElementById("bags2")
.oninput = calculate;









// Reset Button

document
.getElementById("resetBtn")
.onclick = ()=>{


document
.getElementById("bags1")
.value = "";



document
.getElementById("bags2")
.value = "";



calculate();


};









// Start Email Check

checkEmail();