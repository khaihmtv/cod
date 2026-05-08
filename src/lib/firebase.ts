import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyD8_DWfsiU1UIWZlprB6jbcaucupLheSMo",
  authDomain: "sola-e9c81.firebaseapp.com",
  databaseURL: "https://sola-e9c81-default-rtdb.firebaseio.com",
  projectId: "sola-e9c81",
  storageBucket: "sola-e9c81.appspot.com",
  messagingSenderId: "108171829326",
  appId: "1:108171829326:web:25664ed4763f15d2eaa31f",
  measurementId: "G-XCL1ZCBVDJ"
};

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)