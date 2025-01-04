// import React, { useContext, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../contexts/AuthContext';
// import Card from '@mui/material/Card';

// import Box from '@mui/material/Box';
// // import Card from '@mui/material/Card';
// import CardActions from '@mui/material/CardActions';
// import CardContent from '@mui/material/CardContent';
// import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';
// import { IconButton } from '@mui/material';
// import HomeIcon from '@mui/icons-material/home';



// export default function History() {

//     const { getHistoryOfUser } = useContext(AuthContext);

//     const [meetings, setMeetings] = useState([])

//     const routeTo = useNavigate();

//     useEffect(() => {
//         const fetchHistory = async () => {
//             try{
//                 const history = await getHistoryOfUser();
//                 // console.log("Fetched history:", history); 
//                 // setMeetings(history || []);
//                 setMeetings(Array.isArray(history) ? history : []);

//             }catch{
//                 //Implement SnackBar
//             }
//         }
//         fetchHistory();
//     },[])

//   return (
//     <div>
//         {
//             Array.isArray(meetings) && meetings.length == 0 ? (
//             meetings.map(e => {
//                 return(
//                     <>
//                     <IconButton onClick={() => {
//                         routeTo("/home")
//                     }}>
//                         <HomeIcon/>
//                     </IconButton>
//                     <Card variant="outlined">
//                     <CardContent>
//       <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
//         Word of the Day
//       </Typography>
      
//       <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>adjective</Typography>
      
//     </CardContent>
    
//                     </Card>
//                     </>
//                 )
//             })
//             ): (
//                 <Typography>No history found.</Typography>
//             )
//         }
//     </div>
//   )
// }


// import React, { useContext, useEffect, useState } from 'react'
// import { AuthContext } from '../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import Card from '@mui/material/Card';
// import Box from '@mui/material/Box';
// import CardActions from '@mui/material/CardActions';
// import CardContent from '@mui/material/CardContent';
// import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';
// import HomeIcon from '@mui/icons-material/Home';

// import { IconButton } from '@mui/material';
// export default function History() {


//     const { getHistoryOfUser } = useContext(AuthContext);

//     const [meetings, setMeetings] = useState([]);


//     const routeTo = useNavigate();

//     useEffect(() => {
//         const fetchHistory = async () => {
//             try {
//                 const history = await getHistoryOfUser();
//                 setMeetings(history);
//             } catch {
//                 // IMPLEMENT SNACKBAR
//             }
//         }

//         fetchHistory();
//     }, [])

//     let formatDate = (dateString) => {

//         const date = new Date(dateString);
//         const day = date.getDate().toString().padStart(2, "0");
//         const month = (date.getMonth() + 1).toString().padStart(2, "0")
//         const year = date.getFullYear();

//         return `${day}/${month}/${year}`

//     }

//     return (
//         <div>

//             <IconButton onClick={() => {
//                 routeTo("/home")
//             }}>
//                 <HomeIcon />
//             </IconButton >
//             {
//                 (meetings.length !== 0) ? meetings.map((e, i) => {
//                     return (

//                         <>


//                             <Card key={i} variant="outlined">


//                                 <CardContent>
//                                     <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
//                                         Code: {e.meetingCode}
//                                     </Typography>

//                                     <Typography sx={{ mb: 1.5 }} color="text.secondary">
//                                         Date: {formatDate(e.date)}
//                                     </Typography>

//                                 </CardContent>


//                             </Card>


//                         </>
//                     )
//                 }) : <></>

//             }

//         </div>
//     )
// }


import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton } from '@mui/material';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                console.log("Fetched history:", history); // Debug log
                setMeetings(Array.isArray(history) ? history : []); // Ensure array type
            } catch (error) {
                console.error("Error fetching history:", error); // Debug log
                setMeetings([]); // Set fallback
            }
        };
        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <div>
            <IconButton onClick={() => routeTo('/home')}>
                <HomeIcon />
            </IconButton>
            {Array.isArray(meetings) && meetings.length > 0 ? (
                meetings.map((e, i) => (
                    <Card key={i} variant="outlined">
                        <CardContent>
                            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                Code: {e.meetingCode}
                            </Typography>
                            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                Date: {formatDate(e.date)}
                            </Typography>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Typography>No meetings available.</Typography>
            )}
        </div>
    );
}
