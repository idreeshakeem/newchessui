document.addEventListener("DOMContentLoaded", () => {
  let username = document.querySelector("#us");
  let email = document.querySelector("#email");
  let city = document.querySelector("#city");
  let mobileno = document.querySelector("#MobileNumber");
  let pass = document.querySelector("#pass");
  let cpass = document.querySelector("#cpass");

  let errormsg = document.querySelector("#errormsg");
  let submit = document.querySelector("#submit");
  let form = document.querySelector(".main");
  //form behaviour
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  submit.addEventListener("click", async () => {
    if (
      username.value.trim() === "" ||
      email.value.trim() === "" ||
      city.value.trim() == "" ||
      mobileno.value.trim() === "" ||
      pass.value.trim() === "" ||
      cpass.value.trim() === ""
    ) {
      errormsg.textContent = "All Fields are Required";
      errormsg.classList.remove("hide");
      setTimeout(() => {
        errormsg.textContent = "";
        errormsg.classList.add("hide");
      }, 5000);

      return;
    }

    if (pass.value.trim() !== cpass.value.trim()) {
      errormsg.textContent = "Password's don't Match";
      errormsg.classList.remove("hide");

      return;
    }
    let result = await sendingDataToBackend();
    if (result) {
      window.location.href = "/new-acc-submit";
    }
else{
    errormsg.textContent = "Unable to send otp,Try again!";
    errormsg.classList.remove("hide");
    return;
  }
  });

  // //eye button for passwords
  let eye = document.querySelector("#eye");
  let eye2 = document.querySelector("#eye2");
  eye.addEventListener("click", () => {
    if (pass.type === "password") {
      pass.type = "text";
    } else {
      pass.type = "password";
    }
  });
  eye2.addEventListener("click", () => {
    if (cpass.type === "password") {
      cpass.type = "text";
    } else {
      cpass.type = "password";
    }
  });

  //eye button for passwords was till here

  //sending data to backend
  async function sendingDataToBackend() {
    let userdata = {
      username: username.value,
      email: email.value,
      city: city.value,
      mobileno: mobileno.value,
      pass: pass.value,
      cpass: cpass.value,
    };

    if (1 == 1) {
      let response = await fetch("http://localhost:3000/datacreateacc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userdata),
      });

     var responseobj = await response.json();
      console.log(responseobj);

    }
    if(responseobj.status){
      return 1;

    }
    return 0;
  }


  //sending data to backend was till here
});
