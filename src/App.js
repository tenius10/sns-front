import './App.css';
import { useEffect } from "react";
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PostList from "./components/PostList";
import LoginPage from "./components/LoginPage";
import PostDetails from "./components/PostDetails";
import UserDetails from "./components/UserDetails";
import {ContextProvider} from "./components/GlobalContext";

function App() {
    useEffect(() => {
        document.body.style.backgroundColor = '#f4f4f4';
    }, []);

    return (
        <div className="App">
            <ContextProvider>
                <Router>
                    <div id="page-content-wrapper">
                        <Routes>
                            <Route path="/login" element={<LoginPage/>} />
                            <Route path="/" element={<PostList/>} />
                            <Route path="/post/:pno" Component={PostDetails} />
                            <Route path="/user/:uid" Component={UserDetails} />
                        </Routes>
                    </div>
                </Router>
            </ContextProvider>
        </div>
    );
}

export default App;
