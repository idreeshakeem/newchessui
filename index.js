     
     document.addEventListener('DOMContentLoaded', () => {
        let burger=  document.querySelector(".burger")
     let uldiv=  document.querySelector(".divoflist");

     burger.addEventListener('click',()=>{
         // alert("clicked")
        uldiv.classList.toggle("hide")
       
     })
    })
