document.addEventListener("DOMContentLoaded", () => {
  

    let details=document.querySelector("#btn")
    
    details.addEventListener("click",() =>{
    
    
    let inputval=document.querySelector("#us")
    let inputval2=document.querySelector("#pass")
    
    let val1=inputval.value;
      
      let val2=inputval2.value;
      
    if(val1&&val2!= null){
     
    inputval.value=""
      inputval2.value=""
    }
    
      
    let msg=document.getElementById("error")
    if(val1==="" || val2===""){
    msg.textContent="Plz Enter All  Necessray Details "
      
    }
      else {
        msg.textContent=""
      }
    
    
    
      
      
    })
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
      
    })