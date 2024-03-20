import api from "../api";
import {useNavigate, useParams} from "react-router-dom";
import Header from "./Header";
import { useEffect, useState, useRef } from "react";
import {FormControl} from "react-bootstrap";


function PostDetails(){
    let navigate=useNavigate();

    const { pno } = useParams();
    const [post, setPost]=useState(null);
    const [commentList, setCommentList]=useState([]);
    const [commentCursor, setCommentCursor]=useState(null);
    const [hasNextComment, setHasNextComment]=useState(true);

    const [postContent, setPostContent]=useState("");
    const [uploadedFileNames, setUploadedFileNames] = useState([]);
    const [createCommentContent, setCreateCommentContent]=useState("");
    const [modifyCommentContent, setModifyCommentContent]=useState("");

    const [modifyPostActive, setModifyPostActive]=useState(false);
    const [selectedComment, setSelectedComment]=useState(null);

    const fileInputField=useRef();
    const modifyPostBtn=useRef();
    const deletePostBtn=useRef();
    const createCommentBtn=useRef();
    const modifyCommentBtn=useRef();

    const commentPageSize=10;


    const showModifyPost=()=>{
        setModifyPostActive(true);
        setPostContent(post.content);
        setUploadedFileNames(post.fileNames);
    };
    const showModifyComment=(comment)=>{
        setSelectedComment(comment);
        setModifyCommentContent(comment.content);
    };

    const closeModifyPost=async ()=>{
        setModifyPostActive(false);

        //업로드된 파일 삭제
        const files=uploadedFileNames.filter(fileName=>!post.fileNames.includes(fileName));
        for(let i=0;i<files.length;i++){
            await api.delete(`/api/files/${files[i]}`).catch((error)=>{
                console.log("첨부파일 삭제 실패 : " + error);
            });
        }
        console.log("첨부파일 삭제 성공");
    };

    const loadPost=(pno)=>{
        api.get("/api/posts/"+pno).then((result)=>{
            console.log("게시글 조회 성공");
            setPost(result.data);
        }).catch((error)=>{
            console.log("게시글 조회 실패 : "+error);
        })
    };

    const modifyPost=async()=>{
        let success=false;

        await api.put(`/api/posts/${pno}`,{
            content:postContent,
            fileNames:uploadedFileNames
        }).then((result)=>{
            console.log("게시글 수정 성공");
            success=true;
            setPost(result.data);
            setModifyPostActive(false);
        }).catch((error)=>{
            console.log("게시글 수정 실패 : " + error);
        });

        modifyPostBtn.current.disabled=false;

        return success;
    };

    const deletePost=async()=>{
        let success=false;
        await api.delete(`/api/posts/${pno}`).then((result)=>{
            console.log("게시글 삭제 성공");
            success=true;
            navigate("/");
        }).catch((error)=>{
            console.log("게시글 삭제 실패 : "+error);
        });
        return success;
    };

    const likePost=async()=>{
        await api.post(`/api/posts/${pno}/like`,{}).then((result)=>{
            console.log("게시글 좋아요 성공");
            setPost(result.data);
        }).catch((error)=>{
            console.log("게시글 좋아요 실패 : " + error);
        });
    };

    const unlikePost=async()=>{
        await api.delete(`/api/posts/${pno}/like`,{}).then((result)=>{
            console.log("게시글 좋아요 취소 성공");
            setPost(result.data);
        }).catch((error)=>{
            console.log("게시글 좋아요 취소 실패 : " + error);
        });
    };

    const loadCommentList=async({baseList=commentList, size = commentPageSize, cursor = commentCursor, hasNext=hasNextComment})=>{
        if(!hasNext) return;
        await api.get(`/api/posts/${pno}/comments?size=${size}${cursor!=null?("&cursor="+cursor.cno):""}`).then((result)=>{
            console.log("댓글 목록 조회 성공");
            const content=result.data.content;
            setCommentList(baseList.concat(content));
            setCommentCursor(content[content.length-1]);
            setHasNextComment(result.data.hasNext);
        }).catch((error)=>{
            console.log("댓글 목록 조회 실패 : " + error);
        });
    };

    const createComment=async()=>{
        let success=false;

        await api.post(`/api/posts/${pno}/comments`,{
            pno:pno,
            content:createCommentContent
        }).then((result)=>{
            console.log("댓글 등록 성공");
            success=true;
            loadPost(pno);
            loadCommentList({baseList:[], cursor:null, hasNext:true});
            setCreateCommentContent("");
        }).catch((error)=>{
            console.log("댓글 등록 실패 : " + error);
        });

        createCommentBtn.current.disabled=false;

        return success;
    };

    const modifyComment=async()=>{
        let success=false;

        await api.put(`/api/posts/${pno}/comments/${selectedComment.cno}`,{
            pno:pno,
            content:modifyCommentContent
        }).then((result)=>{
            console.log("댓글 수정 성공");
            success=true;
            loadPost(pno);
            loadCommentList({baseList:[], cursor:null, hasNext:true});
            setSelectedComment(null);
        }).catch((error)=>{
            console.log("댓글 수정 실패 : " + error);
        });

        modifyCommentBtn.current.disabled=false;

        return success;
    };

    const deleteComment=async(cno)=>{
        let success=false;
        await api.delete(`/api/posts/${pno}/comments/${cno}`).then((result)=>{
            console.log("댓글 삭제 성공");
            success=true;
            loadPost(pno);
            loadCommentList({baseList:[], cursor:null, hasNext:true});
        }).catch((error)=>{
            console.log("댓글 삭제 실패 : "+error);
        });
        return success;
    };

    const likeComment=async(cno)=>{
        await api.post(`/api/posts/${pno}/comments/${cno}/like`,{}).then((result)=>{
            console.log("댓글 좋아요 성공");
            const newCommentList=commentList.map((comment)=>comment.cno==cno?result.data:comment);
            setCommentList(newCommentList);
        }).catch((error)=>{
            console.log("댓글 좋아요 실패 : " + error);
        });
    };

    const unlikeComment=async(cno)=>{
        await api.delete(`/api/posts/${pno}/comments/${cno}/like`,{}).then((result)=>{
            console.log("댓글 좋아요 취소 성공");
            const newCommentList=commentList.map((comment)=>comment.cno==cno?result.data:comment);
            setCommentList(newCommentList);
        }).catch((error)=>{
            console.log("댓글 좋아요 취소 실패 : " + error);
        });
    };

    const selectFile=async(event) => {
        let success=false;

        //서버에 파일 업로드
        await api.post("/api/files", event.target.files).then(async(result)=>{
            console.log("첨부파일 등록 성공!");
            success=true;

            const data=result.data;
            const links=[]
            data.forEach((file)=>{
                links.push(file.link);
            });
            setUploadedFileNames([...uploadedFileNames, ...links]);
        }).catch((error)=>{
            console.log("첨부파일 등록 실패 : " + error);
        });

        //input 태그 비우기
        event.target.value=null;
    };

    /**
     * 게시글 수정할 때는 등록할 때와는 다르게
     * 첨부파일을 선택해제하면 화면에서만 안 보이게 하고,
     * 실제 파일 삭제는 게시글 수정 작업에서 한다.
     * @param idx
     * @returns {Promise<void>}
     */
    const unselectFile=async(idx)=>{
        let success=false;

        //서버에서 파일 삭제
        const fileName=uploadedFileNames[idx];
        if(!post.fileNames.includes(fileName)){
            //수정 전에 있던 파일이 아니라 수정창에서 방금 선택한 파일이면 삭제해도 됨
            await api.delete(`/api/files/${fileName}`).then((result)=>{
                console.log("첨부파일 삭제 성공!");
                setUploadedFileNames(uploadedFileNames.filter((fileName, i) => i !== idx));
                success=true;
            }).catch((error)=>{
                console.log("첨부파일 삭제 실패 : " + error);
            });
        }
        else{
            //수정 전에 있던 파일인 경우, 수정 작업을 취소하면 여전히 남아있어야 해서 아직 삭제하면 안 됨.
            setUploadedFileNames(uploadedFileNames.filter((fileName, i) => i !== idx));
        }

        return success;
    };

    useEffect(()=>{
        loadPost(pno);
        loadCommentList({baseList:[], cursor:null, hasNext:true});
    },[pno]);

    return (
        <>
            <Header/>
            {
                post &&
                <div className="centered-column-item">
                    {
                        modifyPostActive?
                            <>
                                <div className="box">
                                    <div className="justify-between" style={{marginTop:'-15px', marginBottom:'-10px'}}>
                                        <button className="btn"
                                                style={{marginLeft:'-10px', fontSize:'18px', marginTop:'5px'}}
                                                onClick={closeModifyPost}>
                                            <i className="fa-solid fa-arrow-left color-dark"></i>
                                        </button>
                                        <div className="text-bold centered-item" style={{fontSize:'18px'}}>게시글 수정</div>
                                        <div className="centered-row-item">
                                            <button type="button"
                                                    className="btn float-end"
                                                    style={{fontSize:'19px', marginTop:'5px', backgroundColor:'transparent'}}
                                                    onClick={()=>{fileInputField.current.click();}}>
                                                <i className="fa-solid fa-paperclip color-dark"></i>
                                            </button>
                                            <button type="button"
                                                    className="btn float-end"
                                                    ref={modifyPostBtn}
                                                    style={{fontSize:'19px', backgroundColor:'transparent'}}
                                                    onClick={(event)=>{
                                                        event.target.disabled=true;
                                                        (async()=>{
                                                            const success=await modifyPost();
                                                            if(!success) event.target.disabled=false;
                                                        })();
                                                    }}>
                                                <i className="fa-solid fa-paper-plane color-dark"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <hr/>
                                    <div className="justify-between" style={{marginBottom:'10px'}}>
                                        <div className="centered-row-item">
                                            <div className="text-bold" style={{fontSize:'17px', marginRight:'15px'}}>{post.writer.nickname}</div>
                                            <div className="color-light-gray" style={{fontSize:'15px', marginTop:'6px'}}>{post.regDate}</div>
                                        </div>
                                    </div>
                                    <div style={{marginBottom:'14px'}}>
                                    <textarea rows="8"
                                              className="form-control"
                                              value={postContent}
                                              style={{resize:'none', fontSize:'16px'}}
                                              onChange={(event)=>{
                                                  setPostContent(event.target.value);
                                              }}/>
                                    </div>
                                    <div className="centered-row-item">
                                        {uploadedFileNames.length > 0 && (
                                            uploadedFileNames.map((fileName, idx)=> {
                                                return (
                                                    <div className="card col-4">
                                                        <div className="card-header d-flex justify-content-center" key={idx}>
                                                            {fileName}
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
                                                            <img src={`http://localhost:8080/api/files/thumbnail/${fileName}`}/>
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
                                </div>
                            </>
                            :
                            <>
                                <div className="box">
                                    <div>
                                        <button className="btn"
                                                style={{fontSize:'18px', marginLeft:'-10px', marginTop:'-15px', marginBottom:'-10px'}}
                                                onClick={()=> navigate(-1)}>
                                            <i className="fa-solid fa-arrow-left color-dark"></i>
                                        </button>
                                        <hr/>
                                    </div>
                                    <div className="justify-between" style={{marginBottom:'10px', marginTop:'-6px'}}>
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
                                        {
                                            post.owned &&
                                            <div className="float-end">
                                                <button className="btn"
                                                        style={{fontSize:'18px', backgroundColor:'transparent'}}
                                                        onClick={showModifyPost}>
                                                    <i className="fa-regular fa-pen-to-square color-dark"></i>
                                                </button>
                                                <button className="btn"
                                                        ref={deletePostBtn}
                                                        style={{fontSize:'18px', backgroundColor:'transparent'}}
                                                        onClick={(event)=>{
                                                            event.target.disabled=true;
                                                            (async()=>{
                                                                const success=await deletePost();
                                                                if(!success) event.target.disabled=false;
                                                            })();
                                                        }}>
                                                    <i className="fa-solid fa-trash color-dark"></i>
                                                </button>
                                            </div>
                                        }
                                    </div>
                                    <div style={{marginLeft:'70px'}}>
                                        <div style={{fontSize:'16px'}}>{post.content}</div>
                                        <div className="centered-row-item" style={{marginTop:'12px'}}>
                                            {
                                                post.fileNames && post.fileNames.map((fileName)=>{
                                                    return(
                                                        <img src={`http://localhost:8080/api/files/${fileName}`} style={{width:'auto', height:'200px', marginRight:'4px'}}/>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <hr/>
                                        <div className="justify-between" style={{marginBottom:'8px'}}>
                                            <div className="centered-row-item">
                                                {
                                                    post.liked?
                                                        <i className="fa-solid fa-heart color-danger"
                                                           style={{marginRight:'8px'}}
                                                           onClick={(event)=>{
                                                               event.target.disabled=true;
                                                               (async()=>{
                                                                   await unlikePost();
                                                                   event.target.disabled=false;
                                                               })();
                                                           }}></i>
                                                        :
                                                        <i className="fa-regular fa-heart"
                                                           style={{marginRight:'8px'}}
                                                           onClick={(event)=>{
                                                               event.target.disabled=true;
                                                               (async()=>{
                                                                   await likePost();
                                                                   event.target.disabled=false;
                                                               })();
                                                           }}></i>
                                                }
                                                <div className="text-bold" style={{marginRight:'20px'}}>{post.likeCount}</div>
                                                <i className="fa-regular fa-message" style={{marginRight:'8px'}}></i>
                                                <div className="text-bold" style={{marginRight:'20px'}}>{post.commentCount}</div>
                                                <i className="fa-regular fa-eye" style={{marginRight:'8px'}}></i>
                                                <div className="text-bold">{post.views}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="box">
                                    {
                                        !selectedComment &&
                                        <>
                                            <div className="text-bold" style={{fontSize:'16px', marginBottom:'16px'}}>댓글</div>
                                            <div className="centered-row-item" style={{marginBottom:'10px'}}>
                                                <FormControl type="text"
                                                             value={createCommentContent}
                                                             onChange={(event)=>{
                                                                 setCreateCommentContent(event.target.value);
                                                             }}
                                                />
                                                <button type="button"
                                                        className="btn float-end"
                                                        ref={createCommentBtn}
                                                        style={{fontSize:'18px', backgroundColor:'transparent'}}
                                                        onClick={(event)=>{
                                                            event.target.disabled=true;
                                                            (async()=>{
                                                                const success=await createComment();
                                                                if(!success) event.target.disabled=false;
                                                            })();
                                                        }}>
                                                    <i className="fa-solid fa-paper-plane color-dark"></i>
                                                </button>
                                            </div>
                                        </>
                                    }
                                    {
                                        commentList &&
                                        selectedComment==null?
                                            <>
                                                {
                                                    commentList.slice().map((comment, idx)=>{
                                                        return (
                                                            <div key={idx}>
                                                                <hr/>
                                                                <div className="justify-between">
                                                                    <div className="centered-row-item">
                                                                        <div style={{marginRight:'20px'}}>
                                                                            <img className="round-border"
                                                                                 style={{width:'40px', height:'40px'}}
                                                                                 src={`http://localhost:8080/api/files/${comment.writer.profileName}`}
                                                                                 onClick={()=>{navigate(`/user/${comment.writer.uid}`)}}
                                                                            />
                                                                        </div>
                                                                        <div className="centered-row-item">
                                                                            <div className="text-bold" style={{fontSize:'17px', marginRight:'15px'}}>{comment.writer.nickname}</div>
                                                                            <div className="color-light-gray" style={{fontSize:'15px', marginTop:'6px'}}>{comment.regDate}</div>
                                                                        </div>
                                                                    </div>
                                                                    {
                                                                        comment.owned &&
                                                                        <div className="float-end">
                                                                            <button className="btn"
                                                                                    style={{fontSize:'18px', backgroundColor:'transparent'}}
                                                                                    onClick={()=>{
                                                                                        showModifyComment(comment);
                                                                                    }}>
                                                                                <i className="fa-regular fa-pen-to-square color-dark"></i>
                                                                            </button>
                                                                            <button className="btn"
                                                                                    style={{fontSize:'18px', backgroundColor:'transparent'}}
                                                                                    onClick={(event)=>{
                                                                                        event.target.disabled=true;
                                                                                        (async()=>{
                                                                                            const success=await deleteComment(comment.cno);
                                                                                            if(!success) event.target.disabled=false;
                                                                                        })();
                                                                                    }}>
                                                                                <i className="fa-solid fa-trash color-dark"></i>
                                                                            </button>
                                                                        </div>
                                                                    }
                                                                </div>
                                                                <div style={{marginLeft:'60px'}}>
                                                                    <div style={{fontSize:'16px', marginTop:'10px', marginBottom:'15px'}}>{comment.content}</div>
                                                                    <div>
                                                                        <div className="centered-row-item" style={{marginBottom:'8px'}}>
                                                                            {
                                                                                comment.liked?
                                                                                    <i className="fa-solid fa-heart color-danger"
                                                                                       style={{marginRight:'8px'}}
                                                                                       onClick={(event)=>{
                                                                                           event.target.disabled=true;
                                                                                           (async()=>{
                                                                                               await unlikeComment(comment.cno);
                                                                                               event.target.disabled=false;
                                                                                           })();
                                                                                       }}></i>
                                                                                    :
                                                                                    <i className="fa-regular fa-heart"
                                                                                       style={{marginRight:'8px'}}
                                                                                       onClick={(event)=>{
                                                                                           event.target.disabled=true;
                                                                                           (async()=>{
                                                                                               await likeComment(comment.cno);
                                                                                               event.target.disabled=false;
                                                                                           })();
                                                                                       }}></i>
                                                                            }
                                                                            <div className="text-bold" style={{marginRight:'20px'}}>{comment.likeCount}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                }
                                                {
                                                    hasNextComment &&
                                                    <button className="btn btn-outline-secondary" style={{width:'100%'}} onClick={loadCommentList}>더 보기</button>
                                                }
                                            </>
                                            :
                                            <>
                                                <div className="justify-between" style={{marginTop:'-15px', marginBottom:'-10px'}}>
                                                    <button className="btn"
                                                            style={{marginLeft:'-10px', fontSize:'18px', marginTop:'5px'}}
                                                            onClick={()=>setSelectedComment(null)}>
                                                        <i className="fa-solid fa-arrow-left color-dark"></i>
                                                    </button>
                                                    <div className="text-bold centered-item" style={{fontSize:'18px'}}>댓글 수정</div>
                                                    <button type="button"
                                                            className="btn float-end"
                                                            ref={modifyCommentBtn}
                                                            style={{fontSize:'19px', backgroundColor:'transparent'}}
                                                            onClick={(event)=>{
                                                                event.target.disabled=true;
                                                                (async()=>{
                                                                    const success=await modifyComment();
                                                                    if(!success) event.target.disabled=false;
                                                                })();
                                                            }}>
                                                        <i className="fa-solid fa-paper-plane color-dark"></i>
                                                    </button>
                                                </div>
                                                <hr/>
                                                <div className="justify-between" style={{marginBottom:'10px'}}>
                                                    <div className="centered-row-item">
                                                        <div className="text-bold" style={{fontSize:'17px', marginRight:'15px'}}>{selectedComment.writer.nickname}</div>
                                                        <div className="color-light-gray" style={{fontSize:'15px', marginTop:'6px'}}>{selectedComment.regDate}</div>
                                                    </div>
                                                </div>
                                                <div style={{marginBottom:'14px'}}>
                                                    <textarea rows="4"
                                                              className="form-control"
                                                              value={modifyCommentContent}
                                                              style={{resize:'none', fontSize:'16px'}}
                                                              onChange={(event)=>{
                                                                  setModifyCommentContent(event.target.value);
                                                              }}
                                                    />
                                                </div>
                                            </>
                                    }
                                </div>
                            </>
                    }
                </div>
            }
        </>
    );
}

export default PostDetails;