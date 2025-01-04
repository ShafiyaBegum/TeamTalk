import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { Snackbar } from '@mui/material';
//import httpStatus from 'http-status';

const defaultTheme = createTheme();
//const [error, setError] = React.useState("");

export default function Authentication() {

    const [username, setUsername] = React.useState();
    const [password, setPassword] = React.useState();
    const [name, setName] = React.useState();
    const [error, setError] = React.useState();
    const [message, setMessage] = React.useState();


    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const {handleRegister, handleLogin} = React.useContext(AuthContext);

    let handleAuth = async() => {
        try{
            if(formState === 0){ // for signin
              let result = await handleLogin(username, password);
              //console.log(result);
            }
            if(formState === 1){ // for signup
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
            }
        }catch(err){
            console.log(err);
            //return;
            //let message = (err.response.data.message || "Something went wrong");
            const message = (err.response && err.response.data && err.response.data.message) || "Something went wrong";
            setError(message);
        }
    }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />

        {/* Background image covering the entire page */}
        <Grid
          item
          xs={false}
          sm={false}
          md={false}
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            right: '600px',  // Reserves space for the sign-in form
            //backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',

            backgroundImage: 'url(https://img.freepik.com/premium-photo/grainy-gradient-background-red-white-blue-colors-with-soft-faded-watercolor-border-texture_927344-24167.jpg)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Sign-in form on the right side */}
        <Grid
          item
          xs={12}
          sm={12}
          md={5}
          component={Paper}
          elevation={6}
          square
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '600px',  // Fixed width for the sign-in form
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 4,
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>

            <div>
                <Button variant = {formState == 0? "contained" : ""} onClick= {() => setFormState(0)}>
                    Sign In
                </Button>
                <Button variant = {formState == 1? "contained" : ""} onClick = {() => setFormState(1)}>
                    Sign Up
                </Button>
            </div>
            
            <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
            <p>{name}</p>
            {formState == 1? <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Full Name"
                name="username"
                autoFocus
                onChange={(e) => setName(e.target.value)}
              />: <></>}
            
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}//here name is changed to username
                autoFocus
                onChange={(e) => setUsername(e.target.value)}

              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                value={password}
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}

              />
              <p style = {{color : "red"}}>{error}</p>
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick = {handleAuth}
              >
              {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

                <Snackbar
                open = {open}
                autoHideDuration = {4000}
                message = {message}
                onClose={() => setOpen(false)}
                />


    </ThemeProvider>
  );
}

