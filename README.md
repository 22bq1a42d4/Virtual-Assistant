<p align="center">
  <table>
    <tr>
      <td width="60" align="center">
        <img src="assets/robot_intro.jpg" alt="AI Assistant Logo" width="50" />
      </td>
      <td align="center">
        <h1><strong>Virtual Assistant</strong></h1>
      </td>
    </tr>
  </table>
</p>

<p align="center">
  An intelligent, locally hosted AI system designed for <strong>real-time conversations</strong>, <strong>voice-controlled interactions</strong>, and <strong>image-driven understanding</strong>.
  <br><br>
  Built with next-generation <em>multimodal large language models</em>, this assistant simulates human-like responses for seamless <strong>customer engagement</strong> and smart task automation.
</p>






---

## 🚀 Features

- 🧠 AI Chatbot powered by LLaMA3 & LLaVA (via Ollama)
- 🎤 Voice command recognition
- 🖼️ Image input and visual response generation
- 📞 Simulated AI phone call handling (Customer Care Agent)
- 🔐 Firebase Authentication (Login/Signup)
- 🧍 Real-time 3D Robot Model interaction
- 🌐 Works offline on local machine

---

## 🧱 Project Structure
```bash
virtual-assistant/
│
├── frontend/
│ ├── src/
│ ├── 019808ab-4e08-7793-90e2-8aeeb0fdefd3.glb # 3D Robot Model
│ ├── App.css
│ ├── App.js
│ ├── App.test.js
│ ├── background.webp
│ ├── index.css
│ ├── index.html
│ ├── index.js
│ ├── login.html
│ ├── logo.svg
│ ├── profile.html
│ ├── reportWebVitals.js
│ └── setupTests.js
│
├── backend/
│ ├── controllers/
│ ├── routes/
│ ├── server.js
│ ├── serviceAccountKey.json.json
│ ├── package.json
│ └── package-lock.json
```


---

## 💡 Technologies Used

### 🎨 Frontend Stack
<table> <tr> <td align="center"> <a href="https://developer.mozilla.org/en-US/docs/Web/HTML" target="_blank"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="50" height="50" alt="HTML5"/> <br><sub><b>HTML5</b></sub> </a> </td> <td align="center"> <a href="https://developer.mozilla.org/en-US/docs/Web/CSS" target="_blank"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="50" height="50" alt="CSS3"/> <br><sub><b>CSS3</b></sub> </a> </td> <td align="center"> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width="50" height="50" alt="JavaScript"/> <br><sub><b>JavaScript</b></sub> </a> </td> <td align="center"> <a href="https://reactjs.org/" target="_blank"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="50" height="50" alt="React"/> <br><sub><b>React</b></sub> </a> </td> <td align="center"> <a href="https://threejs.org/" target="_blank"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg" width="50" height="50" alt="Three.js"/> <br><sub><b>Three.js</b></sub> </a> </td> <td align="center"> <a href="https://firebase.google.com/products/auth" target="_blank"> <img src="https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg" width="50" height="50" alt="Firebase Auth"/> <br><sub><b>Firebase Auth</b></sub> </a> </td> <td align="center"> <a href="https://firebase.google.com/products/firestore" target="_blank"> <img src="https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg" width="50" height="50" alt="Firestore"/> <br><sub><b>Firestore</b></sub> </a> </td> </tr> </table>

### 🧠 Backend Stack
<table> <tr> <td align="center"> <a href="https://nodejs.org/" target="_blank"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="50" height="50" alt="Node.js"/> <br><sub><b>Node.js</b></sub> </a> </td> <td align="center"> <a href="https://expressjs.com/" target="_blank"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" width="50" height="50" alt="Express.js"/> <br><sub><b>Express.js</b></sub> </a> </td> <td align="center"> <a href="https://firebase.google.com/docs/admin/setup" target="_blank"> <img src="https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg" width="50" height="50" alt="Firebase Admin"/> <br><sub><b>Firebase Admin</b></sub> </a> </td> <td align="center"> <a href="https://ollama.com/library/llama3" target="_blank"> <img src="https://avatars.githubusercontent.com/u/169671556?s=200&v=4" width="50" height="50" alt="LLaMA 3"/> <br><sub><b>LLaMA 3</b></sub> </a> </td> <td align="center"> <a href="https://ollama.com/library/llava" target="_blank"> <img src="https://avatars.githubusercontent.com/u/169671556?s=200&v=4" width="50" height="50" alt="LLaVA"/> <br><sub><b>LLaVA</b></sub> </a> </td> </tr> </table>

---

## 📷 Sample Login Page

This project features a stylish login interface using Firebase Auth:
- 3D Robot Model (GLB)
- Split layout with secure sign-in
- Real-time auth state detection

![Login Page]



<img width="947" height="508" alt="vi" src="https://github.com/user-attachments/assets/a6426db7-2f5e-49d1-ada8-c40359e6bc3e" />

---

## 📦 Setup Instructions

### Prerequisites
- Node.js ≥ 18
- Ollama (LLaMA 3 & LLaVA models pulled)
- Firebase project set up
- GLB-supported 3D rendering enabled in browser

---

### 🔌 Backend Setup

```bash
cd backend
npm install
node server.js
```
Update serviceAccountKey.json.json with your Firebase Admin credentials.

### 🌐 Frontend Setup
```bash

cd frontend# If using Create React App
npm install
npm start
```
## 📚 Topics & Tags
<p align="left"> <a href="https://github.com/topics/chatbot" target="_blank"> <img src="https://img.shields.io/badge/-Chatbot-0A0A0A?style=for-the-badge&logo=openai&logoColor=white" alt="Chatbot"/> </a> <a href="https://github.com/topics/voice-commands" target="_blank"> <img src="https://img.shields.io/badge/-Voice_Commands-0A0A0A?style=for-the-badge&logo=soundcloud&logoColor=white" alt="Voice Commands"/> </a> <a href="https://github.com/topics/image-processing" target="_blank"> <img src="https://img.shields.io/badge/-Image_Processing-0A0A0A?style=for-the-badge&logo=opencv&logoColor=white" alt="Image Processing"/> </a> <a href="https://github.com/topics/nlp" target="_blank"> <img src="https://img.shields.io/badge/-NLP-0A0A0A?style=for-the-badge&logo=amazon-lex&logoColor=white" alt="NLP"/> </a> <a href="https://github.com/topics/machine-learning" target="_blank"> <img src="https://img.shields.io/badge/-Machine_Learning-0A0A0A?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Machine Learning"/> </a> <a href="https://github.com/topics/llm" target="_blank"> <img src="https://img.shields.io/badge/-LLM_Training-0A0A0A?style=for-the-badge&logo=meta&logoColor=white" alt="LLM Training"/> </a> <a href="https://github.com/topics/firebase" target="_blank"> <img src="https://img.shields.io/badge/-Firebase-0A0A0A?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase"/> </a> <a href="https://github.com/topics/ollama" target="_blank"> <img src="https://img.shields.io/badge/-Ollama-0A0A0A?style=for-the-badge&logo=vercel&logoColor=white" alt="Ollama"/> </a> <a href="https://ollama.com/library/llama3" target="_blank"> <img src="https://img.shields.io/badge/-LLaMA_3-0A0A0A?style=for-the-badge&logo=meta&logoColor=white" alt="LLaMA 3"/> </a> <a href="https://ollama.com/library/llava" target="_blank"> <img src="https://img.shields.io/badge/-LLaVA-0A0A0A?style=for-the-badge&logo=github&logoColor=white" alt="LLaVA"/> </a> </p>

## 🙋‍♂️ Author
<table> <tr> <td align="left" valign="middle" width="50"> <img src="https://avatars.githubusercontent.com/22bq1a42d4" width="48" style="border-radius: 50%;" alt="Author Avatar"/> </td> <td valign="middle"> <strong>Seelam Abhinav</strong> <br/> <sub>Student @ VVIT</sub> <br/> <a href="https://github.com/22bq1a42d4" target="_blank"> <img src="https://img.shields.io/badge/-GitHub_Profile-0A0A0A?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Profile"/> </a> </td> </tr> </table>


## 📄 License
This project is open-source and available under the MIT License.

---

