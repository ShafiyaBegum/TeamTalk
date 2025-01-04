import React from 'react'
import "../App.css"
import { Link, useNavigate} from 'react-router-dom';
// import router from '../../../BACKEND/src/routes/users.routes';

export default function LandingPage() {
  const router = useNavigate();
  return (
    <div className='landingPageContainer'>
      <nav>
        <div className='navHeader'>
          <h2>TeamTalk</h2>
        </div>
        <div className='navlist'>
          <p onClick={() => {
            // window.location.href = "/ad23";
            router("/ad23")
          }
          }>Join as Guest</p>
          <p onClick={() => {
            router("/auth")
          }}>Register</p>
          <div onClick={() => {
            router("/auth")
          }} role = 'button'>
            <p>Login</p>
          </div>
        </div>
      </nav>
      <div class = "landingMainContainer">
        <div>
          <h1><span style = {{color: "#FF9839"}}>Connect</span> with your loved ones</h1>
          <p>Cover a distance by a Video Call</p>
          <div role = 'button'>
            <Link to = {"/auth"}>Get Started</Link>
          </div>
        </div>
        <div>
          <img src = "/mobile.png" alt = " "/>
        </div>
      </div>
    </div>
  )
}
