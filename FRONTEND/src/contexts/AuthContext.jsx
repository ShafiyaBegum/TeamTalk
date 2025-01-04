import axios from "axios";
import {createContext, useContext, useState} from "react";
import { useNavigate } from 'react-router-dom';
import httpStatus from 'http-status';

//import {createContext} from "react";

export const AuthContext = createContext({});
export const client = axios.create({
    baseURL : "http://localhost:8000/api/v1/users"
})

export const AuthProvider = ({children}) => {
    const authContext = useContext(AuthContext);
    const [userData, setUserData] = useState(authContext);
    //const [userData, setUserData] = useState(null); // Initialize state here
    const router = useNavigate();
    const handleRegister = async(name, username, password) => {
        try{
            let request = await client.post("/register", {
                name : name,
                username : username,
                password : password
            });
            if(request.status === httpStatus.CREATED){//instead of 201, you can use httpStatus.CREATED
                return request.data.message;
            }
        }catch(err){
            throw err;
        }
    }
    const handleLogin = async (username, password) => {
        try{
            let request = await client.post("/login", {
                username : username,
                password : password,
            });
            console.log(request.data);
            if(request.status === httpStatus.OK){
                localStorage.setItem("token", request.data.token);
                setUserData(request.data.user); // Store user data from the response gpt given
                router("/home");

            }
        }catch(err){
            throw err;
        }
    }
    //const router = useNavigate();

    const getHistoryOfUser = async () => {
        try{
            let request = await client.get("/get_all_activity", {
                params : {
                    token : localStorage.getItem("token")
                }
            });
            return request.data;
        }catch(err){
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try{
            let request = await client.post("/add_to_activity", {
                token : localStorage.getItem("token"),
                meeting_code : meetingCode
            });
            return request
        }catch(e){
            throw e;
        }
    }

    const data = {
        userData, setUserData, handleRegister, handleLogin, getHistoryOfUser, addToUserHistory
    }
    return (
        <AuthContext.Provider value = {data}>
            {children}
        </AuthContext.Provider>
    )
}