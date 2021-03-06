
const url = 'https://digital-coe-api.azurewebsites.net/lims3/getAllBooks';
var divEle=$("#container");

document.addEventListener('DOMContentLoaded', function() {
    $('#all-books-btn').click(function(){
        var url='https://digital-coe-api.azurewebsites.net/lims3/getAllBooks'
        
        fetch(url)
        .then((resp) => resp.json())
        .then(function (data) {
            divEle.html('<div></div>')
            console.log(data);
            appendElements(data)
        })
    })
    
    $('#recent-books-btn').click(function(){
        var url='https://digital-coe-api.azurewebsites.net/lims3/newBooks'
        
        fetch(url)
        .then((resp) => resp.json())
        .then(function (data) {
            divEle.html('<div></div>')
            console.log(data);
            appendElements(data);
        })
    })
    $('#header-div').click(function(){
        var newBoookscount=5;
        chrome.browserAction.setBadgeBackgroundColor({
            color:[255,0,0,255]
        })
        chrome.browserAction.setBadgeText({text:''+newBoookscount})
    })
});

function init(){
    fetch(url)
    .then((resp) => resp.json())
    .then(function (data) {
        console.log(data);
        appendElements(data)
        var link = $('#books-div');
        // onClick's logic below:
        $('#books-div').click (function() {
            chrome.tabs.create({
                // url: "https://digital-coe-lims.azurewebsites.net/"+$(this).attr('data-id')
                url: "https://digital-coe-lims.azurewebsites.net/"
           });
        });
    })
    .catch(function (error) {
        console.log(error);
    }); 
    chrome.browserAction.setBadgeText({text:''});  
}


function appendElements(data){
    data.map((item,i) => {
        if(item.image !=='./assets/images/noBookAvail.png' && (item.image !== null && item.image !== undefined )){
            console.log(item.image,i)
            var imgUrl=item.image
            if(imgUrl.split('assets').length>1)
                item.image=imgUrl.split('assets')[1]
            else
                item.image=imgUrl.split('assets')[0]
            divEle.append("<div id ='books-div' data-id='"+item._id+"' class='books-div'><div class='col-sm-8'><div class='title-div'>"+item.title+"</div><div class='author-div'>"+item.authors+"</div></div><div class='col-sm-4 img-div'><img src='"+item.image+"'/></div></div>")
        }
       // divEle.append("<div id ='books-div' data-id='"+item._id+"' class='books-div'><div class='col-sm-8'><div class='title-div'>"+item.title+"</div><div class='author-div'>"+item.authors+"</div></div><div class='col-sm-4 img-div'><img src='"+chrome.extension.getURL(item.image)+"'/></div></div>")
    });
}

init()