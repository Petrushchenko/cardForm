"use strict";

const isNumericInput = (event) => {
    const key = event.keyCode;
    return ((key >= 48 && key <= 57) || // Allow number line
        (key >= 96 && key <= 105) // Allow number pad
    );
};

const isModifierKey = (event) => {
    const key = event.keyCode;
    return (event.shiftKey === true || key === 35 || key === 36) || // Allow Shift, Home, End
        (key === 8 || key === 9 || key === 13 || key === 46) || // Allow Backspace, Tab, Enter, Delete
        (key > 36 && key < 41) || // Allow left, up, right, down
        (
            // Allow Ctrl/Command + A,C,V,X,Z
            (event.ctrlKey === true || event.metaKey === true) &&
            (key === 65 || key === 67 || key === 86 || key === 88 || key === 90)
        )
};
const enforceFormat = (event) => {
    // Input must be of a valid number format or a modifier key
    if(!isNumericInput(event) && !isModifierKey(event)){
        event.preventDefault();
    }

    const target = event.target;
    let inputLength = target.value.replace(/\D/g, '').length;
    let cursorStart = target.selectionStart;
    console.log(cursorStart);

    if(isModifierKey(event)) {
        //console.log(target.selectionStart);

        if (
            (event.keyCode > 36 && event.keyCode < 41) 
            || (event.shiftKey === true || event.keyCode === 35 || event.keyCode === 36)
            ) {
            return;
        } else {
           // target.value = target.value.replace(/\D/g, '');
            console.log(target.value, target.selectionStart, inputLength);

            if (target.selectionStart < 19) {
                let modifiedInput = '';

                /*for (var i = 0; i < inputLength; i+=4) {
                    modifiedInput += target.value.slice(i, i+4) + " " ;
                    console.log(i, modifiedInput);
                }
                console.log(modifiedInput)
                target.value = modifiedInput;*/
                let part1 = target.value.slice(0, target.selectionStart-1);
                let part2 = target.value.slice(target.selectionStart);
                part2 = part2.replace(/\D/g, '');
                let newValue =  part1 + part2; 
                //target.selectionStart = target.selectionStart +1;

                console.log(target.value, 
                    "aaaaa "+part1,
                    "bbbbb "+part2,
                     Math.floor(target.selectionStart / 5), newValue);
            }
        }
        
        console.log(event.eventPhase);
    
    }


    if (isNumericInput(event)) {

        //let inputLength = target.value.replace(/\D/g, '').length;

        if (inputLength > 0 && inputLength%4 === 0 && target.value.length < 16) {
            target.value = `${target.value} `;
        } 
        if(inputLength >= 16){
            event.preventDefault();
        }
        
    } else {
       // formatToPhone(event);
   // console.log(target.value, inputLength);
    }

};

const formatToPhone = (event) => {
    if(isModifierKey(event)) {
        console.log('yes')
        return;
    }
     const target = event.target;
    let inputLength = target.value.replace(/\D/g, '').length;


   /* if (target.value.length <= 16) {
            let modifiedInput = '';

            for (var i = 0; i <= inputLength; i+=4) {
                modifiedInput += target.value.slice(i, i+4) + " " ;
                console.log(i);
            }
            console.log(modifiedInput)
            target.value = modifiedInput;
            console.log(target.value);
        }*/
    // I am lazy and don't like to type things more than once
    /*const target = event.target;
    const input = target.value.replace(/\D/g,'').substring(0,10); // First ten digits of input only
    const zip = input.substring(0,3);
    const middle = input.substring(3,6);
    const last = input.substring(6,10);

    if(input.length > 6){target.value = `(${zip}) ${middle} - ${last}`;}
    else if(input.length > 3){target.value = `(${zip}) ${middle}`;}
    else if(input.length > 0){target.value = `(${zip}`;}*/

};

( function(){
    let form = document.querySelector('form');
    let btn = form.querySelector('button');

    form.addEventListener('click', (e) => handleEmail(e, form, btn));
    btn.addEventListener('click', checkForm);

    
    let cardInput = document.querySelector('#card');
    cardInput.addEventListener('keydown', enforceFormat);
   // cardInput.addEventListener('input',formatToPhone);

})()

// Show or hide <input type="email" >
function handleEmail(e, parent, el) {

    if (e.target.name === "save") {
        if (e.target.checked) {
            let email = document.createElement('input');
            email.type = "email";
            email.name = "email";
            email.placeholder="Email";
            email.required = true;
            parent.insertBefore(email, el);

        } else {
            parent.removeChild(document.querySelector('input[type="email"]'));
        }
    }
    
}

function checkForm (e) {
    e.preventDefault();

    let expiration = document.querySelector('[data-toggle="datepicker"]');
    let email = document.querySelector('[type="email"]');
    let storeCheckbox = document.querySelector('[type="checkbox"]'); 
    let textFields = document.querySelectorAll('[type="text"]');
    let res = [];

    textFields.forEach((item) => {

        if (item.id === 'card') {
            console.log(item)
        }

        let inp = new Verification(item);
        res.push(inp.isRequired());

    });

    let checkExpiration = new Verification(expiration);
    res.push(checkExpiration.isRequired());


    if (email) {
        let checkPost = new Verification(email);
        checkPost.isRequired();
        checkPost.checkEmail();
        res.push(checkPost.checkEmail());

    }
    console.log(res, res.every((item) => item));
    if(res.every((item) => item)) {
        let preloader = document.querySelector('.preloader');

        preloader.style.display = "block";
        setTimeout(() => preloader.style.display = "none", 2000);
    }
}


class Verification {
    constructor(elem){
        this.elem= elem;
        this.required = elem.required;
        this.nextEl = this.elem.nextElementSibling;
        this.parentElem = this.elem.parentElement;
        this.valid = true;
        this.message = "This field is required";  
    }

    showError(){
        let mes = document.createElement('span');
        mes.textContent = this.message;
        mes.className = "message";

        if (this.valid) {
            this.elem.classList.remove('error');
            if(this.nextEl.classList.contains("message")) this.parentElem.removeChild(this.nextEl); 

        } else {
            if (!this.nextEl.classList.contains("message")) {
                this.parentElem.insertBefore(mes, this.elem.nextElementSibling);
            }
        } 
        this.valid =!this.valid;
    }

    removeMessage(){
        this.elem.addEventListener('focus', (e) => {
            this.elem.classList.remove('error');
            this.nextEl = this.elem.nextElementSibling;

            if(this.nextEl.classList.contains("message")) this.parentElem.removeChild(this.nextEl); 
        });
        this.elem.addEventListener('change', () => this.elem.classList.remove('error'));
    }
    isRequired(){
        if (this.required) {
           if (this.elem.value.length != 0) {
                if (this.nextEl.classList.contains("message")) {
                    this.parentElem.removeChild(this.nextEl); 

                } 
           } else {
                this.valid = !this.valid;
                this.elem.classList.add('error');
                this.showError();

           }
        }
        this.removeMessage();
        return this.elem.value;
    }

    checkEmail(){
        this.nextEl = this.elem.nextElementSibling;

        this.message = "Invalid Email address";

        const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;

        if (!reg.test(this.elem.value)) {
            this.elem.classList.add('error');
            this.valid = !this.valid;
            this.showError();
  
        } else {
            this.elem.classList.remove('error');
            this.removeMessage();

        }
        return this.elem.value;
    }

}
