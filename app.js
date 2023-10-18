const express = require('express');
const app = express();
const port = 5000;

const bodyParser = require('body-parser');
const session = require('express-session');
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));

app.set('view engine', 'ejs');
app.use(express.static('public'));

const firebaseConfig = {
  apiKey: "AIzaSyCCi3CEYxk5jgM35tjY5gM-gRuhFKW49L8",
  authDomain: "project-1c95b.firebaseapp.com",
  projectId: "project-1c95b",
  storageBucket: "project-1c95b.appspot.com",
  messagingSenderId: "561106188109",
  appId: "1:561106188109:web:fbb05fa53a88b6ae94a904",
  measurementId: "G-WC4WRVDN84"
};
const app1 = initializeApp(firebaseConfig);
const auth = getAuth(app1);
const db = getFirestore(app1);

app.get('/', (req, res) => {
  res.render('home');
});

app.get("/about", (req, res) => {
  res.render("about");
});


app.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

app.post('/signupSubmit', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Storing user details in Firestore
    const personalDetailsRef = doc(db, 'Personal', user.uid);
    await setDoc(personalDetailsRef, {
      email: email,
      password : password
    });

    res.render('login');
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      res.render('signup', { error: 'Email already in use. Please choose a different one.' });
    } else {
      console.error('Signup error:', error.code, error.message);
      res.render('signup', { error: 'An error occurred during signup. Please try again later.' });
    }
  }
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/loginSubmit', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    req.session.loggedin = true;
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error.message);
    res.render('login', { error: 'Invalid email or password. Please try again.' });
  }
});

app.get('/dashboard', (req, res) => {
  if (req.session.loggedin) {
    res.render('dashboard');
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', async (req, res) => {
  try {
    await signOut(auth);
    req.session.loggedin = false;
    res.redirect('/');
  } catch (error) {
    console.error('Logout error:', error.message);
    res.redirect('/dashboard');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
