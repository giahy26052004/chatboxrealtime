

import React, { useState } from 'react';
import './App.css';

import 'firebase/firestore';
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

import { getFirestore, collection, query, orderBy, limit, serverTimestamp, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDgVd3NWjUuPl-qhjn1I3vYQKbWdSkb2xw",
  authDomain: "chat-wed-e060a.firebaseapp.com",
  projectId: "chat-wed-e060a",
  storageBucket: "chat-wed-e060a.appspot.com",
  messagingSenderId: "9250963084",
  appId: "1:9250963084:web:cacad7b53ebe6c945005a9",
  measurementId: "G-HRYFBTRWBX"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);



function App() {
  const [user] = useAuthState(auth)
  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(function (result) { })
      .catch(function (error) {
        alert(error);
      })
  };

  return (
    <button onClick={signInWithGoogle}>Sign In with Google</button>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()} > SignOut</button >
  )
}
function ChatRoom() {
  const dummy = React.useRef(null);
  const messagesRef = collection(firestore, 'messages');
  const q = query(collection(firestore, 'messages'), orderBy('createdAt'), limit(25));
  const [messages] = useCollectionData(q, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    try {
      await addDoc(collection(firestore, 'messages'), {
        text: formValue,
        createdAt: serverTimestamp(),
        uid: uid,
        photoURL: photoURL
      });

      // Xóa giá trị của formValue sau khi đã gửi tin nhắn thành công
      setFormValue('');
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  }
  return (
    <>
      <main>
        {messages && messages.map(msg => msg.text !== '' &&<ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}></input>
        <button type="submit">🕊️</button>
      </form>
    </>
  )
}
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div >
  )

}

export default App;
