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
const modifierInput = (event) => {
        let newValue = '';
        const target = event.target;

        if(isModifierKey(event)) {

            if (event.keyCode === 8) {

               if (target.selectionStart <= 19) {

                    let part1 = target.value.slice(0, target.selectionStart-1);
                    let part2 = target.value.slice(target.selectionStart);
                  
                    if (part2.length > 0) {
                        part2 = part2.replace(/\D/g, '');
                       
                        while(!Number.isInteger((part1.length + 1) / 5 )){
                            part1 += part2.slice(0,1);
                            part2 = part2.split('').slice(1).join('');

                        }
                        if(part2.length > 4) {
                            let n = part2.split('').map((item, i) => (i + 1) % 4 === 0 ? item + " " : item).join('');
                            part2 = n;
                        }
                        newValue =  `${part1} ${part2}`; 
                    } else {
                        newValue = part1;
                    }
                   
                }
            } else {
               if (
                (event.keyCode > 36 && event.keyCode < 41) 
                || (event.shiftKey === true || event.keyCode === 35 || event.keyCode === 36)
                ) {return;}
            }
        }
        return newValue;  
    }
const enforceFormat = (event) => {
    // Input must be of a valid number format or a modifier key
    if(!isNumericInput(event) && !isModifierKey(event)){
        event.preventDefault();
    }

    const target = event.target;

    if (modifierInput(event)) {
        event.preventDefault();
        target.value = modifierInput(event);
    }

    let inputLength = target.value.replace(/\D/g, '').length;


    if (isNumericInput(event)) {
        if (inputLength > 0 && inputLength%4 === 0 && target.value.length < 16) {
            target.value = `${target.value} `;
        } 
        if(inputLength >= 16){
            event.preventDefault();
        }
        
    } 

};

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

        let inp = new Verification(item);
        let val = inp.isRequired();
        if (item.id === "card" ) {
            if(val.replace(/\D/g, '').length === 16) {
        
                res.push(val);
            } else {
                inp.checkCard();
            }
        } else {
            res.push(val);
        }

    });

    let checkExpiration = new Verification(expiration);
    res.push(checkExpiration.isRequired());


    if (email) {
        let checkPost = new Verification(email);
        checkPost.isRequired();
        checkPost.checkEmail();
        res.push(checkPost.checkEmail());

    }
    console.log(res);
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
            return this.elem.value;
        }
    }
    checkCard(){
        this.message = "Card number shoud contain 16 integers";
        this.nextEl = this.elem.nextElementSibling;

        this.removeMessage();
        if (this.elem.value.length < 19) {
                this.valid = !this.valid;
                this.elem.classList.add('error');

                this.showError();
        } else {
            return this.elem.value;
        }
       
    }
}

( function(){
    let form = document.querySelector('form');
    let btn = form.querySelector('button');

    form.addEventListener('click', (e) => handleEmail(e, form, btn));
    btn.addEventListener('click', checkForm);
  
    let cardInputs = document.querySelectorAll('input[type="text"]');
    cardInputs.forEach((inp) => inp.addEventListener('keydown', enforceFormat)) ;

})()