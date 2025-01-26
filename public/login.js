document.addEventListener("DOMContentLoaded", () => {
  let btn = document.querySelector("#btn");
  btn.addEventListener("click", async () => {
    let inputval = document.querySelector("#us");
    let inputval2 = document.querySelector("#password");

    let val1 = inputval.value.trim();

    let val2 = inputval2.value.trim();

   

    if (val1 && val2 != "") {
      inputval.value = "";
      inputval2.value = "";
    }

    let msg = document.getElementById("error");
    if (val1 === "" || val2 === "") {
      msg.textContent = "Plz Enter All  Necessray Details ";
    } else {
      msg.textContent = "";

      //making object

      let userdetails = {
        email: val1,
        password: val2,
      };
      senddatatoserver(userdetails);




    }









    async function senddatatoserver(userdetails) {
      let response = await fetch("http://localhost:3000/logindata", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(userdetails),
      });
      let parsedres = await response.json();
      console.log(parsedres);

if(parsedres.status==400){

msg.textContent="Email or Password is wrong"


}
else if(parsedres.status==200){

window.location.href="/userpaccopage"



}

    }
  });
});
