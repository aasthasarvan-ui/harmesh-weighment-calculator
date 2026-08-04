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




// Backup PIN

const MASTER_PIN = "1234";




// Screen Change

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
btoa(navigator.userAgent);



let deviceRef =
ref(database,"devices/"+id);



let data =
await get(deviceRef);




if(data.exists()){


if(data.val().deviceID !== deviceID){


throw new Error(
"Device Not Authorized"
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



document.getElementById("loginMessage")
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
document.getElementById("pin").value;



if(pin === MASTER_PIN){


try{


await deviceLock(

"pin_device",

"PIN Login"

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


email =
prompt(
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







// Reset


document
.getElementById("resetBtn")
.onclick=()=>{


document.getElementById("bags1").value="";

document.getElementById("bags2").value="";

calculate();


};







checkEmail();
