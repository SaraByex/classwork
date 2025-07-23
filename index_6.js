const firebaseConfig = {
  apiKey: "AIzaSyBDAbRGKNeUy9JgxSdidgjg8zt8rQo9Pu0",
  authDomain: "birthday-message-73cea.firebaseapp.com",
  databaseURL: "https://birthday-message-73cea-default-rtdb.firebaseio.com",
  projectId: "birthday-message-73cea",
  storageBucket: "birthday-message-73cea.appspot.com",
  messagingSenderId: "321402996238",
  appId: "1:321402996238:web:dd9820d58599522a209e5f"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database().ref("users");

// DOM Elements
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const greetingText = document.getElementById("greetingText");
const birthdayMsg = document.getElementById("birthdayMsg");
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");

// Fallback quote
const defaultQuote = {
  quote: "Believe you can and you're halfway there.",
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
// date picker and user can also type, no future dates
const flatpickr("#birthDate", {dateFormat: "m/d/Y", maxDate: "today", allowInput: true, });

// --- SIGN UP ---
if (signupForm) {
  document.getElementById("btnSignUp").addEventListener("click", function (e) {
    e.preventDefault();

const firstNameInput = document.getElementById("firstName").value.trim();
const lastNameInput = document.getElementById("lastName").value.trim();

    const firstName = capitalize(firstNameInput);
    const lastName = capitalize(lastNameInput);
    const birthDate = document.getElementById("birthDate").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
   

    if (!signupForm.checkValidity()) {
      alert("Please fill out the form correctly.");
      return;
    }

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

// --- LOGIN ---
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

        // Now redirect
        window.location.href = "./message.html";
      })
      .catch((error) => {
        console.error("Login error:", error);
        alert("Login failed: " + error.message);
      });
  });
}
// --- AUTH & MESSAGE PAGE ---
auth.onAuthStateChanged(user => {
  const isLoginPage = path.includes("login.html");
  const isMessagePage = path.includes("message.html");

  if (!user && !isLoginPage) {
    window.location.href = "./login.html";
    return;
  }

  if (!isMessagePage || !user) return;

  // Fetch and display message if on message.html
  db.child(user.uid).once("value")
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) throw new Error("User data not found");

      const today = formatDate(new Date());
      const userBDay = formatDate(data.birthDate);

      if (greetingText) {
        greetingText.textContent = `Happy Birthday! ${data.firstName}!`;
      }

      if (birthdayMsg) {
        if (today === userBDay) {
          birthdayMsg.textContent = "Wishing you joy and success in the years ahead!";
        } else {
          const daysLeft = daysUntilBirthday(data.birthDate);
          birthdayMsg.textContent = `Your birthday is in ${daysLeft} day(s)!`;
        }
      }

      return getQuote();
    })
    .then(({ quote, author }) => {
      if (quoteText) quoteText.textContent = `"${quote}"`;
      if (quoteAuthor) quoteAuthor.textContent = ` - ${author}`;
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
});

// --- Utility Functions ---
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toISOString().slice(5, 10); // MM-DD
}

function daysUntilBirthday(birthDateStr) {
  const today = new Date();
  const birthDate = new Date(birthDateStr);
  birthDate.setFullYear(today.getFullYear());
  if (birthDate < today) {
    birthDate.setFullYear(today.getFullYear() + 1);
  }
  const diffTime = birthDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getQuote() {
  return fetch("https://api.quotable.io/random")
    .then(res => res.json())
    .then(data => ({ quote: data.content, author: data.author }))
    .catch(() => defaultQuote);
}