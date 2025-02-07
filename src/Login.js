import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Bar from './images/Bar.png';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href='/'> SmartClinic </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme = createTheme();


export default function SignInSide() {
  const [admin, setAdmin] = useState('');
  const [password, setPassword] = useState('');
  const handleChangeAdmin = e => {
    setAdmin(e.target.value);
  }
  const handleChangePassword = e => {
    setPassword(e.target.value);
  }
  const handleSubmit = (event) => {
    console.log(admin,password)
    event.preventDefault();
    if(admin === '' || password === ''){
        alert('กรุณากรอกข้อมูลให้ครบถ้วน')
    } else {
        const data = new FormData(event.currentTarget);
        const jsonData = {
            id_admin: data.get('admin'),
            password: data.get('password'),   
        }

        fetch("http://127.0.0.1:5001/adminlogin", { // เปลี่ยน URL ที่นี่
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonData),
        })
        .then((response) => response.json())
        .then((data) => {
            if(data.status === 'success'){
                alert('ยินดีต้อนรับเจ้าหน้าที่ระบบ')
                localStorage.setItem('token', data.token)
                window.location = '/admin'
            } else {
                alert('เข้าสู่ระบบล้มเหลว')
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    }
};



  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${Bar})`,
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              LOGIN
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="admin"
                label="Admin Address"
                name="admin"
                autoComplete="admin"
                autoFocus
                onChange={handleChangeAdmin}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={handleChangePassword}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                LOGIN
              </Button>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}