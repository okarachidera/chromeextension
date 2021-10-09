let myLeads=[];
// let disEl=document.getElementById("dis-el");
const inputbtn=document.getElementById("input-btn");
const inputEl=document.getElementById("input-el");
const deleteBtn=document.getElementById("delete-btn");
const tabBtn=document.getElementById("tab-btn");
let ulEl=document.getElementById("ul-el");
let localleadstorage=JSON.parse(localStorage.getItem("clptech"));
// const tabs = [
//     {url: "https://www.linkedin.com/in/per-harald-borgen/"}
// ]

if (localleadstorage) {
    myLeads=localleadstorage
    render(myLeads);
}


deleteBtn.addEventListener("dblclick",function () {
    localStorage.clear();
    myLeads=[];
    render(myLeads)
});

tabBtn.addEventListener('click',function () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        myLeads.push(tabs[0].url)
        localStorage.setItem("clptech",JSON.stringify(myLeads));
        render(myLeads)
    })
})

inputbtn.addEventListener('click',function () {
    myLeads.push(inputEl.value)
    inputEl.value='';
    // convert to string
    myLeads=JSON.stringify(myLeads);
    // store in browser storage
    localStorage.setItem('clptech',myLeads);
    //convert to javascript
    myLeads=JSON.parse(myLeads);
    // disEl.innerHTML=myLeads
    render(myLeads);
})

function render(leads) {
    let listitems='';
    for(let i=0; i < leads.length; i++ ){
        // console.log(myLeads[i]); 
        // listitems+="<li><a href='"+myLeads[i]+"' target='_blank'>"+myLeads[i] +"</a></li>";
        listitems+=`<li>
                        <a href='${leads[i]}' target='_blank'>
                            ${leads[i]}
                        </a>
                    </li>`
    }
    ulEl.innerHTML=listitems  
}



