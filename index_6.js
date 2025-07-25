const firebaseConfig = {
  apiKey: "AIzaSyBDAbRGKNeUy9JgxSdidgjg8zt8rQo9Pu0",
  authDomain: "birthday-message-73cea.firebaseapp.com",
  databaseURL: "https://birthday-message-73cea-default-rtdb.firebaseio.com",
  projectId: "birthday-message-73cea",
  storageBucket: "birthday-message-73cea.appspot.com",
  messagingSenderId: "321402996238",
  appId: "1:321402996238:web:dd9820d58599522a209e5f"
};

// Initialize firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database().ref("users");

// DOM Elements
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const greetingText = document.getElementById("greetingText");
const birthdayMsg = document.getElementById("birthdayMsg");


// fallback quote
const defaultQuote = {
  quote: "Believe you can and you're almost there.",
  author: "Theodore Roosevelt, 1878"
};

const path = window.location.pathname;

function capitalize(name) {
  if (name.length === 0) {
    return "";
  } else {
    const firstLetter = name.charAt(0).toUpperCase();
    const rest = name.slice(1).toLowerCase();
    return firstLetter + rest;
  }
}


// --- SIGN UP ---
if (signupForm) {
  document.getElementById("btnSignUp").addEventListener("click", function (e) {
    e.preventDefault();

    const firstNameInput = document.getElementById("firstName").value.trim();
    const lastNameInput = document.getElementById("lastName").value.trim();
        function capitalize(str) {return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();} //convert 1st letters of names to upper//
    
    const firstName = capitalize(firstNameInput);
    const lastName = capitalize(lastNameInput);
    const birthDate = document.getElementById("birthDate").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();


    // field validations
    if (!firstName) {alert("First name is required.");
      return;
    }
    if (!lastName) {alert("Last name is required.");
      return;
    }
    if (!birthDate) {alert("Birth date is required.");
      return;
    }
    if (!email) {alert("Email is required.");
      return;
    }
    if (!password) {alert("Password is required in correct format.");
      return;
    }
    if (password.length < 8) {alert("Password must be at least 8 characters long.");
      return;
    }

    // then to firebase signup

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const uid = userCredential.user.uid;
        return db.child(uid).set({
          firstName,
          lastName,
          birthDate,
          email
        });
      })
      .then(() => {
        signupForm.reset();
        window.location.href = "./login.html";
      })
      .catch((error) => {
        console.error("Error during sign-up:", error);
        alert("Error: " + error.message);
      });
  });
}

//login
if (loginForm) {
  document.getElementById("btnLogin").addEventListener("click", function (e) {
    e.preventDefault();

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!loginForm.checkValidity()) {
      alert("Please enter a valid email and password.");
      return;
    }

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        // clear fields before redirect
        emailInput.value = "";
        passwordInput.value = "";
        loginForm.reset();

        // now redirect
        window.location.href = "./message.html";
      })
      .catch((error) => {
        console.error("Login error:", error);
        alert("Login failed: " + error.message);
      });
  });
}
// auth & Message
auth.onAuthStateChanged(async (user) => {
  const isLoginPage = path.includes("login.html");
  const isMessagePage = path.includes("message.html");

  if (!user && !isLoginPage) {
    window.location.href = "./login.html";
    return;
  }

  if (!isMessagePage || !user) return;

  try {
    const snapshot = await db.child(user.uid).once("value");
    const userdata = snapshot.val();
    if (!userdata) throw new Error("User data not found");

    const today = formatDate(new Date());  //current date only month & date "07-25'//
    const userBDay = formatDate(userdata.birthDate);

    if (greetingText) {
      greetingText.textContent = `Hello ${userdata.firstName}!`;
    }

    if (birthdayMsg) {
      if (today === userBDay) {
        birthdayMsg.innerHTML = `Happy Birthday to you! Wishing you Joy and Success in the Years ahead! <br>
          <img src="./images/bd-image.png" alt="birthday smiley face" style="width:200px; vertical-align:middle;" />`;

        const quoteData = await getQuote();
        if (quoteData) {
          const { quote, author } = quoteData;
          if (quoteText) quoteText.innerHTML = `"${quote}"`;
          if (quoteAuthor) quoteAuthor.innerHTML = ` - ${author}`;
        }
      } else {
        const daysLeft = daysUntilBirthday(userdata.birthDate);
        birthdayMsg.textContent = `${daysLeft} DAYS UNTIL YOUR BIRTHDAY!!`;
      }
    }

    } catch (error) {
      console.error("Error loading user data or quote:", error);
    }
  });


    const quoteText = document.getElementById("quoteText" );
    const quoteAuthor = document.getElementById( "quoteAuthor");


const getQuote = async () => {
  try {
    const res = await fetch("https://api.quotable.io/random");
    const data = await res.json();
    return {
      quote: data.content,
      author: data.author
    };
  } catch (error) {
    console.log("API failed, using default.");
    return null;
  }
};


// date functions //
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toISOString().slice(5, 10); // MM-DD
}

function daysUntilBirthday(birthDateStr) {
  const today = new Date();
  const birthDate = new Date(birthDateStr);
  birthDate.setFullYear(today.getFullYear());  //replaces the yob to current yr to calculate days vs today//
  if (birthDate < today) {
    birthDate.setFullYear(today.getFullYear() + 1);
  }
  const diffTime = birthDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));  //convert the diff from milliseconds to days//
};