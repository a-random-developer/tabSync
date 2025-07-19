document.getElementById('allowBtn').addEventListener('click', () => {
  console.log("Button clicked");
  
  chrome.identity.getAuthToken({interactive:true},(token)=>{
    if(chrome.runtime.lastError){
      console.log("Error signing in user :- ",chrome.runtime.lastError);
    }else{
      window.close();
    }
  })
});
