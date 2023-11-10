import { useState } from 'react';
import axios from 'axios';
import './Login.css';

export default function Login() {
  const [loginSuccess, setLoginSuccess] = useState<Boolean | null>(null);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const [username, password] = [event.target['username'].value, event.target['password'].value];
    // if (users.some((user) => user.username === username && user.password === password)) {
    //   localStorage.setItem('user', username);
    //   window.location.href = '/dashboard';
    // } else {
    //   alert("Not found!");
    // }

    axios.post('http://localhost:3001/api/login', {
      username: username,
      password: password,
    }, {
      withCredentials: true,
    }).then((response) => {
      if (!response.data['token']) {
        setLoginSuccess(false);
      } else {
        localStorage.setItem('token', response.data['token']);
        setLoginSuccess(true);
        window.location.href = '/dashboard';
      }
    }).catch(() => {
      // alert("Login failed!");
      setLoginSuccess(false);
    });
  };

  return (
    <>
      {/* <div className="card mb-3"> */}
      <div className="border row g-0 h-100 d-flex align-items-center">
        <div className="col d-none d-lg-flex login-wallpaper h-100">
        </div>
        <div className="border h-100 col-lg-3 align-items-center d-flex flex-row login-menu">
          <div className="py-5 px-5 w-100">
            <h1>Login</h1>
            <form
              className="d-flex flex-column gap-3 my-3"
              onSubmit={handleSubmit}
            >
              <div className="form-outline">
                <input
                  type='text'
                  className="form-control"
                  id='username'
                  name='username'
                  placeholder='Username'
                  required
                />
              </div>

              <div className="form-outline">
                <input
                  type='password'
                  className="form-control"
                  id='password'
                  name='password'
                  placeholder='Password'
                  required
                />
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                >
                  Sign in
                </button>
              </div>
            </form>
            {
              (
                loginSuccess === false
                  ? <p className="text-danger">Login failed!</p>
                  : <></>
              )
            }

          </div>
        </div>
      </div>
      {/* </div> */}
      {/* <div className='login-main'>
        <div className='login-picture'>
        </div>
        <div className='login-bar'>
          <div className='login-menu'>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
              <input
                type='text'
                className='input-username-password'
                id='username'
                name='username'
                placeholder='Username'
                required
              />
              <input
                className='input-username-password'
                type='password'
                id='password'
                name='password'
                placeholder='Password'
                required
              />
              <button
                type='submit'
              >
                Login
              </button>
            </form>
            {
              (
                loginSuccess === false
                  ? <>Login failed!</>
                  : <></>
              )
            }
          </div>
        </div>
      </div > */}
    </>
  );
}