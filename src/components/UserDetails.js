import api from "../api";
import {useEffect, useState, useRef, useContext} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Header from "./Header";
import {FormControl} from "react-bootstrap";
import {GlobalContext} from "./GlobalContext";
import Modal from "react-bootstrap/Modal";



function UserDetails(){
    let navigate=useNavigate();

    const { uid } = useParams();
    const {myInfo, setMyInfo}=useContext(GlobalContext);

    //유저 페이지 정보
    const [userInfo, setUserInfo]=useState(null);
    const [postCount, setPostCount]=useState(0);
    const [followerCount, setFollowerCount]=useState(0);
    const [followingCount, setFollowingCount]=useState(0);
    const [followed, setFollowed]=useState(false);

    const [postList, setPostList]=useState([]);
    const [postCursor, setPostCursor]=useState(null);
    const [hasNextPost, setHasNextPost]=useState(true);

    //팔로워 목록
    const [followerModalActive, setFollowerModalActive]=useState(false);
    const [followerList, setFollowerList]=useState([]);
    const [followerCursor, setFollowerCursor]=useState(null);
    const [hasNextFollower, setHasNextFollower]=useState(true);

    //팔로잉 목록
    const [followingModalActive, setFollowingModalActive]=useState(false);
    const [followingList, setFollowingList]=useState([]);
    const [followingCursor, setFollowingCursor]=useState(null);
    const [hasNextFollowing, setHasNextFollowing]=useState(true);

    //프로필 수정
    const [modifyProfileModalActive, setModifyProfileModalActive]=useState(false);
    const profileInputField=useRef();

    const [nicknameInput, setNicknameInput]=useState("");
    const [introInput, setIntroInput]=useState("");

    const [profilePreview, setProfilePreview] = useState(null);
    const [selectedProfile, setSelectedProfile]=useState(null);
    const [defaultProfile, setDefaultProfile]=useState(false);



    const showModifyProfileModal=()=>{
        setModifyProfileModalActive(true);
        setNicknameInput(userInfo.nickname);
        setIntroInput(userInfo.intro);
    };

    const closeModifyProfileModal=()=>{
        setModifyProfileModalActive(false);
        setProfilePreview(null);
        setSelectedProfile(null);
        setDefaultProfile(false);
    };

    const showFollowerModal=()=>{
        loadFollowerList({baseList:[], cursor:null, hasNext:true});
        setFollowerModalActive(true);
    }

    const closeFollowerModal=()=>{
        setFollowerList([]);
        setFollowerCursor(null);
        setHasNextFollower(true);
        setFollowerModalActive(false);
    }

    const showFollowingModal=()=>{
        loadFollowingList({baseList:[], cursor:null, hasNext:true});
        setFollowingModalActive(true);
    }

    const closeFollowingModal=()=>{
        setFollowingList([]);
        setFollowingCursor(null);
        setHasNextFollowing(true);
        setFollowingModalActive(false);
    }


    const loadMyInfo=async()=>{
        await api.get('/api/users/me').then((result)=>{
            console.log("유저 조회 성공");
            setMyInfo(result.data);
        }).catch((error)=>{
            console.log("유저 조회 실패 : "+error);
        })
    };

    const loadUserPage=(uid)=>{
        if(!uid) return;
        api.get(`/api/users/${uid}`).then((result)=>{
            console.log("유저 페이지 조회 성공");
            const userPage=result.data;
            if(userPage){
                setUserInfo(userPage.userInfo);
                setPostCount(userPage.postCount);
                setFollowerCount(userPage.followerCount);
                setFollowingCount(userPage.followingCount);
                setFollowed(userPage.followed);
            }
        }).catch((error)=>{
            console.log("유저 페이지 조회 실패 : "+error);
        });
    };

    const loadPostList=({baseList=postList, cursor=postCursor, hasNext=hasNextPost})=>{
        if(!uid) return;
        if(!hasNext) return;
        api.get(`/api/users/${uid}/posts${cursor!=null?'?cursor='+cursor.pno:''}`).then((result)=>{
            console.log("게시글 조회 성공");
            const content=result.data.content;
            if(content.length > 0){
                setPostList(baseList.concat(content));
                setPostCursor(content[content.length-1]);
            }
            setHasNextPost(result.data.hasNext);
        }).catch((error)=>{
            console.log("게시글 조회 실패 : "+error);
        })
    };

    const loadFollowerList=({baseList=followerList, cursor=followerCursor, hasNext=hasNextFollower})=>{
        if(!uid) return;
        if(hasNext){
            api.get(`/api/users/${uid}/followers${cursor!=null?'?cursor='+cursor.uid:''}`).then((result)=>{
                console.log("팔로워 목록 조회 성공!");
                const content=result.data.content;
                if(content.length > 0){
                    setFollowerList(baseList.concat(content));
                    setFollowerCursor(content[content.length-1]);
                }
                setHasNextFollower(result.data.hasNext);
            }).catch((error)=>{
                console.log("팔로워 목록 조회 실패 : "+error);
            });
        }
    };

    const loadFollowingList=({baseList=followingList, cursor=followingCursor, hasNext=hasNextFollowing})=>{
        if(!uid) return;
        if(hasNext){
            api.get(`/api/users/${uid}/followings${cursor!=null?'?cursor='+cursor.uid:''}`).then((result)=>{
                console.log("팔로워 목록 조회 성공!");
                const content=result.data.content;
                if(content.length > 0){
                    setFollowingList(baseList.concat(content));
                    setFollowingCursor(content[content.length-1]);
                }
                setHasNextFollowing(result.data.hasNext);
            }).catch((error)=>{
                console.log("팔로워 목록 조회 실패 : "+error);
            });
        }
    };

    const modifyUserInfo=async()=>{
        let success=false;

        if(!myInfo) return success;

        let profileName=null;
        const uploadFile=selectedProfile;
        if(uploadFile){
            //프로필 사진을 변경했으면, 서버에 파일 업로드
            let uploadSuccess=true;
            await api.post('/api/files', uploadFile).then(async(result)=>{
                console.log("첨부파일 등록 성공!");
                if(result.data.length>0){
                    profileName=result.data[0].link;
                }
            }).catch((error)=>{
                uploadSuccess=false;
                console.log("첨부파일 등록 실패 : "+error);
            });
            if(!uploadSuccess) return;
        }
        else{
            //uploadFile이 null인 경우는 프로필에 변동이 없거나, 기본 프로필로 설정한 경우
            if(defaultProfile) profileName=null;  //기본 프로필
            else profileName=userInfo.profileName;  //현재 프로필
        }

        //회원 정보 수정
        await api.put(`/api/users/${myInfo.uid}`, {
            nickname:nicknameInput,
            profileName:profileName,
            intro:introInput
        }).then((result)=>{
            console.log("프로필 수정 성공!");
            success=true;
            setUserInfo(result);
            loadMyInfo();
            closeModifyProfileModal();
            loadUserPage(userInfo.uid);
            loadPostList({baseList:[], cursor:null, hasNext:true});
        }).catch((error)=>{
            console.log("프로필 수정 실패 : "+error);
        });

        return success;
    };

    const selectFile=async(event) => {
        const files = event.target.files;
        const file=files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
            setProfilePreview(reader.result);
        }

        if (file) {
            reader.readAsDataURL(file);
            setSelectedProfile(files);
            setDefaultProfile(false);
        } else {
            setProfilePreview(null);
        }
    };

    const follow=async(uid)=>{
        let success=false;
        if(!uid) return success;

        await api.post(`/api/users/${uid}/follow`).then((result)=>{
            console.log("팔로우 성공!");
            success=true;
        }).catch((error)=>{
            console.log("팔로우 실패 : "+error);
        });

        return success;
    };

    const unfollow=async(uid)=>{
        let success=false;
        if(!uid) return;

        await api.delete(`/api/users/${uid}/follow`).then((result)=>{
            console.log("언팔로우 성공!");
            success=true;
        }).catch((error)=>{
            console.log("언팔로우 실패 : "+error);
        });

        return success;
    };

    useEffect(()=>{
        loadUserPage(uid);
        loadPostList({baseList:[], cursor:null, hasNext:true});
    },[uid]);

    return (
        <>
            <Header userInfo={userInfo}/>
            <div className="centered-column-item">
                {
                    modifyProfileModalActive?
                        <div className="box" style={{width:'600px'}}>
                            <div>
                                <div className="justify-between" style={{marginTop:'-10px', marginBottom:'-9px'}}>
                                    <button className="btn"
                                            style={{fontSize:'18px', marginLeft:'-10px'}}
                                            onClick={closeModifyProfileModal}>
                                        <i className="fa-solid fa-arrow-left color-dark"></i>
                                    </button>
                                    <button type="button"
                                            className="btn float-end"
                                            style={{fontSize:'19px', backgroundColor:'transparent'}}
                                            onClick={(event)=>{
                                                event.target.disabled=true;
                                                (async()=>{
                                                    const success=await modifyUserInfo();
                                                    if(!success) event.target.disabled=false;
                                                })();
                                            }}>
                                        <i className="fa-solid fa-paper-plane color-dark"></i>
                                    </button>
                                </div>
                                <hr/>
                            </div>
                            {
                                userInfo &&
                                <div>
                                    <div className="container" style={{marginBottom:'35px', height:'80px'}}>
                                        <div style={{marginRight:'30px'}}>
                                            {
                                                profilePreview?
                                                    <img className="round-border"
                                                         style={{width:'100px', height:'100px'}}
                                                         src={profilePreview}
                                                         onClick={()=>{profileInputField.current.click();}} />
                                                    :
                                                    <>
                                                        {
                                                            defaultProfile?
                                                                <img className="round-border"
                                                                     style={{width:'100px', height:'100px'}}
                                                                     src={'http://localhost:8080/api/files/default-profile'}
                                                                     onClick={()=>{profileInputField.current.click();}}
                                                                />
                                                                :
                                                                <>
                                                                    {
                                                                        userInfo &&
                                                                        <img className="round-border"
                                                                             style={{width:'100px', height:'100px'}}
                                                                             src={`http://localhost:8080/api/files/${userInfo.profileName}`}
                                                                             onClick={()=>{profileInputField.current.click();}}
                                                                        />
                                                                    }
                                                                </>
                                                        }
                                                    </>
                                            }
                                        </div>
                                        <input type="file"
                                               ref={profileInputField}
                                               style={{display:'none'}}
                                               onChange={selectFile}
                                        />
                                    </div>
                                    <div style={{marginLeft:'5px', marginTop:'-45px', marginBottom:'20px'}}>
                                        <button className="btn btn-primary rounded-circle"
                                                style={{marginRight:'30px'}}
                                                onClick={()=>{
                                                    setProfilePreview(null);
                                                    setSelectedProfile(null);
                                                    setDefaultProfile(userInfo.profileName==null);
                                                }}>
                                            <i className="fa-solid fa-arrows-rotate"></i>
                                        </button>
                                        <button className="btn btn-danger rounded-circle"
                                                onClick={()=>{
                                                    setProfilePreview(null);
                                                    setSelectedProfile(null);
                                                    setDefaultProfile(true);
                                                }}>
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                    <div style={{marginBottom:'15px'}}>
                                        <div className="text-bold" style={{fontSize:'19px', marginBottom:'4px'}}>
                                            <FormControl type="text"
                                                         value={nicknameInput}
                                                         style={{width:'200px'}}
                                                         placeholder="닉네임"
                                                         onChange={(event)=>{
                                                             setNicknameInput(event.target.value);
                                                         }}/>
                                        </div>
                                        <div className="text-bold" style={{fontSize:'19px'}}>
                                            <textarea rows="4"
                                                      className="form-control"
                                                      value={introInput}
                                                      placeholder="자기소개"
                                                      style={{resize:'none'}}
                                                      onChange={(event)=>{
                                                          setIntroInput(event.target.value);
                                                      }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                        :
                        <div>
                            <div className="box" style={{width:'600px'}}>
                                <div>
                                    <button className="btn"
                                            style={{fontSize:'18px', marginLeft:'-10px', marginTop:'-15px', marginBottom:'-10px'}}
                                            onClick={()=> navigate(-1)}>
                                        <i className="fa-solid fa-arrow-left color-dark"></i>
                                    </button>
                                    <hr/>
                                </div>
                                {
                                    userInfo &&
                                    <div>
                                        <div className="container" style={{marginBottom:'20px', height:'80px'}}>
                                            <div style={{marginRight:'30px'}}>
                                                <img className="round-border" style={{width:'90px', height:'90px'}}
                                                     src={`http://localhost:8080/api/files/${userInfo.profileName}`}/>
                                            </div>
                                            <div className="container text-bold" style={{width:'340px', fontSize:'15px', marginTop:'20px'}}>
                                                <div className="centered-column-item">
                                                    <div style={{fontSize:'24px'}}>{postCount}</div>
                                                    <div className="color-gray">게시글</div>
                                                </div>
                                                <div className="centered-column-item">
                                                    <div style={{fontSize:'24px'}}
                                                         onClick={showFollowerModal}>
                                                        {followerCount}
                                                    </div>
                                                    <div className="color-gray">팔로워</div>
                                                </div>
                                                <div className="centered-column-item">
                                                    <div style={{fontSize:'24px'}}
                                                         onClick={showFollowingModal}>
                                                        {followingCount}
                                                    </div>
                                                    <div className="color-gray">팔로우</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{marginLeft:'20px', marginBottom:'20px'}}>
                                            <div className="text-bold" style={{fontSize:'19px', marginBottom:'6px'}}>{userInfo.nickname}</div>
                                            <div>{userInfo.intro}</div>
                                        </div>
                                        {
                                            myInfo && (myInfo.uid === userInfo.uid) &&
                                            <div style={{marginLeft:'5px', marginBottom:'8px'}}>
                                                <button className="btn btn-outline-secondary"
                                                        style={{width:'49%', marginRight:'6px'}}
                                                        onClick={showModifyProfileModal}>
                                                    프로필 편집
                                                </button>
                                                <button className="btn btn-outline-secondary"
                                                        style={{width:'49%'}}>
                                                    계정 관리
                                                </button>
                                            </div>
                                        }
                                        {
                                            myInfo && (myInfo.uid != userInfo.uid) &&
                                            <div style={{marginBottom:'8px'}}>
                                                {
                                                    followed?
                                                        <button className="btn btn-outline-secondary text-bold"
                                                                style={{width:'100%'}}
                                                                onClick={async()=>{
                                                                    const success=await unfollow(userInfo.uid);
                                                                    if(success) loadUserPage(userInfo.uid);
                                                                }}>
                                                            언팔로우
                                                        </button>
                                                        :
                                                        <button className="btn btn-primary text-bold"
                                                                style={{width:'100%'}}
                                                                onClick={async()=>{
                                                                    const success=await follow(userInfo.uid);
                                                                    if(success) loadUserPage(userInfo.uid);
                                                                }}>
                                                            팔로우
                                                        </button>
                                                }
                                            </div>
                                        }
                                    </div>
                                }
                            </div>
                            <div>
                                {
                                    postList.slice().map((post, idx)=>{
                                        return (
                                            <div className="box" key={idx} style={{width:'600px'}}>
                                                <div className="centered-row-item">
                                                    <div style={{marginRight:'20px'}}>
                                                        <img className="round-border"
                                                             style={{width:'50px', height:'50px'}}
                                                             src={`http://localhost:8080/api/files/${post.writer.profileName}`}
                                                             onClick={()=>{navigate(`/user/${post.writer.uid}`)}}
                                                        />
                                                    </div>
                                                    <div className="centered-row-item">
                                                        <div className="text-bold" style={{fontSize:'17px', marginRight:'15px'}}>{post.writer.nickname}</div>
                                                        <div className="color-light-gray" style={{fontSize:'15px', marginTop:'6px'}}>{post.regDate}</div>
                                                    </div>
                                                </div>
                                                <div style={{marginLeft:'70px'}}
                                                     onClick={()=>{navigate(`/post/${post.pno}`)}}>
                                                    <div style={{fontSize:'16px'}}>{post.content}</div>
                                                    <div className="centered-row-item" style={{marginTop:'12px'}}>
                                                        {
                                                            post.fileNames && post.fileNames.map((fileName)=>{
                                                                return(
                                                                    <img className="image" src={`http://localhost:8080/api/files/${fileName}`} style={{width:'auto', height:'140px', marginRight:'4px'}}/>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                                <div>
                                                    <hr/>
                                                    <div className="centered-row-item" style={{marginBottom:'8px'}}>
                                                        {
                                                            post.liked?
                                                                <i className="fa-solid fa-heart color-danger" style={{marginRight:'8px'}}></i>
                                                                :
                                                                <i className="fa-regular fa-heart" style={{marginRight:'8px'}}></i>
                                                        }
                                                        <div className="text-bold" style={{marginRight:'20px'}}>{post.likeCount}</div>
                                                        <i className="fa-regular fa-message" style={{marginRight:'8px'}}></i>
                                                        <div className="text-bold" style={{marginRight:'20px'}}>{post.commentCount}</div>
                                                        <i className="fa-regular fa-eye" style={{marginRight:'8px'}}></i>
                                                        <div className="text-bold">{post.views}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                                {
                                    hasNextPost &&
                                    <button className="btn btn-outline-secondary" style={{width:'100%'}} onClick={loadPostList}>더 보기</button>
                                }
                            </div>
                        </div>
                }
            </div>

            <Modal show={followerModalActive}
                   onHide={closeFollowerModal}
                   centered>
                <Modal.Header style={{height:'66px'}}>
                    <div className="text-bold" style={{fontSize:'18px'}}>팔로워 ({followerCount})</div>
                </Modal.Header>
                <Modal.Body>
                    <div style={{minHeight:'500px'}}>
                        {
                            followerList.slice().map((follower, idx)=>{
                                return (
                                    <div className="box" key={idx} style={{width:'100%', border:'solid 1px lightGray', paddingTop:'15px',paddingBottom:'15px'}}>
                                        <div className="centered-row-item">
                                            <div className="centered-row-item" style={{width:'75%'}}>
                                                <div style={{marginRight:'20px'}}>
                                                    <img className="round-border"
                                                         style={{width:'60px', height:'60px'}}
                                                         src={`http://localhost:8080/api/files/${follower.profileName}`}
                                                         onClick={()=>{navigate(`/user/${follower.uid}`)}}
                                                    />
                                                </div>
                                                <div style={{marginRight:'20px'}}>
                                                    <div className="text-bold" style={{fontSize:'17px'}}>{follower.nickname}</div>
                                                    <div style={{fontSize:'14px'}}>{follower.intro.length>30?follower.intro.slice(0, 30)+'...':follower.intro}</div>
                                                </div>
                                            </div>
                                            <div style={{width:'25%'}}>
                                                {
                                                    myInfo && (myInfo.uid != follower.uid) &&
                                                    <>
                                                        {
                                                            follower.followed?
                                                                <button className="btn btn-outline-secondary text-bold float-end"
                                                                        style={{width:'90px', fontSize:'15px'}}
                                                                        onClick={async()=>{
                                                                            const success=await unfollow(follower.uid);
                                                                            if(success) {
                                                                                setFollowerList(followerList.slice().map((item, index)=>{
                                                                                    if(index==idx) {
                                                                                        item.followed=false;
                                                                                    }
                                                                                    return item;
                                                                                }))
                                                                            }
                                                                        }}>
                                                                    언팔로우
                                                                </button>
                                                                :
                                                                <button className="btn btn-primary text-bold float-end"
                                                                        style={{width:'80px', fontSize:'15px'}}
                                                                        onClick={async()=>{
                                                                            const success=await follow(follower.uid);
                                                                            if(success) {
                                                                                setFollowerList(followerList.slice().map((item, index)=>{
                                                                                    if(index==idx) {
                                                                                        item.followed=true;
                                                                                    }
                                                                                    return item;
                                                                                }))
                                                                            }
                                                                        }}>
                                                                    팔로우
                                                                </button>
                                                        }
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        }
                        {
                            hasNextFollower &&
                            <button className="btn btn-outline-secondary" style={{width:'100%'}} onClick={loadFollowerList}>더 보기</button>
                        }
                    </div>
                </Modal.Body>
            </Modal>


            <Modal show={followingModalActive}
                   onHide={closeFollowingModal}
                   centered>
                <Modal.Header style={{height:'66px'}}>
                    <div className="text-bold" style={{fontSize:'18px'}}>팔로우 ({followingCount})</div>
                </Modal.Header>
                <Modal.Body>
                    <div style={{minHeight:'500px'}}>
                        {
                            followingList.slice().map((following, idx)=>{
                                return (
                                    <div className="box" key={idx} style={{width:'100%', border:'solid 1px lightGray', paddingTop:'15px',paddingBottom:'15px'}}>
                                        <div className="centered-row-item">
                                            <div className="centered-row-item" style={{width:'75%'}}>
                                                <div style={{marginRight:'20px'}}>
                                                    <img className="round-border"
                                                         style={{width:'60px', height:'60px'}}
                                                         src={`http://localhost:8080/api/files/${following.profileName}`}
                                                         onClick={()=>{navigate(`/user/${following.uid}`)}}
                                                    />
                                                </div>
                                                <div className="" style={{marginRight:'20px'}}>
                                                    <div className="text-bold" style={{fontSize:'17px'}}>{following.nickname}</div>
                                                    <div style={{fontSize:'14px'}}>{following.intro.length>30?following.intro.slice(0, 30)+'...':following.intro}</div>
                                                </div>
                                            </div>
                                            <div style={{width:'25%'}}>
                                                {
                                                    myInfo && (myInfo.uid != following.uid) &&
                                                    <>
                                                        {
                                                            following.followed?
                                                                <button className="btn btn-outline-secondary text-bold float-end"
                                                                        style={{width:'90px', fontSize:'15px'}}
                                                                        onClick={async()=>{
                                                                            const success=await unfollow(following.uid);
                                                                            if(success) {
                                                                                setFollowingList(followingList.slice().map((item, index)=>{
                                                                                    if(index==idx) {
                                                                                        item.followed=false;
                                                                                    }
                                                                                    return item;
                                                                                }))
                                                                            }
                                                                        }}>
                                                                    언팔로우
                                                                </button>
                                                                :
                                                                <button className="btn btn-primary text-bold float-end"
                                                                        style={{width:'80px', fontSize:'15px'}}
                                                                        onClick={async()=>{
                                                                            const success=await follow(following.uid);
                                                                            if(success) {
                                                                                setFollowingList(followingList.slice().map((item, index)=>{
                                                                                    if(index==idx) {
                                                                                        item.followed=true;
                                                                                    }
                                                                                    return item;
                                                                                }))
                                                                            }
                                                                        }}>
                                                                    팔로우
                                                                </button>
                                                        }
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        }
                        {
                            hasNextFollowing &&
                            <button className="btn btn-outline-secondary" style={{width:'100%'}} onClick={loadFollowingList}>더 보기</button>
                        }
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default UserDetails;