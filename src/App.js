import { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword,onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {useNavigate} from 'react-router-dom';
import Chat from './Chat';
import background from "./Imagenes/tigre.jpg";

import 'bootstrap/dist/css/bootstrap.min.css';

const firebaseConfig = {
  apiKey: "AIzaSyADqCOcc0wsJWT976zLDbvY1YQHbG4XtxU",
  authDomain: "chatclases-371b0.firebaseapp.com",
  projectId: "chatclases-371b0",
  storageBucket: "chatclases-371b0.appspot.com",
  messagingSenderId: "767760354520",
  appId: "1:767760354520:web:9787710d5c12edbca35bad",
  measurementId: "G-V81FCVHGWT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(firestore, 'users', userCredential.user.uid));
      console.log(userDoc.data());
      navigate('/Chat');
      setIsLoggedIn(true); 
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="container-fluid p-0">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand mx-auto" href="#">Logo</a>
      </nav>
      <div className="container mt-0"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: '100%',
        backgroundRepeat: 'no-repeat',
        minHeight: '91vh',
        minWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 className="text-center"
          style={{
            color: `white`,
          }}
        >Mi aula virtual</h1>
        {isLoggedIn ? ( 
          <Chat currentUserUid={currentUser.uid}/>
        ) : (
          <>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label"
                  style={{
                    color: `white`,
                  }}
                >
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label"
                  style={{
                    color: `white`,
                  }}
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Iniciar Sesión
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
                
export default App;
                
                
                
                
                
                
                