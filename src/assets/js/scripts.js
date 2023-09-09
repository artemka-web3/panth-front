$(document).ready(function(){
    
    // hamburger
    $(".hamurger_menu").on('click',function(e){
        e.preventDefault();
        $(".header_menus").addClass("active")
    })
    
    $(".close").on('click',function(e){
        e.preventDefault();
        $(".header_menus").removeClass("active")
    })


    // 
});