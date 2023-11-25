//localStorage.clear();
function calculateAge(birthdate) {
            const today = new Date();
            const birthDate = new Date(birthdate);
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                return age - 1;
            } else {
                return age;
    }
}
const validate = (email,dobInput,tc) => {

    if (email.validity.typeMismatch) {
        email.setCustomValidity("I am expecting an email address!");
        email.reportValidity();

    } else {
        email.setCustomValidity("");
    }
    
    const dobValue = dobInput.value;
    
    const age = calculateAge(dobValue);

            if (age < 18 || age > 55) {
                dobInput.setCustomValidity("You must be between 18 and 55 years old to register.");
                dobInput.reportValidity();
    }
            else {
               dobInput.setCustomValidity("");  
    }

    const terms = tc.checked;
    if (terms == false) {
        tc.setCustomValidity("please click the checkbox to continue");
                tc.reportValidity();
    }
    else {
          tc.setCustomValidity("");  
    }
}

const email = document.getElementById("email");
const dobInput = document.getElementById("dob");
const tc = document.getElementById("Tc");


email.addEventListener('input', () => validate(email));


dobInput.addEventListener('input', () => validate(email, dobInput));
tc.addEventListener('input', () => validate(email, dobInput, tc));

let userform = document.getElementById("user-form");
let retrievedata = () => {
    let userdata = localStorage.getItem("User-entries");
    if (userdata) {
        userdata = JSON.parse(userdata);
    }
    else {
        userdata = [];
    }
    return userdata;
}
let displayEntries = () => {
    const userdata = retrievedata();
   // console.log(userdata);
    let tableEntries =userdata.map((entry) => {
        let nameCell = `<td class="tableelement">${entry.name} </td>`;
        let emailCell = `<td class="tableelement">${entry.email} </td>`;
        let passwordCell = `<td class="tableelement">${entry.password} </td>`;
        let dobCell = `<td class="tableelement">${entry.dob} </td>`;
        let tcCell = `<td class="tableelement">${entry.tc} </td>`;
        
        let row = `<tr>${nameCell} ${emailCell} ${passwordCell}  ${dobCell} ${tcCell} </tr>`;
        return row;

    }
    ).join('\n');
    
    
    let table = document.getElementById("entries");
   table.insertAdjacentHTML('beforeend', tableEntries);
    
}



let userdata = retrievedata();
const saveform = (event) => {
    event.preventDefault();
   
   
        let name = document.getElementById("name").value;
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        let dob = document.getElementById("dob").value;
        let tc = document.getElementById("Tc").checked;
    
        let entry = {
            name: name,
            email: email,
            password: password,
            dob: dob,
            tc: tc

        }
        userdata.push(entry);
        localStorage.setItem("User-entries", JSON.stringify(userdata));
        displayEntries();
    }

userform.addEventListener("submit", saveform);

displayEntries();