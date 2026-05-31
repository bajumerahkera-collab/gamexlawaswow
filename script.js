let current = 0;

const slides = document.querySelectorAll(".slides img");

setInterval(() => {

slides[current].style.display = "none";

current++;

if(current >= slides.length){
current = 0;
}

slides[current].style.display = "block";

},3000);
