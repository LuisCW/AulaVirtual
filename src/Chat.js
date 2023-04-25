import { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onDisconnect, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import {useNavigate} from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Container, Row, Col } from 'react-bootstrap';

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
const db = getFirestore(app);
const messagesCollection = collection(db, 'messages');
const usersCollection = collection(db, 'users');
const auth = getAuth(app);
const database = getDatabase(app);

function Chat() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(messagesCollection, orderBy("sentAt"), (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ ...doc.data(), id: doc.id });
      });
      setMessages(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userQuery = query(usersCollection, where("uid", "==", user.uid));
          const userQuerySnapshot = await getDocs(userQuery);
          const onlineUsersRef = query(usersCollection, where("online", "==", true));
          const unsubscribe = onSnapshot(onlineUsersRef, (querySnapshot) => {
            const data = [];
            querySnapshot.forEach((doc) => {
              data.push({ ...doc.data(), id: doc.id });
            });
            console.log("Online users:", data);
            setOnlineUsers(data);
          });
          
          if (userQuerySnapshot.docs.length === 0) {
            console.log("El usuario actual no se encuentra en la colección 'users'");
          } else {
            const userData = userQuerySnapshot.docs[0].data();
            console.log("El usuario actual es:", userData.Usuario);
            const userRef = ref(database, `users/${user.uid}`);
            set(userRef, { ...userData, online: true });
            onDisconnect(userRef).set({ ...userData, online: false });
          }
          
        } catch (error) {
          console.log("Error al buscar el usuario actual:", error);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
 
  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (text.trim() !== '') {
      if (!currentUser) {
        console.log("No se ha iniciado sesión");
        return;
      }
    
      try {
        const userQuery = query(usersCollection, where("uid", "==", currentUser.uid));
        const userQuerySnapshot = await getDocs(userQuery);
        
        if (userQuerySnapshot.docs.length === 0) {
          console.log("El usuario actual no se encuentra en la colección 'users'");
          return;
        }
        
        const userData = userQuerySnapshot.docs[0].data();
          
        await addDoc(messagesCollection, {
          text,
          createdAt: new Date(),
          Usuario: userData.Usuario,
          Rol: userData.Rol,
          userId: currentUser.uid
        });
        
        setText('');
      } catch (error) {
        console.log("Error al agregar el mensaje:", error);
      }
    }
  };
  
  const handleLogout = () => {
    window.location.reload();
    navigate('/App.js');
  };

  return (
    <Container fluid>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand>Clase Virtual</Navbar.Brand>
        <Nav className="ml-auto">
          <Nav.Link onClick={handleLogout}>Cerrar sesión</Nav.Link>
        </Nav>
      </Navbar>
      <Row>
        <Col lg={8}>
          <video width="100%" height="auto" controls>
            <source src="https://www.youtube.com/embed/l0Xtt9WpHVY" type="video/mp4" />
          </video>
        </Col>
        <Col lg={4}>
        <div className="chat-wrapper" style={{ backgroundColor: 'white', height: '400px', overflowY: 'scroll' }}>
  <ul>
    {messages.map((message) => (
      <li key={message.id}>
        {message.text}
        <br />
        <small>
          <em>{message.Usuario} - {message.Rol}</em>
        </small>
      </li>
    ))}
  </ul>
  <form onSubmit={handleSubmit}>
    <div className="input-group">
      <input
        type="text"
        className="form-control"
        placeholder="Escribe un mensaje..."
        value={text}
        onChange={handleChange}
      />
      <div className="input-group-append">
        <button className="btn btn-primary" type="submit">Enviar</button>
      </div>
    </div>
  </form>
</div>

        </Col>
      </Row>
    </Container>
  );
}

export default Chat;



