import React, {useContext, useState, useEffect, useRef} from 'react';
import { authContext, User } from '../common/useAuth';
import { Post } from '../classes/Forum';
import moment from 'moment';
import Linkify from 'react-linkify';
import axios from 'axios';
import { useForceUpdate } from '../common/useForceUpdate';

export function PostInput({threadId, slug, callBack}: {threadId: number; slug?: string; callBack?: Function}) {
	const auth = useContext(authContext);
    let user: User = auth.user;
    let [commentError, setCommentError] = useState<string>(null);
    let newPostRef = useRef(undefined);
    let [newPost, setNewPost] = useState<string>(undefined);
    let [postingComment, setPostingComment] = useState<boolean>();

    let clearPost = () => {
        setNewPost(undefined);
        newPostRef.current.value = null;
    }

    let submitComment = async () => {
        if (postingComment) {
			setCommentError("You have already submitted a comment");
			return;
		}

		if (!newPost || newPost.length < 3) {
			setCommentError("Your post must be at least 3 characters long");
			return;
		}

		setCommentError(null);
	    setPostingComment(true);
		try {
			let postThreadId = threadId || slug;
            let resp = await axios.post(`/api/threads/${postThreadId}/posts`, {content: newPost});
            callBack && callBack();
			setPostingComment(false);
            clearPost();
		} catch (err) {
			console.log(err.response);
			setCommentError(err.response.data);
			setPostingComment(false);
		}

    }
    useEffect(() => {
        console.log('new post changin')
    }, [newPost])
    return (
        <>
        {!user?.user_id && <div ng-show="!authService.user" className="text-gray">
            Please <div className="anchor" ng-click="showLogin()" style={{display: 'inline', cursor: 'pointer'}}>Login</div> to post a comment. Don't have an account? <div className="anchor" ng-click="showSignUp()" style={{display: 'inline', cursor: 'pointer'}}>Signup</div> here
        </div>}
        <div className="new-post-container" ng-show="authService.user">
            {commentError && <div className="alert alert-danger alert-dismissable">
                <button type="button" className="close" onClick={() => setCommentError(null)}>&times;</button>
                {commentError}
            </div>}
            
            {user?.user_id && <textarea 
                value={newPost} 
                onChange={(e) => setNewPost(e.target.value)}
                className="form-control"
                placeholder="Write a comment..." 
                onFocus={() => newPost?.length ? false : setNewPost('')}
                onBlur={() => newPost === '' ? clearPost() : false}
                ref={newPostRef}
            ></textarea>}
            {newPost != null && <div className="submit-buttons">
                {!postingComment && <><div className="btn btn-default" onClick={() => clearPost()}>Cancel</div>
                <div className="btn btn-climbcation" onClick={() => submitComment()}>Submit</div></>}
                {postingComment && <div><img src="/images/climbcation-loading.gif" /></div>}
            </div>}
        </div>
        </>
    );
}

export function Thread({posts}: {posts: Post[]}) {
    return (
        <>
        {posts.map(post => <React.Fragment key={post.id}><PostComponent post={post} /></React.Fragment>)}
        </>
    );
}

export function PostComponent({post}: {post: Post}) {
    let [isEditing, setIsEditing] = useState<boolean>(false);
    let [commentError, setCommentError] = useState<string>(null);
    let [originalContent, setOriginalContent] = useState<string>(post?.content);
	const auth = useContext(authContext);
    let user: User = auth.user;

    let startEditing = () => {
        setOriginalContent(post?.content);
        setIsEditing(true);
    }

    let cancelEdit = () => {
        post.content = originalContent;
        setIsEditing(false);
    }

    let editComment = (post: Post) => {

    }
    return (
        <div className="post">
            <div className="post-title">
                <div className="user">{post.username}</div>
                <div className="time">{moment().diff(moment(post.created_at), 'days') > 6 ? moment(post.created_at).format('MMM D, YYYY') : moment(post.created_at).fromNow()}</div>
            </div>
            {!isEditing && <p className="post-content preserve-line-breaks">
                <Linkify>{post.content}</Linkify>
            </p>}
            {
                isEditing && commentError && 
                <div className="alert alert-danger alert-dismissable">
                    <button type="button" className="close" onClick={() => setCommentError(null)}>&times;</button>
                    {commentError}
                </div>
            }
            {isEditing && <textarea 
                ng-model="post.editedContent" 
                className="form-control"
                ng-show="post.editing"
            ></textarea>}
            {user?.user_id === post.user_id && <div className="post-actions">
                {!isEditing && <a onClick={() => startEditing()}>Edit</a>}
                {isEditing && 
                <>
                    <a onClick={() => cancelEdit()}>Cancel</a>
                    <span className="btn btn-climbcation" onClick={() => editComment(post)} >Submit</span>
                </>
                }
            </div>}
        </div>

    );
}