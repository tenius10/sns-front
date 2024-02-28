import api from "../api";
import {useContext, useRef} from "react";
import { useNavigate } from "react-router-dom";
import {GlobalContext} from "./GlobalContext";

function Header(){
    let navigate=useNavigate();
    const {myInfo, setMyInfo}=useContext(GlobalContext);
    const logoutBtn=useRef(null);

    const logout=async()=>{
        api.post("/api/auth/logout", {}).then((result) => {
            console.log("로그아웃 성공");
            setMyInfo(null);
            navigate("/login");
        }).catch((error) => {
            console.log("로그아웃 실패 : " + error);
        });
    };


    return(
        <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
            <div className="container-fluid" style={{height:'38px'}}>
                <a onClick={(event)=>{
                    event.preventDefault();
                    document.body.classList.toggle('sb-sidenav-toggled');
                    localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
                }}>
                    <i className="fa-solid fa-bars" style={{color: '#969696', fontSize:'17px', paddingLeft:'14px'}}></i>
                </a>
                <h2 className="text-bold" onClick={()=>navigate('/')}>sns</h2>
                {
                    myInfo?
                        <div className="centered-row-item">
                            <div className="text-bold" style={{marginRight:'17px', fontSize:'16px'}}>
                                {myInfo.nickname}
                            </div>
                            <div style={{marginRight:'15px'}}
                                onClick={()=>{navigate(`/user/${myInfo.uid}`)}}>
                                <img className="round-border"
                                     style={{width:'35px', height:'35px'}}
                                     src={`http://localhost:8080/api/files/${myInfo.profileName}`}
                                />
                            </div>
                            <button className="btn btn-outline-danger float-end"
                                    ref={logoutBtn}
                                    style={{marginRight:'20px'}}
                                    onClick={(event)=>{
                                        event.target.disabled=true;
                                        //로그아웃이 여러 번 실행되지 않도록 막음
                                        (async()=>{
                                            const success=await logout();
                                            if(!success) event.target.disabled=false;
                                        })();
                                    }}>
                                로그아웃
                            </button>
                        </div>
                            :
                        <div>
                            <button className="btn btn-outline-primary float-end"
                                    style={{marginRight:'20px'}}
                                    onClick={()=>{navigate("/login");}}>
                                로그인
                            </button>
                        </div>
                }
            </div>
        </nav>
    );
}

export default Header;