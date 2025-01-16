

document.addEventListener("DOMContentLoaded",async()=>{
    document.querySelector("#button").addEventListener("click",async(e)=>{
      e.preventDefault();
   let otp1=document.querySelector("#otp1")
let otp2=document.querySelector("#otp2")
let otp3=document.querySelector("#otp3")
let otp4=document.querySelector("#otp4")
let otp5=document.querySelector("#otp5")
let otp6=document.querySelector("#otp6")
let combinedOtp = { otp: otp1.value + otp2.value + otp3.value + otp4.value + otp5.value + otp6.value };
//console.log(combinedotp);
let response=await fetch("/verifyotp",{

    
method:"POST",
headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(combinedOtp),
});



let responseobj=await response.json();
console.log(responseobj);

if(responseobj.status){
window.location.replace("/loginaftercreateacc")

}
if(!responseobj.status){

  window.location.replace("/otpvftext")
}
    

})

})
