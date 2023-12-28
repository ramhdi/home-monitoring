import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import './Navbar.css';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

type Props = {
  children: React.ReactNode,
  selectedMenu: "Dashboard" | "Maintenance" | "NotFound",
};

type Token = JwtPayload & {
  username?: string,
};

const menus = [
  {
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    name: "Maintenance",
    path: "/maintenance",
  },
];

export default function NavbarProtector(props: Props) {
  const [isTokenValid, setTokenValid] = useState<Boolean | null>(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTokenValid(false);
      return;
    }
    const tokenDecoded = jwtDecode<Token>(token);
    const tokenExpireEpoch = tokenDecoded.exp;
    const tokenUsername = tokenDecoded.username;

    if (!tokenUsername || !tokenExpireEpoch || tokenExpireEpoch < Date.now() / 1000) {
      setTokenValid(false);
      return;
    }

    setUsername(tokenUsername);
    setTokenValid(true);
  }, [props]);
  console.log(isTokenValid);
  if (isTokenValid === null) {
    return (<></>);
  } else if (isTokenValid === false) {
    // window.location.href = '/';
    setTimeout(() => { window.location.href = '/' }, 3000);
    return (<h1>Not Allowed!</h1>)
  }

  return (
    <>
      {/* <div className='header'>
        <div className='header-title'>
          <h3>Home Monitoring</h3>
        </div>
        <div className='header-menus'>
          {
            menus.map((menu) => {
              return (

                <div
                  key={menu.name}
                  className={'header-menu-element' + (props.selectedMenu === menu.name ? ' selected' : '')}
                >
                  <Link to={menu.path}>{menu.name}</Link>
                </div>
              )
            })
          }
          <div className='header-dropdown'>
            <div className='header-dropdown-title'>
              {username}
            </div>
            <div className='header-dropdown-element'>
              <Link to="/logout">Logout</Link>
            </div>
          </div>
        </div>
      </div> */}

      <Navbar expand="lg" className="bg-body-tertiary" bg="dark" data-bs-theme="dark">
        <Container fluid>
          <Navbar.Brand>Home Monitoring</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="justify-content-end flex-grow-1 pe-3">
              {
                menus.map((menu) => {
                  return (

                    <div
                      key={menu.name}
                    >
                      <Nav.Link><Link to={menu.path}>{menu.name}</Link></Nav.Link>
                    </div>
                  )
                })
              }
              <NavDropdown
                title={username}
                align="end"
              >
                <NavDropdown.ItemText><Link to="/logout">Logout</Link></NavDropdown.ItemText>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {props.children}
    </>
  );
}