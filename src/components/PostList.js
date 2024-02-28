import api from "../api";
import Header from "./Header";
import {useEffect, useRef, useState, useContext} from "react";
import Modal from 'react-bootstrap/Modal';
import {useNavigate} from "react-router-dom";
import {GlobalContext} from "./GlobalContext";
import {FormControl} from "react-bootstrap";

function PostList(){
    let navigate=useNavigate();

    const postPageSize=10;

    const [keywordInput, setKeywordInput]=useState('');
    const [curKeyword, setCurKeyword]=useState('');

    const [postList, setPostList]=useState([]);
    const [postCursor, setPostCursor]=useState(null);
    const [hasNextPost, setHasNextPost]=useState(true);

    const [createPostModalActive, setCreatePostModalActive]=useState(false);
    const [postContent, setPostContent]=useState("");
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const createPostBtn=useRef();
    const fileInputField=useRef();

    const showCreatePostModal=()=>{
        setCreatePostModalActive(true);
        setPostContent("");
        setUploadedFiles([]);

        //버튼 활성화
        if(createPostBtn.current) createPostBtn.current.disabled=false;
    };

    const closeCreatePostModal=async()=>{
        setCreatePostModalActive(false);

        //업로드했던 파일 지우기
        const files=[...uploadedFiles]
        for(let i=0;i<files.length;i++){
            await api.delete(`/api/files/${files[i]}`).catch((error)=>{
                console.log("첨부파일 삭제 실패 : " + error);
            });
        }
        console.log("첨부파일 삭제 성공");
    };

    const loadPostList=({keyword=curKeyword, baseList = postList, size = postPageSize, cursor = postCursor, hasNext= hasNextPost})=>{
        if(!hasNext) return;
        api.get(`/api/posts?size=${size}${cursor!=null?("&cursor="+cursor.pno):""}${keyword.length>0?("&keyword="+keyword):""}`).then((result)=>{
            console.log("게시글 목록 조회 성공");
            const content=result.data.content;
            const cursor=content.length>0?content[content.length-1]:null;
            setPostList(baseList.concat(content));
            setPostCursor(cursor);
            setHasNextPost(result.data.hasNext);
        }).catch((error)=>{
            console.log("게시글 목록 조회 실패 : " + error);
        });
    }

    const search=()=>{
        setCurKeyword(keywordInput);
        loadPostList({keyword:keywordInput, baseList:[], cursor:null, hasNext:true});
    }

    const createPost=async()=>{
        let success=false;

        let fileNames=uploadedFiles.map(file=>file.link);

        await api.post("/api/posts",{
            content:postContent,
            fileNames:fileNames
        }).then((result)=>{
            console.log("게시글 등록 성공");
            success=true;
            setCurKeyword('');
            setKeywordInput('');
            loadPostList({keyword:'', baseList:[], cursor:null, hasNext:true});
            closeCreatePostModal();
        }).catch((error)=>{
            console.log("게시글 등록 실패 : " + error);
        });

        return success;
    };
    const selectFile=async(event) => {
        let success=false;

        //서버에 파일 업로드
        await api.post("/api/files", event.target.files).then(async(result)=>{
            const data=result.data;
            console.log("첨부파일 등록 성공!");
            setUploadedFiles([...uploadedFiles, ...data]);
            success=true;
        }).catch((error)=>{
            console.log("첨부파일 등록 실패 : " + error);
        });

        //input 태그 비우기
        event.target.value=null;
    };
    const unselectFile=async(idx)=>{
        let success=false;

        //서버에서 파일 삭제
        const fileName=uploadedFiles[idx].link;
        await api.delete(`/api/files/${fileName}`).then((result)=>{
            const data=result.data;
            console.log("첨부파일 삭제 성공!");
            setUploadedFiles(uploadedFiles.filter((file, i) => i !== idx));
            success=true;
        }).catch((error)=>{
            console.log("첨부파일 삭제 실패 : " + error);
        });
    };

    useEffect(()=>{
        loadPostList({baseList:[], cursor:null, hasNext:true});

    },[])

    return(
        <>
            <Header/>
            <div className="centered-column-item">
                <div className="box">
                    <div className="centered-row-item" style={{marginBottom:'10px'}}>
                        <FormControl type="text"
                                     value={keywordInput}
                                     style={{backgroundColor:'#f4f4f4'}}
                                     placeholder="검색어"
                                     onChange={(event)=>{
                                         setKeywordInput(event.target.value);
                                     }}
                        />
                        <button type="button"
                                className="btn"
                                style={{fontSize:'20px', backgroundColor:'transparent'}}
                                onClick={(event)=>{
                                    event.target.disabled=true;
                                    (async()=>{
                                        const success=await search();
                                        if(!success) event.target.disabled=false;
                                    })();
                                }}>
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </div>
                </div>

                {
                    postList.slice().map((post, idx)=>{
                        return (
                            <div className="box" key={idx}>
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
                                <div style={{marginLeft:'70px'}} onClick={()=>{
                                    navigate(`post/${post.pno}`);
                                }}>
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
            </div>

            {
                hasNextPost &&
                <button className="btn btn-outline-secondary"
                        style={{width:'100%'}}
                        onClick={loadPostList}>
                    더 보기
                </button>
            }

            <button className="round-button color-light-gray" onClick={showCreatePostModal}>
                <i className="fa-solid fa-pen" style={{fontSize:'18px'}}></i>
            </button>

            <Modal show={createPostModalActive} onHide={closeCreatePostModal} centered>
                <Modal.Header style={{height:'66px'}}>
                    <div className="text-bold" style={{fontSize:'20px'}}>게시글 등록</div>
                    <div className="centered-row-item">
                        <button type="button"
                                className="btn float-end"
                                style={{fontSize:'19px', marginTop:'5px', backgroundColor:'transparent'}}
                                onClick={()=>{fileInputField.current.click();}}>
                            <i className="fa-solid fa-paperclip color-dark"></i>
                        </button>
                        <button type="button"
                                className="btn float-end"
                                ref={createPostBtn}
                                style={{fontSize:'19px', marginTop:'5px', backgroundColor:'transparent'}}
                                onClick={(event)=>{
                                    event.target.disabled=true;
                                    (async()=>{
                                        const success=await createPost();
                                        if(!success) event.target.disabled=false;
                                    })();
                                }}>
                            <i className="fa-solid fa-paper-plane color-dark"></i>
                        </button>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <div className="input-group mb-3">
                            <textarea rows="8"
                                      className="form-control"
                                      value={postContent}
                                      style={{resize:'none'}}
                                      onChange={(event)=>{
                                          setPostContent(event.target.value);
                                      }}/>
                        </div>
                    </div>
                    <div className="centered-row-item">
                        {uploadedFiles.length > 0 && (
                            uploadedFiles.map((file, idx)=> {
                                return (
                                    <div className="card col-4">
                                        <div className="card-header d-flex justify-content-center" key={idx}>
                                            {file.fileName}
                                            <button className="btn-sm btn-danger" style={{width:'30%', height:'50%'}}
                                                    onClick={(event) => {
                                                        event.target.disabled=true;
                                                        (async()=>{
                                                            const success=await unselectFile(idx);
                                                            if(!success) event.target.disabled=false;
                                                        })();}}>
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                        <div className="card-body">
                                            <img src={`http://localhost:8080/api/files/thumbnail/${file.link}`}/>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <input type="file"
                           ref={fileInputField}
                           style={{display:'none'}}
                           onChange={selectFile}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}

export default PostList;