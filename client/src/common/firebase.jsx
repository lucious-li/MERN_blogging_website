import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { resolveValue } from "react-hot-toast";

const firebaseConfig = {
  apiKey: "AIzaSyALAH6yQhfeaQ_cIJU4zJP9nRhvD2hRANY",
  authDomain: "mern-blog-website-b2604.firebaseapp.com",
  projectId: "mern-blog-website-b2604",
  storageBucket: "mern-blog-website-b2604.appspot.com",
  messagingSenderId: "857891549707",
  appId: "1:857891549707:web:7e11b20951aee777e7cd0e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//google auth

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;
  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((err) => {
      console.log(err);
    });
  return user;
};
