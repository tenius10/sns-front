import api from "../api";
import {useState, useRef, useContext} from "react";
import { useNavigate } from 'react-router-dom';
import { FormControl } from "react-bootstrap";
import Alert from "./Alert";
import {GlobalContext} from "./GlobalContext";

function LoginPage(){
    let navigate=useNavigate();

    const [id, setId]=useState("");
    const [pw, setPw]=useState("");
    const [loginError, setLoginError]=useState({type:'', message:''});
    const loginBtn=useRef(null);

    const [signUpModalActive, setSignUpModalActive]=useState(false);
    const [idInput,setIdInput]=useState("");
    const [pwInput, setPwInput]=useState("");
    const [nicknameInput, setNicknameInput]=useState("");
    const [emailInput, setEmailInput]=useState("");

    const [signUpError, setSignUpError]=useState({type:'', message:''});
    
    const {myInfo, setMyInfo}=useContext(GlobalContext);


    const showSignUpModal=()=>{
        setSignUpModalActive(true);
        setIdInput("");
        setPwInput("");
        setNicknameInput("");
        setEmailInput("");
        setSignUpError({type:'', message:''});
    }

    const closeSignUpModal=()=>{
        setSignUpModalActive(false);
        setIdInput("");
        setPwInput("");
        setLoginError({type:'', message:''});
    }

    const loadMyInfo=async()=>{
        await api.get('/api/users/me').then((result)=>{
            console.log("유저 조회 성공");
            setMyInfo(result.data);
        }).catch((error)=>{
            console.log("유저 조회 실패 : "+error);
        })
    };

    const login=async()=>{
        let success=false;

        await api.post("/api/auth/login",{
            username:id,
            password:pw
        }).then(async()=>{
            console.log("로그인 성공");
            await loadMyInfo();
            navigate("/");
        }).catch((error)=>{
            setLoginError({type:"danger", message:"로그인 실패"+error});
        });

        return success;
    };

    const signUp=async()=>{
      let success=false;

      await api.post('/api/auth/signup', {
          username:idInput,
          password:pwInput,
          nickname:nicknameInput,
          email:emailInput
      }).then(async()=>{
          console.log("회원가입 성공");
          closeSignUpModal();
      }).catch((error)=>{
          setSignUpError({type:"danger", message:"회원가입 실패"+error});
      });

      return success;
    };


    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}>
            <div className="hard-container bg-black centered-item"
                 style={{
                     width:'360px',
                     height:'550px',
                     paddingTop:'50px',
                     paddingBottom:'50px',
                     marginRight:'0px'
            }}>
                <h2 className="color-white text-bold">SNS</h2>
            </div>
            {
                signUpModalActive?
                    <div className="hard-container centered-item" style={{
                        width:'380px',
                        height:'550px',
                        paddingTop:'50px',
                        paddingBottom:'50px',
                        flexDirection: 'column',
                    }}>
                        <div className="centered-item">
                            <div className='text-bold color-dark'
                                 style={{fontSize:'30px', margin: '0 auto'}}>
                                SignUp
                            </div>
                        </div>
                        <br/>
                        <div className="input-group mb-3" style={{height:'45px'}}>
                            <FormControl type="text"
                                         placeholder="아이디"
                                         value={idInput}
                                         style={{backgroundColor:'#f4f4f4'}}
                                         onChange={(event)=>{
                                             setIdInput(event.target.value);
                                         }}
                            />
                        </div>
                        <div className="input-group mb-3" style={{height:'45px', marginTop:'-8px'}}>
                            <FormControl type="password"
                                         placeholder="비밀번호"
                                         value={pwInput}
                                         style={{backgroundColor:'#f4f4f4'}}
                                         onChange={(event)=>{
                                             setPwInput(event.target.value);
                                         }}
                            />
                        </div>
                        <div className="input-group mb-3" style={{height:'45px', marginTop:'-8px'}}>
                            <FormControl type="text"
                                         placeholder="닉네임"
                                         value={nicknameInput}
                                         style={{backgroundColor:'#f4f4f4'}}
                                         onChange={(event)=>{
                                             setNicknameInput(event.target.value);
                                         }}
                            />
                        </div>
                        <div className="input-group mb-3" style={{height:'45px', marginTop:'-8px'}}>
                            <FormControl type="text"
                                         placeholder="이메일"
                                         value={emailInput}
                                         style={{backgroundColor:'#f4f4f4'}}
                                         onChange={(event)=>{
                                             setEmailInput(event.target.value);
                                         }}
                            />
                        </div>
                        <div style={{width:'100%', marginTop:'4px'}}>
                            <button className="btn btn-outline-dark text-bold"
                                    style={{width:'100%', fontSize:'18px', height:'48px', marginBottom:'8px'}}
                                    onClick={(event)=>{
                                        event.target.disabled=true;
                                        //회원가입이 여러 번 실행되지 않도록 막음
                                        (async()=>{
                                            const success=await signUp();
                                            if(!success) event.target.disabled=false;
                                        })();
                                    }}>
                                회원가입
                            </button>
                            <button className="btn btn-outline-dark text-bold"
                                    style={{width:'100%', fontSize:'18px', height:'48px', marginBottom:'8px'}}
                                    onClick={closeSignUpModal}>
                                로그인 하러가기
                            </button>
                        </div>
                        <Alert type={('type' in signUpError)?signUpError.type:''}
                               message={('message' in signUpError)?signUpError.message:''}/>
                    </div>
                    :
                    <div className="hard-container centered-item" style={{
                        width:'380px',
                        height:'550px',
                        paddingTop:'50px',
                        paddingBottom:'50px',
                        flexDirection: 'column',
                    }}>
                        <div className="centered-item">
                            <div className='text-bold color-dark'
                                 style={{fontSize:'30px', margin: '0 auto'}}>
                                LogIn
                            </div>
                        </div>
                        <br/>
                        <div className="input-group mb-3" style={{height:'45px'}}>
                            <FormControl type="text"
                                         placeholder="아이디"
                                         value={id}
                                         style={{backgroundColor:'#f4f4f4'}}
                                         onChange={(event)=>{
                                             setId(event.target.value);
                                         }}
                            />
                        </div>
                        <div className="input-group mb-3" style={{height:'45px', marginTop:'-8px'}}>
                            <FormControl type="password"
                                         placeholder="비밀번호"
                                         value={pw}
                                         style={{backgroundColor:'#f4f4f4'}}
                                         onChange={(event)=>{
                                             setPw(event.target.value);
                                         }}
                            />
                        </div>
                        <div style={{width:'100%', marginTop:'4px'}}>
                            <button className="btn btn-outline-dark text-bold"
                                    style={{width:'100%', fontSize:'18px', height:'48px', marginBottom:'8px'}}
                                    ref={loginBtn}
                                    onClick={(event)=>{
                                        event.target.disabled=true;
                                        //로그인이 여러 번 실행되지 않도록 막음
                                        (async()=>{
                                            const success=await login();
                                            if(!success) event.target.disabled=false;
                                        })();
                                    }}>
                                로그인
                            </button>
                            <button className="btn btn-outline-dark text-bold"
                                    style={{width:'100%', fontSize:'18px', height:'48px', marginBottom:'8px'}}
                                    onClick={showSignUpModal}>
                                회원가입 하러가기
                            </button>
                        </div>
                        <Alert type={('type' in loginError)?loginError.type:''}
                               message={('message' in loginError)?loginError.message:''}/>
                    </div>
            }
        </div>
    );
}

export default LoginPage;